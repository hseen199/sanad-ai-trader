
    import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { TrendingUp, TrendingDown, XCircle, Zap, LogIn, LogOut } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { toast } from '@/components/ui/use-toast';
    import { useTranslation } from 'react-i18next';
    
    const generateMockTrade = () => {
      const pairs = ['SOL/USDT', 'BTC/USDT', 'ETH/USDT', 'WIF/USDT', 'JUP/USDT', 'BONK/USDT'];
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const tradeAmountSettings = JSON.parse(localStorage.getItem('tradingSettings'))?.tradeAmount || 500;
      const entry = (Math.random() * 1000).toFixed(2);
      return {
        id: Date.now() + Math.random(),
        pair,
        amount: tradeAmountSettings + (Math.random() - 0.5) * 100,
        entry: entry,
        pnl: (Math.random() - 0.45) * 5,
        pnlValue: (entry * ((Math.random() - 0.45) * 0.05)),
      };
    };
    
    const ActiveTrades = ({ isBotActive, setProfit }) => {
      const { t } = useTranslation();
      const [trades, setTrades] = useState([]);
    
      useEffect(() => {
        // Initial mock trades
        if (isBotActive) {
            setTrades([generateMockTrade(), generateMockTrade()]);
        }
        
        if (isBotActive) {
          const tradeInterval = setInterval(() => {
            setTrades(prev => {
              const updatedTrades = prev.map(trade => ({
                ...trade,
                pnl: trade.pnl + (Math.random() - 0.5) * 0.5,
                pnlValue: trade.pnlValue + (Math.random() - 0.5) * 2,
              }));
    
              if (Math.random() < 0.1 && updatedTrades.length > 0) {
                 const tradeToClose = updatedTrades.shift();
                 handleCloseTrade(tradeToClose.id, tradeToClose.pnl, true);
              }
              
              if (Math.random() < 0.2 && updatedTrades.length < 5) {
                 const newTrade = generateMockTrade();
                 updatedTrades.push(newTrade);
                 toast({
                     title: `🚀 ${t('new_trade_opened')}`,
                     description: `${t('buy_signal_detected', {pair: newTrade.pair})} | ${t('amount')}: $${newTrade.amount.toFixed(2)}`,
                     icon: <LogIn className="text-green-400" />
                 });
              }
    
              return updatedTrades;
            });
          }, 3000);
          return () => clearInterval(tradeInterval);
        } else {
            setTrades([]);
        }
      }, [isBotActive, setProfit, t]);
    
      const handleCloseTrade = (id, pnl, auto = false) => {
        const tradeToClose = trades.find(trade => trade.id === id);
        if (!tradeToClose) return;
    
        setTrades(prev => prev.filter(trade => trade.id !== id));
        
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
            </div>
            <span className="px-3 py-1 mt-2 sm:mt-0 rounded-full bg-blue-500/20 text-blue-300 font-semibold">{trades.length}</span>
          </div>
    
          {trades.length === 0 ? (
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
  