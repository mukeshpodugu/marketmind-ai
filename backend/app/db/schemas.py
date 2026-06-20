from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

# --- Stock Schemas ---
class StockBase(BaseModel):
    symbol: str
    name: str
    sector: Optional[str] = None

class StockCreate(StockBase):
    pass

class StockResponse(StockBase):
    id: int
    last_updated: datetime

    class Config:
        from_attributes = True

# --- Watchlist Schemas ---
class WatchlistCreate(BaseModel):
    symbol: str

class WatchlistResponse(BaseModel):
    id: int
    user_id: int
    stock: StockResponse
    created_at: datetime

    class Config:
        from_attributes = True

# --- Holding / Portfolio Schemas ---
class HoldingCreate(BaseModel):
    symbol: str
    shares: float = Field(..., gt=0)
    buy_price: float = Field(..., gt=0)
    purchase_date: Optional[datetime] = None

class HoldingResponse(BaseModel):
    id: int
    portfolio_id: int
    stock: StockResponse
    shares: float
    buy_price: float
    purchase_date: datetime

    class Config:
        from_attributes = True

class PortfolioCreate(BaseModel):
    name: str

class PortfolioResponse(BaseModel):
    id: int
    user_id: int
    name: str
    created_at: datetime
    holdings: List[HoldingResponse] = []

    class Config:
        from_attributes = True

class HoldingDetail(BaseModel):
    id: int
    symbol: str
    name: str
    shares: float
    buy_price: float
    current_price: float
    market_value: float
    total_cost: float
    gain_loss: float
    gain_loss_percent: float
    purchase_date: datetime

class PortfolioSummary(BaseModel):
    portfolio_id: int
    name: str
    total_value: float
    total_cost: float
    total_gain_loss: float
    total_gain_loss_percent: float
    holdings: List[HoldingDetail]

# --- Prediction Schemas ---
class PredictionRequest(BaseModel):
    symbol: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class PredictionDetail(BaseModel):
    date: str
    predicted_price: float
    confidence_lower: float
    confidence_upper: float
    direction: str

class ModelMetrics(BaseModel):
    rmse: float
    mae: float
    mape: float
    r2: float

class PredictionResponse(BaseModel):
    model_config = {
        "protected_namespaces": ()
    }

    symbol: str
    model_used: str
    metrics: Dict[str, ModelMetrics]
    best_model: str
    current_price: float
    predictions: Dict[str, List[PredictionDetail]] # "day", "week", "month", "quarter"
    risk_score: float  # 0 to 10
    risk_category: str  # Low, Medium, High
    confidence_score: float # 0 to 1
    explainable_factors: List[Dict[str, Any]] # SHAP/feature importance

# --- News & Sentiment Schemas ---
class NewsArticleResponse(BaseModel):
    id: int
    title: str
    summary: Optional[str] = None
    url: Optional[str] = None
    source: Optional[str] = None
    sentiment_score: Optional[float] = None
    sentiment_label: Optional[str] = None
    published_at: datetime

    class Config:
        from_attributes = True

class MarketMoodResponse(BaseModel):
    mood_index: float  # 0 to 100
    sentiment_label: str  # Fear, Neutral, Greed
    positive_count: int
    negative_count: int
    neutral_count: int
    recent_news: List[NewsArticleResponse]

# --- Reports Schemas ---
class ReportResponse(BaseModel):
    id: int
    name: str
    file_type: str
    created_at: datetime

    class Config:
        from_attributes = True
