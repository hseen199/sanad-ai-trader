
import React from 'react';
    import { motion } from 'framer-motion';
    import { Brain, Shield, Zap, TrendingUp, Lock, BarChart3 } from 'lucide-react';
    import { useTranslation } from 'react-i18next';
    
    const Features = () => {
      const { t } = useTranslation();
    
      const features = [
        {
          icon: Brain,
          title: t('advanced_ai'),
          description: "Continuous learning AI that adapts to market changes in real-time.",
          gradient: 'from-blue-500 to-cyan-500',
        },
        {
          icon: Shield,
          title: t('decentralized_security'),
          description: "Your funds remain in your Phantom wallet. Full control, full security.",
          gradient: 'from-purple-500 to-pink-500',
        },
        {
          icon: Zap,
          title: t('instant_execution'),
          description: "Leverages Solana's speed for instant trade execution via top DEXs.",
          gradient: 'from-yellow-500 to-orange-500',
        },
        {
          icon: TrendingUp,
          title: t('smart_risk_management'),
          description: "Automated risk controls based on your chosen strategy and plan.",
          gradient: 'from-green-500 to-emerald-500',
        },
        {
          icon: Lock,
          title: "AES-256 Encryption",
          description: "All sensitive data and API communications are encrypted.",
          gradient: 'from-red-500 to-rose-500',
        },
        {
          icon: BarChart3,
          title: "Advanced Analytics",
          description: "A comprehensive dashboard to track performance and AI decisions.",
          gradient: 'from-indigo-500 to-blue-500',
        },
      ];
    
      return (
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {t('why_sanad_ai')}
              </span>
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              {t('advanced_tech')}
            </p>
          </motion.div>
    
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.03 }}
                className="glass-card p-6 group cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-blue-200">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      );
    };
    
    export default Features;
