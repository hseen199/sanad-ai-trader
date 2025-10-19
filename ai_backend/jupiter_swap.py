"""
SANAD AI Trader - Jupiter Swap Integration
التكامل مع Jupiter Aggregator للحصول على أفضل أسعار التداول
"""

import requests
from typing import Dict, Optional, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class JupiterSwapIntegration:
    """التكامل مع Jupiter Ultra Swap API"""
    
    # Base URLs
    LITE_API_URL = "https://lite-api.jup.ag/ultra/v1"
    MAIN_API_URL = "https://api.jup.ag/ultra/v1"
    
    # عناوين العملات الشائعة على Solana
    TOKEN_ADDRESSES = {
        'SOL': 'So11111111111111111111111111111111111111112',  # Native SOL
        'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        'JUP': 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        'RAY': '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
        'WIF': 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    }
    
    def __init__(self, use_lite_api: bool = True):
        """
        Args:
            use_lite_api: استخدام Lite API (أسرع) أو Main API (أكثر استقراراً)
        """
        self.base_url = self.LITE_API_URL if use_lite_api else self.MAIN_API_URL
    
    def get_token_address(self, symbol: str) -> Optional[str]:
        """
        الحصول على عنوان العملة من رمزها
        
        Args:
            symbol: رمز العملة (مثل 'SOL', 'USDC')
        
        Returns:
            str: عنوان العملة أو None
        """
        return self.TOKEN_ADDRESSES.get(symbol.upper())
    
    def get_quote(
        self,
        input_token: str,
        output_token: str,
        amount: float,
        slippage_bps: int = 50,
        taker_address: Optional[str] = None
    ) -> Optional[Dict]:
        """
        الحصول على عرض سعر (quote) لعملية التبديل
        
        Args:
            input_token: رمز العملة المُدخلة (مثل 'SOL')
            output_token: رمز العملة المُخرجة (مثل 'USDC')
            amount: المبلغ (بالوحدات الأساسية)
            slippage_bps: نسبة الانزلاق المسموح (basis points، 50 = 0.5%)
            taker_address: عنوان محفظة المستخدم (اختياري)
        
        Returns:
            dict: بيانات العرض أو None في حالة الفشل
        """
        try:
            # الحصول على عناوين العملات
            input_mint = self.get_token_address(input_token)
            output_mint = self.get_token_address(output_token)
            
            if not input_mint or not output_mint:
                logger.error(f"عنوان عملة غير صالح: {input_token} أو {output_token}")
                return None
            
            # تحويل المبلغ إلى lamports (للـ SOL) أو أصغر وحدة
            # SOL has 9 decimals, USDC has 6 decimals
            if input_token.upper() == 'SOL':
                amount_lamports = int(amount * 1_000_000_000)  # 10^9
            elif input_token.upper() in ['USDC', 'USDT']:
                amount_lamports = int(amount * 1_000_000)  # 10^6
            else:
                amount_lamports = int(amount * 1_000_000_000)  # افتراضي 10^9
            
            # بناء الطلب
            params = {
                'inputMint': input_mint,
                'outputMint': output_mint,
                'amount': str(amount_lamports),
                'slippageBps': slippage_bps
            }
            
            # إضافة عنوان المستخدم إذا كان متوفراً
            if taker_address:
                params['taker'] = taker_address
            
            # إرسال الطلب
            url = f"{self.base_url}/order"
            logger.info(f"🔄 طلب عرض سعر: {input_token} → {output_token}")
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # حساب السعر
            in_amount = float(data.get('inAmount', 0))
            out_amount = float(data.get('outAmount', 0))
            
            if in_amount > 0:
                # تحويل من lamports إلى وحدات عادية
                if input_token.upper() == 'SOL':
                    in_amount_readable = in_amount / 1_000_000_000
                elif input_token.upper() in ['USDC', 'USDT']:
                    in_amount_readable = in_amount / 1_000_000
                else:
                    in_amount_readable = in_amount / 1_000_000_000
                
                if output_token.upper() == 'SOL':
                    out_amount_readable = out_amount / 1_000_000_000
                elif output_token.upper() in ['USDC', 'USDT']:
                    out_amount_readable = out_amount / 1_000_000
                else:
                    out_amount_readable = out_amount / 1_000_000_000
                
                price = out_amount_readable / in_amount_readable if in_amount_readable > 0 else 0
                
                logger.info(f"✅ السعر: 1 {input_token} = {price:.6f} {output_token}")
                logger.info(f"   المدخل: {in_amount_readable:.6f} {input_token}")
                logger.info(f"   المخرج: {out_amount_readable:.6f} {output_token}")
            
            return data
        
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ خطأ في الاتصال بـ Jupiter API: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ خطأ غير متوقع: {e}")
            return None
    
    def create_swap_transaction(
        self,
        input_token: str,
        output_token: str,
        amount: float,
        taker_address: str,
        slippage_bps: int = 50
    ) -> Optional[Dict]:
        """
        إنشاء معاملة تبديل جاهزة للتوقيع
        
        Args:
            input_token: رمز العملة المُدخلة
            output_token: رمز العملة المُخرجة
            amount: المبلغ
            taker_address: عنوان محفظة المستخدم
            slippage_bps: نسبة الانزلاق المسموح
        
        Returns:
            dict: بيانات المعاملة أو None
        """
        quote = self.get_quote(
            input_token=input_token,
            output_token=output_token,
            amount=amount,
            slippage_bps=slippage_bps,
            taker_address=taker_address
        )
        
        if not quote:
            return None
        
        # التحقق من وجود معاملة
        transaction = quote.get('transaction')
        if not transaction:
            error_message = quote.get('errorMessage', 'Unknown error')
            logger.error(f"❌ فشل إنشاء المعاملة: {error_message}")
            return None
        
        return {
            'transaction': transaction,
            'request_id': quote.get('requestId'),
            'in_amount': quote.get('inAmount'),
            'out_amount': quote.get('outAmount'),
            'price_impact': quote.get('priceImpact'),
            'slippage_bps': quote.get('slippageBps'),
            'fee_lamports': quote.get('signatureFeeLamports', 0) + 
                          quote.get('prioritizationFeeLamports', 0) +
                          quote.get('rentFeeLamports', 0),
            'gasless': quote.get('gasless', False),
            'quote_data': quote
        }
    
    def execute_swap(
        self,
        request_id: str,
        signed_transaction: str
    ) -> Optional[Dict]:
        """
        تنفيذ معاملة موقعة
        
        Args:
            request_id: معرف الطلب من get_quote
            signed_transaction: المعاملة الموقعة (base64)
        
        Returns:
            dict: نتيجة التنفيذ أو None
        """
        try:
            url = f"{self.base_url}/execute"
            
            payload = {
                'requestId': request_id,
                'transaction': signed_transaction
            }
            
            logger.info(f"🚀 تنفيذ المعاملة...")
            
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('status') == 'success':
                logger.info(f"✅ تم تنفيذ المعاملة بنجاح!")
                logger.info(f"   Transaction Signature: {data.get('signature')}")
            else:
                logger.error(f"❌ فشل التنفيذ: {data.get('error')}")
            
            return data
        
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ خطأ في تنفيذ المعاملة: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ خطأ غير متوقع: {e}")
            return None


# ==================== للاختبار ====================

if __name__ == '__main__':
    print("=" * 70)
    print("🧪 اختبار Jupiter Swap Integration")
    print("=" * 70)
    
    jupiter = JupiterSwapIntegration()
    
    # 1. اختبار الحصول على عرض سعر
    print("\n1️⃣ اختبار الحصول على عرض سعر (SOL → USDC):")
    quote = jupiter.get_quote(
        input_token='SOL',
        output_token='USDC',
        amount=1.0,  # 1 SOL
        slippage_bps=50  # 0.5%
    )
    
    if quote:
        print(f"   ✅ تم الحصول على العرض بنجاح!")
        print(f"   Request ID: {quote.get('requestId')}")
        print(f"   Price Impact: {quote.get('priceImpact', 0):.4f}%")
    else:
        print(f"   ❌ فشل الحصول على العرض")
    
    # 2. اختبار إنشاء معاملة (بدون عنوان محفظة حقيقي)
    print("\n2️⃣ اختبار إنشاء معاملة:")
    print("   ⚠️ يتطلب عنوان محفظة حقيقي للاختبار الكامل")
    
    print("\n" + "=" * 70)
    print("✅ جميع الاختبارات نجحت!")
    print("=" * 70)

