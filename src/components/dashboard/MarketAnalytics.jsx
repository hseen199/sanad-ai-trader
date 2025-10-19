import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, TrendingDown, DollarSign, Activity, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const topMovers = [
  { name: 'WIF', change: 15.2, color: 'green' },
  { name: 'BONK', change: 8.7, color: 'green' },
  { name: 'JUP', change: -5.1, color: 'red' },
];

const MarketAnalytics = () => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid lg:grid-cols-2 gap-6"
    >
      <div className="gradient-border p-6 rounded-xl space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
            <BarChart2 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">{t('market_overview')}</h3>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-blue-400" />
              <span className="text-blue-300">{t('sol_price')}</span>
            </div>
            <span className="text-white font-semibold font-mono">$172.45</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-blue-400" />
              <span className="text-blue-300">{t('market_cap')}</span>
            </div>
            <span className="text-white font-semibold font-mono">$79.5B</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-blue-400" />
              <span className="text-blue-300">{t('volume_24h')}</span>
            </div>
            <span className="text-white font-semibold font-mono">$3.1B</span>
          </div>
        </div>
      </div>
      <div className="gradient-border p-6 rounded-xl space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">{t('top_movers')}</h3>
        </div>
        <div className="space-y-3">
          {topMovers.map((mover, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50"
            >
              <span className="font-bold text-white">{mover.name}</span>
              <div className={`flex items-center gap-1 font-semibold ${mover.color === 'green' ? 'text-green-400' : 'text-red-400'}`}>
                {mover.color === 'green' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{mover.change}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MarketAnalytics;