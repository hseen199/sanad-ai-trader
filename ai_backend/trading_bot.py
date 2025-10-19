
import gymnasium as gym
import numpy as np
import pandas as pd
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv
from stable_baselines3.common.callbacks import EvalCallback, StopTrainingOnNoModelImprovement
import requests
import time

# --- 1. Data Collection (Placeholder/Simulation) ---
# In a real scenario, this would fetch live/historical data from APIs like CoinGecko, Raydium, Jupiter
# For demonstration, we'll create dummy data or load from a CSV if available.

def fetch_solana_data(symbol='SOL/USDC', interval='1h', limit=1000):
    # This is a placeholder function. Real implementation would use actual API calls.
    # For now, let's generate some synthetic data or load a dummy CSV.
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

# --- 2. Technical Indicators (Using pandas_ta for simplicity) ---
# Note: pandas_ta is not in requirements.txt. Will need to add it or implement manually.
# For now, let's implement a couple manually or use a simplified version.

def calculate_indicators(df):
    df['SMA_10'] = df['Close'].rolling(window=10).mean()
    df['SMA_30'] = df['Close'].rolling(window=30).mean()
    df['RSI'] = calculate_rsi(df['Close'])
    df['MACD'], df['Signal'] = calculate_macd(df['Close'])
    df.dropna(inplace=True)
    return df

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

# --- 3. Solana Trading Environment (Gymnasium) ---
class SolanaTradingEnv(gym.Env):
    metadata = {'render_modes': ['human'], 'render_fps': 30}

    def __init__(self, df, window_size=10, render_mode=None):
        super().__init__()
        self.df = df.reset_index(drop=True)
        self.window_size = window_size
        self.render_mode = render_mode

        # Action space: Buy, Sell, Hold
        self.action_space = gym.spaces.Discrete(3)

        # Observation space: OHLCV + Indicators (e.g., Close, Volume, SMA_10, SMA_30, RSI, MACD, Signal)
        # We need to define the shape based on the number of features after indicator calculation
        self.features = ['Close', 'Volume', 'SMA_10', 'SMA_30', 'RSI', 'MACD', 'Signal']
        self.observation_space = gym.spaces.Box(low=-np.inf, high=np.inf,
                                                shape=(len(self.features),),
                                                dtype=np.float32)

        self.current_step = self.window_size
        self.balance = 1000.0  # Starting balance
        self.shares_held = 0
        self.net_worth = self.balance
        self.max_net_worth = self.balance
        self.episode_history = []

    def _get_obs(self):
        # Get observation for the current step
        obs = self.df[self.features].iloc[self.current_step].values
        return obs.astype(np.float32)

    def _get_info(self):
        return {
            'balance': self.balance,
            'shares_held': self.shares_held,
            'net_worth': self.net_worth,
            'max_net_worth': self.max_net_worth,
            'current_price': self.df['Close'].iloc[self.current_step]
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
        current_price = self.df['Close'].iloc[self.current_step]
        self.current_step += 1

        if self.current_step >= len(self.df) - 1:  # End of data
            done = True
        else:
            done = False

        prev_net_worth = self.net_worth
        self.net_worth = self.balance + self.shares_held * current_price

        reward = 0
        # Action: 0=Hold, 1=Buy, 2=Sell
        if action == 1:  # Buy
            if self.balance > current_price: # Check if we have enough balance
                buy_amount = self.balance * 0.9 / current_price # Buy 90% of available balance
                self.shares_held += buy_amount
                self.balance -= buy_amount * current_price
                # reward += (self.net_worth - prev_net_worth) * 0.1 # Small reward for taking action
        elif action == 2:  # Sell
            if self.shares_held > 0:
                self.balance += self.shares_held * current_price
                self.shares_held = 0
                # reward += (self.net_worth - prev_net_worth) * 0.1 # Small reward for taking action

        # Reward based on net worth change
        reward = (self.net_worth - prev_net_worth) / prev_net_worth if prev_net_worth != 0 else 0
        
        # Penalize if net worth drops significantly
        if self.net_worth < self.balance * 0.8: # If net worth drops 20% below initial balance
            reward -= 1.0 # Significant penalty

        # Encourage reaching new highs
        if self.net_worth > self.max_net_worth:
            reward += 0.5 # Positive reward for growth
            self.max_net_worth = self.net_worth

        observation = self._get_obs()
        info = self._get_info()

        return observation, reward, done, False, info

    def render(self):
        if self.render_mode == 'human':
            print(f"Step: {self.current_step}, Net Worth: {self.net_worth:.2f}, Shares: {self.shares_held:.2f}, Balance: {self.balance:.2f}")

    def close(self):
        pass

# --- 4. Main Training and Backtesting Logic ---
if __name__ == '__main__':
    # 1. Fetch and prepare data
    df = fetch_solana_data()
    df = calculate_indicators(df)
    print(f"Data shape after indicators: {df.shape}")

    # Split data for training and evaluation
    train_size = int(len(df) * 0.8)
    train_df = df[:train_size]
    eval_df = df[train_size:]

    # 2. Create and wrap the environment
    train_env = DummyVecEnv([lambda: SolanaTradingEnv(train_df, render_mode='human')])
    eval_env = DummyVecEnv([lambda: SolanaTradingEnv(eval_df)])

    # 3. Define the RL model (PPO is a good starting point)
    # You might need to tune policy_kwargs for better performance
    model = PPO('MlpPolicy', train_env, verbose=1, learning_rate=0.0001, n_steps=2048, batch_size=64)

    # 4. Define callbacks for evaluation and early stopping
    stop_callback = StopTrainingOnNoModelImprovement(5, 10, verbose=1)
    eval_callback = EvalCallback(eval_env, best_model_save_path='./logs/',
                                 log_path='./logs/', eval_freq=1000, 
                                 deterministic=True, render=False, callback_after_eval=stop_callback)

    # 5. Train the model
    print("\nStarting model training...")
    model.learn(total_timesteps=50000, callback=eval_callback)
    print("Training finished.")

    # 6. Save the trained model
    model.save("solana_trading_bot_ppo")
    print("Model saved as solana_trading_bot_ppo.zip")

    # 7. Backtesting (Evaluation on unseen data)
    print("\nStarting backtesting...")
    obs = eval_env.reset()
    done = False
    cumulative_reward = 0
    while not done:
        action, _states = model.predict(obs, deterministic=True)
        obs, reward, done, info = eval_env.step(action)
        cumulative_reward += reward[0]
        eval_env.render()
        if done:
            break
    print(f"Backtesting finished. Cumulative Reward: {cumulative_reward:.2f}")
    print(f"Final Net Worth: {info[0]['net_worth']:.2f}")

    # Further steps would involve connecting to Solana RPC/DEX APIs for live trading.
    # This part requires secure handling of private keys and careful risk management.
    # Example (conceptual): 
    # from solana.rpc.api import Client
    # from solders.keypair import Keypair
    # solana_client = Client("https://api.mainnet-beta.solana.com")
    # payer = Keypair.from_secret_key(YOUR_PRIVATE_KEY)
    # ... logic to interact with Raydium/Jupiter ...


