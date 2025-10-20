
import React from 'react';
    import { motion } from 'framer-motion';
    import { Wallet, TrendingUp, Shield, Zap } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { toast } from '@/components/ui/use-toast';
    import { useTranslation } from 'react-i18next';
    import { useWallet } from '@solana/wallet-adapter-react';
    
    const Hero = ({ onConnect }) => {
      const { t } = useTranslation();
      const { select, wallets, publicKey, connected } = useWallet();
    
      const connectWallet = async () => {
        try {
          // محاولة الاتصال بـ Phantom
          const phantomWallet = wallets.find(w => w.adapter.name === 'Phantom');
          if (phantomWallet) {
            select(phantomWallet.adapter.name);
          } else if (wallets.length > 0) {
            // إذا Phantom مش موجود، استخدم أول محفظة متاحة
            select(wallets[0].adapter.name);
          }
          
          // انتظر الاتصال
          setTimeout(() => {
            if (publicKey) {
              onConnect(publicKey.toBase58());
              toast({
                title: t('connected_successfully'),
                description: t('phantom_connected'),
              });
            }
          }, 1000);
        } catch (error) {
          console.error('Wallet connection error:', error);
          toast({
            title: 'Error',
            description: 'Failed to connect wallet. Please try again.',
            variant: 'destructive',
          });
        }
      };
    
      return (
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-block px-4 py-2 rounded-full glass-card">
                <span className="text-blue-400 text-sm font-semibold">{t('powered_by_ai')}</span>
              </div>
    
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {t('smart_trading')}
                </span>
                <br />
                <span className="text-white">{t('on_solana')}</span>
              </h1>
    
              <p className="text-xl text-blue-200 leading-relaxed">
                {t('hero_description')}
              </p>
    
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={connectWallet}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 text-white font-bold glow-effect shadow-lg shadow-blue-500/40"
                >
                  <Wallet className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                  {t('start_trading_now')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="glass-button text-lg px-8 py-6"
                  onClick={() => toast({
                    title: t('coming_soon'),
                    description: t('feature_coming_soon'),
                  })}
                >
                  {t('watch_demo')}
                </Button>
              </div>
    
              <div className="grid grid-cols-3 gap-6 pt-8">
                {[
                  { icon: TrendingUp, label: "Intelligent Trading", value: "24/7" },
                  { icon: Shield, label: "Secure", value: "Decentralized" },
                  { icon: Zap, label: "Fast", value: "On Solana" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 * index }}
                    className="text-center"
                  >
                    <div className="w-12 h-12 mx-auto mb-2 rounded-lg glass-card flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <p className="text-sm text-blue-300 font-semibold">{item.value}</p>
                    <p className="text-xs text-gray-400">{item.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
    
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative glass-card p-2 rounded-2xl">
                 <img alt="SANAD AI Trading Bot Dashboard Preview" className="w-full rounded-xl" src="https://images.unsplash.com/photo-1640340435016-1964cf4e723b" />
              </div>
            </motion.div>
          </div>
        </section>
      );
    };
    
    export default Hero;
