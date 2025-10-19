
import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, LogOut, Bot, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const Header = ({ isConnected, walletAddress, onConnect, onDisconnect }) => {
  const { t, i18n } = useTranslation();

  const connectWallet = async () => {
    if (typeof window.phantom?.solana !== 'undefined') {
      try {
        const mockAddress = 'SANAD' + Math.random().toString(36).substring(2, 15).toUpperCase();
        onConnect(mockAddress);
        toast({
          title: t('connected_successfully'),
          description: t('phantom_connected'),
        });
      } catch (error) {
        toast({
          title: t('connection_failed'),
          description: t('error_connecting'),
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: t('phantom_not_installed'),
        description: t('please_install_phantom'),
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
    toast({
      title: t('disconnected_successfully'),
      description: t('wallet_disconnected'),
    });
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/60 border-b border-blue-500/20"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center glow-effect shadow-lg shadow-blue-500/30">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SANAD AI
              </h1>
              <p className="text-xs text-blue-300">{t('trader_bot')}</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
             <Button
              onClick={toggleLanguage}
              variant="ghost"
              size="icon"
              className="text-blue-300 hover:bg-blue-500/10"
            >
              <Globe className="w-5 h-5" />
            </Button>
            {isConnected ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg glass-card">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-sm text-blue-200 font-mono">
                    {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 6)}
                  </span>
                </div>
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  className="border-red-500/50 hover:bg-red-500/10 text-red-400"
                >
                  <LogOut className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                  {t('disconnect')}
                </Button>
              </>
            ) : (
              <Button
                onClick={connectWallet}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold glow-effect shadow-lg shadow-blue-500/40"
              >
                <Wallet className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                {t('connect_wallet')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
