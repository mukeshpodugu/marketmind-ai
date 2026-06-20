import datetime
import numpy as np
import pandas as pd
import yfinance as yf
import logging

logger = logging.getLogger("marketmind")

def generate_synthetic_data(symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
    """
    Generates highly realistic synthetic financial stock price data
    using a Geometric Brownian Motion model with trend, seasonality, and volume.
    """
    logger.info(f"Generating synthetic market data for {symbol} ({start_date} to {end_date})")
    
    start = pd.to_datetime(start_date)
    end = pd.to_datetime(end_date)
    
    # Generate daily dates, filtering out weekends
    dates = pd.date_range(start=start, end=end, freq='B')
    n = len(dates)
    
    if n == 0:
        # Default fallback to 250 business days ending today
        end = datetime.datetime.now()
        start = end - datetime.timedelta(days=365)
        dates = pd.date_range(start=start, end=end, freq='B')
        n = len(dates)

    # Set random seed based on symbol name to make it deterministic but different for each symbol
    seed = sum(ord(c) for c in symbol)
    np.random.seed(seed)

    # Base price based on symbol
    base_prices = {
        "AAPL": 175.0, "MSFT": 415.0, "GOOGL": 150.0, "AMZN": 175.0,
        "NVDA": 850.0, "TSLA": 180.0, "META": 480.0, "NFLX": 600.0,
        "AMD": 160.0, "BTC-USD": 65000.0, "ETH-USD": 3500.0
    }
    s0 = base_prices.get(symbol.upper(), 100.0)

    # Parameters for Geometric Brownian Motion
    mu = 0.0004 + np.random.normal(0, 0.0002)  # daily drift (upward on average)
    sigma = 0.015 + np.random.normal(0, 0.005) # daily volatility (approx 20-30% annual)
    sigma = max(0.005, sigma) # Ensure positive volatility

    # GBM simulation: S_t = S_{t-1} * exp((mu - 0.5 * sigma^2) + sigma * Z)
    returns = np.random.normal(0, 1, n)
    price_factors = np.exp((mu - 0.5 * sigma**2) + sigma * returns)
    price_path = s0 * np.cumprod(price_factors)

    # Add micro-trends and cyclic volatility (seasonality)
    t = np.arange(n)
    seasonality = 1.0 + 0.03 * np.sin(2 * np.pi * t / 60) + 0.02 * np.sin(2 * np.pi * t / 250)
    prices = price_path * seasonality

    # Create DataFrame
    df = pd.DataFrame(index=dates)
    df['Close'] = prices
    
    # Generate High, Low, Open around Close
    pct_changes = np.random.uniform(0.008, 0.025, n)
    df['High'] = df['Close'] * (1.0 + pct_changes * np.random.uniform(0.1, 0.9, n))
    df['Low'] = df['Close'] * (1.0 - pct_changes * np.random.uniform(0.1, 0.9, n))
    
    # Open between High and Low
    df['Open'] = np.random.uniform(df['Low'], df['High'])
    # Adjusted Close is identical
    df['Adj Close'] = df['Close']

    # Generate realistic Volume
    base_volume = {"AAPL": 50e6, "MSFT": 20e6, "NVDA": 40e6, "TSLA": 90e6, "BTC-USD": 25e9}
    v0 = base_volume.get(symbol.upper(), 5e6)
    df['Volume'] = (v0 * np.random.lognormal(0, 0.4, n)).astype(int)

    return df

def fetch_stock_data(symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
    """
    Fetches stock data from yfinance. If offline or failed, generates synthetic data.
    """
    try:
        logger.info(f"Fetching historical data for {symbol} via yfinance ({start_date} to {end_date})")
        df = yf.download(symbol, start=start_date, end=end_date, progress=False)
        
        # Check if returned empty DataFrame
        if df.empty or len(df) < 10:
            logger.warning(f"yfinance returned empty dataset for {symbol}. Falling back to synthetic.")
            return generate_synthetic_data(symbol, start_date, end_date)
            
        # Clean multi-index columns if returned
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
            
        return df
    except Exception as e:
        logger.error(f"Error fetching stock data for {symbol}: {e}. Falling back to synthetic.")
        return generate_synthetic_data(symbol, start_date, end_date)

def calculate_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes all standard technical indicators: SMA, EMA, RSI, MACD, Bollinger Bands,
    Stochastic Oscillator, and Volatility.
    """
    df = df.copy()
    
    # 1. Simple Moving Averages
    df['SMA_10'] = df['Close'].rolling(window=10).mean()
    df['SMA_20'] = df['Close'].rolling(window=20).mean()
    df['SMA_50'] = df['Close'].rolling(window=50).mean()
    
    # 2. Exponential Moving Averages
    df['EMA_12'] = df['Close'].ewm(span=12, adjust=False).mean()
    df['EMA_26'] = df['Close'].ewm(span=26, adjust=False).mean()
    
    # 3. Relative Strength Index (RSI)
    delta = df['Close'].diff()
    gain = delta.clip(lower=0)
    loss = -1 * delta.clip(upper=0)
    
    avg_gain = gain.rolling(window=14).mean()
    avg_loss = loss.rolling(window=14).mean()
    
    rs = avg_gain / (avg_loss + 1e-9)
    df['RSI'] = 100.0 - (100.0 / (1.0 + rs))
    
    # 4. Moving Average Convergence Divergence (MACD)
    df['MACD'] = df['EMA_12'] - df['EMA_26']
    df['MACD_Signal'] = df['MACD'].ewm(span=9, adjust=False).mean()
    df['MACD_Hist'] = df['MACD'] - df['MACD_Signal']
    
    # 5. Bollinger Bands
    df['BB_Middle'] = df['Close'].rolling(window=20).mean()
    df['BB_Std'] = df['Close'].rolling(window=20).std()
    df['BB_Upper'] = df['BB_Middle'] + (2 * df['BB_Std'])
    df['BB_Lower'] = df['BB_Middle'] - (2 * df['BB_Std'])
    
    # 6. Stochastic Oscillator
    low_14 = df['Low'].rolling(window=14).min()
    high_14 = df['High'].rolling(window=14).max()
    df['Stoch_K'] = ((df['Close'] - low_14) / (high_14 - low_14 + 1e-9)) * 100.0
    df['Stoch_D'] = df['Stoch_K'].rolling(window=3).mean()
    
    # 7. Volatility (20-day rolling returns standard deviation)
    df['Returns'] = df['Close'].pct_change()
    df['Volatility'] = df['Returns'].rolling(window=20).std() * np.sqrt(252) # Annualized
    
    # Forward fill/backward fill missing values due to rolling windows
    df = df.ffill().bfill()
    
    return df

def generate_ml_features(df: pd.DataFrame, lookback: int = 30) -> tuple:
    """
    Creates feature windows and labels for ML model training.
    """
    # Columns to use as features
    feature_cols = [
        'Close', 'Open', 'High', 'Low', 'Volume', 
        'SMA_10', 'SMA_20', 'SMA_50', 'EMA_12', 'EMA_26', 
        'RSI', 'MACD', 'MACD_Signal', 'BB_Upper', 'BB_Lower', 
        'Stoch_K', 'Stoch_D', 'Volatility'
    ]
    
    data = df[feature_cols].values
    
    # Labels represent: Close price at t+1 (1 Day), t+5 (1 Week), t+22 (1 Month), t+66 (1 Quarter)
    X, y_day, y_week, y_month, y_quarter = [], [], [], [], []
    
    n = len(df)
    for i in range(lookback, n - 66):
        X.append(data[i-lookback:i])
        y_day.append(df['Close'].iloc[i])        # Next day Close
        y_week.append(df['Close'].iloc[i+4])     # Next week Close
        y_month.append(df['Close'].iloc[i+21])   # Next month Close
        y_quarter.append(df['Close'].iloc[i+65]) # Next quarter Close
        
    return np.array(X), np.array(y_day), np.array(y_week), np.array(y_month), np.array(y_quarter)
