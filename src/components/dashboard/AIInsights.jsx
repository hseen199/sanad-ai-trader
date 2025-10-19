
    import React from 'react';
    import { motion } from 'framer-motion';
    import { Brain, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
    import { useTranslation } from 'react-i18next';
    
    const AIInsights = () => {
      const { t } = useTranslation();
    
      const insights = [
        {
          icon: TrendingUp,
          type: t('opportunity'),
          title: t('strong_bullish_trend'),
          description: 'SOL/USDT shows strong upward momentum. Potential entry point.',
          confidence: 85,
          color: 'green',
        },
        {
          icon: AlertTriangle,
          type: t('warning'),
          title: t('high_volatility_expected'),
          description: 'Market shows unusual volume. Increased risk ahead.',
          confidence: 72,
          color: 'yellow',
        },
        {
          icon: Lightbulb,
          type: t('recommendation'),
          title: t('good_entry_point'),
          description: 'RSI and MACD indicators suggest a good entry point for WIF/USDT.',
          confidence: 78,
          color: 'blue',
        },
      ];
    
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{t('ai_insights')}</h3>
                <p className="text-sm text-blue-300">{t('ai_insights_desc')}</p>
              </div>
            </div>
    
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-slate-900/50 border border-blue-500/20 hover:border-blue-500/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      insight.color === 'green' ? 'bg-green-500/20' :
                      insight.color === 'yellow' ? 'bg-yellow-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      <insight.icon className={`w-5 h-5 ${
                        insight.color === 'green' ? 'text-green-400' :
                        insight.color === 'yellow' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`} />
                    </div>
    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          insight.color === 'green' ? 'bg-green-500/20 text-green-400' :
                          insight.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {insight.type}
                        </span>
                        <span className="text-xs text-gray-400">{t('confidence')}: {insight.confidence}%</span>
                      </div>
    
                      <h4 className="text-white font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm text-blue-200">{insight.description}</p>
    
                      <div className="mt-3 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${insight.confidence}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                          className={`h-full ${
                            insight.color === 'green' ? 'bg-green-500' :
                            insight.color === 'yellow' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
    
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6">
              <h4 className="text-lg font-bold text-white mb-4">{t('trend_strength')}</h4>
              <p className="text-3xl font-bold text-green-400">{t('strong')} {t('bullish')}</p>
              <p className="text-sm text-gray-400">Based on MA & ADX</p>
            </div>
    
            <div className="glass-card p-6">
              <h4 className="text-lg font-bold text-white mb-4">{t('risk_level')}</h4>
              <p className="text-3xl font-bold text-yellow-400">{t('medium')}</p>
              <p className="text-sm text-gray-400">Based on Volatility & ATR</p>
            </div>
    
            <div className="glass-card p-6">
              <h4 className="text-lg font-bold text-white mb-4">{t('liquidity')}</h4>
              <p className="text-3xl font-bold text-blue-400">{t('high')}</p>
               <p className="text-sm text-gray-400">Based on Order Book Depth</p>
            </div>
          </div>
        </motion.div>
      );
    };
    
    export default AIInsights;
  