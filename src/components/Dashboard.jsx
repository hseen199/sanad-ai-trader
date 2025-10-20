import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Shield, TrendingUp, TrendingDown, Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import MyAccount from '@/components/dashboard/MyAccount';
import ActiveTrades from '@/components/dashboard/ActiveTrades';
import MarketMonitor from '@/components/dashboard/MarketMonitor';
import AIStatus from '@/components/dashboard/AIStatus';
import Leaderboard from '@/components/dashboard/Leaderboard';
import AIInsights from '@/components/dashboard/AIInsights';

const Dashboard = ({ walletAddress }) => {
  const { t } = useTranslation();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  
  const [balance, setBalance] = useState(0);
  const [solBalance, setSolBalance] = useState(0);
  const [profit, setProfit] = useState(0);
  const [weeklyProfit, setWeeklyProfit] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBotActive, setIsBotActive] = useState(true);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  // جلب الرصيد الحقيقي من Solana
  useEffect(() => {
    const fetchRealBalance = async () => {
      if (!publicKey || !connection) {
        setIsLoadingBalance(false);
        return;
      }

      try {
        setIsLoadingBalance(true);
        
        // جلب رصيد SOL
        const lamports = await connection.getBalance(publicKey);
        const solAmount = lamports / LAMPORTS_PER_SOL;
        setSolBalance(solAmount);

        // تحويل SOL إلى USD (سعر تقريبي - يمكن جلبه من API)
        const solPriceUSD = 150; // سعر SOL تقريبي
        const usdBalance = solAmount * solPriceUSD;
        setBalance(usdBalance);

        setIsLoadingBalance(false);
      } catch (error) {
        console.error('Error fetching balance:', error);
        
        // Fallback إلى localStorage في حالة الخطأ
        const savedBalance = localStorage.getItem('balance');
        if (savedBalance) {
          setBalance(parseFloat(savedBalance));
        } else {
          const initialBalance = 5000 + Math.random() * 15000;
          setBalance(initialBalance);
          localStorage.setItem('balance', initialBalance.toString());
        }
        
        setIsLoadingBalance(false);
      }
    };

    fetchRealBalance();
    
    // تحديث الرصيد كل 30 ثانية
    const interval = setInterval(fetchRealBalance, 30000);
    
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  // جلب بيانات الربح والإعدادات
  useEffect(() => {
    const savedProfit = localStorage.getItem('profit');
    const savedWeeklyProfit = localStorage.getItem('weeklyProfit');
    
    if (savedProfit) setProfit(parseFloat(savedProfit));
    
    if (savedWeeklyProfit) {
      setWeeklyProfit(parseFloat(savedWeeklyProfit));
    } else {
      const initialWeeklyProfit = (Math.random() * 15) + 2;
      setWeeklyProfit(initialWeeklyProfit);
      localStorage.setItem('weeklyProfit', initialWeeklyProfit.toString());
    }

    const adminWallets = JSON.parse(localStorage.getItem('adminWallets') || '[]');
    if (adminWallets.includes(walletAddress)) {
      setIsAdmin(true);
    }
    
    const settings = JSON.parse(localStorage.getItem('tradingSettings') || '{}');
    setIsBotActive(settings.autoTrading !== false);
  }, [walletAddress]);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -5, scale: 1.03 }}
            className="glass-card p-6 rounded-2xl"
          >
            <p className="text-sm text-blue-300 mb-2">{t('total_balance')}</p>
            {isLoadingBalance ? (
              <p className="text-2xl font-bold text-white">Loading...</p>
            ) : (
              <>
                <p className="text-3xl font-bold text-white">${balance.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">{solBalance.toFixed(4)} SOL</p>
              </>
            )}
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.03 }}
            className="glass-card p-6 rounded-2xl"
          >
            <p className="text-sm text-blue-300 mb-2">{t('profit_loss')} (24h)</p>
            <div className="flex items-baseline gap-2">
                <p className={`text-3xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {profit >= 0 ? '+' : ''}{profit.toFixed(2)}%
                </p>
                {profit >= 0 ? <TrendingUp className="text-green-400" /> : <TrendingDown className="text-red-400" />}
            </div>
            <p className="text-xs text-gray-400 mt-1">{t('last_24h')}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.03 }}
            className="glass-card p-6 rounded-2xl"
          >
            <p className="text-sm text-blue-300 mb-2">{t('bot_status')}</p>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isBotActive ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></div>
              <p className="text-2xl font-bold text-white">{isBotActive ? t('active') : t('inactive')}</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">{isBotActive ? "Analyzing market 24/7" : "Paused by user"}</p>
          </motion.div>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 glass-card p-1">
            <TabsTrigger value="account">{t('my_account')}</TabsTrigger>
            <TabsTrigger value="trades">{t('active_trades')}</TabsTrigger>
            <TabsTrigger value="market">{t('market_monitor')}</TabsTrigger>
            <TabsTrigger value="ai">{t('ai_status')}</TabsTrigger>
            <TabsTrigger value="leaderboard">{t('leaderboard')}</TabsTrigger>
            <TabsTrigger value="insights">{t('ai_insights')}</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <MyAccount walletAddress={walletAddress} balance={balance} />
          </TabsContent>

          <TabsContent value="trades">
            <ActiveTrades />
          </TabsContent>

          <TabsContent value="market">
            <MarketMonitor />
          </TabsContent>

          <TabsContent value="ai">
            <AIStatus />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="insights">
            <AIInsights />
          </TabsContent>
        </Tabs>

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6 rounded-2xl border border-purple-500/30"
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-purple-400" />
              <h3 className="text-xl font-bold text-purple-400">{t('admin_panel')}</h3>
            </div>
            <Link
              to="/dev-admin"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              {t('open_admin_panel')}
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;

