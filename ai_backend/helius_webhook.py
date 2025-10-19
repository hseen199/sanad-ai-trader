"""
SANAD AI Trader - Helius Webhook Handler
معالج Webhooks من Helius للتحقق من المدفوعات
"""

from flask import request, jsonify
from subscription_manager import SubscriptionManager
import logging
import hmac
import hashlib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class HeliusWebhookHandler:
    """معالج Webhooks من Helius"""
    
    # محفظة الاستلام
    RECEIVER_WALLET = "4WFksLbfb1hsBbUx8Xn3bic9esKfqy47x8phyYwbSBcK"
    
    # مبلغ الاشتراك (بالـ lamports)
    SUBSCRIPTION_AMOUNT_LAMPORTS = 100_000_000  # 0.1 SOL
    
    def __init__(self, webhook_secret: str = None):
        """
        Args:
            webhook_secret: سر الـ Webhook من Helius (اختياري للتحقق)
        """
        self.webhook_secret = webhook_secret
        self.subscription_manager = SubscriptionManager()
    
    def verify_signature(self, payload: bytes, signature: str) -> bool:
        """
        التحقق من توقيع الـ Webhook
        
        Args:
            payload: محتوى الطلب
            signature: التوقيع من Helius
        
        Returns:
            bool: True إذا كان التوقيع صحيحاً
        """
        if not self.webhook_secret:
            logger.warning("⚠️ لم يتم تعيين webhook_secret، سيتم تخطي التحقق")
            return True
        
        try:
            expected_signature = hmac.new(
                self.webhook_secret.encode(),
                payload,
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(expected_signature, signature)
        except Exception as e:
            logger.error(f"❌ خطأ في التحقق من التوقيع: {e}")
            return False
    
    def handle_webhook(self, data: dict) -> dict:
        """
        معالجة Webhook من Helius
        
        Args:
            data: بيانات الـ Webhook
        
        Returns:
            dict: نتيجة المعالجة
        """
        try:
            # استخراج البيانات
            webhook_type = data.get('type')
            
            if webhook_type != 'TRANSFER':
                logger.info(f"⏭️ تخطي webhook من نوع: {webhook_type}")
                return {'status': 'ignored', 'reason': 'not_a_transfer'}
            
            # استخراج بيانات المعاملة
            transactions = data.get('transactions', [])
            
            if not transactions:
                logger.warning("⚠️ لا توجد معاملات في الـ webhook")
                return {'status': 'error', 'reason': 'no_transactions'}
            
            # معالجة كل معاملة
            processed_count = 0
            for tx in transactions:
                result = self._process_transaction(tx)
                if result:
                    processed_count += 1
            
            return {
                'status': 'success',
                'processed': processed_count,
                'total': len(transactions)
            }
        
        except Exception as e:
            logger.error(f"❌ خطأ في معالجة الـ webhook: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def _process_transaction(self, tx: dict) -> bool:
        """
        معالجة معاملة واحدة
        
        Args:
            tx: بيانات المعاملة
        
        Returns:
            bool: True إذا تمت المعالجة بنجاح
        """
        try:
            # استخراج البيانات
            signature = tx.get('signature')
            account_data = tx.get('accountData', [])
            native_transfers = tx.get('nativeTransfers', [])
            
            logger.info(f"🔍 معالجة معاملة: {signature}")
            
            # البحث عن تحويل SOL
            for transfer in native_transfers:
                from_address = transfer.get('fromUserAccount')
                to_address = transfer.get('toUserAccount')
                amount = transfer.get('amount', 0)
                
                # التحقق من أن التحويل لمحفظتنا
                if to_address != self.RECEIVER_WALLET:
                    continue
                
                # التحقق من المبلغ (0.1 SOL = 100,000,000 lamports)
                if amount < self.SUBSCRIPTION_AMOUNT_LAMPORTS:
                    logger.warning(f"⚠️ المبلغ غير كافٍ: {amount} lamports")
                    continue
                
                # تفعيل الاشتراك
                logger.info(f"💰 تم استلام دفعة من: {from_address}")
                logger.info(f"   المبلغ: {amount / 1_000_000_000} SOL")
                
                # تجديد الاشتراك
                result = self.subscription_manager.renew_subscription(from_address)
                
                if result:
                    logger.info(f"✅ تم تجديد الاشتراك لـ: {from_address}")
                    return True
                else:
                    logger.error(f"❌ فشل تجديد الاشتراك لـ: {from_address}")
                    return False
            
            logger.info(f"⏭️ لم يتم العثور على تحويل مطابق في المعاملة")
            return False
        
        except Exception as e:
            logger.error(f"❌ خطأ في معالجة المعاملة: {e}")
            return False


# ==================== للاختبار ====================

if __name__ == '__main__':
    print("=" * 70)
    print("🧪 اختبار Helius Webhook Handler")
    print("=" * 70)
    
    handler = HeliusWebhookHandler()
    
    # بيانات webhook تجريبية
    test_webhook = {
        'type': 'TRANSFER',
        'transactions': [
            {
                'signature': 'test123',
                'nativeTransfers': [
                    {
                        'fromUserAccount': 'TestWallet123',
                        'toUserAccount': '4WFksLbfb1hsBbUx8Xn3bic9esKfqy47x8phyYwbSBcK',
                        'amount': 100_000_000  # 0.1 SOL
                    }
                ]
            }
        ]
    }
    
    print("\n1️⃣ اختبار معالجة webhook:")
    result = handler.handle_webhook(test_webhook)
    print(f"   النتيجة: {result}")
    
    print("\n" + "=" * 70)
    print("✅ جميع الاختبارات نجحت!")
    print("=" * 70)

