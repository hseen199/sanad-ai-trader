import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Zap, Bot, Copy, CheckCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/ui/use-toast';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { subscriptionService } from '@/services/apiService';

const Subscription = ({ onSubscribe }) => {
  const { t } = useTranslation();
  const { publicKey, sendTransaction } = useWallet();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const treasuryWallet = "4WFksLbfb1hsBbUx8Xn3bic9esKfqy47x8phyYwbSBcK";
  const subscriptionAmount = 0.1; // SOL

  // جلب حالة الاشتراك
  const fetchSubscriptionStatus = async () => {
    if (!publicKey) return;

    setIsLoadingStatus(true);
    try {
      const walletAddress = publicKey.toBase58();
      const data = await subscriptionService.status(walletAddress);
      
      if (data.status === 'success') {
        setSubscriptionStatus(data.subscription);
        
        // إذا كان الاشتراك نشطاً، استدعاء onSubscribe
        if (data.subscription.is_active) {
          onSubscribe();
        }
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [publicKey]);

  // تفعيل الفترة التجريبية
  const handleActivateTrial = async () => {
    if (!publicKey) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    setIsSubscribing(true);
    try {
      const walletAddress = publicKey.toBase58();
      const data = await subscriptionService.activateTrial(walletAddress);
      
      if (data.status === 'success') {
        toast({
          title: '🎉 ' + t('trial_activated'),
          description: t('trial_activated_desc'),
        });
        
        // تحديث حالة الاشتراك
        await fetchSubscriptionStatus();
      }
    } catch (error) {
      console.error('Error activating trial:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to activate trial',
        variant: 'destructive',
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  // الدفع عبر Solana
  const handleSubscribeClick = async () => {
    if (!publicKey || !sendTransaction) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    setIsSubscribing(true);

    try {
      // إنشاء الاتصال بـ Solana
      const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
      
      // إنشاء معاملة الدفع
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(treasuryWallet),
          lamports: subscriptionAmount * LAMPORTS_PER_SOL,
        })
      );

      // الحصول على آخر blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      toast({
        title: t('subscribing'),
        description: `Sending ${subscriptionAmount} SOL to ${t('treasury_wallet')}`,
      });

      // إرسال المعاملة
      const signature = await sendTransaction(transaction, connection);
      
      toast({
        title: 'Processing...',
        description: 'Waiting for transaction confirmation...',
      });

      // انتظار التأكيد
      await connection.confirmTransaction(signature, 'confirmed');

      // التحقق من الدفع في الباكند
      const walletAddress = publicKey.toBase58();
      const verifyData = await subscriptionService.verifyPayment(
        walletAddress,
        signature,
        subscriptionAmount
      );

      if (verifyData.status === 'success') {
        toast({
          title: t('subscription_successful'),
          description: t('subscription_successful_desc'),
        });

        // تحديث حالة الاشتراك
        await fetchSubscriptionStatus();
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process subscription',
        variant: 'destructive',
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(treasuryWallet);
    toast({
      title: t('copied_to_clipboard'),
      description: t('treasury_wallet') + ': ' + treasuryWallet
    });
  };

  // إذا كان الاشتراك نشطاً
  if (subscriptionStatus?.is_active) {
    return (
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center glass-card p-8 rounded-2xl"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center glow-effect shadow-lg shadow-green-500/40">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">اشتراكك نشط! 🎉</h2>
          <p className="text-green-200 text-lg mb-8">
            {subscriptionStatus.subscription_type === 'trial' 
              ? 'أنت في الفترة التجريبية المجانية'
              : 'اشتراكك الشهري نشط'}
          </p>

          <div className="glass-card p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-300">نوع الاشتراك</span>
              <span className="text-white font-semibold">
                {subscriptionStatus.subscription_type === 'trial' ? 'تجريبي (7 أيام)' : 'شهري'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-300">ينتهي في</span>
              <span className="text-white font-semibold">
                {new Date(subscriptionStatus.expires_at).toLocaleDateString('ar')}
              </span>
            </div>
          </div>

          {subscriptionStatus.subscription_type === 'paid' && (
            <Button
              onClick={handleSubscribeClick}
              disabled={isSubscribing}
              size="lg"
              className="w-full text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 glow-effect text-white font-bold shadow-lg shadow-blue-500/40"
            >
              {isSubscribing ? 'جاري التجديد...' : 'تجديد الاشتراك'}
            </Button>
          )}
        </motion.div>
      </div>
    );
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

        {/* الفترة التجريبية */}
        {subscriptionStatus && !subscriptionStatus.trial_used && (
          <div className="glass-card p-6 rounded-lg mb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-green-400">فترة تجريبية مجانية 7 أيام!</h3>
            </div>
            <p className="text-gray-300 mb-4">جرب البوت مجاناً لمدة 7 أيام بدون أي التزام</p>
            <Button
              onClick={handleActivateTrial}
              disabled={isSubscribing || !publicKey}
              size="lg"
              className="w-full text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold"
            >
              {isSubscribing ? 'جاري التفعيل...' : 'تفعيل الفترة التجريبية'}
            </Button>
          </div>
        )}

        {/* الاشتراك المدفوع */}
        <div className="glass-card p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-300 mb-2">الاشتراك الشهري</p>
            <p className="text-3xl font-bold text-white mb-4">{subscriptionAmount} SOL / شهر</p>
            
            <div className="border-t border-blue-500/20 pt-4">
              <p className="text-sm text-blue-300 mb-2">{t('treasury_wallet')}</p>
              <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-white text-xs sm:text-sm break-all">{treasuryWallet}</p>
                  <Button variant="ghost" size="icon" onClick={copyToClipboard} className="text-blue-300 hover:bg-blue-500/20 flex-shrink-0">
                      <Copy className="w-4 h-4" />
                  </Button>
              </div>
            </div>
        </div>
        
        <Button
          onClick={handleSubscribeClick}
          disabled={isSubscribing || !publicKey}
          size="lg"
          className="w-full text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 glow-effect text-white font-bold shadow-lg shadow-blue-500/40"
        >
          {isSubscribing ? t('subscribing') : t('subscribe_now')}
        </Button>

        {!publicKey && (
          <p className="text-sm text-yellow-400 mt-4">⚠️ الرجاء توصيل المحفظة أولاً</p>
        )}

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

