"""
SANAD Ultimate AI Trading API - Version 2.0 with Database
API متكامل للتداول بالذكاء الاصطناعي مع قاعدة بيانات دائمة
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from ultimate_ai_engine import (
    DecisionEngine,
    calculate_all_indicators
)
from price_feed import get_price_feed
from portfolio_db import PortfolioManagerDB
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os

app = Flask(__name__)
CORS(app)

# تخزين الجلسات
decision_engine = None
price_feed = get_price_feed()

# Cache للمحافظ (لتقليل استعلامات قاعدة البيانات)
portfolios_cache = {}


def get_decision_engine():
    """تحميل محرك القرار عند الحاجة فقط"""
    global decision_engine
    if decision_engine is None:
        decision_engine = DecisionEngine()
    return decision_engine


def get_portfolio(wallet_address: str, initial_balance: float = 10000) -> PortfolioManagerDB:
    """الحصول على محفظة من Cache أو قاعدة البيانات"""
    if wallet_address not in portfolios_cache:
        portfolios_cache[wallet_address] = PortfolioManagerDB(
            wallet_address,
            initial_balance=initial_balance
        )
    return portfolios_cache[wallet_address]


# ==================== Home ====================

@app.route('/')
def home():
    return jsonify({
        'status': 'success',
        'message': 'SANAD Ultimate AI Trading API v2.0',
        'version': '2.0',
        'features': [
            '10 استراتيجيات تداول متقدمة',
            'إدارة محفظة ذكية',
            'تقسيم صفقات تلقائي',
            'إدارة مخاطر متقدمة',
            'تحليل عميق قبل كل قرار',
            'أسعار لحظية حقيقية من السوق',
            f'{price_feed.get_token_count()}+ عملة مدعومة',
            'قاعدة بيانات دائمة للمستخدمين'
        ]
    })


# ==================== Portfolio Management ====================

@app.route('/api/v1/portfolio/create', methods=['POST'])
def create_portfolio():
    """إنشاء أو تحميل محفظة"""
    try:
        data = request.json
        wallet_address = data.get('wallet_address')
        initial_balance = data.get('initial_balance', 10000)
        
        if not wallet_address:
            return jsonify({'error': 'عنوان المحفظة مطلوب'}), 400
        
        portfolio = get_portfolio(wallet_address, initial_balance)
        info = portfolio.get_portfolio_info()
        
        return jsonify({
            'status': 'success',
            'message': 'تم إنشاء/تحميل المحفظة بنجاح',
            'wallet_address': wallet_address,
            'portfolio': info
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/portfolio/info', methods=['GET'])
def get_portfolio_info():
    """الحصول على معلومات المحفظة"""
    try:
        wallet_address = request.args.get('wallet_address')
        
        if not wallet_address:
            return jsonify({'error': 'عنوان المحفظة مطلوب'}), 400
        
        portfolio = get_portfolio(wallet_address)
        info = portfolio.get_portfolio_info()
        
        return jsonify({
            'status': 'success',
            'wallet_address': wallet_address,
            'portfolio': info
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/portfolio/positions', methods=['GET'])
def get_positions():
    """الحصول على الصفقات المفتوحة"""
    try:
        wallet_address = request.args.get('wallet_address')
        
        if not wallet_address:
            return jsonify({'error': 'عنوان المحفظة مطلوب'}), 400
        
        portfolio = get_portfolio(wallet_address)
        positions = portfolio.get_open_positions()
        
        return jsonify({
            'status': 'success',
            'wallet_address': wallet_address,
            'positions': positions,
            'count': len(positions)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/portfolio/history', methods=['GET'])
def get_trade_history():
    """الحصول على سجل الصفقات"""
    try:
        wallet_address = request.args.get('wallet_address')
        limit = int(request.args.get('limit', 50))
        
        if not wallet_address:
            return jsonify({'error': 'عنوان المحفظة مطلوب'}), 400
        
        portfolio = get_portfolio(wallet_address)
        history = portfolio.get_trade_history(limit=limit)
        
        return jsonify({
            'status': 'success',
            'wallet_address': wallet_address,
            'trades': history,
            'count': len(history)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== Trading Operations ====================

@app.route('/api/v1/trade/open', methods=['POST'])
def open_trade():
    """فتح صفقة جديدة"""
    try:
        data = request.json
        wallet_address = data.get('wallet_address')
        
        # التحقق من صلاحية الاشتراك
        subscription_status = subscription_manager.check_subscription_status(wallet_address)
        
        if not subscription_status['is_active']:
            return jsonify({
                'error': 'اشتراكك منتهي أو معلق',
                'message': subscription_status['message'],
                'needs_payment': subscription_status['needs_payment'],
                'subscription_status': subscription_status
            }), 403
        symbol = data.get('symbol')
        entry_price = float(data.get('entry_price'))
        position_size = float(data.get('position_size'))
        stop_loss = float(data.get('stop_loss'))
        take_profit = float(data.get('take_profit'))
        confidence = float(data.get('confidence', 0.8))
        
        if not all([wallet_address, symbol, entry_price, position_size]):
            return jsonify({'error': 'بيانات غير كاملة'}), 400
        
        portfolio = get_portfolio(wallet_address)
        success, message = portfolio.open_position(
            symbol=symbol,
            entry_price=entry_price,
            position_size=position_size,
            stop_loss=stop_loss,
            take_profit=take_profit,
            confidence=confidence
        )
        
        if success:
            return jsonify({
                'status': 'success',
                'message': message,
                'portfolio': portfolio.get_portfolio_info()
            })
        else:
            return jsonify({'error': message}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/trade/close', methods=['POST'])
def close_trade():
    """إغلاق صفقة"""
    try:
        data = request.json
        wallet_address = data.get('wallet_address')
        symbol = data.get('symbol')
        exit_price = float(data.get('exit_price'))
        strategies_used = data.get('strategies_used', [])
        
        if not all([wallet_address, symbol, exit_price]):
            return jsonify({'error': 'بيانات غير كاملة'}), 400
        
        portfolio = get_portfolio(wallet_address)
        success, result = portfolio.close_position(
            symbol=symbol,
            exit_price=exit_price,
            strategies_used=strategies_used
        )
        
        if success:
            return jsonify({
                'status': 'success',
                'result': result,
                'portfolio': portfolio.get_portfolio_info()
            })
        else:
            return jsonify({'error': result}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== Price Feed APIs ====================

@app.route('/api/v1/price/current', methods=['GET'])
def get_current_price():
    """الحصول على السعر الحالي لعملة معينة"""
    try:
        token_symbol = request.args.get('symbol', 'SOL')
        
        price = price_feed.get_current_price(token_symbol)
        
        if price:
            return jsonify({
                'status': 'success',
                'symbol': token_symbol,
                'price': float(price),
                'timestamp': datetime.now().isoformat(),
                'source': 'live_market'
            })
        else:
            return jsonify({'error': f'لم نتمكن من جلب سعر {token_symbol}'}), 404
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/price/multiple', methods=['POST'])
def get_multiple_prices():
    """الحصول على أسعار متعددة دفعة واحدة"""
    try:
        data = request.json
        symbols = data.get('symbols', ['SOL'])
        
        prices = price_feed.get_multiple_prices(symbols)
        
        return jsonify({
            'status': 'success',
            'prices': prices,
            'timestamp': datetime.now().isoformat(),
            'count': len(prices)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/price/supported-tokens', methods=['GET'])
def get_supported_tokens():
    """الحصول على قائمة العملات المدعومة"""
    try:
        tokens = price_feed.get_all_supported_tokens()
        
        return jsonify({
            'status': 'success',
            'tokens': tokens,
            'count': len(tokens),
            'network': 'Solana'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== Analysis APIs ====================

@app.route('/api/v1/analysis/live', methods=['POST'])
def analyze_live_market():
    """تحليل السوق الحي مع بيانات حقيقية"""
    try:
        data = request.json
        token_symbol = data.get('symbol', 'SOL')
        wallet_address = data.get('wallet_address')
        
        # جلب بيانات السوق الحية
        market_data = price_feed.get_live_market_data(token_symbol, limit=100)
        
        if market_data is None:
            return jsonify({'error': f'لم نتمكن من جلب بيانات {token_symbol}'}), 404
        
        # حساب المؤشرات
        df = calculate_all_indicators(market_data)
        
        # الحصول على القرار
        current_idx = len(df) - 1
        engine = get_decision_engine()
        signal, confidence, stop_loss, take_profit, strategies = engine.get_consensus_decision(df, current_idx)
        
        current_price = df['Close'].iloc[current_idx]
        
        # حساب حجم الصفقة إذا كانت المحفظة موجودة
        position_size = None
        if wallet_address:
            portfolio = get_portfolio(wallet_address)
            if signal != 0 and stop_loss:
                position_size = portfolio.calculate_position_size(
                    current_price,
                    stop_loss,
                    confidence
                )
        
        signal_text = 'Hold'
        if signal == 1:
            signal_text = 'Buy'
        elif signal == 2:
            signal_text = 'Sell'
        
        return jsonify({
            'status': 'success',
            'symbol': token_symbol,
            'analysis': {
                'signal': signal_text,
                'confidence': float(confidence),
                'current_price': float(current_price),
                'stop_loss': float(stop_loss) if stop_loss else None,
                'take_profit': float(take_profit) if take_profit else None,
                'position_size': float(position_size) if position_size else None,
                'strategies_used': strategies,
                'data_source': 'live_market',
                'network': 'Solana',
                'timestamp': datetime.now().isoformat()
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== Run Server ====================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)




# ==================== Subscription APIs ====================

from subscription_manager import SubscriptionManager

subscription_manager = SubscriptionManager()


@app.route('/api/v1/subscription/status', methods=['GET'])
def get_subscription_status():
    """التحقق من حالة اشتراك المستخدم"""
    try:
        wallet_address = request.args.get('wallet_address')
        
        if not wallet_address:
            return jsonify({'error': 'عنوان المحفظة مطلوب'}), 400
        
        status = subscription_manager.check_subscription_status(wallet_address)
        
        return jsonify({
            'status': 'success',
            'subscription': status
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/subscription/activate-trial', methods=['POST'])
def activate_trial():
    """تفعيل الفترة التجريبية"""
    try:
        data = request.json
        wallet_address = data.get('wallet_address')
        
        if not wallet_address:
            return jsonify({'error': 'عنوان المحفظة مطلوب'}), 400
        
        # التأكد من وجود المستخدم
        portfolio = get_portfolio(wallet_address)
        
        success, message = subscription_manager.activate_trial(wallet_address)
        
        if success:
            return jsonify({
                'status': 'success',
                'message': message
            })
        else:
            return jsonify({'error': message}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/subscription/payment-request', methods=['POST'])
def create_payment_request():
    """إنشاء طلب دفع للاشتراك"""
    try:
        data = request.json
        wallet_address = data.get('wallet_address')
        
        if not wallet_address:
            return jsonify({'error': 'عنوان المحفظة مطلوب'}), 400
        
        payment_request = subscription_manager.create_payment_request(wallet_address)
        
        if payment_request:
            return jsonify({
                'status': 'success',
                'payment': {
                    'amount': payment_request['amount'],
                    'recipient': payment_request['recipient'],
                    'memo': payment_request['memo'],
                    'expires_at': payment_request['expires_at'].isoformat(),
                    'currency': 'SOL',
                    'network': 'Solana'
                }
            })
        else:
            return jsonify({'error': 'فشل إنشاء طلب الدفع'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/subscription/verify-payment', methods=['POST'])
def verify_payment():
    """التحقق من الدفع وتفعيل الاشتراك"""
    try:
        data = request.json
        wallet_address = data.get('wallet_address')
        transaction_signature = data.get('transaction_signature')
        amount_paid = float(data.get('amount_paid', 0))
        
        if not all([wallet_address, transaction_signature]):
            return jsonify({'error': 'بيانات غير كاملة'}), 400
        
        # TODO: التحقق الفعلي من المعاملة على Solana blockchain
        # هنا يجب استخدام Solana RPC للتحقق من صحة المعاملة
        
        success, message = subscription_manager.verify_and_activate_subscription(
            wallet_address,
            transaction_signature,
            amount_paid
        )
        
        if success:
            return jsonify({
                'status': 'success',
                'message': message
            })
        else:
            return jsonify({'error': message}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/subscription/webhook', methods=['POST'])
def subscription_webhook():
    """
    Webhook لاستقبال إشعارات الدفع من Helius أو خدمة مشابهة
    """
    try:
        # التحقق من صحة الطلب (يجب إضافة Bearer token)
        auth_header = request.headers.get('Authorization')
        
        # TODO: التحقق من Bearer token
        # if not auth_header or auth_header != f"Bearer {WEBHOOK_SECRET}":
        #     return jsonify({'error': 'Unauthorized'}), 401
        
        data = request.json
        
        # استخراج معلومات المعاملة
        transaction_signature = data.get('signature')
        
        # TODO: معالجة البيانات من Helius webhook
        # يجب التحقق من:
        # 1. نوع المعاملة (SPL Transfer)
        # 2. المبلغ المرسل
        # 3. العنوان المستلم
        # 4. memo يحتوي على معلومات الاشتراك
        
        return jsonify({
            'status': 'success',
            'message': 'Webhook received'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500




# ==================== Solana Pay Integration ====================

from solana_pay_integration import SolanaPayIntegration

# عنوان المحفظة المستلمة للاشتراكات
RECIPIENT_WALLET = "4WFksLbfb1hsBbUx8Xn3bic9esKfqy47x8phyYwbSBcK"
solana_pay = SolanaPayIntegration(RECIPIENT_WALLET)


@app.route('/api/v1/subscription/solana-pay', methods=['POST'])
def create_solana_pay_request():
    """إنشاء طلب دفع Solana Pay"""
    try:
        data = request.json
        wallet_address = data.get('wallet_address')
        
        if not wallet_address:
            return jsonify({'error': 'عنوان المحفظة مطلوب'}), 400
        
        # إنشاء طلب دفع
        payment_request = subscription_manager.create_payment_request(wallet_address)
        
        if not payment_request:
            return jsonify({'error': 'فشل إنشاء طلب الدفع'}), 400
        
        # إنشاء بيانات Solana Pay
        solana_pay_data = solana_pay.create_payment_qr_data(
            amount=payment_request['amount'],
            memo=payment_request['memo'],
            label="SANAD AI Trader - Monthly Subscription"
        )
        
        # إنشاء رابط Solana Pay
        payment_url = solana_pay.create_payment_url(
            amount=payment_request['amount'],
            memo=payment_request['memo'],
            label="SANAD AI Trader - Monthly Subscription"
        )
        
        return jsonify({
            'status': 'success',
            'payment': {
                'url': payment_url,
                'qr_data': solana_pay_data,
                'amount': payment_request['amount'],
                'recipient': RECIPIENT_WALLET,
                'memo': payment_request['memo'],
                'expires_at': payment_request['expires_at'].isoformat(),
                'currency': 'SOL',
                'network': 'Solana'
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

