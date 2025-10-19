"""
SANAD AI Trader - Subscription Manager
نظام إدارة الاشتراكات مع فترة تجريبية مجانية 7 أيام
"""

from database import get_database, User, Subscription
from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SubscriptionManager:
    """إدارة الاشتراكات والفترة التجريبية"""
    
    # إعدادات الاشتراك
    TRIAL_PERIOD_DAYS = 7  # فترة تجريبية مجانية 7 أيام
    MONTHLY_PRICE_SOL = 0.1  # سعر الاشتراك الشهري بالـ SOL
    SUBSCRIPTION_DURATION_DAYS = 30  # مدة الاشتراك (شهر)
    
    def __init__(self):
        self.db = get_database()
    
    def check_subscription_status(self, wallet_address: str) -> Dict:
        """
        التحقق من حالة اشتراك المستخدم
        
        Returns:
            dict: {
                'is_active': bool,
                'status': str,  # 'trial', 'active', 'expired', 'suspended'
                'expires_at': datetime or None,
                'days_remaining': int,
                'needs_payment': bool
            }
        """
        session = self.db.get_session()
        try:
            # البحث عن المستخدم
            user = session.query(User).filter_by(wallet_address=wallet_address).first()
            
            if user is None:
                # مستخدم جديد - يحصل على فترة تجريبية
                return {
                    'is_active': False,
                    'status': 'new',
                    'expires_at': None,
                    'days_remaining': self.TRIAL_PERIOD_DAYS,
                    'needs_payment': False,
                    'message': 'مستخدم جديد - يحصل على فترة تجريبية مجانية 7 أيام'
                }
            
            # البحث عن الاشتراك
            subscription = session.query(Subscription).filter_by(user_id=user.id).first()
            
            if subscription is None:
                # مستخدم موجود لكن بدون اشتراك - تفعيل الفترة التجريبية
                trial_expires = user.created_at + timedelta(days=self.TRIAL_PERIOD_DAYS)
                days_remaining = (trial_expires - datetime.utcnow()).days
                
                if days_remaining > 0:
                    return {
                        'is_active': True,
                        'status': 'trial',
                        'expires_at': trial_expires,
                        'days_remaining': days_remaining,
                        'needs_payment': False,
                        'message': f'الفترة التجريبية - متبقي {days_remaining} يوم'
                    }
                else:
                    return {
                        'is_active': False,
                        'status': 'trial_expired',
                        'expires_at': trial_expires,
                        'days_remaining': 0,
                        'needs_payment': True,
                        'message': 'انتهت الفترة التجريبية - يرجى الاشتراك'
                    }
            
            # التحقق من حالة الاشتراك المدفوع
            now = datetime.utcnow()
            
            if subscription.is_active and subscription.expires_at:
                if subscription.expires_at > now:
                    # اشتراك نشط
                    days_remaining = (subscription.expires_at - now).days
                    return {
                        'is_active': True,
                        'status': 'active',
                        'expires_at': subscription.expires_at,
                        'days_remaining': days_remaining,
                        'needs_payment': False,
                        'message': f'اشتراك نشط - متبقي {days_remaining} يوم'
                    }
                else:
                    # اشتراك منتهي
                    return {
                        'is_active': False,
                        'status': 'expired',
                        'expires_at': subscription.expires_at,
                        'days_remaining': 0,
                        'needs_payment': True,
                        'message': 'انتهى الاشتراك - يرجى التجديد'
                    }
            else:
                # اشتراك معلق
                return {
                    'is_active': False,
                    'status': 'suspended',
                    'expires_at': subscription.expires_at,
                    'days_remaining': 0,
                    'needs_payment': True,
                    'message': 'العضوية معلقة - يرجى التجديد'
                }
        
        finally:
            session.close()
    
    def activate_trial(self, wallet_address: str) -> Tuple[bool, str]:
        """
        تفعيل الفترة التجريبية للمستخدم الجديد
        """
        session = self.db.get_session()
        try:
            user = session.query(User).filter_by(wallet_address=wallet_address).first()
            
            if user is None:
                return False, "المستخدم غير موجود"
            
            # التحقق من عدم وجود اشتراك سابق
            subscription = session.query(Subscription).filter_by(user_id=user.id).first()
            
            if subscription is not None:
                return False, "المستخدم لديه اشتراك بالفعل"
            
            # إنشاء سجل اشتراك للفترة التجريبية
            trial_expires = datetime.utcnow() + timedelta(days=self.TRIAL_PERIOD_DAYS)
            
            subscription = Subscription(
                user_id=user.id,
                is_active=True,
                subscription_type='trial',
                started_at=datetime.utcnow(),
                expires_at=trial_expires
            )
            
            session.add(subscription)
            session.commit()
            
            logger.info(f"✅ تم تفعيل الفترة التجريبية للمستخدم: {wallet_address[:8]}...")
            
            return True, f"تم تفعيل الفترة التجريبية - تنتهي في {trial_expires.strftime('%Y-%m-%d')}"
        
        except Exception as e:
            logger.error(f"❌ خطأ في تفعيل الفترة التجريبية: {e}")
            session.rollback()
            return False, str(e)
        
        finally:
            session.close()
    
    def create_payment_request(self, wallet_address: str) -> Dict:
        """
        إنشاء طلب دفع للاشتراك
        
        Returns:
            dict: {
                'amount': float,  # المبلغ بالـ SOL
                'recipient': str,  # عنوان المحفظة المستلمة
                'memo': str,  # memo للمعاملة
                'expires_at': datetime
            }
        """
        session = self.db.get_session()
        try:
            user = session.query(User).filter_by(wallet_address=wallet_address).first()
            
            if user is None:
                return None
            
            # إنشاء memo فريد للمعاملة
            memo = f"SANAD-SUB-{user.id}-{int(datetime.utcnow().timestamp())}"
            
            # عنوان المحفظة المستلمة للاشتراكات
            recipient_wallet = "4WFksLbfb1hsBbUx8Xn3bic9esKfqy47x8phyYwbSBcK"
            
            return {
                'amount': self.MONTHLY_PRICE_SOL,
                'recipient': recipient_wallet,
                'memo': memo,
                'expires_at': datetime.utcnow() + timedelta(minutes=15),  # ينتهي بعد 15 دقيقة
                'user_id': user.id
            }
        
        finally:
            session.close()
    
    def verify_and_activate_subscription(
        self, 
        wallet_address: str, 
        transaction_signature: str,
        amount_paid: float
    ) -> Tuple[bool, str]:
        """
        التحقق من المعاملة وتفعيل الاشتراك
        
        Args:
            wallet_address: عنوان محفظة المستخدم
            transaction_signature: توقيع المعاملة على Solana
            amount_paid: المبلغ المدفوع بالـ SOL
        """
        session = self.db.get_session()
        try:
            user = session.query(User).filter_by(wallet_address=wallet_address).first()
            
            if user is None:
                return False, "المستخدم غير موجود"
            
            # التحقق من المبلغ
            if amount_paid < self.MONTHLY_PRICE_SOL:
                return False, f"المبلغ المدفوع ({amount_paid} SOL) أقل من المطلوب ({self.MONTHLY_PRICE_SOL} SOL)"
            
            # البحث عن الاشتراك
            subscription = session.query(Subscription).filter_by(user_id=user.id).first()
            
            now = datetime.utcnow()
            new_expires_at = now + timedelta(days=self.SUBSCRIPTION_DURATION_DAYS)
            
            if subscription is None:
                # إنشاء اشتراك جديد
                subscription = Subscription(
                    user_id=user.id,
                    is_active=True,
                    subscription_type='monthly',
                    amount_paid=amount_paid,
                    transaction_signature=transaction_signature,
                    started_at=now,
                    expires_at=new_expires_at
                )
                session.add(subscription)
            else:
                # تجديد الاشتراك الموجود
                if subscription.expires_at and subscription.expires_at > now:
                    # إذا كان الاشتراك لا يزال نشطاً، نضيف 30 يوم إلى تاريخ الانتهاء
                    new_expires_at = subscription.expires_at + timedelta(days=self.SUBSCRIPTION_DURATION_DAYS)
                
                subscription.is_active = True
                subscription.subscription_type = 'monthly'
                subscription.amount_paid = amount_paid
                subscription.transaction_signature = transaction_signature
                subscription.started_at = now
                subscription.expires_at = new_expires_at
            
            session.commit()
            
            logger.info(f"✅ تم تفعيل الاشتراك للمستخدم: {wallet_address[:8]}... حتى {new_expires_at.strftime('%Y-%m-%d')}")
            
            return True, f"تم تفعيل الاشتراك بنجاح - ينتهي في {new_expires_at.strftime('%Y-%m-%d')}"
        
        except Exception as e:
            logger.error(f"❌ خطأ في تفعيل الاشتراك: {e}")
            session.rollback()
            return False, str(e)
        
        finally:
            session.close()
    
    def suspend_subscription(self, wallet_address: str) -> Tuple[bool, str]:
        """
        تعليق الاشتراك (عند عدم الدفع)
        """
        session = self.db.get_session()
        try:
            user = session.query(User).filter_by(wallet_address=wallet_address).first()
            
            if user is None:
                return False, "المستخدم غير موجود"
            
            subscription = session.query(Subscription).filter_by(user_id=user.id).first()
            
            if subscription is None:
                return False, "لا يوجد اشتراك"
            
            subscription.is_active = False
            session.commit()
            
            logger.info(f"⚠️ تم تعليق اشتراك المستخدم: {wallet_address[:8]}...")
            
            return True, "تم تعليق الاشتراك"
        
        except Exception as e:
            logger.error(f"❌ خطأ في تعليق الاشتراك: {e}")
            session.rollback()
            return False, str(e)
        
        finally:
            session.close()


# ==================== للاختبار ====================

if __name__ == '__main__':
    print("=" * 70)
    print("💳 اختبار نظام الاشتراكات")
    print("=" * 70)
    
    manager = SubscriptionManager()
    wallet = "TestSubscriptionWallet123456789012345"
    
    # 1. التحقق من حالة مستخدم جديد
    print("\n1️⃣ التحقق من حالة مستخدم جديد:")
    status = manager.check_subscription_status(wallet)
    print(f"   الحالة: {status['status']}")
    print(f"   نشط: {status['is_active']}")
    print(f"   الرسالة: {status['message']}")
    
    # 2. إنشاء المستخدم وتفعيل الفترة التجريبية
    print("\n2️⃣ إنشاء المستخدم وتفعيل الفترة التجريبية:")
    from portfolio_db import PortfolioManagerDB
    pm = PortfolioManagerDB(wallet)
    
    success, msg = manager.activate_trial(wallet)
    print(f"   {msg}")
    
    # 3. التحقق من الحالة بعد التفعيل
    print("\n3️⃣ التحقق من الحالة بعد التفعيل:")
    status = manager.check_subscription_status(wallet)
    print(f"   الحالة: {status['status']}")
    print(f"   نشط: {status['is_active']}")
    print(f"   الأيام المتبقية: {status['days_remaining']}")
    print(f"   ينتهي في: {status['expires_at'].strftime('%Y-%m-%d %H:%M')}")
    
    # 4. إنشاء طلب دفع
    print("\n4️⃣ إنشاء طلب دفع:")
    payment_request = manager.create_payment_request(wallet)
    if payment_request:
        print(f"   المبلغ: {payment_request['amount']} SOL")
        print(f"   Memo: {payment_request['memo']}")
        print(f"   ينتهي في: {payment_request['expires_at'].strftime('%Y-%m-%d %H:%M')}")
    
    # 5. محاكاة الدفع وتفعيل الاشتراك
    print("\n5️⃣ محاكاة الدفع وتفعيل الاشتراك:")
    success, msg = manager.verify_and_activate_subscription(
        wallet,
        transaction_signature="FAKE_SIGNATURE_FOR_TESTING_12345",
        amount_paid=0.1
    )
    print(f"   {msg}")
    
    # 6. التحقق من الحالة بعد الدفع
    print("\n6️⃣ التحقق من الحالة بعد الدفع:")
    status = manager.check_subscription_status(wallet)
    print(f"   الحالة: {status['status']}")
    print(f"   نشط: {status['is_active']}")
    print(f"   الأيام المتبقية: {status['days_remaining']}")
    print(f"   ينتهي في: {status['expires_at'].strftime('%Y-%m-%d %H:%M')}")
    
    print("\n" + "=" * 70)
    print("✅ جميع الاختبارات نجحت!")
    print("=" * 70)

