from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from stable_baselines3 import PPO
import gymnasium as gym
import os

app = Flask(__name__)
CORS(app) # Enable CORS for frontend communication

# --- Placeholder for AI Model Loading and Prediction ---
model = None
df_global = None

# Define the trading environment class here or import it if modified
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
            print(f"Step: {self.current_step}, Net Worth: {self.net_worth:.2f}, Shares: {self.shares_held:.2f}, Balance: {self.balance:.2f}")

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
        # Check if model file exists, otherwise create a dummy one
        if not os.path.exists("solana_trading_bot_ppo.zip"):
            print("Model file solana_trading_bot_ppo.zip not found. Creating a dummy model.")
            model_temp = PPO("MlpPolicy", dummy_env, verbose=0)
            model_temp.save("solana_trading_bot_ppo")
        model = PPO.load("solana_trading_bot_ppo", env=dummy_env) # Load the actual model
        print("AI model and data loaded.")

@app.route("/predict_trade", methods=["POST"])
def predict_trade():
    data = request.json
    current_observation = np.array(data["observation"], dtype=np.float32)

    if model is None:
        return jsonify({"error": "AI model not loaded"}), 500

    action, _states = model.predict(current_observation, deterministic=True)
    action_map = {0: "hold", 1: "buy", 2: "sell"}
    predicted_action = action_map.get(action.item(), "hold")

    return jsonify({"action": predicted_action})

@app.route("/", methods=["GET"])
def health_check():
    return "AI Backend is running!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

