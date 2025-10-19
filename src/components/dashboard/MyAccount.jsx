
    import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { User, Settings, CheckCircle, Zap } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Slider } from '@/components/ui/slider';
    import { Switch } from '@/components/ui/switch';
    import { toast } from '@/components/ui/use-toast';
    import { useTranslation } from 'react-i18next';
    
    const MyAccount = ({ setIsBotActive }) => {
      const { t } = useTranslation();
      const [tradeAmount, setTradeAmount] = useState([500]);
      const [riskLevel, setRiskLevel] = useState('medium');
      const [tradingPlan, setTradingPlan] = useState('balanced');
      const [autoTrading, setAutoTrading] = useState(true);
      const [notifications, setNotifications] = useState(true);
      const [expiryDays, setExpiryDays] = useState(30);
    
      useEffect(() => {
        const settings = JSON.parse(localStorage.getItem('tradingSettings'));
        if (settings) {
          setTradeAmount([settings.tradeAmount || 500]);
          setRiskLevel(settings.riskLevel || 'medium');
          setTradingPlan(settings.tradingPlan || 'balanced');
          setAutoTrading(settings.autoTrading !== false);
          setNotifications(settings.notifications !== false);
        }
        
        const wallet = localStorage.getItem('phantomWallet');
        const subscription = JSON.parse(localStorage.getItem(`subscription_${wallet}`));
        if (subscription && subscription.expiry) {
            const diff = new Date(subscription.expiry) - new Date();
            setExpiryDays(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
        }
      }, []);
    
      const saveSettings = () => {
        localStorage.setItem('tradingSettings', JSON.stringify({
          tradeAmount: tradeAmount[0],
          riskLevel,
          tradingPlan,
          autoTrading,
          notifications
        }));
        setIsBotActive(autoTrading);
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
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-white">{t('subscription_status')}</h3>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50">
                <span className="text-blue-300">{t('expires_in')}</span>
                <span className="text-white font-semibold">{expiryDays} {t('days')}</span>
              </div>
              <Button variant="outline" className="w-full glass-button" onClick={() => toast({ title: t('coming_soon') })}>
                {t('renew_subscription')}
              </Button>
            </div>
    
            <div className="glass-card p-6 space-y-4">
               <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">{t('bot_controls')}</h3>
              </div>
               <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50">
                <div>
                    <p className="font-semibold text-white">{t('auto_trading')}</p>
                    <p className="text-sm text-gray-400">{autoTrading ? t('bot_is_active') : t('bot_is_paused')}</p>
                </div>
                <Switch checked={autoTrading} onCheckedChange={setAutoTrading} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50">
                <div>
                    <p className="font-semibold text-white">{t('trade_notifications')}</p>
                    <p className="text-sm text-gray-400">{t('receive_trade_alerts')}</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">{t('trading_configuration')}</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white font-semibold">{t('trade_amount')}</label>
                  <span className="text-blue-400 font-semibold">${tradeAmount[0]}</span>
                </div>
                <Slider value={tradeAmount} onValueChange={setTradeAmount} min={50} max={5000} step={50} />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>$50</span>
                  <span>$5000</span>
                </div>
              </div>
    
              <div>
                <label className="text-white font-semibold mb-2 block">{t('risk_level')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map(level => (
                    <Button key={level} onClick={() => setRiskLevel(level)} variant={riskLevel === level ? 'default' : 'outline'} className={riskLevel === level ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'glass-button'}>{t(level)}</Button>
                  ))}
                </div>
              </div>
    
              <div>
                <label className="text-white font-semibold mb-2 block">{t('trading_plan')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['conservative', 'balanced', 'aggressive'].map(plan => (
                    <Button key={plan} onClick={() => setTradingPlan(plan)} variant={tradingPlan === plan ? 'default' : 'outline'} className={tradingPlan === plan ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'glass-button'}>{t(plan)}</Button>
                  ))}
                </div>
              </div>
    
              <Button onClick={saveSettings} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 glow-effect text-white font-bold">{t('save_settings')}</Button>
            </div>
          </div>
        </motion.div>
      );
    };
    
    export default MyAccount;
  