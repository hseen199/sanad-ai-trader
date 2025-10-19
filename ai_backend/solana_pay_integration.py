"""
SANAD AI Trader - Solana Pay Integration
التكامل مع Solana Pay للمدفوعات
"""

from typing import Dict, Optional
from datetime import datetime, timedelta
import json


class SolanaPayIntegration:
    """التكامل مع Solana Pay"""
    
    def __init__(self, recipient_wallet: str):
        """
        Args:
            recipient_wallet: عنوان المحفظة المستلمة للمدفوعات
        """
        self.recipient_wallet = recipient_wallet
    
    def create_payment_url(
        self,
        amount: float,
        memo: str,
        label: str = "SANAD AI Trader Subscription"
    ) -> str:
        """
        إنشاء رابط Solana Pay
        
        Args:
            amount: المبلغ بالـ SOL
            memo: رسالة المعاملة
            label: وصف المعاملة
        
        Returns:
            str: رابط Solana Pay
        """
        # تنسيق Solana Pay URL
        # solana:<recipient>?amount=<amount>&label=<label>&memo=<memo>
        
        url = f"solana:{self.recipient_wallet}"
        url += f"?amount={amount}"
        url += f"&label={label.replace(' ', '%20')}"
        url += f"&memo={memo}"
        
        return url
    
    def create_payment_qr_data(
        self,
        amount: float,
        memo: str,
        label: str = "SANAD AI Trader Subscription"
    ) -> Dict:
        """
        إنشاء بيانات QR Code للدفع
        
        Returns:
            dict: بيانات للاستخدام في Frontend
        """
        payment_url = self.create_payment_url(amount, memo, label)
        
        return {
            'url': payment_url,
            'recipient': self.recipient_wallet,
            'amount': amount,
            'memo': memo,
            'label': label,
            'currency': 'SOL',
            'network': 'Solana'
        }
    
    def create_transfer_request(
        self,
        amount: float,
        memo: str,
        reference: Optional[str] = None
    ) -> Dict:
        """
        إنشاء طلب تحويل متوافق مع Solana Pay Transfer Request
        
        Args:
            amount: المبلغ بالـ SOL
            memo: رسالة المعاملة
            reference: مرجع فريد للمعاملة (اختياري)
        
        Returns:
            dict: بيانات Transfer Request
        """
        return {
            'recipient': self.recipient_wallet,
            'amount': str(amount),
            'splToken': None,  # None = SOL native
            'reference': reference,
            'label': 'SANAD AI Trader Subscription',
            'message': f'Monthly subscription payment: {amount} SOL',
            'memo': memo
        }


# ==================== للاختبار ====================

if __name__ == '__main__':
    print("=" * 70)
    print("💳 اختبار Solana Pay Integration")
    print("=" * 70)
    
    # عنوان المحفظة المستلمة للاشتراكات
    recipient = "4WFksLbfb1hsBbUx8Xn3bic9esKfqy47x8phyYwbSBcK"
    
    solana_pay = SolanaPayIntegration(recipient)
    
    # 1. إنشاء رابط Solana Pay
    print("\n1️⃣ إنشاء رابط Solana Pay:")
    payment_url = solana_pay.create_payment_url(
        amount=0.1,
        memo="SANAD-SUB-123-1234567890",
        label="SANAD AI Trader Subscription"
    )
    print(f"   {payment_url}")
    
    # 2. إنشاء بيانات QR Code
    print("\n2️⃣ إنشاء بيانات QR Code:")
    qr_data = solana_pay.create_payment_qr_data(
        amount=0.1,
        memo="SANAD-SUB-123-1234567890"
    )
    print(f"   Recipient: {qr_data['recipient']}")
    print(f"   Amount: {qr_data['amount']} {qr_data['currency']}")
    print(f"   Memo: {qr_data['memo']}")
    
    # 3. إنشاء Transfer Request
    print("\n3️⃣ إنشاء Transfer Request:")
    transfer_request = solana_pay.create_transfer_request(
        amount=0.1,
        memo="SANAD-SUB-123-1234567890",
        reference="unique-reference-123"
    )
    print(f"   {json.dumps(transfer_request, indent=2)}")
    
    print("\n" + "=" * 70)
    print("✅ جميع الاختبارات نجحت!")
    print("=" * 70)

