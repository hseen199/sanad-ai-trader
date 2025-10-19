import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

// تم إزالة شرط عملة SNDX - الاشتراك بـ SOL فقط

// عنوان الاشتراك (يجب تغييره إلى العنوان الفعلي)
export const SUBSCRIPTION_WALLET = '4WFksLbfb1hsBbUx8Xn3bic9esKfqy47x8phyYwbSBcK';

// رسوم الاشتراك الشهري (0.1 SOL)
export const SUBSCRIPTION_FEE_SOL = 0.1;

// نسبة رسوم التداول (3%)
export const TRADE_FEE_PERCENTAGE = 0.03;

/**
 * إنشاء معاملة دفع الاشتراك
 */
export const createSubscriptionTransaction = async (connection, fromPubkey) => {
  const toPubkey = new PublicKey(SUBSCRIPTION_WALLET);
  const lamports = SUBSCRIPTION_FEE_SOL * LAMPORTS_PER_SOL;

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports,
    })
  );

  transaction.feePayer = fromPubkey;
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;

  return transaction;
};

/**
 * التحقق من حالة الاشتراك
 */
export const checkSubscriptionStatus = async (walletAddress) => {
  try {
    const response = await fetch('/api/v1/subscription/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { active: false, error: error.message };
  }
};

/**
 * التحقق من معاملة الاشتراك
 */
export const verifySubscriptionPayment = async (signature, walletAddress) => {
  try {
    const response = await fetch('/api/v1/subscription/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ signature, walletAddress }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying subscription payment:', error);
    return { verified: false, error: error.message };
  }
};

/**
 * الحصول على رصيد المحفظة
 */
export const getWalletBalance = async (connection, publicKey) => {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    return 0;
  }
};

/**
 * الحصول على رصيد التوكن
 */
export const getTokenBalance = async (connection, walletPublicKey, tokenMintAddress) => {
  try {
    const tokenMint = new PublicKey(tokenMintAddress);
    const tokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      walletPublicKey
    );

    const balance = await connection.getTokenAccountBalance(tokenAccount);
    return parseFloat(balance.value.uiAmount || 0);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0;
  }
};

/**
 * إنشاء رسالة مصادقة للتوقيع
 */
export const createAuthMessage = (walletAddress) => {
  const timestamp = Date.now();
  return `SANAD AI Trader Authentication\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\n\nSign this message to authenticate your wallet.`;
};

/**
 * التحقق من توقيع المصادقة
 */
export const verifyAuthSignature = async (walletAddress, signature, message) => {
  try {
    const response = await fetch('/api/v1/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress, signature, message }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying auth signature:', error);
    return { verified: false, error: error.message };
  }
};

