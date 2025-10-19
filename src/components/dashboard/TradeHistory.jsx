import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TradeHistory = () => {
  const { t } = useTranslation();
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    const savedTrades = JSON.parse(localStorage.getItem('trades') || '[]');
    setTrades(savedTrades);
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ar-SA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-border p-6 rounded-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">سجل التداولات</h3>
        <Clock className="w-5 h-5 text-blue-400" />
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
        {trades.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">لا توجد تداولات بعد</p>
            <p className="text-sm text-gray-500 mt-2">ابدأ التداول لرؤية السجل هنا</p>
          </div>
        ) : (
          trades.map((trade, index) => (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-blue-500/20 hover:border-blue-500/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  trade.type === 'BUY' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {trade.type === 'BUY' ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {trade.type === 'BUY' ? 'شراء' : 'بيع'}
                  </p>
                  <p className="text-sm text-gray-400">{formatDate(trade.timestamp)}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-white font-semibold">${trade.amount.toFixed(2)}</p>
                <p className={`text-sm ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)}%
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default TradeHistory;