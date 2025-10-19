
import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, CheckCircle, Settings, Coffee } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HowItWorks = () => {
    const { t } = useTranslation();

    const steps = [
        { icon: Wallet, title: t('connect'), description: t('connect_desc') },
        { icon: CheckCircle, title: t('subscribe'), description: t('subscribe_desc') },
        { icon: Settings, title: t('configure'), description: t('configure_desc') },
        { icon: Coffee, title: t('relax'), description: t('relax_desc') },
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
                        {t('how_it_works')}
                    </span>
                </h2>
                <p className="text-xl text-blue-200 max-w-2xl mx-auto">
                    {t('how_it_works_desc')}
                </p>
            </motion.div>

            <div className="relative">
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-blue-500/20 -translate-y-1/2"></div>
                <div className="grid md:grid-cols-4 gap-8 relative">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="text-center"
                        >
                            <div className="relative inline-block">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center mb-4 glow-effect shadow-lg shadow-blue-500/30 mx-auto">
                                    <step.icon className="w-9 h-9 text-white" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                            <p className="text-blue-200 text-sm">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
  