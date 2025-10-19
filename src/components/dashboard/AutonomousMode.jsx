import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Zap, Search, Target, FileText, Percent } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const topCoins = [
  { name: 'Bitcoin', symbol: 'BTC', price: 68000 },
  { name: 'Ethereum', symbol: 'ETH', price: 3500 },
  { name: 'Solana', symbol: 'SOL', price: 170 },
  { name: 'BNB', symbol: 'BNB', price: 600 },
  { name: 'XRP', symbol: 'XRP', price: 0.52 },
  { name: 'Dogecoin', symbol: 'DOGE', price: 0.16 },
  { name: 'Cardano', symbol: 'ADA', price: 0.45 },
  { name: 'Avalanche', symbol: 'AVAX', price: 37 },
  { name: 'Chainlink', symbol: 'LINK', price: 18.5 },
];

const AutonomousMode = ({ setProfit }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState('البحث عن فرص...');
  const [currentTarget, setCurrentTarget] = useState(null);
  const [scanIndex, setScanIndex] = useState(0);

  useEffect(() => {
    const scanInterval = setInterval(() => {
      setScanIndex(prev => (prev + 1) % topCoins.length);
    }, 1500);

    const decisionInterval = setInterval(() => {
      setStatus('تحليل أفضل فرصة...');
      setTimeout(() => {
        const selectedCoin = topCoins[Math.floor(Math.random() * topCoins.length)];
        setCurrentTarget(selectedCoin);
        setStatus(`تم تحديد الهدف: ${selectedCoin.symbol}. تنفيذ الصفقة...`);
        
        setTimeout(() => {
          const tradeType = Math.random() > 0.5 ? 'شراء' : 'بيع';
          const profitChange = (Math.random() - 0.4) * 3;
          
          setProfit(prev => {
            const newProfit = prev + profitChange;
            localStorage.setItem('profit', newProfit.toString());
            return newProfit;
          });

          toast({
            title: `🤖 صفقة تلقائية: ${tradeType} ${selectedCoin.symbol}`,
            description: `ربح/خسارة: ${profitChange.toFixed(2)}%`,
          });

          setStatus('البحث عن فرص...');
          setCurrentTarget(null);
        }, 3000);
      }, 2000);
    }, 15000);

    return () => {
      clearInterval(scanInterval);
      clearInterval(decisionInterval);
    };
  }, [setProfit]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 gradient-border p-6 rounded-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">الوضع التلقائي</h3>
            <p className="text-sm text-blue-300">البوت يتداول نيابة عنك 24/7</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/50 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
            <p className="font-semibold text-white">الحالة الحالية: {status}</p>
          </div>
        </div>
        
        {currentTarget && (
          <motion.div 
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-3"
          >
             <Target className="w-5 h-5 text-green-400" />
            <p className="font-semibold text-white">
              الهدف الحالي: {currentTarget.name} ({currentTarget.symbol})
            </p>
          </motion.div>
        )}

        <div className="space-y-4">
            <div className="flex items-center gap-3 text-lg font-semibold">
                <FileText className="w-5 h-5 text-blue-400" />
                <h4 className="text-white">ملخص النشاط</h4>
            </div>
            <div className="text-sm text-gray-400 p-4 bg-slate-800/50 rounded-lg">
                <p>يقوم البوت بالبحث المستمر ضمن قائمة أفضل 200 عملة رقمية عن أفضل فرص التداول بناءً على مجموعة من المؤشرات الفنية وتحليل الذكاء الاصطناعي. عند العثور على فرصة ذات احتمالية نجاح عالية، يقوم البوت تلقائيًا بتنفيذ صفقة بيع أو شراء مع إدارة ذكية للمخاطر.</p>
            </div>
             <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <Percent className="w-5 h-5 text-purple-400" />
                <p className="text-sm text-purple-200">
                    ميزة قادمة: سيتم تطبيق رسوم بنسبة 5% على الأرباح المحققة في هذا الوضع.
                </p>
            </div>
        </div>

      </div>
      
      <div className="gradient-border p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
            <Search className="w-5 h-5 text-blue-400" />
            <h4 className="text-xl font-bold text-white">تحليل السوق</h4>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
          {topCoins.map((coin, index) => (
            <motion.div
              key={coin.symbol}
              animate={{
                backgroundColor: scanIndex === index ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.05)',
                borderColor: scanIndex === index ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.2)',
              }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${scanIndex === index ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'}`}></div>
                <div>
                  <p className="font-bold text-white">{coin.symbol}</p>
                  <p className="text-xs text-gray-400">{coin.name}</p>
                </div>
              </div>
              <div className="font-mono text-white">${coin.price.toLocaleString()}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutonomousMode;