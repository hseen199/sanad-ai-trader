import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, BarChart, Zap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const AccountOverview = () => {
  const { t } = useTranslation();
  const [tradeAmount, setTradeAmount] = useState([500]);
  const [riskLevel, setRiskLevel] = useState('medium');
  const [tradingPlan, setTradingPlan] = useState('balanced');

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('tradingSettings'));
    if (settings) {
      setTradeAmount([settings.tradeAmount]);
      setRiskLevel(settings.riskLevel);
      setTradingPlan(settings.tradingPlan);
    }
  }, []);

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
            <span className="text-white font-semibold">{t('premium')}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50">
            <span className="text-blue-300">{t('renewal_date')}</span>
            <span className="text-white font-semibold">15 Nov 2025</span>
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
              <span className="text-blue-400 font-semibold">${tradeAmount[0]}</span>
            </div>
            <Slider value={tradeAmount} onValueChange={setTradeAmount} min={50} max={5000} step={50} />
          </div>

          <div>
            <label className="text-white font-semibold mb-2 block">{t('risk_level')}</label>
            <div className="grid grid-cols-3 gap-2">
              {['low', 'medium', 'high'].map(level => (
                <Button key={level} onClick={() => setRiskLevel(level)} variant={riskLevel === level ? 'default' : 'outline'} className={riskLevel === level ? 'bg-blue-600' : 'border-blue-500/50'}>{t(level)}</Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white font-semibold mb-2 block">{t('trading_plan')}</label>
            <div className="grid grid-cols-3 gap-2">
              {['conservative', 'balanced', 'aggressive'].map(plan => (
                <Button key={plan} onClick={() => setTradingPlan(plan)} variant={tradingPlan === plan ? 'default' : 'outline'} className={tradingPlan === plan ? 'bg-blue-600' : 'border-blue-500/50'}>{t(plan)}</Button>
              ))}
            </div>
          </div>

          <Button onClick={saveSettings} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">{t('save_settings')}</Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AccountOverview;