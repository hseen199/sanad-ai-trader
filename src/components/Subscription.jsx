
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Zap, Bot, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/ui/use-toast';

const Subscription = ({ onSubscribe }) => {
  const { t } = useTranslation();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const treasuryWallet = "4WFksLbfb1hsBbUx8Xn3bic9esKfqy47x8phyYwbSBcK";

  const handleSubscribeClick = () => {
    setIsSubscribing(true);
    toast({
      title: t('subscribing'),
      description: `Sending 0.1 SOL to ${t('treasury_wallet')}`
    });

    setTimeout(() => {
      onSubscribe();
      toast({
        title: t('subscription_successful'),
        description: t('subscription_successful_desc'),
      });
      setIsSubscribing(false);
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(treasuryWallet);
    toast({
      title: t('copied_to_clipboard'),
      description: t('treasury_wallet') + ': ' + treasuryWallet
    });
  }

  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center glass-card p-8 rounded-2xl"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center glow-effect shadow-lg shadow-blue-500/40">
          <Bot className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">{t('subscription_required')}</h2>
        <p className="text-blue-200 text-lg mb-8">{t('subscription_desc')}</p>

        <div className="glass-card p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-300">{t('treasury_wallet')}</p>
            <div className="flex items-center justify-between gap-2 mt-2">
                <p className="font-mono text-white text-xs sm:text-sm break-all">{treasuryWallet}</p>
                <Button variant="ghost" size="icon" onClick={copyToClipboard} className="text-blue-300 hover:bg-blue-500/20 flex-shrink-0">
                    <Copy className="w-4 h-4" />
                </Button>
            </div>
        </div>
        
        <Button
          onClick={handleSubscribeClick}
          disabled={isSubscribing}
          size="lg"
          className="w-full text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 glow-effect text-white font-bold shadow-lg shadow-blue-500/40"
        >
          {isSubscribing ? t('subscribing') : t('subscribe_now')}
        </Button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 text-left">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-white">100% Secure</h3>
              <p className="text-sm text-gray-400">Your funds stay in your wallet.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-white">24/7 Trading</h3>
              <p className="text-sm text-gray-400">The bot never sleeps.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Bot className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-white">Adaptive AI</h3>
              <p className="text-sm text-gray-400">Constantly learns and improves.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Subscription;
  