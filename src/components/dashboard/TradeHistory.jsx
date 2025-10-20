import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { portfolioService } from '@/services/apiService';

const TradeHistory = ({ walletAddress }) => {
  const { t } = useTranslation();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!walletAddress) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await portfolioService.history(walletAddress, 50);
        
        if (data.status === 'success' && data.history) {
          // تحويل البيانات من Backend إلى الصيغة المتوقعة
          const formattedTrades = data.history.map(trade => ({
            id: trade.id,
            type: trade.trade_type === 'buy' ? 'BUY' : 'SELL',
            symbol: trade.symbol,
            amount: trade.amount || 0,
            profit: trade.pnl || 0,
            timestamp: trade.exit_time || trade.entry_time,
            entry_price: trade.entry_price,
            exit_price: trade.exit_price
          }));
          
          setTrades(formattedTrades);
          // حفظ في localStorage كـ backup
          localStorage.setItem('trades', JSON.stringify(formattedTrades));
        } else {
          setTrades([]);
        }
      } catch (error) {
        console.error('Failed to fetch trade history:', error);
        // Fallback إلى localStorage
        const savedTrades = JSON.parse(localStorage.getItem('trades') || '[]');
        setTrades(savedTrades);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    // تحديث كل 30 ثانية
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, [walletAddress]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'غير محدد';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('ar-SA', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'غير محدد';
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-border p-6 rounded-xl"
      >
        <div className="text-center py-12">
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </motion.div>
    );
  }

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
                    {trade.symbol} - {trade.type === 'BUY' ? 'شراء' : 'بيع'}
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

