
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
              const solPrice = 150; // سعر SOL تقريبي
              const usdBalance = solBalance * solPrice;
              setBalance(usdBalance);
              localStorage.setItem('balance', usdBalance.toString());
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

      useEffect(() => {
        const savedProfit = localStorage.getItem('profit');
        const savedWeeklyProfit = localStorage.getItem('weeklyProfit');
        
        if (savedProfit) setProfit(parseFloat(savedProfit));
        
        if (savedProfit) setProfit(parseFloat(savedProfit));
        if (savedWeeklyProfit) setWeeklyProfit(parseFloat(savedWeeklyProfit));
        else {
            const initialWeeklyProfit = (Math.random() * 15) + 2;
            setWeeklyProfit(initialWeeklyProfit);
            localStorage.setItem('weeklyProfit', initialWeeklyProfit.toString());
        }
    
        const adminWallets = JSON.parse(localStorage.getItem('adminWallets') || '[]');
        if (adminWallets.includes(walletAddress)) {
          setIsAdmin(true);
        }
        
        const settings = JSON.parse(localStorage.getItem('tradingSettings'));
        if (settings) {
          setIsBotActive(settings.autoTrading !== false);
        }
    
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
  