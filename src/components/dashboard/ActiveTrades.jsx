import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, XCircle, Zap, LogIn, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { useWallet } from '@solana/wallet-adapter-react';
import { portfolioService, tradeService } from '@/services/apiService';

const ActiveTrades = ({ isBotActive, setProfit }) => {
  const { t } = useTranslation();
  const { publicKey } = useWallet();
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // جلب الصفقات النشطة من Backend
  const fetchActiveTrades = async () => {
    if (!publicKey) {
      setTrades([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const walletAddress = publicKey.toBase58();
      const data = await portfolioService.positions(walletAddress);
      
      if (data.status === 'success' && data.positions) {
        // تحويل البيانات للصيغة المطلوبة
        const formattedTrades = data.positions.map(pos => ({
          id: pos.id || `trade_${Date.now()}_${pos.token}`,
          pair: `${pos.token}/USDT`,
          amount: pos.amount || 0,
          entry: pos.entry_price || 0,
          pnl: pos.pnl_percentage || 0,
          pnlValue: pos.pnl_value || 0,
        }));
        
        setTrades(formattedTrades);
      } else {
        setTrades([]);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching active trades:', err);
      setError(err.message);
      setIsLoading(false);
      setTrades([]);
    }
  };

  useEffect(() => {
    if (isBotActive && publicKey) {
      // جلب الصفقات عند التحميل
      fetchActiveTrades();
      
      // تحديث الصفقات كل 10 ثوانٍ
      const interval = setInterval(fetchActiveTrades, 10000);
      
      return () => clearInterval(interval);
    } else {
      setTrades([]);
    }
  }, [isBotActive, publicKey]);

  // إغلاق صفقة
  const handleCloseTrade = async (id, pnl, auto = false) => {
    const tradeToClose = trades.find(trade => trade.id === id);
    if (!tradeToClose || !publicKey) return;

    try {
      const walletAddress = publicKey.toBase58();
      const data = await tradeService.close(walletAddress, id);

      if (data.status === 'success') {
        // إزالة الصفقة من القائمة
        setTrades(prev => prev.filter(trade => trade.id !== id));
        
        // تحديث الربح
        setProfit(prev => {
          const newProfit = prev + pnl;
          localStorage.setItem('profit', newProfit.toString());
          return newProfit;
        });

        const fee = Math.abs(tradeToClose.pnlValue * 0.03);

        toast({
          title: `🏁 ${t('trade_closed')}`,
          description: `${tradeToClose.pair} | P/L: ${pnl.toFixed(2)}% ($${tradeToClose.pnlValue.toFixed(2)}) | ${t('fees')}: $${fee.toFixed(2)}`,
          icon: <LogOut className={pnl >= 0 ? "text-green-400" : "text-red-400"} />,
        });

        // تحديث القائمة
        fetchActiveTrades();
      }
    } catch (error) {
      console.error('Error closing trade:', error);
      toast({
        title: 'Error',
        description: 'Failed to close trade. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 md:p-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-yellow-400" />
          <h3 className="text-2xl font-bold text-white">{t('active_trades')}</h3>
          {error && (
            <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">
              Connection error
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchActiveTrades}
            disabled={isLoading || !publicKey}
            className="p-2 glass-card rounded-lg hover:bg-blue-500/10 transition-colors disabled:opacity-50"
            title="Refresh trades"
          >
            <RefreshCw className={`w-5 h-5 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-semibold">{trades.length}</span>
        </div>
      </div>

      {!publicKey ? (
        <div className="text-center py-12">
          <p className="text-gray-300 text-lg">{t('connect_wallet_first')}</p>
          <p className="text-sm text-gray-500 mt-2">{t('connect_wallet_to_see_trades')}</p>
        </div>
      ) : trades.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-300 text-lg">{isBotActive ? t('no_active_trades') : t('bot_is_paused')}</p>
          {isBotActive && <p className="text-sm text-gray-500 mt-2">{t('bot_is_analyzing')}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="hidden md:grid grid-cols-6 items-center gap-4 px-4 text-xs text-gray-400 uppercase">
              <span className="col-span-2">{t('pair')}</span>
              <span>{t('amount')}</span>
              <span>{t('entry_price')}</span>
              <span className="text-center">{t('current_pnl')}</span>
          </div>
          {trades.map((trade) => (
            <motion.div
              key={trade.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 rounded-lg bg-slate-900/50 border border-blue-500/20 grid grid-cols-2 md:grid-cols-6 items-center gap-4"
            >
              <div className="flex items-center gap-3 col-span-2">
                {trade.pnl >= 0 ? <TrendingUp className="w-6 h-6 text-green-400 hidden sm:block" /> : <TrendingDown className="w-6 h-6 text-red-400 hidden sm:block" />}
                <div>
                  <p className="font-bold text-white">{trade.pair}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-blue-300 md:hidden">{t('amount')}</p>
                <p className="font-mono text-white">${trade.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-300 md:hidden">{t('entry_price')}</p>
                <p className="font-mono text-white">${trade.entry}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-blue-300 md:hidden">{t('current_pnl')}</p>
                <div className="flex flex-col">
                  <p className={`font-bold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.pnl.toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-400">(${trade.pnlValue.toFixed(2)})</p>
                </div>
              </div>
              <div className="col-span-2 md:col-span-1 text-right">
                <Button size="sm" variant="destructive" onClick={() => handleCloseTrade(trade.id, trade.pnl, false)}>
                  <XCircle size={16} className="ltr:mr-2 rtl:ml-2" />
                  {t('close_trade')}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ActiveTrades;

