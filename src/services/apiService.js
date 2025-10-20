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
 * Keep-Alive Service - منع نوم الباكند على Render
 */
export const keepAliveService = {
  start: () => {
    // Ping كل 10 دقائق لمنع النوم
    const pingInterval = setInterval(async () => {
      try {
        await fetch(`${API_BASE_URL}/`, { method: 'GET' });
        console.log('✅ Backend keep-alive ping successful');
      } catch (error) {
        console.warn('⚠️ Backend keep-alive ping failed:', error.message);
      }
    }, 10 * 60 * 1000); // 10 دقائق

    // Ping فوري عند بدء التطبيق
    fetch(`${API_BASE_URL}/`, { method: 'GET' })
      .then(() => console.log('✅ Initial backend wake-up successful'))
      .catch((error) => console.warn('⚠️ Initial backend wake-up failed:', error.message));

    return pingInterval;
  },

  stop: (intervalId) => {
    if (intervalId) {
      clearInterval(intervalId);
      console.log('🛑 Backend keep-alive stopped');
    }
  },
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
    return apiRequest(`/api/v1/subscription/status?wallet_address=${walletAddress}`, {
      method: 'GET',
    });
  },

  verify: async (signature, walletAddress) => {
    return apiRequest('/api/v1/subscription/verify', {
      method: 'POST',
      body: JSON.stringify({ signature, walletAddress }),
    });
  },

  activateTrial: async (walletAddress) => {
    return apiRequest('/api/v1/subscription/activate-trial', {
      method: 'POST',
      body: JSON.stringify({ wallet_address: walletAddress }),
    });
  },

  createPaymentRequest: async (walletAddress) => {
    return apiRequest('/api/v1/subscription/payment-request', {
      method: 'POST',
      body: JSON.stringify({ wallet_address: walletAddress }),
    });
  },

  verifyPayment: async (walletAddress, transactionSignature, amountPaid) => {
    return apiRequest('/api/v1/subscription/verify-payment', {
      method: 'POST',
      body: JSON.stringify({ 
        wallet_address: walletAddress, 
        transaction_signature: transactionSignature,
        amount_paid: amountPaid 
      }),
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

  open: async (walletAddress, symbol, entryPrice, positionSize, stopLoss, takeProfit, confidence) => {
    return apiRequest('/api/v1/trade/open', {
      method: 'POST',
      body: JSON.stringify({ 
        wallet_address: walletAddress, 
        symbol, 
        entry_price: entryPrice,
        position_size: positionSize,
        stop_loss: stopLoss,
        take_profit: takeProfit,
        confidence 
      }),
    });
  },

  close: async (walletAddress, positionId) => {
    return apiRequest('/api/v1/trade/close', {
      method: 'POST',
      body: JSON.stringify({ 
        wallet_address: walletAddress, 
        position_id: positionId 
      }),
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

  analyze: async (symbol, walletAddress) => {
    return apiRequest('/api/v1/analysis/live', {
      method: 'POST',
      body: JSON.stringify({ symbol, wallet_address: walletAddress }),
    });
  },
};

/**
 * خدمات المحفظة
 */
export const portfolioService = {
  info: async (walletAddress) => {
    return apiRequest(`/api/v1/portfolio/info?wallet_address=${walletAddress}`, {
      method: 'GET',
    });
  },

  positions: async (walletAddress) => {
    return apiRequest(`/api/v1/portfolio/positions?wallet_address=${walletAddress}`, {
      method: 'GET',
    });
  },

  history: async (walletAddress, limit = 50) => {
    return apiRequest(`/api/v1/portfolio/history?wallet_address=${walletAddress}&limit=${limit}`, {
      method: 'GET',
    });
  },

  create: async (walletAddress, initialBalance = 10000) => {
    return apiRequest('/api/v1/portfolio/create', {
      method: 'POST',
      body: JSON.stringify({ wallet_address: walletAddress, initial_balance: initialBalance }),
    });
  },
};

/**
 * خدمات الأسعار
 */
export const priceService = {
  current: async (symbol) => {
    return apiRequest(`/api/v1/price/current?symbol=${symbol}`, {
      method: 'GET',
    });
  },

  multiple: async (symbols) => {
    return apiRequest('/api/v1/price/multiple', {
      method: 'POST',
      body: JSON.stringify({ symbols }),
    });
  },

  supported: async () => {
    return apiRequest('/api/v1/price/supported-tokens', {
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

