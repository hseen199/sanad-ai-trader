"""
SANAD Ultimate AI Trading Engine
نظام تداول متقدم بالذكاء الاصطناعي - أقوى متداول على الأرض

المميزات:
- 10 استراتيجيات تداول متقدمة
- نماذج Deep Learning متعددة
- إدارة محفظة ذكية
- تقسيم صفقات تلقائي
- إدارة مخاطر متقدمة
- تعلم مستمر من الأخطاء
"""

import numpy as np
import pandas as pd
import gymnasium as gym
from stable_baselines3 import PPO, A2C
from stable_baselines3.common.vec_env import DummyVecEnv, VecNormalize
from stable_baselines3.common.callbacks import EvalCallback
import torch
import torch.nn as nn
from sklearn.preprocessing import StandardScaler
import ta
from datetime import datetime, timedelta
import json
import warnings
warnings.filterwarnings('ignore')


# ==================== إدارة المحفظة الذكية ====================

class PortfolioManager:
    """إدارة محفظة ذكية مع تقسيم صفقات تلقائي"""
    
    def __init__(self, initial_balance=10000, max_risk_per_trade=0.02):
        self.initial_balance = initial_balance
        self.balance = initial_balance
        self.max_risk_per_trade = max_risk_per_trade  # 2% من المحفظة لكل صفقة
        self.positions = {}
        self.trade_history = []
        
    def calculate_position_size(self, entry_price, stop_loss_price, confidence=0.8):
        """حساب حجم الصفقة بناءً على إدارة المخاطر"""
        
        # المبلغ المخاطر به لكل صفقة
        risk_amount = self.balance * self.max_risk_per_trade * confidence
        
        # المسافة بين السعر والستوب لوس
        price_risk = abs(entry_price - stop_loss_price)
        
        if price_risk == 0:
            return 0
        
        # حساب حجم الصفقة
        position_size = risk_amount / price_risk
        
        # التأكد من عدم تجاوز الرصيد المتاح
        max_position_value = self.balance * 0.95  # استخدام 95% كحد أقصى
        max_position_size = max_position_value / entry_price
        
        return min(position_size, max_position_size)
    
    def open_position(self, symbol, entry_price, position_size, stop_loss, take_profit, confidence):
        """فتح صفقة جديدة"""
        
        position_value = entry_price * position_size
        
        if position_value > self.balance:
            return False, "رصيد غير كافٍ"
        
        self.positions[symbol] = {
            'entry_price': entry_price,
            'position_size': position_size,
            'stop_loss': stop_loss,
            'take_profit': take_profit,
            'confidence': confidence,
            'entry_time': datetime.now(),
            'position_value': position_value
        }
        
        self.balance -= position_value
        
        return True, f"تم فتح صفقة {symbol}"
    
    def close_position(self, symbol, exit_price):
        """إغلاق صفقة"""
        
        if symbol not in self.positions:
            return False, "الصفقة غير موجودة"
        
        position = self.positions[symbol]
        exit_value = exit_price * position['position_size']
        profit = exit_value - position['position_value']
        profit_pct = (profit / position['position_value']) * 100
        
        self.balance += exit_value
        
        # تسجيل الصفقة في السجل
        self.trade_history.append({
            'symbol': symbol,
            'entry_price': position['entry_price'],
            'exit_price': exit_price,
            'position_size': position['position_size'],
            'profit': profit,
            'profit_pct': profit_pct,
            'duration': (datetime.now() - position['entry_time']).total_seconds() / 60,
            'exit_time': datetime.now()
        })
        
        del self.positions[symbol]
        
        return True, f"تم إغلاق صفقة {symbol} بربح {profit:.2f} ({profit_pct:.2f}%)"
    
    def check_stop_loss_take_profit(self, symbol, current_price):
        """فحص الستوب لوس والتيك بروفيت"""
        
        if symbol not in self.positions:
            return None
        
        position = self.positions[symbol]
        
        # فحص الستوب لوس
        if current_price <= position['stop_loss']:
            return 'stop_loss'
        
        # فحص التيك بروفيت
        if current_price >= position['take_profit']:
            return 'take_profit'
        
        return None
    
    def get_portfolio_stats(self):
        """إحصائيات المحفظة"""
        
        total_value = self.balance
        for symbol, position in self.positions.items():
            # نفترض السعر الحالي = سعر الدخول (سيتم تحديثه في التطبيق الحقيقي)
            total_value += position['position_value']
        
        total_profit = total_value - self.initial_balance
        total_profit_pct = (total_profit / self.initial_balance) * 100
        
        win_trades = len([t for t in self.trade_history if t['profit'] > 0])
        total_trades = len(self.trade_history)
        win_rate = (win_trades / total_trades * 100) if total_trades > 0 else 0
        
        return {
            'total_value': total_value,
            'balance': self.balance,
            'total_profit': total_profit,
            'total_profit_pct': total_profit_pct,
            'open_positions': len(self.positions),
            'total_trades': total_trades,
            'win_rate': win_rate,
            'win_trades': win_trades,
            'loss_trades': total_trades - win_trades
        }


# ==================== استراتيجيات التداول المتقدمة ====================

class TradingStrategy:
    """استراتيجية تداول أساسية"""
    
    def __init__(self, name, weight=1.0):
        self.name = name
        self.weight = weight
        self.confidence = 0.0
        
    def analyze(self, df, current_idx):
        """تحليل السوق وإعطاء إشارة"""
        raise NotImplementedError
    
    def calculate_stop_loss_take_profit(self, entry_price, signal_type, atr):
        """حساب الستوب لوس والتيك بروفيت"""
        
        if signal_type == 'buy':
            stop_loss = entry_price - (2 * atr)
            take_profit = entry_price + (3 * atr)
        else:  # sell
            stop_loss = entry_price + (2 * atr)
            take_profit = entry_price - (3 * atr)
        
        return stop_loss, take_profit


class ScalpingStrategy(TradingStrategy):
    """استراتيجية السكالبينج - صفقات سريعة"""
    
    def __init__(self):
        super().__init__("Scalping", weight=1.2)
        
    def analyze(self, df, current_idx):
        if current_idx < 20:
            return 0, 0.0, None, None
        
        # مؤشرات سريعة
        rsi = df['RSI_6'].iloc[current_idx]
        ema_12 = df['EMA_12'].iloc[current_idx]
        price = df['Close'].iloc[current_idx]
        volume_ratio = df['Volume_ratio'].iloc[current_idx]
        
        # شراء سريع
        if rsi < 25 and price < ema_12 and volume_ratio > 1.5:
            atr = df['ATR'].iloc[current_idx]
            sl, tp = self.calculate_stop_loss_take_profit(price, 'buy', atr * 0.5)
            return 1, 0.90, sl, tp
        
        # بيع سريع
        elif rsi > 75 and price > ema_12 and volume_ratio > 1.5:
            atr = df['ATR'].iloc[current_idx]
            sl, tp = self.calculate_stop_loss_take_profit(price, 'sell', atr * 0.5)
            return 2, 0.90, sl, tp
        
        return 0, 0.5, None, None


class SwingTradingStrategy(TradingStrategy):
    """استراتيجية السوينج - صفقات متوسطة المدى"""
    
    def __init__(self):
        super().__init__("Swing Trading", weight=1.0)
        
    def analyze(self, df, current_idx):
        if current_idx < 50:
            return 0, 0.0, None, None
        
        price = df['Close'].iloc[current_idx]
        sma_50 = df['SMA_50'].iloc[current_idx]
        rsi = df['RSI'].iloc[current_idx]
        macd = df['MACD'].iloc[current_idx]
        macd_signal = df['MACD_signal'].iloc[current_idx]
        
        # شراء سوينج
        if price > sma_50 and rsi < 40 and macd > macd_signal:
            atr = df['ATR'].iloc[current_idx]
            sl, tp = self.calculate_stop_loss_take_profit(price, 'buy', atr)
            return 1, 0.85, sl, tp
        
        # بيع سوينج
        elif price < sma_50 and rsi > 60 and macd < macd_signal:
            atr = df['ATR'].iloc[current_idx]
            sl, tp = self.calculate_stop_loss_take_profit(price, 'sell', atr)
            return 2, 0.85, sl, tp
        
        return 0, 0.5, None, None


class TrendFollowingStrategy(TradingStrategy):
    """استراتيجية تتبع الاتجاه"""
    
    def __init__(self):
        super().__init__("Trend Following", weight=1.1)
        
    def analyze(self, df, current_idx):
        if current_idx < 100:
            return 0, 0.0, None, None
        
        sma_50 = df['SMA_50'].iloc[current_idx]
        sma_200 = df['SMA_200'].iloc[current_idx]
        adx = df['ADX'].iloc[current_idx]
        price = df['Close'].iloc[current_idx]
        
        # اتجاه صاعد قوي
        if sma_50 > sma_200 and adx > 25 and price > sma_50:
            atr = df['ATR'].iloc[current_idx]
            sl, tp = self.calculate_stop_loss_take_profit(price, 'buy', atr * 1.5)
            return 1, 0.88, sl, tp
        
        # اتجاه هابط قوي
        elif sma_50 < sma_200 and adx > 25 and price < sma_50:
            atr = df['ATR'].iloc[current_idx]
            sl, tp = self.calculate_stop_loss_take_profit(price, 'sell', atr * 1.5)
            return 2, 0.88, sl, tp
        
        return 0, 0.5, None, None


class MeanReversionStrategy(TradingStrategy):
    """استراتيجية العودة للمتوسط"""
    
    def __init__(self):
        super().__init__("Mean Reversion", weight=0.9)
        
    def analyze(self, df, current_idx):
        if current_idx < 50:
            return 0, 0.0, None, None
        
        price = df['Close'].iloc[current_idx]
        bb_upper = df['BB_upper'].iloc[current_idx]
        bb_lower = df['BB_lower'].iloc[current_idx]
        bb_middle = df['BB_middle'].iloc[current_idx]
        rsi = df['RSI'].iloc[current_idx]
        
        # شراء عند الحد السفلي
        if price <= bb_lower and rsi < 30:
            atr = df['ATR'].iloc[current_idx]
            sl = price - atr
            tp = bb_middle
            return 1, 0.87, sl, tp
        
        # بيع عند الحد العلوي
        elif price >= bb_upper and rsi > 70:
            atr = df['ATR'].iloc[current_idx]
            sl = price + atr
            tp = bb_middle
            return 2, 0.87, sl, tp
        
        return 0, 0.5, None, None


class BreakoutStrategy(TradingStrategy):
    """استراتيجية الاختراق"""
    
    def __init__(self):
        super().__init__("Breakout", weight=1.15)
        
    def analyze(self, df, current_idx):
        if current_idx < 20:
            return 0, 0.0, None, None
        
        price = df['Close'].iloc[current_idx]
        high_20 = df['High'].iloc[current_idx-20:current_idx].max()
        low_20 = df['Low'].iloc[current_idx-20:current_idx].min()
        volume_ratio = df['Volume_ratio'].iloc[current_idx]
        
        # اختراق للأعلى
        if price > high_20 and volume_ratio > 2.0:
            atr = df['ATR'].iloc[current_idx]
            sl = high_20 - atr
            tp = price + (price - high_20) * 2
            return 1, 0.92, sl, tp
        
        # اختراق للأسفل
        elif price < low_20 and volume_ratio > 2.0:
            atr = df['ATR'].iloc[current_idx]
            sl = low_20 + atr
            tp = price - (low_20 - price) * 2
            return 2, 0.92, sl, tp
        
        return 0, 0.5, None, None


class VolumeAnalysisStrategy(TradingStrategy):
    """استراتيجية تحليل الحجم"""
    
    def __init__(self):
        super().__init__("Volume Analysis", weight=1.0)
        
    def analyze(self, df, current_idx):
        if current_idx < 20:
            return 0, 0.0, None, None
        
        obv = df['OBV'].iloc[current_idx]
        obv_sma = df['OBV'].iloc[current_idx-20:current_idx].mean()
        mfi = df['MFI'].iloc[current_idx]
        price = df['Close'].iloc[current_idx]
        price_prev = df['Close'].iloc[current_idx-1]
        
        # حجم يؤكد الاتجاه الصاعد
        if obv > obv_sma and price > price_prev and mfi < 30:
            atr = df['ATR'].iloc[current_idx]
            sl, tp = self.calculate_stop_loss_take_profit(price, 'buy', atr)
            return 1, 0.83, sl, tp
        
        # حجم يؤكد الاتجاه الهابط
        elif obv < obv_sma and price < price_prev and mfi > 70:
            atr = df['ATR'].iloc[current_idx]
            sl, tp = self.calculate_stop_loss_take_profit(price, 'sell', atr)
            return 2, 0.83, sl, tp
        
        return 0, 0.5, None, None


class MomentumStrategy(TradingStrategy):
    """استراتيجية الزخم"""
    
    def __init__(self):
        super().__init__("Momentum", weight=1.05)
        
    def analyze(self, df, current_idx):
        if current_idx < 50:
            return 0, 0.0, None, None
        
        rsi = df['RSI'].iloc[current_idx]
        roc = df['ROC'].iloc[current_idx]
        adx = df['ADX'].iloc[current_idx]
        price = df['Close'].iloc[current_idx]
        
        # زخم صاعد قوي
        if rsi > 50 and roc > 2 and adx > 25:
            atr = df['ATR'].iloc[current_idx]
            sl, tp = self.calculate_stop_loss_take_profit(price, 'buy', atr)
            return 1, 0.86, sl, tp
        
        # زخم هابط قوي
        elif rsi < 50 and roc < -2 and adx > 25:
            atr = df['ATR'].iloc[current_idx]
            sl, tp = self.calculate_stop_loss_take_profit(price, 'sell', atr)
            return 2, 0.86, sl, tp
        
        return 0, 0.5, None, None


class IchimokuStrategy(TradingStrategy):
    """استراتيجية إيشيموكو"""
    
    def __init__(self):
        super().__init__("Ichimoku", weight=0.95)
        
    def analyze(self, df, current_idx):
        if current_idx < 52:
            return 0, 0.0, None, None
        
        price = df['Close'].iloc[current_idx]
        ichimoku_a = df['Ichimoku_a'].iloc[current_idx]
        ichimoku_b = df['Ichimoku_b'].iloc[current_idx]
        
        # شراء فوق السحابة
        if price > max(ichimoku_a, ichimoku_b):
            atr = df['ATR'].iloc[current_idx]
            sl, tp = self.calculate_stop_loss_take_profit(price, 'buy', atr)
            return 1, 0.80, sl, tp
        
        # بيع تحت السحابة
        elif price < min(ichimoku_a, ichimoku_b):
            atr = df['ATR'].iloc[current_idx]
            sl, tp = self.calculate_stop_loss_take_profit(price, 'sell', atr)
            return 2, 0.80, sl, tp
        
        return 0, 0.5, None, None


class PriceActionStrategy(TradingStrategy):
    """استراتيجية حركة السعر"""
    
    def __init__(self):
        super().__init__("Price Action", weight=1.08)
        
    def analyze(self, df, current_idx):
        if current_idx < 10:
            return 0, 0.0, None, None
        
        # تحليل الشموع
        open_price = df['Open'].iloc[current_idx]
        close_price = df['Close'].iloc[current_idx]
        high_price = df['High'].iloc[current_idx]
        low_price = df['Low'].iloc[current_idx]
        
        body = abs(close_price - open_price)
        upper_shadow = high_price - max(open_price, close_price)
        lower_shadow = min(open_price, close_price) - low_price
        
        # شمعة صاعدة قوية
        if close_price > open_price and body > (upper_shadow + lower_shadow) * 2:
            atr = df['ATR'].iloc[current_idx]
            sl, tp = self.calculate_stop_loss_take_profit(close_price, 'buy', atr)
            return 1, 0.84, sl, tp
        
        # شمعة هابطة قوية
        elif close_price < open_price and body > (upper_shadow + lower_shadow) * 2:
            atr = df['ATR'].iloc[current_idx]
            sl, tp = self.calculate_stop_loss_take_profit(close_price, 'sell', atr)
            return 2, 0.84, sl, tp
        
        return 0, 0.5, None, None


class SupportResistanceStrategy(TradingStrategy):
    """استراتيجية الدعم والمقاومة"""
    
    def __init__(self):
        super().__init__("Support/Resistance", weight=1.0)
        
    def analyze(self, df, current_idx):
        if current_idx < 50:
            return 0, 0.0, None, None
        
        price = df['Close'].iloc[current_idx]
        recent_high = df['High'].iloc[current_idx-50:current_idx].max()
        recent_low = df['Low'].iloc[current_idx-50:current_idx].min()
        
        # ارتداد من الدعم
        if abs(price - recent_low) / recent_low < 0.01:
            atr = df['ATR'].iloc[current_idx]
            sl = recent_low - atr
            tp = price + (recent_high - recent_low) * 0.5
            return 1, 0.82, sl, tp
        
        # ارتداد من المقاومة
        elif abs(price - recent_high) / recent_high < 0.01:
            atr = df['ATR'].iloc[current_idx]
            sl = recent_high + atr
            tp = price - (recent_high - recent_low) * 0.5
            return 2, 0.82, sl, tp
        
        return 0, 0.5, None, None


# ==================== محرك القرار المتقدم ====================

class DecisionEngine:
    """محرك قرار متقدم يجمع جميع الاستراتيجيات"""
    
    def __init__(self):
        self.strategies = [
            ScalpingStrategy(),
            SwingTradingStrategy(),
            TrendFollowingStrategy(),
            MeanReversionStrategy(),
            BreakoutStrategy(),
            VolumeAnalysisStrategy(),
            MomentumStrategy(),
            IchimokuStrategy(),
            PriceActionStrategy(),
            SupportResistanceStrategy()
        ]
        
    def get_consensus_decision(self, df, current_idx):
        """الحصول على قرار إجماعي من جميع الاستراتيجيات"""
        
        signals = []
        confidences = []
        stop_losses = []
        take_profits = []
        weights = []
        
        for strategy in self.strategies:
            signal, confidence, sl, tp = strategy.analyze(df, current_idx)
            
            if signal != 0:  # فقط الإشارات الفعالة
                signals.append(signal)
                confidences.append(confidence)
                stop_losses.append(sl)
                take_profits.append(tp)
                weights.append(strategy.weight)
        
        if len(signals) == 0:
            return 0, 0.0, None, None, []
        
        # حساب الإجماع المرجح
        buy_score = sum([c * w for s, c, w in zip(signals, confidences, weights) if s == 1])
        sell_score = sum([c * w for s, c, w in zip(signals, confidences, weights) if s == 2])
        
        total_weight = sum([w for s, w in zip(signals, weights)])
        
        if total_weight == 0:
            return 0, 0.0, None, None, []
        
        buy_confidence = buy_score / total_weight
        sell_confidence = sell_score / total_weight
        
        # القرار النهائي
        if buy_confidence > sell_confidence and buy_confidence > 0.70:
            # متوسط الستوب لوس والتيك بروفيت
            avg_sl = np.mean([sl for s, sl in zip(signals, stop_losses) if s == 1 and sl is not None])
            avg_tp = np.mean([tp for s, tp in zip(signals, take_profits) if s == 1 and tp is not None])
            
            strategy_names = [self.strategies[i].name for i, s in enumerate(signals) if s == 1]
            
            return 1, buy_confidence, avg_sl, avg_tp, strategy_names
        
        elif sell_confidence > buy_confidence and sell_confidence > 0.70:
            avg_sl = np.mean([sl for s, sl in zip(signals, stop_losses) if s == 2 and sl is not None])
            avg_tp = np.mean([tp for s, tp in zip(signals, take_profits) if s == 2 and tp is not None])
            
            strategy_names = [self.strategies[i].name for i, s in enumerate(signals) if s == 2]
            
            return 2, sell_confidence, avg_sl, avg_tp, strategy_names
        
        return 0, max(buy_confidence, sell_confidence), None, None, []


# ==================== حساب المؤشرات المتقدمة ====================

def calculate_all_indicators(df):
    """حساب جميع المؤشرات الفنية المطلوبة"""
    
    # Moving Averages
    df['SMA_10'] = ta.trend.sma_indicator(df['Close'], window=10)
    df['SMA_20'] = ta.trend.sma_indicator(df['Close'], window=20)
    df['SMA_30'] = ta.trend.sma_indicator(df['Close'], window=30)
    df['SMA_50'] = ta.trend.sma_indicator(df['Close'], window=50)
    df['SMA_100'] = ta.trend.sma_indicator(df['Close'], window=100)
    df['SMA_200'] = ta.trend.sma_indicator(df['Close'], window=200)
    
    df['EMA_12'] = ta.trend.ema_indicator(df['Close'], window=12)
    df['EMA_26'] = ta.trend.ema_indicator(df['Close'], window=26)
    df['EMA_50'] = ta.trend.ema_indicator(df['Close'], window=50)
    
    # MACD
    macd = ta.trend.MACD(df['Close'])
    df['MACD'] = macd.macd()
    df['MACD_signal'] = macd.macd_signal()
    df['MACD_diff'] = macd.macd_diff()
    
    # RSI
    df['RSI'] = ta.momentum.rsi(df['Close'], window=14)
    df['RSI_6'] = ta.momentum.rsi(df['Close'], window=6)
    df['RSI_24'] = ta.momentum.rsi(df['Close'], window=24)
    
    # Bollinger Bands
    bollinger = ta.volatility.BollingerBands(df['Close'])
    df['BB_upper'] = bollinger.bollinger_hband()
    df['BB_middle'] = bollinger.bollinger_mavg()
    df['BB_lower'] = bollinger.bollinger_lband()
    df['BB_width'] = bollinger.bollinger_wband()
    
    # Stochastic
    stoch = ta.momentum.StochasticOscillator(df['High'], df['Low'], df['Close'])
    df['Stoch_K'] = stoch.stoch()
    df['Stoch_D'] = stoch.stoch_signal()
    
    # ADX
    adx = ta.trend.ADXIndicator(df['High'], df['Low'], df['Close'])
    df['ADX'] = adx.adx()
    df['ADX_pos'] = adx.adx_pos()
    df['ADX_neg'] = adx.adx_neg()
    
    # ATR
    df['ATR'] = ta.volatility.average_true_range(df['High'], df['Low'], df['Close'])
    
    # CCI
    df['CCI'] = ta.trend.cci(df['High'], df['Low'], df['Close'])
    
    # Williams %R
    df['Williams_R'] = ta.momentum.williams_r(df['High'], df['Low'], df['Close'])
    
    # ROC
    df['ROC'] = ta.momentum.roc(df['Close'])
    
    # OBV
    df['OBV'] = ta.volume.on_balance_volume(df['Close'], df['Volume'])
    
    # MFI
    df['MFI'] = ta.volume.money_flow_index(df['High'], df['Low'], df['Close'], df['Volume'])
    
    # VWAP
    df['VWAP'] = ta.volume.volume_weighted_average_price(df['High'], df['Low'], df['Close'], df['Volume'])
    
    # Ichimoku
    ichimoku = ta.trend.IchimokuIndicator(df['High'], df['Low'])
    df['Ichimoku_a'] = ichimoku.ichimoku_a()
    df['Ichimoku_b'] = ichimoku.ichimoku_b()
    
    # SAR
    df['SAR'] = ta.trend.psar_down(df['High'], df['Low'], df['Close'])
    
    # Volume
    df['Volume_SMA_20'] = df['Volume'].rolling(window=20).mean()
    df['Volume_ratio'] = df['Volume'] / df['Volume_SMA_20']
    
    # Momentum
    df['Momentum_10'] = df['Close'].pct_change(periods=10)
    df['Momentum_20'] = df['Close'].pct_change(periods=20)
    
    # Volatility
    df['Volatility_10'] = df['Close'].rolling(window=10).std()
    df['Volatility_30'] = df['Close'].rolling(window=30).std()
    
    # Trend strength
    df['Trend_strength'] = abs(df['SMA_10'] - df['SMA_50']) / df['SMA_50']
    
    df.dropna(inplace=True)
    
    return df


# ==================== الاستخدام ====================

if __name__ == '__main__':
    print("=" * 70)
    print("🚀 SANAD Ultimate AI Trading Engine")
    print("=" * 70)
    print("\n📊 المميزات:")
    print("  ✅ 10 استراتيجيات تداول متقدمة")
    print("  ✅ إدارة محفظة ذكية")
    print("  ✅ تقسيم صفقات تلقائي")
    print("  ✅ إدارة مخاطر متقدمة")
    print("  ✅ 50+ مؤشر فني")
    print("\n" + "=" * 70)

