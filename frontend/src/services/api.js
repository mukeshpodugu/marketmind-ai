const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token && token !== 'guest_token') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // --- Auth ---
  async login(username, password) {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async register(username, email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async forgotPassword(email) {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async resetPassword(token, newPassword) {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Password reset failed');
    }
    return res.json();
  },

  // --- Stocks ---
  async getStocks() {
    const res = await fetch(`${API_BASE_URL}/stocks/`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async searchStocks(query) {
    const res = await fetch(`${API_BASE_URL}/stocks/search?q=${query}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getStockDetail(symbol, days = 365) {
    const res = await fetch(`${API_BASE_URL}/stocks/detail/${symbol}?days=${days}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to retrieve stock details');
    return res.json();
  },

  // --- Predictions ---
  async predictStock(symbol) {
    const res = await fetch(`${API_BASE_URL}/predict/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ symbol }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Prediction failed');
    }
    return res.json();
  },

  // --- Portfolios ---
  async getPortfolios() {
    const res = await fetch(`${API_BASE_URL}/portfolios/`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async createPortfolio(name) {
    const res = await fetch(`${API_BASE_URL}/portfolios/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Portfolio creation failed');
    }
    return res.json();
  },

  async addHolding(portfolioId, symbol, shares, buyPrice, purchaseDate) {
    const res = await fetch(`${API_BASE_URL}/portfolios/${portfolioId}/holdings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ symbol, shares, buy_price: buyPrice, purchase_date: purchaseDate }),
    });
    if (!res.ok) {
       const err = await res.json();
       throw new Error(err.detail || 'Failed to add holding');
    }
    return res.json();
  },

  async removeHolding(portfolioId, holdingId) {
    const res = await fetch(`${API_BASE_URL}/portfolios/${portfolioId}/holdings/${holdingId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getPortfolioSummary(portfolioId) {
    const res = await fetch(`${API_BASE_URL}/portfolios/${portfolioId}/summary`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load portfolio performance');
    return res.json();
  },

  // --- Watchlist ---
  async getWatchlist() {
    const res = await fetch(`${API_BASE_URL}/watchlists/`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async addToWatchlist(symbol) {
    const res = await fetch(`${API_BASE_URL}/watchlists/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ symbol }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to watch stock');
    }
    return res.json();
  },

  async removeFromWatchlist(watchlistId) {
    const res = await fetch(`${API_BASE_URL}/watchlists/${watchlistId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // --- Sentiment ---
  async getSentiment(symbol = 'GENERAL') {
    const res = await fetch(`${API_BASE_URL}/sentiment/?symbol=${symbol}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // --- Reports ---
  getReportDownloadUrl(symbol, format = 'pdf') {
    const token = localStorage.getItem('token') || '';
    return `${API_BASE_URL}/reports/generate?symbol=${symbol}&format=${format}&token=${token}`;
  },

  async getReportsList() {
    const res = await fetch(`${API_BASE_URL}/reports/`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // --- Admin ---
  async getAdminUsers() {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async updateAdminUserRole(userId, role) {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role?role=${role}`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getAdminLogs() {
    const res = await fetch(`${API_BASE_URL}/admin/logs`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getAdminModelAccuracy() {
    const res = await fetch(`${API_BASE_URL}/admin/models/accuracy`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async clearAdminCache() {
    const res = await fetch(`${API_BASE_URL}/admin/cache/clear`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getAdminSystemMetrics() {
    const res = await fetch(`${API_BASE_URL}/admin/system/metrics`, {
      headers: getHeaders(),
    });
    return res.json();
  }
};
