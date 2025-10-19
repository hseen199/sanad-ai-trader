import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Shield, Bell, Zap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { t } = useTranslation();
  const [autoTrade, setAutoTrade] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [riskLevel, setRiskLevel] = useState([50]);
  const [maxTrade, setMaxTrade] = useState([1000]);

  const saveSettings = () => {
    localStorage.setItem('settings', JSON.stringify({
      autoTrade,
      notifications,
      riskLevel: riskLevel[0],
      maxTrade: maxTrade[0],
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
      className="space-y-6"
    >
      <div className="gradient-border p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">{t('bot_settings')}</h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-blue-500/20">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white font-semibold">{t('auto_trading')}</p>
                <p className="text-sm text-gray-400">{t('auto_trading_desc')}</p>
              </div>
            </div>
            <Switch checked={autoTrade} onCheckedChange={setAutoTrade} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-blue-500/20">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white font-semibold">{t('notifications')}</p>
                <p className="text-sm text-gray-400">{t('notifications_desc')}</p>
              </div>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>

          <div className="p-4 rounded-lg bg-slate-900/50 border border-blue-500/20 space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-white font-semibold">{t('risk_level')}</p>
                <p className="text-sm text-gray-400">{t('risk_description')}</p>
              </div>
              <span className="text-blue-400 font-semibold">{riskLevel[0]}%</span>
            </div>
            <Slider
              value={riskLevel}
              onValueChange={setRiskLevel}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{t('low')}</span>
              <span>{t('medium')}</span>
              <span>{t('high')}</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/50 border border-blue-500/20 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-white font-semibold">{t('max_trade_amount')}</p>
                <p className="text-sm text-gray-400">{t('max_trade_amount_desc')}</p>
              </div>
              <span className="text-blue-400 font-semibold">${maxTrade[0]}</span>
            </div>
            <Slider
              value={maxTrade}
              onValueChange={setMaxTrade}
              max={5000}
              step={100}
              className="w-full"
            />
          </div>

          <Button
            onClick={saveSettings}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {t('save_settings')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;