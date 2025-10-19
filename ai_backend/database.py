"""
SANAD AI Trader - Database Models
نماذج قاعدة البيانات لحفظ بيانات المستخدمين والمحافظ والصفقات
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

# Base class for all models
Base = declarative_base()


# ==================== Models ====================

class User(Base):
    """نموذج المستخدم"""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    wallet_address = Column(String(44), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    portfolio = relationship("Portfolio", back_populates="user", uselist=False)
    trades = relationship("Trade", back_populates="user")
    subscription = relationship("Subscription", back_populates="user", uselist=False)
    
    def __repr__(self):
        return f"<User(wallet={self.wallet_address[:8]}...)>"


class Portfolio(Base):
    """نموذج المحفظة"""
    __tablename__ = 'portfolios'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    
    initial_balance = Column(Float, default=10000.0)
    current_balance = Column(Float, default=10000.0)
    max_risk_per_trade = Column(Float, default=0.02)  # 2%
    
    total_profit = Column(Float, default=0.0)
    total_trades = Column(Integer, default=0)
    winning_trades = Column(Integer, default=0)
    losing_trades = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    user = relationship("User", back_populates="portfolio")
    positions = relationship("Position", back_populates="portfolio")
    
    def __repr__(self):
        return f"<Portfolio(user_id={self.user_id}, balance=${self.current_balance:.2f})>"


class Position(Base):
    """نموذج الصفقة المفتوحة"""
    __tablename__ = 'positions'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    portfolio_id = Column(Integer, ForeignKey('portfolios.id'), nullable=False)
    
    symbol = Column(String(20), nullable=False)
    entry_price = Column(Float, nullable=False)
    position_size = Column(Float, nullable=False)
    stop_loss = Column(Float)
    take_profit = Column(Float)
    confidence = Column(Float)
    
    position_value = Column(Float, nullable=False)
    entry_time = Column(DateTime, default=datetime.utcnow)
    
    is_open = Column(Boolean, default=True)
    
    # العلاقات
    portfolio = relationship("Portfolio", back_populates="positions")
    
    def __repr__(self):
        return f"<Position(symbol={self.symbol}, size={self.position_size}, entry=${self.entry_price})>"


class Trade(Base):
    """نموذج سجل الصفقات المغلقة"""
    __tablename__ = 'trades'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    symbol = Column(String(20), nullable=False)
    trade_type = Column(String(10), nullable=False)  # 'buy' or 'sell'
    
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float, nullable=False)
    position_size = Column(Float, nullable=False)
    
    stop_loss = Column(Float)
    take_profit = Column(Float)
    confidence = Column(Float)
    
    profit = Column(Float, nullable=False)
    profit_pct = Column(Float, nullable=False)
    
    entry_time = Column(DateTime, nullable=False)
    exit_time = Column(DateTime, default=datetime.utcnow)
    
    strategies_used = Column(JSON)  # قائمة الاستراتيجيات المستخدمة
    
    # العلاقات
    user = relationship("User", back_populates="trades")
    
    def __repr__(self):
        return f"<Trade(symbol={self.symbol}, profit=${self.profit:.2f})>"


class Subscription(Base):
    """نموذج الاشتراكات"""
    __tablename__ = 'subscriptions'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    
    is_active = Column(Boolean, default=False)
    subscription_type = Column(String(20), default='monthly')  # 'monthly', 'yearly'
    
    amount_paid = Column(Float)  # بالـ SOL
    transaction_signature = Column(String(88))  # توقيع المعاملة على Solana
    
    started_at = Column(DateTime)
    expires_at = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    user = relationship("User", back_populates="subscription")
    
    def __repr__(self):
        return f"<Subscription(user_id={self.user_id}, active={self.is_active})>"


# ==================== Database Setup ====================

class Database:
    """إدارة الاتصال بقاعدة البيانات"""
    
    def __init__(self, database_url=None):
        """
        إنشاء اتصال بقاعدة البيانات
        
        Args:
            database_url: رابط قاعدة البيانات (PostgreSQL أو SQLite)
                         إذا لم يتم تحديده، سيتم استخدام SQLite محلياً
        """
        if database_url is None:
            # استخدام SQLite محلياً للتطوير
            database_url = os.getenv('DATABASE_URL', 'sqlite:///sanad_trading.db')
        
        # إذا كان الرابط من Render أو Heroku، قد يبدأ بـ postgres:// بدلاً من postgresql://
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        
        self.engine = create_engine(database_url, echo=False)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def create_tables(self):
        """إنشاء جميع الجداول"""
        Base.metadata.create_all(bind=self.engine)
        print("✅ تم إنشاء جميع الجداول بنجاح")
    
    def drop_tables(self):
        """حذف جميع الجداول (للتطوير فقط)"""
        Base.metadata.drop_all(bind=self.engine)
        print("⚠️ تم حذف جميع الجداول")
    
    def get_session(self):
        """الحصول على جلسة قاعدة بيانات"""
        return self.SessionLocal()


# ==================== Singleton Instance ====================

_db_instance = None

def get_database():
    """الحصول على instance واحد من Database"""
    global _db_instance
    if _db_instance is None:
        _db_instance = Database()
        _db_instance.create_tables()
    return _db_instance


# ==================== للاختبار ====================

if __name__ == '__main__':
    print("=" * 70)
    print("🗄️ اختبار قاعدة البيانات - SANAD AI Trader")
    print("=" * 70)
    
    # إنشاء قاعدة البيانات
    db = Database()
    db.create_tables()
    
    # اختبار إضافة مستخدم
    print("\n1️⃣ اختبار إضافة مستخدم...")
    session = db.get_session()
    
    try:
        # إنشاء مستخدم جديد
        user = User(wallet_address="DemoWallet123456789012345678901234567890")
        session.add(user)
        session.commit()
        print(f"   ✅ تم إضافة المستخدم: {user}")
        
        # إنشاء محفظة للمستخدم
        portfolio = Portfolio(
            user_id=user.id,
            initial_balance=10000.0,
            current_balance=10000.0
        )
        session.add(portfolio)
        session.commit()
        print(f"   ✅ تم إنشاء المحفظة: {portfolio}")
        
        # إنشاء صفقة مفتوحة
        position = Position(
            portfolio_id=portfolio.id,
            symbol='SOL',
            entry_price=190.50,
            position_size=10.0,
            stop_loss=185.0,
            take_profit=200.0,
            confidence=0.85,
            position_value=1905.0
        )
        session.add(position)
        session.commit()
        print(f"   ✅ تم فتح صفقة: {position}")
        
        # قراءة البيانات
        print("\n2️⃣ قراءة البيانات...")
        users = session.query(User).all()
        print(f"   عدد المستخدمين: {len(users)}")
        
        for u in users:
            print(f"   - {u}")
            if u.portfolio:
                print(f"     المحفظة: ${u.portfolio.current_balance:.2f}")
            if u.portfolio and u.portfolio.positions:
                print(f"     الصفقات المفتوحة: {len(u.portfolio.positions)}")
        
        print("\n✅ جميع الاختبارات نجحت!")
        
    except Exception as e:
        print(f"❌ خطأ: {e}")
        session.rollback()
    
    finally:
        session.close()
    
    print("\n" + "=" * 70)
    print("✅ اختبار قاعدة البيانات اكتمل!")
    print("=" * 70)

