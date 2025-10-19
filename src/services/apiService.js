const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * دالة مساعدة لإجراء طلبات API
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

/**
 * خدمات المصادقة
 */
export const authService = {
  connect: async (walletAddress, signature, message) => {
    return apiRequest('/api/v1/auth/connect', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, message }),
    });
  },

  verify: async (walletAddress, signature, message) => {
    return apiRequest('/api/v1/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, message }),
    });
  },
};

/**
 * خدمات الاشتراك
 */
export const subscriptionService = {
  pay: async (walletAddress, signature) => {
    return apiRequest('/api/v1/subscription/pay', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature }),
    });
  },

  status: async (walletAddress) => {
    return apiRequest('/api/v1/subscription/status', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  },

  verify: async (signature, walletAddress) => {
    return apiRequest('/api/v1/subscription/verify', {
      method: 'POST',
      body: JSON.stringify({ signature, walletAddress }),
    });
  },
};

/**
 * خدمات الإعدادات
 */
export const settingsService = {
  get: async (walletAddress) => {
    return apiRequest(`/api/v1/settings?walletAddress=${walletAddress}`, {
      method: 'GET',
    });
  },

  update: async (walletAddress, settings) => {
    return apiRequest('/api/v1/settings', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, ...settings }),
    });
  },
};

/**
 * خدمات السوق
 */
export const marketService = {
  getTop200: async () => {
    return apiRequest('/api/v1/market/top200', {
      method: 'GET',
    });
  },

  getPairData: async (pair) => {
    return apiRequest(`/api/v1/market/pair/${pair}`, {
      method: 'GET',
    });
  },

  getOHLCV: async (pair, interval = '1h', limit = 100) => {
    return apiRequest(`/api/v1/market/ohlcv?pair=${pair}&interval=${interval}&limit=${limit}`, {
      method: 'GET',
    });
  },
};

/**
 * خدمات التداول
 */
export const tradeService = {
  signal: async (pair, action, amount, route) => {
    return apiRequest('/api/v1/trade/signal', {
      method: 'POST',
      body: JSON.stringify({ pair, action, amount, route }),
    });
  },

  execute: async (walletAddress, pair, action, amount, slippage) => {
    return apiRequest('/api/v1/trade/execute', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, pair, action, amount, slippage }),
    });
  },

  history: async (walletAddress, limit = 50) => {
    return apiRequest(`/api/v1/trade/history?walletAddress=${walletAddress}&limit=${limit}`, {
      method: 'GET',
    });
  },

  active: async (walletAddress) => {
    return apiRequest(`/api/v1/trade/active?walletAddress=${walletAddress}`, {
      method: 'GET',
    });
  },
};

/**
 * خدمات الذكاء الاصطناعي
 */
export const aiService = {
  status: async () => {
    return apiRequest('/api/v1/ai/status', {
      method: 'GET',
    });
  },

  predict: async (observation) => {
    return apiRequest('/api/v1/ai/predict', {
      method: 'POST',
      body: JSON.stringify({ observation }),
    });
  },

  insights: async (walletAddress) => {
    return apiRequest(`/api/v1/ai/insights?walletAddress=${walletAddress}`, {
      method: 'GET',
    });
  },
};

/**
 * خدمات الحساب
 */
export const accountService = {
  overview: async (walletAddress) => {
    return apiRequest(`/api/v1/account/overview?walletAddress=${walletAddress}`, {
      method: 'GET',
    });
  },

  performance: async (walletAddress, period = '7d') => {
    return apiRequest(`/api/v1/account/performance?walletAddress=${walletAddress}&period=${period}`, {
      method: 'GET',
    });
  },
};

