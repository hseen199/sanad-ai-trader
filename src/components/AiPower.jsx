
import React from 'react';
import { motion } from 'framer-motion';
import { Database, BrainCircuit, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AiPower = () => {
    const { t } = useTranslation();

    const powers = [
        {
            icon: Database,
            title: t('data_analysis'),
            description: t('data_analysis_desc'),
        },
        {
            icon: BrainCircuit,
            title: t('predictive_modeling'),
            description: t('predictive_modeling_desc'),
        },
        {
            icon: Activity,
            title: t('adaptive_learning'),
            description: t('adaptive_learning_desc'),
        },
    ];

    return (
        <section className="py-20 bg-slate-950/30">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {t('power_of_ai')}
                        </span>
                    </h2>
                    <p className="text-xl text-blue-200 max-w-2xl mx-auto">
                        {t('power_of_ai_desc')}
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {powers.map((power, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            className="glass-card p-8 text-center"
                        >
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-500/20">
                                <power.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">{power.title}</h3>
                            <p className="text-blue-200">{power.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AiPower;
  