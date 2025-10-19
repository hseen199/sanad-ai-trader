
    import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Wallet, CheckCircle, Settings, BarChart, Server, Smartphone, Monitor } from 'lucide-react';

const TutorialPage = () => {
    const { t } = useTranslation();

    const steps = [
        {
            icon: Wallet,
            title: t('step_1'),
            description: t('step_1_desc'),
        },
        {
            icon: CheckCircle,
            title: t('step_2'),
            description: t('step_2_desc'),
        },
        {
            icon: Settings,
            title: t('step_3'),
            description: t('step_3_desc'),
        },
        {
            icon: BarChart,
            title: t('step_4'),
            description: t('step_4_desc'),
        },
    ];

    return (
        <>
            <Helmet>
                <title>SANAD AI Trader - {t('how_to_start')}</title>
                <meta name="description" content={`Learn how to start using SANAD AI Trader in 4 easy steps.`} />
            </Helmet>

            <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
                <div 
                    className="absolute inset-0 z-0 opacity-40"
                    style={{
                        backgroundImage: `radial-gradient(circle at 20% 25%, hsl(216, 80%, 30%), #020617 25%), 
                                          radial-gradient(circle at 80% 70%, hsl(260, 80%, 40%), #020617 25%)`,
                        animation: 'animate-background 20s ease-in-out infinite'
                    }}
                ></div>

                <div className="relative z-10 flex flex-col min-h-screen">
                    <Header />

                    <main className="flex-grow container mx-auto px-4 py-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                {t('how_to_start')}
                            </h1>
                            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
                                Get your AI trading bot up and running in just a few simple steps.
                            </p>
                        </motion.div>

                        <div className="max-w-4xl mx-auto mt-16 space-y-12">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                    transition={{ duration: 0.5 }}
                                    className="flex items-start gap-6"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center glow-effect shadow-lg shadow-blue-500/30">
                                            <step.icon className="w-8 h-8 text-white" />
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className="w-px h-16 bg-blue-500/30 mt-4"></div>
                                        )}
                                    </div>
                                    <div className="glass-card p-6 flex-1">
                                        <h2 className="text-2xl font-bold text-white mb-2">{step.title}</h2>
                                        <p className="text-blue-200">{step.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="max-w-4xl mx-auto mt-20 grid md:grid-cols-2 gap-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="glass-card p-6"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <Server className="w-8 h-8 text-green-400" />
                                    <h3 className="text-xl font-bold text-white">{t('background_operation')}</h3>
                                </div>
                                <p className="text-blue-200">{t('background_operation_desc')}</p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="glass-card p-6"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex items-center text-cyan-400">
                                       <Smartphone className="w-8 h-8" /><Monitor className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{t('multi_platform_support')}</h3>
                                </div>
                                <p className="text-blue-200">{t('multi_platform_support_desc')}</p>
                            </motion.div>
                        </div>

                        <div className="text-center mt-20">
                            <Link to="/">
                                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 text-white font-bold glow-effect shadow-lg shadow-blue-500/40">
                                    {t('start_trading_now')}
                                </Button>
                            </Link>
                        </div>
                    </main>

                    <Footer />
                </div>
            </div>
        </>
    );
};

export default TutorialPage;
  