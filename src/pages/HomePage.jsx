import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Dashboard from '@/components/Dashboard';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import Subscription from '@/components/Subscription';
import { Toaster } from '@/components/ui/toaster';
import { useTranslation } from 'react-i18next';
import HowItWorks from '@/components/HowItWorks';
import AiPower from '@/components/AiPower';
import Faq from '@/components/Faq';
import FinalCTA from '@/components/FinalCTA';

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const { publicKey, connected } = useWallet();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // التحقق من الاشتراك عند الاتصال
    if (connected && publicKey) {
      const walletAddress = publicKey.toBase58();
      const subscription = JSON.parse(localStorage.getItem(`subscription_${walletAddress}`) || 'null');
      
      if (subscription && new Date(subscription.expiry) > new Date()) {
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }
    } else {
      setIsSubscribed(false);
    }
    
    setIsLoading(false);
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [connected, publicKey, i18n.language]);

  const handleSubscription = () => {
    if (!publicKey) return;
    
    const walletAddress = publicKey.toBase58();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const subscriptionData = { expiry: expiryDate.toISOString() };
    localStorage.setItem(`subscription_${walletAddress}`, JSON.stringify(subscriptionData));
    setIsSubscribed(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <p>{t('loading')}</p>
        </div>
      );
    }

    // غير متصل - عرض الصفحة الرئيسية
    if (!connected || !publicKey) {
      return (
        <>
          <Hero />
          <Features />
          <HowItWorks />
          <AiPower />
          <Faq />
          <FinalCTA />
        </>
      );
    }

    // متصل لكن غير مشترك - عرض صفحة الاشتراك
    if (!isSubscribed) {
      return <Subscription onSubscribe={handleSubscription} />;
    }

    // متصل ومشترك - عرض Dashboard
    return <Dashboard walletAddress={publicKey.toBase58()} />;
  };

  return (
    <>
      <Helmet>
        <title>SANAD AI Trader - {t('smart_trading')} {t('on_solana')}</title>
        <meta name="description" content={t('hero_description')} />
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

          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <motion.div
                key={connected ? (isSubscribed ? 'dashboard' : 'subscription') : 'landing'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>

          <Footer />
        </div>

        <Toaster />
      </div>
    </>
  );
};

export default HomePage;

