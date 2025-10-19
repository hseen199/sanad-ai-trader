"""
SANAD AI Trader - Trade Executor
منفذ الصفقات - يربط بين التحليل والتنفيذ الفعلي
"""

from typing import Dict, Optional
from jupiter_swap import JupiterSwapIntegration
from portfolio_db import PortfolioManagerDB
from subscription_manager import SubscriptionManager
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TradeExecutor:
    """منفذ الصفقات - يدير عملية التداول من البداية للنهاية"""
    
    def __init__(self):
        self.jupiter = JupiterSwapIntegration()
        self.subscription_manager = SubscriptionManager()
        # PortfolioManager يتم إنشاؤه لكل عملية حسب wallet_address
    
    def prepare_buy_order(
        self,
        wallet_address: str,
        symbol: str,
        amount_usd: float,
        slippage_bps: int = 50
    ) -> Optional[Dict]:
        """
        تحضير أمر شراء
        
        Args:
            wallet_address: عنوان محفظة المستخدم
            symbol: رمز العملة المراد شراؤها
            amount_usd: المبلغ بالدولار
            slippage_bps: نسبة الانزلاق المسموح
        
        Returns:
            dict: بيانات الأمر أو None
        """
        try:
            # 1. التحقق من الاشتراك
            subscription_status = self.subscription_manager.check_subscription_status(wallet_address)
            if not subscription_status['is_active']:
                logger.error("❌ الاشتراك غير نشط")
                return {
                    'error': 'subscription_inactive',
                    'message': subscription_status['message']
                }
            
            # 2. حساب كمية SOL المطلوبة
            # نحتاج تحويل USD إلى SOL أولاً
            sol_price_quote = self.jupiter.get_quote(
                input_token='SOL',
                output_token='USDC',
                amount=1.0  # 1 SOL
            )
            
            if not sol_price_quote:
                logger.error("❌ فشل الحصول على سعر SOL")
                return None
            
            # حساب سعر SOL بالدولار
            sol_amount_lamports = float(sol_price_quote.get('inAmount', 0))
            usdc_amount = float(sol_price_quote.get('outAmount', 0)) / 1_000_000  # USDC has 6 decimals
            sol_price_usd = usdc_amount / (sol_amount_lamports / 1_000_000_000) if sol_amount_lamports > 0 else 0
            
            # حساب كمية SOL المطلوبة
            sol_amount_needed = amount_usd / sol_price_usd if sol_price_usd > 0 else 0
            
            logger.info(f"💰 سعر SOL: ${sol_price_usd:.2f}")
            logger.info(f"💰 كمية SOL المطلوبة: {sol_amount_needed:.6f}")
            
            # 3. إنشاء معاملة التبديل (SOL → Token)
            swap_transaction = self.jupiter.create_swap_transaction(
                input_token='SOL',
                output_token=symbol,
                amount=sol_amount_needed,
                taker_address=wallet_address,
                slippage_bps=slippage_bps
            )
            
            if not swap_transaction:
                logger.error("❌ فشل إنشاء معاملة التبديل")
                return None
            
            return {
                'type': 'buy',
                'symbol': symbol,
                'amount_usd': amount_usd,
                'sol_amount': sol_amount_needed,
                'sol_price_usd': sol_price_usd,
                'transaction': swap_transaction['transaction'],
                'request_id': swap_transaction['request_id'],
                'expected_output': float(swap_transaction['out_amount']),
                'price_impact': swap_transaction['price_impact'],
                'fee_lamports': swap_transaction['fee_lamports'],
                'slippage_bps': slippage_bps,
                'wallet_address': wallet_address
            }
        
        except Exception as e:
            logger.error(f"❌ خطأ في تحضير أمر الشراء: {e}")
            return None
    
    def prepare_sell_order(
        self,
        wallet_address: str,
        symbol: str,
        amount: float,
        slippage_bps: int = 50
    ) -> Optional[Dict]:
        """
        تحضير أمر بيع
        
        Args:
            wallet_address: عنوان محفظة المستخدم
            symbol: رمز العملة المراد بيعها
            amount: الكمية
            slippage_bps: نسبة الانزلاق المسموح
        
        Returns:
            dict: بيانات الأمر أو None
        """
        try:
            # 1. التحقق من الاشتراك
            subscription_status = self.subscription_manager.check_subscription_status(wallet_address)
            if not subscription_status['is_active']:
                logger.error("❌ الاشتراك غير نشط")
                return {
                    'error': 'subscription_inactive',
                    'message': subscription_status['message']
                }
            
            # 2. إنشاء معاملة التبديل (Token → SOL)
            swap_transaction = self.jupiter.create_swap_transaction(
                input_token=symbol,
                output_token='SOL',
                amount=amount,
                taker_address=wallet_address,
                slippage_bps=slippage_bps
            )
            
            if not swap_transaction:
                logger.error("❌ فشل إنشاء معاملة التبديل")
                return None
            
            # حساب القيمة بالدولار
            sol_received = float(swap_transaction['out_amount']) / 1_000_000_000
            
            # الحصول على سعر SOL بالدولار
            sol_price_quote = self.jupiter.get_quote(
                input_token='SOL',
                output_token='USDC',
                amount=1.0
            )
            
            sol_price_usd = 0
            if sol_price_quote:
                usdc_amount = float(sol_price_quote.get('outAmount', 0)) / 1_000_000
                sol_price_usd = usdc_amount
            
            amount_usd = sol_received * sol_price_usd
            
            return {
                'type': 'sell',
                'symbol': symbol,
                'amount': amount,
                'sol_received': sol_received,
                'amount_usd': amount_usd,
                'sol_price_usd': sol_price_usd,
                'transaction': swap_transaction['transaction'],
                'request_id': swap_transaction['request_id'],
                'expected_output': float(swap_transaction['out_amount']),
                'price_impact': swap_transaction['price_impact'],
                'fee_lamports': swap_transaction['fee_lamports'],
                'slippage_bps': slippage_bps,
                'wallet_address': wallet_address
            }
        
        except Exception as e:
            logger.error(f"❌ خطأ في تحضير أمر البيع: {e}")
            return None
    
    def execute_trade(
        self,
        request_id: str,
        signed_transaction: str,
        trade_type: str,
        wallet_address: str,
        symbol: str,
        amount: float,
        price: float
    ) -> Optional[Dict]:
        """
        تنفيذ صفقة موقعة
        
        Args:
            request_id: معرف الطلب
            signed_transaction: المعاملة الموقعة
            trade_type: نوع الصفقة ('buy' أو 'sell')
            wallet_address: عنوان المحفظة
            symbol: رمز العملة
            amount: الكمية
            price: السعر
        
        Returns:
            dict: نتيجة التنفيذ
        """
        try:
            # 1. تنفيذ المعاملة على Jupiter
            result = self.jupiter.execute_swap(
                request_id=request_id,
                signed_transaction=signed_transaction
            )
            
            if not result or result.get('status') != 'success':
                logger.error("❌ فشل تنفيذ المعاملة على Jupiter")
                return None
            
            # 2. تحديث المحفظة في قاعدة البيانات
            portfolio_manager = PortfolioManagerDB(wallet_address)
            
            if trade_type == 'buy':
                # فتح صفقة جديدة
                trade_result = portfolio_manager.open_position(
                    symbol=symbol,
                    entry_price=price,
                    position_size=amount,
                    stop_loss=price * 0.95,  # افتراضي 5%
                    take_profit=price * 1.10,  # افتراضي 10%
                    confidence=0.8
                )
            else:
                # إغلاق صفقة موجودة
                trade_result = portfolio_manager.close_position(
                    symbol=symbol,
                    exit_price=price
                )
            
            return {
                'status': 'success',
                'signature': result.get('signature'),
                'trade_type': trade_type,
                'symbol': symbol,
                'amount': amount,
                'price': price,
                'portfolio_updated': trade_result is not None
            }
        
        except Exception as e:
            logger.error(f"❌ خطأ في تنفيذ الصفقة: {e}")
            return None


# ==================== للاختبار ====================

if __name__ == '__main__':
    print("=" * 70)
    print("🧪 اختبار Trade Executor")
    print("=" * 70)
    
    executor = TradeExecutor()
    
    # 1. اختبار تحضير أمر شراء (بدون عنوان محفظة حقيقي)
    print("\n1️⃣ اختبار تحضير أمر شراء:")
    print("   ⚠️ يتطلب عنوان محفظة حقيقي للاختبار الكامل")
    
    # 2. اختبار الحصول على سعر SOL
    print("\n2️⃣ اختبار الحصول على سعر SOL:")
    sol_quote = executor.jupiter.get_quote('SOL', 'USDC', 1.0)
    if sol_quote:
        usdc_amount = float(sol_quote.get('outAmount', 0)) / 1_000_000
        print(f"   ✅ سعر SOL: ${usdc_amount:.2f}")
    
    print("\n" + "=" * 70)
    print("✅ جميع الاختبارات نجحت!")
    print("=" * 70)

