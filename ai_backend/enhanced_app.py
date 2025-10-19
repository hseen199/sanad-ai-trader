from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from stable_baselines3 import PPO
import gymnasium as gym
import os
import json
from datetime import datetime, timedelta
import hashlib
import hmac

app = Flask(__name__)
CORS(app)

# --- Configuration ---
SUBSCRIPTION_FEE_SOL = 0.1
TRADE_FEE_PERCENTAGE = 0.03
SUBSCRIPTION_DURATION_DAYS = 30

# --- Global Variables ---
model = None
df_global = None
subscriptions_db = {}  # في الإنتاج، استخدم قاعدة بيانات حقيقية
users_db = {}
trades_db = {}
settings_db = {}

# --- Trading Environment (من trading_bot.py) ---
class SolanaTradingEnv(gym.Env):
    metadata = {"render_modes": ["human"], "render_fps": 30}

    def __init__(self, df, window_size=10, render_mode=None):
        super().__init__()
        self.df = df.reset_index(drop=True)
        self.window_size = window_size
        self.render_mode = render_mode

        self.action_space = gym.spaces.Discrete(3)
        self.features = ["Close", "Volume", "SMA_10", "SMA_30", "RSI", "MACD", "Signal"]
        self.observation_space = gym.spaces.Box(low=-np.inf, high=np.inf,
                                                shape=(len(self.features),),
                                                dtype=np.float32)

        self.current_step = self.window_size
        self.balance = 1000.0
        self.shares_held = 0
        self.net_worth = self.balance
        self.max_net_worth = self.balance
        self.episode_history = []

    def _get_obs(self):
        obs = self.df[self.features].iloc[self.current_step].values
        return obs.astype(np.float32)

    def _get_info(self):
        return {
            "balance": self.balance,
            "shares_held": self.shares_held,
            "net_worth": self.net_worth,
            "max_net_worth": self.max_net_worth,
            "current_price": self.df["Close"].iloc[self.current_step]
        }

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.current_step = self.window_size
        self.balance = 1000.0
        self.shares_held = 0
        self.net_worth = self.balance
        self.max_net_worth = self.balance
        self.episode_history = []
        observation = self._get_obs()
        info = self._get_info()
        return observation, info

    def step(self, action):
        current_price = self.df["Close"].iloc[self.current_step]
        self.current_step += 1

        if self.current_step >= len(self.df) - 1:
            done = True
        else:
            done = False

        prev_net_worth = self.net_worth
        self.net_worth = self.balance + self.shares_held * current_price

        reward = 0
        if action == 1:
            if self.balance > current_price:
                buy_amount = self.balance * 0.9 / current_price
                self.shares_held += buy_amount
                self.balance -= buy_amount * current_price
        elif action == 2:
            if self.shares_held > 0:
                self.balance += self.shares_held * current_price
                self.shares_held = 0

        reward = (self.net_worth - prev_net_worth) / prev_net_worth if prev_net_worth != 0 else 0
        
        if self.net_worth < self.balance * 0.8:
            reward -= 1.0

        if self.net_worth > self.max_net_worth:
            reward += 0.5
            self.max_net_worth = self.net_worth

        observation = self._get_obs()
        info = self._get_info()

        return observation, reward, done, False, info

    def render(self):
        if self.render_mode == "human":
            print(f"Step: {self.current_step}, Net Worth: {self.net_worth:.2f}")

    def close(self):
        pass


def calculate_rsi(series, window=14):
    diff = series.diff(1)
    gain = diff.where(diff > 0, 0)
    loss = -diff.where(diff < 0, 0)
    avg_gain = gain.ewm(com=window - 1, min_periods=window).mean()
    avg_loss = loss.ewm(com=window - 1, min_periods=window).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_macd(series, fast_period=12, slow_period=26, signal_period=9):
    exp1 = series.ewm(span=fast_period, adjust=False).mean()
    exp2 = series.ewm(span=slow_period, adjust=False).mean()
    macd = exp1 - exp2
    signal = macd.ewm(span=signal_period, adjust=False).mean()
    return macd, signal

def calculate_indicators(df):
    df["SMA_10"] = df["Close"].rolling(window=10).mean()
    df["SMA_30"] = df["Close"].rolling(window=30).mean()
    df["RSI"] = calculate_rsi(df["Close"])
    df["MACD"], df["Signal"] = calculate_macd(df["Close"])
    df.dropna(inplace=True)
    return df

def fetch_solana_data(symbol='SOL/USDC', interval='1h', limit=1000):
    try:
        data = pd.read_csv('sol_usdc_ohlcv_dummy.csv')
        print("Loaded dummy data from sol_usdc_ohlcv_dummy.csv")
        return data
    except FileNotFoundError:
        print("Generating synthetic data...")
        dates = pd.date_range(start='2023-01-01', periods=limit, freq=interval)
        np.random.seed(42)
        open_prices = np.random.uniform(10, 200, limit)
        close_prices = open_prices + np.random.uniform(-5, 5, limit)
        high_prices = np.maximum(open_prices, close_prices) + np.random.uniform(0, 3, limit)
        low_prices = np.minimum(open_prices, close_prices) - np.random.uniform(0, 3, limit)
        volume = np.random.uniform(1000, 100000, limit)

        data = pd.DataFrame({
            'Date': dates,
            'Open': open_prices,
            'High': high_prices,
            'Low': low_prices,
            'Close': close_prices,
            'Volume': volume
        })
        data.set_index('Date', inplace=True)
        data.to_csv('sol_usdc_ohlcv_dummy.csv')
        return data


@app.before_request
def load_model_and_data():
    global model, df_global
    if model is None or df_global is None:
        print("Loading AI model and data...")
        df_global = fetch_solana_data()
        df_global = calculate_indicators(df_global)
        
        dummy_env = SolanaTradingEnv(df_global.iloc[0:10])
        if not os.path.exists("solana_trading_bot_ppo.zip"):
            print("Model file not found. Creating a dummy model.")
            model_temp = PPO("MlpPolicy", dummy_env, verbose=0)
            model_temp.save("solana_trading_bot_ppo")
        model = PPO.load("solana_trading_bot_ppo", env=dummy_env)
        print("AI model and data loaded.")


# --- Authentication Endpoints ---
@app.route("/api/v1/auth/connect", methods=["POST"])
def auth_connect():
    data = request.json
    wallet_address = data.get("walletAddress")
    signature = data.get("signature")
    message = data.get("message")
    
    if not all([wallet_address, signature, message]):
        return jsonify({"error": "Missing required fields"}), 400
    
    # في الإنتاج، تحقق من التوقيع باستخدام مكتبة Solana
    users_db[wallet_address] = {
        "connected_at": datetime.now().isoformat(),
        "last_seen": datetime.now().isoformat()
    }
    
    return jsonify({
        "success": True,
        "walletAddress": wallet_address,
        "message": "Wallet connected successfully"
    })


@app.route("/api/v1/auth/verify", methods=["POST"])
def auth_verify():
    data = request.json
    wallet_address = data.get("walletAddress")
    
    if wallet_address in users_db:
        return jsonify({"verified": True, "user": users_db[wallet_address]})
    
    return jsonify({"verified": False}), 404


# --- Subscription Endpoints ---
@app.route("/api/v1/subscription/pay", methods=["POST"])
def subscription_pay():
    data = request.json
    wallet_address = data.get("walletAddress")
    signature = data.get("signature")
    
    if not all([wallet_address, signature]):
        return jsonify({"error": "Missing required fields"}), 400
    
    # في الإنتاج، تحقق من المعاملة على blockchain
    expiry_date = datetime.now() + timedelta(days=SUBSCRIPTION_DURATION_DAYS)
    
    subscriptions_db[wallet_address] = {
        "active": True,
        "started_at": datetime.now().isoformat(),
        "expires_at": expiry_date.isoformat(),
        "transaction_signature": signature
    }
    
    return jsonify({
        "success": True,
        "subscription": subscriptions_db[wallet_address]
    })


@app.route("/api/v1/subscription/status", methods=["POST"])
def subscription_status():
    data = request.json
    wallet_address = data.get("walletAddress")
    
    if wallet_address in subscriptions_db:
        subscription = subscriptions_db[wallet_address]
        expires_at = datetime.fromisoformat(subscription["expires_at"])
        is_active = expires_at > datetime.now()
        
        return jsonify({
            "active": is_active,
            "subscription": subscription
        })
    
    return jsonify({"active": False})


@app.route("/api/v1/subscription/verify", methods=["POST"])
def subscription_verify():
    data = request.json
    signature = data.get("signature")
    wallet_address = data.get("walletAddress")
    
    # في الإنتاج، تحقق من المعاملة على blockchain
    return jsonify({
        "verified": True,
        "signature": signature,
        "walletAddress": wallet_address
    })


# --- Settings Endpoints ---
@app.route("/api/v1/settings", methods=["GET", "POST"])
def settings():
    if request.method == "GET":
        wallet_address = request.args.get("walletAddress")
        if wallet_address in settings_db:
            return jsonify(settings_db[wallet_address])
        return jsonify({
            "risk_level": "balanced",
            "trade_size_usd": 200,
            "slippage_tolerance": 1.0,
            "autonomous_mode": False
        })
    
    elif request.method == "POST":
        data = request.json
        wallet_address = data.get("walletAddress")
        settings_db[wallet_address] = {
            "risk_level": data.get("risk_level", "balanced"),
            "trade_size_usd": data.get("trade_size_usd", 200),
            "slippage_tolerance": data.get("slippage_tolerance", 1.0),
            "autonomous_mode": data.get("autonomous_mode", False),
            "updated_at": datetime.now().isoformat()
        }
        return jsonify({"success": True, "settings": settings_db[wallet_address]})


# --- Market Endpoints ---
@app.route("/api/v1/market/top200", methods=["GET"])
def market_top200():
    # في الإنتاج، جلب من CoinGecko/CoinMarketCap API
    top_pairs = [
        {"symbol": "SOL/USDT", "price": 150.25, "change_24h": 5.2},
        {"symbol": "BTC/USDT", "price": 45000.00, "change_24h": 2.1},
        {"symbol": "ETH/USDT", "price": 3200.00, "change_24h": 3.5},
        # ... المزيد من الأزواج
    ]
    return jsonify({"pairs": top_pairs, "count": len(top_pairs)})


@app.route("/api/v1/market/pair/<pair>", methods=["GET"])
def market_pair(pair):
    # في الإنتاج، جلب بيانات حقيقية
    return jsonify({
        "pair": pair,
        "price": 150.25,
        "volume_24h": 1500000,
        "change_24h": 5.2,
        "high_24h": 155.00,
        "low_24h": 145.00
    })


@app.route("/api/v1/market/ohlcv", methods=["GET"])
def market_ohlcv():
    pair = request.args.get("pair", "SOL/USDT")
    interval = request.args.get("interval", "1h")
    limit = int(request.args.get("limit", 100))
    
    # في الإنتاج، جلب بيانات OHLCV حقيقية
    if df_global is not None:
        data = df_global.tail(limit).to_dict(orient='records')
        return jsonify({"pair": pair, "interval": interval, "data": data})
    
    return jsonify({"error": "Data not available"}), 500


# --- Trade Endpoints ---
@app.route("/api/v1/trade/signal", methods=["POST"])
def trade_signal():
    data = request.json
    pair = data.get("pair")
    action = data.get("action")
    amount = data.get("amount")
    route = data.get("route")
    
    return jsonify({
        "success": True,
        "signal": {
            "pair": pair,
            "action": action,
            "amount": amount,
            "route": route,
            "timestamp": datetime.now().isoformat()
        }
    })


@app.route("/api/v1/trade/execute", methods=["POST"])
def trade_execute():
    data = request.json
    wallet_address = data.get("walletAddress")
    pair = data.get("pair")
    action = data.get("action")
    amount = data.get("amount")
    slippage = data.get("slippage", 1.0)
    
    # حساب الرسوم
    fee_amount = amount * TRADE_FEE_PERCENTAGE
    net_amount = amount - fee_amount
    
    trade_id = hashlib.sha256(f"{wallet_address}{datetime.now().isoformat()}".encode()).hexdigest()[:16]
    
    trade_record = {
        "trade_id": trade_id,
        "wallet_address": wallet_address,
        "pair": pair,
        "action": action,
        "amount": amount,
        "fee_amount": fee_amount,
        "net_amount": net_amount,
        "slippage": slippage,
        "status": "executed",
        "timestamp": datetime.now().isoformat()
    }
    
    if wallet_address not in trades_db:
        trades_db[wallet_address] = []
    trades_db[wallet_address].append(trade_record)
    
    return jsonify({
        "success": True,
        "trade": trade_record
    })


@app.route("/api/v1/trade/history", methods=["GET"])
def trade_history():
    wallet_address = request.args.get("walletAddress")
    limit = int(request.args.get("limit", 50))
    
    if wallet_address in trades_db:
        trades = trades_db[wallet_address][-limit:]
        return jsonify({"trades": trades, "count": len(trades)})
    
    return jsonify({"trades": [], "count": 0})


@app.route("/api/v1/trade/active", methods=["GET"])
def trade_active():
    wallet_address = request.args.get("walletAddress")
    
    # في الإنتاج، جلب الصفقات النشطة من قاعدة البيانات
    return jsonify({"active_trades": [], "count": 0})


# --- AI Endpoints ---
@app.route("/api/v1/ai/status", methods=["GET"])
def ai_status():
    return jsonify({
        "status": "active",
        "model_version": "1.0.0",
        "last_updated": datetime.now().isoformat(),
        "performance": {
            "accuracy": 0.75,
            "total_predictions": 1000,
            "successful_trades": 750
        }
    })


@app.route("/api/v1/ai/predict", methods=["POST"])
def ai_predict():
    data = request.json
    observation = np.array(data["observation"], dtype=np.float32)

    if model is None:
        return jsonify({"error": "AI model not loaded"}), 500

    action, _states = model.predict(observation, deterministic=True)
    action_map = {0: "HOLD", 1: "BUY", 2: "SELL"}
    predicted_action = action_map.get(action.item(), "HOLD")

    return jsonify({
        "action": predicted_action,
        "confidence": 0.82,
        "timestamp": datetime.now().isoformat()
    })


@app.route("/api/v1/ai/insights", methods=["GET"])
def ai_insights():
    wallet_address = request.args.get("walletAddress")
    
    # في الإنتاج، توليد رؤى حقيقية بناءً على بيانات المستخدم
    insights = [
        {"type": "recommendation", "message": "السوق يظهر اتجاهاً صاعداً، فرصة جيدة للشراء"},
        {"type": "warning", "message": "مستوى RSI مرتفع، احذر من التصحيح المحتمل"},
        {"type": "info", "message": "حجم التداول أعلى من المتوسط بنسبة 25%"}
    ]
    
    return jsonify({"insights": insights, "count": len(insights)})


# --- Account Endpoints ---
@app.route("/api/v1/account/overview", methods=["GET"])
def account_overview():
    wallet_address = request.args.get("walletAddress")
    
    total_trades = len(trades_db.get(wallet_address, []))
    total_profit = sum(t.get("net_amount", 0) for t in trades_db.get(wallet_address, []))
    
    return jsonify({
        "wallet_address": wallet_address,
        "total_trades": total_trades,
        "total_profit": total_profit,
        "success_rate": 0.75,
        "current_balance": 10000.00
    })


@app.route("/api/v1/account/performance", methods=["GET"])
def account_performance():
    wallet_address = request.args.get("walletAddress")
    period = request.args.get("period", "7d")
    
    # في الإنتاج، حساب الأداء الفعلي
    performance_data = [
        {"date": "2024-10-11", "profit": 150.00},
        {"date": "2024-10-12", "profit": 200.00},
        {"date": "2024-10-13", "profit": -50.00},
        {"date": "2024-10-14", "profit": 300.00},
        {"date": "2024-10-15", "profit": 100.00},
        {"date": "2024-10-16", "profit": 250.00},
        {"date": "2024-10-17", "profit": 180.00},
    ]
    
    return jsonify({
        "period": period,
        "data": performance_data,
        "total_profit": sum(d["profit"] for d in performance_data)
    })


# --- Health Check ---
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "running",
        "service": "SANAD AI Trading Backend",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

