import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, BarChart, Zap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { subscriptionService, accountService } from '@/services/apiService';

const AccountOverview = ({ walletAddress }) => {
  const { t } = useTranslation();
  const [tradeAmount, setTradeAmount] = useState([500]);
  const [riskLevel, setRiskLevel] = useState('medium');
  const [tradingPlan, setTradingPlan] = useState('balanced');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [accountStats, setAccountStats] = useState({
    totalTrades: 0,
    winRate: 0,
    avgProfit: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!walletAddress) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // جلب حالة الاشتراك
        const subData = await subscriptionService.status(walletAddress);
        if (subData.status === 'success') {
          setSubscriptionStatus(subData);
        }
        
        // جلب إحصائيات الحساب
        const statsData = await accountService.overview(walletAddress);
        if (statsData.status === 'success') {
          setAccountStats({
            totalTrades: statsData.total_trades || 0,
            winRate: statsData.win_rate || 0,
            avgProfit: statsData.avg_profit || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch account data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // تحميل الإعدادات من localStorage
    const settings = JSON.parse(localStorage.getItem('tradingSettings') || '{}');
    if (settings.tradeAmount) setTradeAmount([settings.tradeAmount]);
    if (settings.riskLevel) setRiskLevel(settings.riskLevel);
    if (settings.tradingPlan) setTradingPlan(settings.tradingPlan);
  }, [walletAddress]);

  const saveSettings = () => {
    localStorage.setItem('tradingSettings', JSON.stringify({
      tradeAmount: tradeAmount[0],
      riskLevel,
      tradingPlan,
    }));
    toast({
      title: t('settings_saved'),
      description: t('settings_saved_desc'),
    });
  };

  const getSubscriptionType = () => {
    if (!subscriptionStatus) return t('loading');
    
    if (subscriptionStatus.subscription_status === 'trial') {
      return `${t('trial')} (${subscriptionStatus.days_remaining} ${t('days_remaining')})`;
    } else if (subscriptionStatus.subscription_status === 'active') {
      return t('premium');
    } else {
      return t('expired');
    }
  };

  const getRenewalDate = () => {
    if (!subscriptionStatus || !subscriptionStatus.expires_at) {
      return t('not_available');
    }
    
    try {
      const date = new Date(subscriptionStatus.expires_at);
      return date.toLocaleDateString('ar-SA', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return t('not_available');
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid lg:grid-cols-2 gap-6"
      >
        <div className="gradient-border p-6 rounded-xl">
          <p className="text-center text-gray-400">جاري التحميل...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid lg:grid-cols-2 gap-6"
    >
      <div className="gradient-border p-6 rounded-xl space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">{t('subscription_status')}</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50">
            <span className="text-blue-300">{t('subscription_type')}</span>
            <span className="text-white font-semibold">{getSubscriptionType()}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50">
            <span className="text-blue-300">{t('renewal_date')}</span>
            <span className="text-white font-semibold">{getRenewalDate()}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50">
            <span className="text-blue-300">إجمالي الصفقات</span>
            <span className="text-white font-semibold">{accountStats.totalTrades}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50">
            <span className="text-blue-300">نسبة النجاح</span>
            <span className="text-green-400 font-semibold">{accountStats.winRate}%</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50">
            <span className="text-blue-300">متوسط الربح</span>
            <span className={`font-semibold ${accountStats.avgProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {accountStats.avgProfit >= 0 ? '+' : ''}{accountStats.avgProfit.toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-center text-gray-400 pt-2">{t('monthly_fee')}</p>
          <Button
            variant="outline"
            className="w-full mt-2 border-blue-500/50 hover:bg-blue-500/10"
            onClick={() => toast({ title: t('coming_soon') })}
          >
            {t('renew_subscription')}
          </Button>
        </div>
      </div>

      <div className="gradient-border p-6 rounded-xl space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">{t('trading_configuration')}</h3>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-white font-semibold">{t('trade_amount')}</label>
              <span className="text-blue-400 font-mono">${tradeAmount[0]}</span>
            </div>
            <Slider
              value={tradeAmount}
              onValueChange={setTradeAmount}
              max={5000}
              min={100}
              step={50}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-white font-semibold block mb-2">{t('risk_level')}</label>
            <div className="grid grid-cols-3 gap-2">
              {['low', 'medium', 'high'].map((level) => (
                <button
                  key={level}
                  onClick={() => setRiskLevel(level)}
                  className={`p-2 rounded-lg text-sm font-semibold transition-all ${
                    riskLevel === level
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                  }`}
                >
                  {t(level)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white font-semibold block mb-2">{t('trading_plan')}</label>
            <div className="grid grid-cols-3 gap-2">
              {['conservative', 'balanced', 'aggressive'].map((plan) => (
                <button
                  key={plan}
                  onClick={() => setTradingPlan(plan)}
                  className={`p-2 rounded-lg text-sm font-semibold transition-all ${
                    tradingPlan === plan
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                  }`}
                >
                  {t(plan)}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={saveSettings}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {t('save_settings')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AccountOverview;

