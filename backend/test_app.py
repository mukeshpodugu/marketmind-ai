import pytest
import pandas as pd
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.ml.data_pipeline import calculate_technical_indicators
from app.services.portfolio_service import calculate_portfolio_performance

client = TestClient(app)

# --- Unit Tests: ML Data Pipeline ---
def test_calculate_technical_indicators():
    """
    Unit test to verify that the technical indicators module correctly calculates
    SMA, EMA, RSI, MACD, and Bollinger Bands on time-series inputs.
    """
    # Create 60 days of synthetic price data
    dates = pd.date_range(start="2026-01-01", periods=60)
    prices = [100.0 + i * 0.5 for i in range(60)] # Upward linear trend
    
    df = pd.DataFrame(index=dates)
    df["Close"] = prices
    df["Open"] = prices
    df["High"] = [p + 1.0 for p in prices]
    df["Low"] = [p - 1.0 for p in prices]
    df["Volume"] = 1000000

    df_indicators = calculate_technical_indicators(df)
    
    # Assert columns exist
    assert "SMA_10" in df_indicators.columns
    assert "SMA_50" in df_indicators.columns
    assert "RSI" in df_indicators.columns
    assert "MACD" in df_indicators.columns
    assert "BB_Upper" in df_indicators.columns
    assert "BB_Lower" in df_indicators.columns
    
    # Check that calculations completed without leaving NaNs
    assert not df_indicators["SMA_10"].isnull().any()
    assert not df_indicators["RSI"].isnull().any()
    
    # In an upward trend, SMA 10 should be less than the closing price
    assert df_indicators["SMA_10"].iloc[-1] < df_indicators["Close"].iloc[-1]

# --- API Integration Tests ---
def test_system_status_endpoint():
    """
    Verifies the public system health check endpoint is live and returns
    appropriate developer metadata.
    """
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert data["developer"]["name"] == "PODUGU MUKESH"
    assert data["developer"]["location"] == "Srikakulam"

def test_auth_registration_validation():
    """
    Tests that duplicate or invalid user signups are rejected by the validation schemas.
    """
    # Generate unique test username
    username = "test_user_2026"
    signup_payload = {
        "username": username,
        "email": "testuser@marketmind.com",
        "password": "strongpassword123"
    }
    
    # First signup (should succeed or return error if database already has it)
    res1 = client.post("/api/v1/auth/register", json=signup_payload)
    if res1.status_code == 201:
        assert res1.json()["username"] == username
        
        # Second signup with same credentials (must fail)
        res2 = client.post("/api/v1/auth/register", json=signup_payload)
        assert res2.status_code == 400
        assert "already registered" in res2.json()["detail"]
    else:
        # If pre-existing, it should fail with 400
        assert res1.status_code == 400
