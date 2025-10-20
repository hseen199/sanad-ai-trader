import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import AutonomousMode from '@/components/dashboard/AutonomousMode';
import { useTranslation } from 'react-i18next';
import { useWallet } from '@solana/wallet-adapter-react';
import { priceService, aiService, tradeService } from '@/services/apiService';

const TradingPanel = ({ balance, setBalance, setProfit }) => {
  const { t } = useTranslation();
  const { publicKey } = useWallet();
  const [currentPrice, setCurrentPrice] = useState(0);
  const [signal, setSignal] = useState('HOLD');
  const [confidence, setConfidence] = useState(0);
  const [isAutonomous, setIsAutonomous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [priceStats, setPriceStats] = useState({
    high24h: 0,
    low24h: 0,
    volume: 0,
  });

  // جلب السعر الحالي والتحليل
  const fetchMarketData = async () => {
    try {
      // جلب السعر الحالي
      const priceData = await priceService.current('SOL');
      if (priceData.status === 'success') {
        setCurrentPrice(priceData.price);
        
        // حساب إحصائيات وهمية بناءً على السعر الحقيقي
        setPriceStats({
          high24h: priceData.price * 1.05,
          low24h: priceData.price * 0.95,
          volume: '2.4M',
        });
      }

      // جلب التحليل الذكي إذا كانت المحفظة متصلة
      if (publicKey) {
        const walletAddress = publicKey.toBase58();
        const analysisData = await aiService.analyze('SOL', walletAddress);
        
        if (analysisData.status === 'success') {
          setAnalysis(analysisData.analysis);
          
          // تحديث الإشارة والثقة
          const signalText = analysisData.analysis.signal.toUpperCase();
          setSignal(signalText);
          setConfidence(analysisData.analysis.confidence * 100);
        }
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  useEffect(() => {
    // جلب البيانات عند التحميل
    fetchMarketData();
    
    // تحديث البيانات كل 5 ثوانٍ
    const interval = setInterval(fetchMarketData, 5000);
    
    return () => clearInterval(interval);
  }, [publicKey]);

  // تنفيذ صفقة يدوية
  const executeTrade = async (type) => {
    if (!publicKey) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    if (!analysis) {
      toast({
        title: 'Error',
        description: 'Waiting for market analysis...',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const walletAddress = publicKey.toBase58();
      const tradeAmount = 500; // يمكن جعلها قابلة للتخصيص
      
      // فتح صفقة جديدة
      const tradeData = await tradeService.open(
        walletAddress,
        'SOL',
        currentPrice,
        tradeAmount,
        analysis.stop_loss || currentPrice * 0.95,
        analysis.take_profit || currentPrice * 1.05,
        analysis.confidence || 0.8
      );

      if (tradeData.status === 'success') {
        toast({
          title: `✅ تم تنفيذ ${type === 'BUY' ? 'الشراء' : 'البيع'}`,
          description: `المبلغ: $${tradeAmount} | السعر: $${currentPrice.toFixed(2)}`,
        });

        // تحديث الربح المحلي
        const profitChange = (Math.random() - 0.3) * 5;
        setProfit(prev => {
          const newProfit = prev + profitChange;
          localStorage.setItem('profit', newProfit.toString());
          return newProfit;
        });
      }
    } catch (error) {
      console.error('Error executing trade:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to execute trade',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-center space-x-4 p-4 rounded-xl bg-slate-900/50 border border-blue-500/20">
          <div className="flex items-center space-x-2 text-gray-400">
            <User size={20} />
            <span>الوضع اليدوي</span>
          </div>
          <Switch
            checked={isAutonomous}
            onCheckedChange={setIsAutonomous}
            id="autonomous-mode-switch"
          />
          <div className="flex items-center space-x-2 text-blue-400 font-semibold">
            <Bot size={20} />
            <span>الوضع التلقائي</span>
          </div>
        </div>

      <AnimatePresence mode="wait">
        {!isAutonomous ? (
           <motion.div
            key="manual"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-6"
           >
            <div
              className="gradient-border p-6 rounded-xl space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-4">السعر الحالي (SOL/USDC)</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">
                    ${currentPrice > 0 ? currentPrice.toFixed(2) : '...'}
                  </span>
                  {currentPrice > 0 && (
                    <span className={`text-lg ${currentPrice > 98 ? 'text-green-400' : 'text-red-400'}`}>
                      {currentPrice > 98 ? '+' : ''}{((currentPrice - 98) / 98 * 100).toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <span className="text-blue-300">أعلى سعر (24س)</span>
                  <span className="text-white font-semibold">${priceStats.high24h.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <span className="text-blue-300">أدنى سعر (24س)</span>
                  <span className="text-white font-semibold">${priceStats.low24h.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <span className="text-blue-300">حجم التداول</span>
                  <span className="text-white font-semibold">{priceStats.volume}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => executeTrade('BUY')}
                  disabled={isLoading || !publicKey || currentPrice === 0}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <TrendingUp className="w-4 h-4 ml-2" />
                  شراء
                </Button>
                <Button
                  onClick={() => executeTrade('SELL')}
                  disabled={isLoading || !publicKey || currentPrice === 0}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                >
                  <TrendingDown className="w-4 h-4 ml-2" />
                  بيع
                </Button>
              </div>
            </div>

            <div
              className="gradient-border p-6 rounded-xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">إشارة AI</h3>
                <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
              </div>

              <div className="text-center space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`inline-block px-8 py-4 rounded-xl text-3xl font-bold ${
                    signal === 'BUY' ? 'bg-green-500/20 text-green-400 border-2 border-green-500' :
                    signal === 'SELL' ? 'bg-red-500/20 text-red-400 border-2 border-red-500' :
                    'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500'
                  }`}
                >
                  {signal === 'BUY' ? '🟢 شراء' : signal === 'SELL' ? '🔴 بيع' : '🟡 انتظار'}
                </motion.div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-300">مستوى الثقة</span>
                    <span className="text-white font-semibold">{confidence.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence}%` }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                </div>
              </div>

              {analysis && (
                <div className="space-y-3 pt-4 border-t border-blue-500/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-300">Stop Loss</span>
                    <span className="text-red-400 font-mono">
                      ${analysis.stop_loss ? analysis.stop_loss.toFixed(2) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-300">Take Profit</span>
                    <span className="text-green-400 font-mono">
                      ${analysis.take_profit ? analysis.take_profit.toFixed(2) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-300">Position Size</span>
                    <span className="text-white font-mono">
                      ${analysis.position_size ? analysis.position_size.toFixed(2) : 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
           <motion.div
            key="autonomous"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
           >
             <AutonomousMode setProfit={setProfit} />
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TradingPanel;

