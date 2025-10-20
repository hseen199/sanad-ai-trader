
    import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { Link } from 'react-router-dom';
    import { Shield, TrendingUp, TrendingDown, Bot } from 'lucide-react';
    import { useTranslation } from 'react-i18next';
    import { useConnection, useWallet } from '@solana/wallet-adapter-react';
    import { LAMPORTS_PER_SOL } from '@solana/web3.js';
    import MyAccount from '@/components/dashboard/MyAccount';
    import ActiveTrades from '@/components/dashboard/ActiveTrades';
    import MarketMonitor from '@/components/dashboard/MarketMonitor';
    import AIStatus from '@/components/dashboard/AIStatus';
    import Leaderboard from '@/components/dashboard/Leaderboard';
    import AIInsights from '@/components/dashboard/AIInsights';
    
    const Dashboard = ({ walletAddress }) => {
      const { t } = useTranslation();
      const [balance, setBalance] = useState(0);
      const [profit, setProfit] = useState(0);
      const [weeklyProfit, setWeeklyProfit] = useState(0);
      const [isAdmin, setIsAdmin] = useState(false);
      const [isBotActive, setIsBotActive] = useState(true);
    
      const { connection } = useConnection();
      const { publicKey } = useWallet();

      // جلب الرصيد الحقيقي من Solana
      useEffect(() => {
        const fetchBalance = async () => {
          if (publicKey && connection) {
            try {
              const lamports = await connection.getBalance(publicKey);
              const solBalance = lamports / LAMPORTS_PER_SOL;
              
              // جلب سعر SOL الحقيقي من API
              try {
                const priceResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/price/solana`);
                const priceData = await priceResponse.json();
                const solPrice = priceData.status === 'success' ? priceData.price : 150;
                const usdBalance = solBalance * solPrice;
                setBalance(usdBalance);
                localStorage.setItem('balance', usdBalance.toString());
              } catch (priceError) {
                console.error('Error fetching SOL price:', priceError);
                // Fallback إلى سعر تقريبي
                const usdBalance = solBalance * 150;
                setBalance(usdBalance);
                localStorage.setItem('balance', usdBalance.toString());
              }
            } catch (error) {
              console.error('Error fetching balance:', error);
              // Fallback إلى localStorage
              const savedBalance = localStorage.getItem('balance');
              if (savedBalance) setBalance(parseFloat(savedBalance));
              else setBalance(5000);
            }
          } else {
            // Fallback إلى localStorage
            const savedBalance = localStorage.getItem('balance');
            if (savedBalance) setBalance(parseFloat(savedBalance));
            else setBalance(5000);
          }
        };

        fetchBalance();
        const interval = setInterval(fetchBalance, 30000);
        return () => clearInterval(interval);
      }, [publicKey, connection]);

  // جلب بيانات الأداء من API
  useEffect(() => {
    const fetchPerformance = async () => {
      if (!walletAddress) return;
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/account/performance?wallet_address=${walletAddress}&period=7d`);
        const data = await response.json();
        
        if (data.status === 'success') {
          setWeeklyProfit(data.weekly_profit || 0);
          setProfit(data.total_profit || 0);
          localStorage.setItem('weeklyProfit', data.weekly_profit.toString());
          localStorage.setItem('profit', data.total_profit.toString());
        }
      } catch (error) {
        console.error('Failed to fetch performance:', error);
        // Fallback إلى localStorage
        const savedWeeklyProfit = localStorage.getItem('weeklyProfit');
        const savedProfit = localStorage.getItem('profit');
        if (savedWeeklyProfit) setWeeklyProfit(parseFloat(savedWeeklyProfit));
        else setWeeklyProfit(0);
        if (savedProfit) setProfit(parseFloat(savedProfit));
        else setProfit(0);
      }
    };
    
    fetchPerformance();
    const interval = setInterval(fetchPerformance, 60000); // تحديث كل دقيقة
    
    // فحص الصلاحيات والإعدادات
    const adminWallets = JSON.parse(localStorage.getItem('adminWallets') || '[]');
    if (adminWallets.includes(walletAddress)) {
      setIsAdmin(true);
    }
    
    const settings = JSON.parse(localStorage.getItem('tradingSettings'));
    if (settings) {
      setIsBotActive(settings.autoTrading !== false);
    }
    
    return () => clearInterval(interval);
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
                <p className="text-3xl font-bold text-white">${balance.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">USDT</p>
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
                <TabsTrigger value="ai_insights">{t('ai_insights')}</TabsTrigger>
                <TabsTrigger value="market">{t('market_monitor')}</TabsTrigger>
                <TabsTrigger value="ai_status">{t('ai_status')}</TabsTrigger>
                <TabsTrigger value="leaderboard">{t('leaderboard')}</TabsTrigger>
              </TabsList>
    
              <TabsContent value="account" className="mt-6">
                <MyAccount setIsBotActive={setIsBotActive} />
              </TabsContent>
    
              <TabsContent value="trades" className="mt-6">
                <ActiveTrades isBotActive={isBotActive} setProfit={setProfit} />
              </TabsContent>
    
               <TabsContent value="ai_insights" className="mt-6">
                <AIInsights />
              </TabsContent>

              <TabsContent value="market" className="mt-6">
                <MarketMonitor />
              </TabsContent>
    
              <TabsContent value="ai_status" className="mt-6">
                <AIStatus />
              </TabsContent>
    
              <TabsContent value="leaderboard" className="mt-6">
                <Leaderboard currentUserProfit={weeklyProfit} />
              </TabsContent>
            </Tabs>
            
            {isAdmin && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mt-8"
                >
                    <Link to="/dev-admin" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold glow-effect">
                        <Shield size={20} />
                        <span>{t('dev_panel_link')}</span>
                    </Link>
                </motion.div>
            )}
          </motion.div>
        </div>
      );
    };
    
    export default Dashboard;
  