
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FinalCTA = ({ onConnect }) => {
    const { t } = useTranslation();

    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative p-10 md:p-16 text-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 shadow-2xl shadow-blue-500/30"
                >
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full filter blur-xl"></div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full filter blur-xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            {t('unlock_your_trading_potential')}
                        </h2>
                        <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-8">
                            {t('final_cta_desc')}
                        </p>
                        <Button
                            onClick={onConnect}
                            size="lg"
                            className="bg-white text-blue-600 hover:bg-gray-200 text-lg px-8 py-6 font-bold shadow-lg"
                        >
                            <Wallet className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                            {t('get_started_now')}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FinalCTA;
  