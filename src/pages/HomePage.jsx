
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedWallet = localStorage.getItem('phantomWallet');
    if (savedWallet) {
      setWalletAddress(savedWallet);
      setIsConnected(true);
      
      const subscription = JSON.parse(localStorage.getItem(`subscription_${savedWallet}`));
      if (subscription && new Date(subscription.expiry) > new Date()) {
        setIsSubscribed(true);
      }
    }
    setIsLoading(false);
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const handleConnect = (address) => {
    setWalletAddress(address);
    setIsConnected(true);
    localStorage.setItem('phantomWallet', address);

    const subscription = JSON.parse(localStorage.getItem(`subscription_${address}`));
      if (subscription && new Date(subscription.expiry) > new Date()) {
        setIsSubscribed(true);
      }
  };

  const handleDisconnect = () => {
    setWalletAddress('');
    setIsConnected(false);
    setIsSubscribed(false);
    localStorage.removeItem('phantomWallet');
  };

  const handleSubscription = () => {
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

    if (!isConnected) {
      return (
        <>
          <Hero onConnect={handleConnect} />
          <Features />
          <HowItWorks />
          <AiPower />
          <Faq />
          <FinalCTA onConnect={handleConnect} />
        </>
      );
    }

    if (!isSubscribed) {
      return <Subscription onSubscribe={handleSubscription} />;
    }

    return <Dashboard walletAddress={walletAddress} />;
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
          <Header 
            isConnected={isConnected}
            walletAddress={walletAddress}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />

          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <motion.div
                key={isConnected ? (isSubscribed ? 'dashboard' : 'subscription') : 'landing'}
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
  