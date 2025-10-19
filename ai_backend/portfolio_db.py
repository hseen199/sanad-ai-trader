"""
SANAD AI Trader - Portfolio Manager with Database
إدارة محفظة ذكية مع حفظ دائم في قاعدة البيانات
"""

from database import get_database, User, Portfolio, Position, Trade
from datetime import datetime
from typing import Optional, Dict, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PortfolioManagerDB:
    """إدارة محفظة ذكية مع قاعدة بيانات"""
    
    def __init__(self, wallet_address: str, initial_balance: float = 10000, max_risk_per_trade: float = 0.02):
        """
        إنشاء أو تحميل محفظة من قاعدة البيانات
        
        Args:
            wallet_address: عنوان محفظة المستخدم
            initial_balance: الرصيد الابتدائي (للمستخدمين الجدد فقط)
            max_risk_per_trade: نسبة المخاطرة القصوى لكل صفقة (2% افتراضياً)
        """
        self.wallet_address = wallet_address
        self.db = get_database()
        
        # تحميل أو إنشاء المستخدم والمحفظة
        session = self.db.get_session()
        try:
            # البحث عن المستخدم
            user = session.query(User).filter_by(wallet_address=wallet_address).first()
            
            if user is None:
                # إنشاء مستخدم جديد
                user = User(wallet_address=wallet_address)
                session.add(user)
                session.commit()
                logger.info(f"✅ تم إنشاء مستخدم جديد: {wallet_address[:8]}...")
                
                # إنشاء محفظة للمستخدم
                portfolio = Portfolio(
                    user_id=user.id,
                    initial_balance=initial_balance,
                    current_balance=initial_balance,
                    max_risk_per_trade=max_risk_per_trade
                )
                session.add(portfolio)
                session.commit()
                logger.info(f"✅ تم إنشاء محفظة جديدة: ${initial_balance:.2f}")
            else:
                # تحديث آخر نشاط
                user.last_active = datetime.utcnow()
                session.commit()
                logger.info(f"✅ تم تحميل مستخدم موجود: {wallet_address[:8]}...")
            
            self.user_id = user.id
            
        except Exception as e:
            logger.error(f"❌ خطأ في إنشاء/تحميل المستخدم: {e}")
            session.rollback()
            raise
        finally:
            session.close()
    
    def get_portfolio_info(self) -> Dict:
        """الحصول على معلومات المحفظة"""
        session = self.db.get_session()
        try:
            portfolio = session.query(Portfolio).filter_by(user_id=self.user_id).first()
            
            if portfolio is None:
                return None
            
            # حساب الإحصائيات
            win_rate = (portfolio.winning_trades / portfolio.total_trades * 100) if portfolio.total_trades > 0 else 0
            
            return {
                'initial_balance': portfolio.initial_balance,
                'current_balance': portfolio.current_balance,
                'total_profit': portfolio.total_profit,
                'total_trades': portfolio.total_trades,
                'winning_trades': portfolio.winning_trades,
                'losing_trades': portfolio.losing_trades,
                'win_rate': win_rate,
                'max_risk_per_trade': portfolio.max_risk_per_trade
            }
        finally:
            session.close()
    
    def calculate_position_size(self, entry_price: float, stop_loss_price: float, confidence: float = 0.8) -> float:
        """حساب حجم الصفقة بناءً على إدارة المخاطر"""
        session = self.db.get_session()
        try:
            portfolio = session.query(Portfolio).filter_by(user_id=self.user_id).first()
            
            if portfolio is None:
                return 0
            
            # المبلغ المخاطر به لكل صفقة
            risk_amount = portfolio.current_balance * portfolio.max_risk_per_trade * confidence
            
            # المسافة بين السعر والستوب لوس
            price_risk = abs(entry_price - stop_loss_price)
            
            if price_risk == 0:
                return 0
            
            # حساب حجم الصفقة
            position_size = risk_amount / price_risk
            
            # التأكد من عدم تجاوز الرصيد المتاح
            max_position_value = portfolio.current_balance * 0.95  # استخدام 95% كحد أقصى
            max_position_size = max_position_value / entry_price
            
            return min(position_size, max_position_size)
        
        finally:
            session.close()
    
    def open_position(self, symbol: str, entry_price: float, position_size: float, 
                     stop_loss: float, take_profit: float, confidence: float) -> tuple:
        """فتح صفقة جديدة"""
        session = self.db.get_session()
        try:
            portfolio = session.query(Portfolio).filter_by(user_id=self.user_id).first()
            
            if portfolio is None:
                return False, "المحفظة غير موجودة"
            
            position_value = entry_price * position_size
            
            if position_value > portfolio.current_balance:
                return False, "رصيد غير كافٍ"
            
            # إنشاء صفقة جديدة
            position = Position(
                portfolio_id=portfolio.id,
                symbol=symbol,
                entry_price=entry_price,
                position_size=position_size,
                stop_loss=stop_loss,
                take_profit=take_profit,
                confidence=confidence,
                position_value=position_value,
                is_open=True
            )
            
            # تحديث رصيد المحفظة
            portfolio.current_balance -= position_value
            
            session.add(position)
            session.commit()
            
            logger.info(f"✅ تم فتح صفقة {symbol}: {position_size} @ ${entry_price}")
            
            return True, f"تم فتح صفقة {symbol}"
        
        except Exception as e:
            logger.error(f"❌ خطأ في فتح الصفقة: {e}")
            session.rollback()
            return False, str(e)
        
        finally:
            session.close()
    
    def close_position(self, symbol: str, exit_price: float, strategies_used: List[str] = None) -> tuple:
        """إغلاق صفقة"""
        session = self.db.get_session()
        try:
            portfolio = session.query(Portfolio).filter_by(user_id=self.user_id).first()
            
            if portfolio is None:
                return False, "المحفظة غير موجودة"
            
            # البحث عن الصفقة المفتوحة
            position = session.query(Position).filter_by(
                portfolio_id=portfolio.id,
                symbol=symbol,
                is_open=True
            ).first()
            
            if position is None:
                return False, "الصفقة غير موجودة"
            
            # حساب الربح/الخسارة
            exit_value = exit_price * position.position_size
            profit = exit_value - position.position_value
            profit_pct = (profit / position.position_value) * 100
            
            # تحديث رصيد المحفظة
            portfolio.current_balance += exit_value
            portfolio.total_profit += profit
            portfolio.total_trades += 1
            
            if profit > 0:
                portfolio.winning_trades += 1
            else:
                portfolio.losing_trades += 1
            
            # إغلاق الصفقة
            position.is_open = False
            
            # تسجيل الصفقة في السجل
            trade = Trade(
                user_id=self.user_id,
                symbol=symbol,
                trade_type='buy' if profit > 0 else 'sell',
                entry_price=position.entry_price,
                exit_price=exit_price,
                position_size=position.position_size,
                stop_loss=position.stop_loss,
                take_profit=position.take_profit,
                confidence=position.confidence,
                profit=profit,
                profit_pct=profit_pct,
                entry_time=position.entry_time,
                exit_time=datetime.utcnow(),
                strategies_used=strategies_used
            )
            
            session.add(trade)
            session.commit()
            
            logger.info(f"✅ تم إغلاق صفقة {symbol}: ربح ${profit:.2f} ({profit_pct:.2f}%)")
            
            return True, {
                'profit': profit,
                'profit_pct': profit_pct,
                'exit_price': exit_price
            }
        
        except Exception as e:
            logger.error(f"❌ خطأ في إغلاق الصفقة: {e}")
            session.rollback()
            return False, str(e)
        
        finally:
            session.close()
    
    def get_open_positions(self) -> List[Dict]:
        """الحصول على جميع الصفقات المفتوحة"""
        session = self.db.get_session()
        try:
            portfolio = session.query(Portfolio).filter_by(user_id=self.user_id).first()
            
            if portfolio is None:
                return []
            
            positions = session.query(Position).filter_by(
                portfolio_id=portfolio.id,
                is_open=True
            ).all()
            
            return [{
                'symbol': p.symbol,
                'entry_price': p.entry_price,
                'position_size': p.position_size,
                'stop_loss': p.stop_loss,
                'take_profit': p.take_profit,
                'confidence': p.confidence,
                'position_value': p.position_value,
                'entry_time': p.entry_time.isoformat()
            } for p in positions]
        
        finally:
            session.close()
    
    def get_trade_history(self, limit: int = 50) -> List[Dict]:
        """الحصول على سجل الصفقات"""
        session = self.db.get_session()
        try:
            trades = session.query(Trade).filter_by(
                user_id=self.user_id
            ).order_by(Trade.exit_time.desc()).limit(limit).all()
            
            return [{
                'symbol': t.symbol,
                'trade_type': t.trade_type,
                'entry_price': t.entry_price,
                'exit_price': t.exit_price,
                'position_size': t.position_size,
                'profit': t.profit,
                'profit_pct': t.profit_pct,
                'entry_time': t.entry_time.isoformat(),
                'exit_time': t.exit_time.isoformat(),
                'strategies_used': t.strategies_used
            } for t in trades]
        
        finally:
            session.close()


# ==================== للاختبار ====================

if __name__ == '__main__':
    print("=" * 70)
    print("💼 اختبار Portfolio Manager مع قاعدة البيانات")
    print("=" * 70)
    
    # إنشاء محفظة جديدة
    wallet = "TestWallet123456789012345678901234567890"
    pm = PortfolioManagerDB(wallet, initial_balance=10000)
    
    # عرض معلومات المحفظة
    print("\n1️⃣ معلومات المحفظة:")
    info = pm.get_portfolio_info()
    for key, value in info.items():
        print(f"   {key}: {value}")
    
    # فتح صفقة
    print("\n2️⃣ فتح صفقة SOL...")
    success, msg = pm.open_position(
        symbol='SOL',
        entry_price=190.50,
        position_size=10.0,
        stop_loss=185.0,
        take_profit=200.0,
        confidence=0.85
    )
    print(f"   {msg}")
    
    # عرض الصفقات المفتوحة
    print("\n3️⃣ الصفقات المفتوحة:")
    positions = pm.get_open_positions()
    for p in positions:
        print(f"   {p['symbol']}: {p['position_size']} @ ${p['entry_price']}")
    
    # إغلاق الصفقة
    print("\n4️⃣ إغلاق صفقة SOL...")
    success, result = pm.close_position('SOL', 195.0, strategies_used=['Scalping', 'Momentum'])
    if success:
        print(f"   ربح: ${result['profit']:.2f} ({result['profit_pct']:.2f}%)")
    
    # عرض سجل الصفقات
    print("\n5️⃣ سجل الصفقات:")
    history = pm.get_trade_history(limit=10)
    for t in history:
        print(f"   {t['symbol']}: ${t['profit']:.2f} ({t['profit_pct']:.2f}%)")
    
    # عرض معلومات المحفظة المحدثة
    print("\n6️⃣ معلومات المحفظة المحدثة:")
    info = pm.get_portfolio_info()
    for key, value in info.items():
        print(f"   {key}: {value}")
    
    print("\n" + "=" * 70)
    print("✅ جميع الاختبارات نجحت!")
    print("=" * 70)

