import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Zap, Search, Target, FileText, Percent } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const AutonomousMode = ({ setProfit, walletAddress }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState('البحث عن فرص...');
  const [currentTarget, setCurrentTarget] = useState(null);
  const [scanIndex, setScanIndex] = useState(0);
  const [topCoins, setTopCoins] = useState([]);
  const [isActive, setIsActive] = useState(false);

  // جلب أفضل العملات من API
  useEffect(() => {
    const fetchTopCoins = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/price/multiple?symbols=bitcoin,ethereum,solana,binancecoin,ripple,dogecoin,cardano,avalanche-2,chainlink`);
        const data = await response.json();
        
        if (data.status === 'success' && data.prices) {
          const formatted = data.prices.map(coin => ({
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            price: coin.current_price
          }));
          setTopCoins(formatted);
        } else {
          // Fallback
          setTopCoins([
            { name: 'Bitcoin', symbol: 'BTC', price: 68000 },
            { name: 'Ethereum', symbol: 'ETH', price: 3500 },
            { name: 'Solana', symbol: 'SOL', price: 170 }
          ]);
        }
      } catch (error) {
        console.error('Error fetching coins:', error);
        setTopCoins([
          { name: 'Bitcoin', symbol: 'BTC', price: 68000 },
          { name: 'Ethereum', symbol: 'ETH', price: 3500 },
          { name: 'Solana', symbol: 'SOL', price: 170 }
        ]);
      }
    };
    
    fetchTopCoins();
  }, []);

  useEffect(() => {
    if (!isActive || topCoins.length === 0) return;
    
    const scanInterval = setInterval(() => {
      setScanIndex(prev => (prev + 1) % topCoins.length);
    }, 1500);

    const decisionInterval = setInterval(async () => {
      setStatus('تحليل أفضل فرصة...');
      
      try {
        // جلب إشارة من AI
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/ai/status`);
        const data = await response.json();
        
        if (data.status === 'success' && data.signals && data.signals.length > 0) {
          // استخدام أول إشارة من AI
          const signal = data.signals[0];
          const selectedCoin = topCoins.find(c => signal.pair.includes(c.symbol)) || topCoins[0];
          
          setCurrentTarget(selectedCoin);
          setStatus(`تم تحديد الهدف: ${selectedCoin.symbol}. تنفيذ الصفقة...`);
          
          setTimeout(() => {
            const tradeType = signal.signal === 'شراء' ? 'شراء' : signal.signal === 'بيع' ? 'بيع' : 'احتفاظ';
            
            if (tradeType !== 'احتفاظ') {
              // محاكاة تنفيذ الصفقة
              const profitChange = (signal.confidence - 0.5) * 4; // ربح بناءً على الثقة
              
              setProfit(prev => {
                const newProfit = prev + profitChange;
                localStorage.setItem('profit', newProfit.toString());
                return newProfit;
              });

              toast({
                title: `🤖 صفقة تلقائية: ${tradeType} ${selectedCoin.symbol}`,
                description: `ربح/خسارة: ${profitChange.toFixed(2)}% | ثقة AI: ${(signal.confidence * 100).toFixed(0)}%`,
              });

              setStatus(`✅ تم ${tradeType} ${selectedCoin.symbol} بنجاح`);
            } else {
              setStatus('🔍 لا توجد فرص مناسبة حالياً...');
            }
          }, 2000);
        } else {
          setStatus('🔍 البحث عن فرص جديدة...');
        }
      } catch (error) {
        console.error('Error in autonomous mode:', error);
        setStatus('⚠️ خطأ في الاتصال بمحرك AI');
      }
    }, 15000);

    return () => {
      clearInterval(scanInterval);
      clearInterval(decisionInterval);
    };
  }, [isActive, topCoins, setProfit]);

  const toggleAutonomous = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setStatus('🚀 تم تفعيل الوضع التلقائي');
      toast({
        title: '🤖 الوضع التلقائي مفعّل',
        description: 'سيقوم الذكاء الاصطناعي بالتداول تلقائياً',
      });
    } else {
      setStatus('⏸️ الوضع التلقائي متوقف');
      toast({
        title: '⏸️ تم إيقاف الوضع التلقائي',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-border p-6 rounded-xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{t('autonomous_mode')}</h3>
            <p className="text-sm text-gray-400">AI التداول الآلي بالذكاء الاصطناعي</p>
          </div>
        </div>
        <button
          onClick={toggleAutonomous}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            isActive
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isActive ? '⏸️ إيقاف' : '▶️ تفعيل'}
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-900/50 border border-blue-500/20">
          <Zap className={`w-5 h-5 ${isActive ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} />
          <div className="flex-1">
            <p className="text-sm text-blue-300">الحالة</p>
            <p className="text-white font-semibold">{status}</p>
          </div>
        </div>

        {currentTarget && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <Target className="w-5 h-5 text-purple-400" />
            <div className="flex-1">
              <p className="text-sm text-purple-300">الهدف الحالي</p>
              <p className="text-white font-semibold">
                {currentTarget.name} ({currentTarget.symbol}) - ${currentTarget.price.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <div className="p-4 rounded-lg bg-slate-900/50">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-blue-400" />
            <p className="text-sm text-blue-300">مسح السوق</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {topCoins.slice(0, 9).map((coin, idx) => (
              <div
                key={coin.symbol}
                className={`p-2 rounded text-center text-xs transition-all ${
                  idx === scanIndex && isActive
                    ? 'bg-blue-500/30 border border-blue-500'
                    : 'bg-slate-800/50'
                }`}
              >
                <p className="text-white font-semibold">{coin.symbol}</p>
                <p className="text-gray-400">${coin.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-xs text-yellow-300 font-semibold">ملاحظة</p>
              <p className="text-xs text-gray-400 mt-1">
                الوضع التلقائي يستخدم الذكاء الاصطناعي لاتخاذ قرارات التداول. تأكد من مراجعة إعدادات المخاطرة.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AutonomousMode;

