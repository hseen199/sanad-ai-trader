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




# ==================== Trading Execution (Jupiter Integration) ====================

from trade_executor import TradeExecutor

trade_executor = TradeExecutor()


@app.route('/api/v1/trade/prepare-buy', methods=['POST'])
def prepare_buy_order():
    """تحضير أمر شراء"""
    try:
        data = request.json
        wallet_address = data.get('wallet_address')
        symbol = data.get('symbol')
        amount_usd = float(data.get('amount_usd'))
        slippage_bps = int(data.get('slippage_bps', 50))
        
        if not wallet_address or not symbol or not amount_usd:
            return jsonify({'error': 'بيانات ناقصة'}), 400
        
        # تحضير الأمر
        order = trade_executor.prepare_buy_order(
            wallet_address=wallet_address,
            symbol=symbol,
            amount_usd=amount_usd,
            slippage_bps=slippage_bps
        )
        
        if not order:
            return jsonify({'error': 'فشل تحضير الأمر'}), 400
        
        if order.get('error'):
            return jsonify(order), 403
        
        return jsonify({
            'status': 'success',
            'order': order
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/trade/prepare-sell', methods=['POST'])
def prepare_sell_order():
    """تحضير أمر بيع"""
    try:
        data = request.json
        wallet_address = data.get('wallet_address')
        symbol = data.get('symbol')
        amount = float(data.get('amount'))
        slippage_bps = int(data.get('slippage_bps', 50))
        
        if not wallet_address or not symbol or not amount:
            return jsonify({'error': 'بيانات ناقصة'}), 400
        
        # تحضير الأمر
        order = trade_executor.prepare_sell_order(
            wallet_address=wallet_address,
            symbol=symbol,
            amount=amount,
            slippage_bps=slippage_bps
        )
        
        if not order:
            return jsonify({'error': 'فشل تحضير الأمر'}), 400
        
        if order.get('error'):
            return jsonify(order), 403
        
        return jsonify({
            'status': 'success',
            'order': order
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/trade/execute', methods=['POST'])
def execute_trade():
    """تنفيذ صفقة موقعة"""
    try:
        data = request.json
        request_id = data.get('request_id')
        signed_transaction = data.get('signed_transaction')
        trade_type = data.get('trade_type')
        wallet_address = data.get('wallet_address')
        symbol = data.get('symbol')
        amount = float(data.get('amount'))
        price = float(data.get('price'))
        
        if not all([request_id, signed_transaction, trade_type, wallet_address, symbol]):
            return jsonify({'error': 'بيانات ناقصة'}), 400
        
        # تنفيذ الصفقة
        result = trade_executor.execute_trade(
            request_id=request_id,
            signed_transaction=signed_transaction,
            trade_type=trade_type,
            wallet_address=wallet_address,
            symbol=symbol,
            amount=amount,
            price=price
        )
        
        if not result:
            return jsonify({'error': 'فشل تنفيذ الصفقة'}), 400
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/trade/quote', methods=['GET'])
def get_trade_quote():
    """الحصول على عرض سعر"""
    try:
        input_token = request.args.get('input_token', 'SOL')
        output_token = request.args.get('output_token', 'USDC')
        amount = float(request.args.get('amount', 1.0))
        
        quote = trade_executor.jupiter.get_quote(
            input_token=input_token,
            output_token=output_token,
            amount=amount
        )
        
        if not quote:
            return jsonify({'error': 'فشل الحصول على العرض'}), 400
        
        # حساب السعر بشكل مقروء
        in_amount = float(quote.get('inAmount', 0))
        out_amount = float(quote.get('outAmount', 0))
        
        # تحويل من lamports
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
        
        return jsonify({
            'status': 'success',
            'quote': {
                'input_token': input_token,
                'output_token': output_token,
                'input_amount': in_amount_readable,
                'output_amount': out_amount_readable,
                'price': price,
                'price_impact': quote.get('priceImpact', 0),
                'slippage_bps': quote.get('slippageBps', 0)
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500




# ==================== Helius Webhook Endpoint ====================

from helius_webhook import HeliusWebhookHandler
import os

# إنشاء معالج الـ Webhook
webhook_handler = HeliusWebhookHandler(
    webhook_secret=os.environ.get('HELIUS_WEBHOOK_SECRET')
)


@app.route('/api/v1/webhook/payment', methods=['POST'])
def helius_webhook():
    """استقبال ومعالجة Webhooks من Helius"""
    try:
        # الحصول على البيانات
        data = request.json
        
        # التحقق من التوقيع (اختياري)
        signature = request.headers.get('X-Helius-Signature')
        if signature:
            payload = request.get_data()
            if not webhook_handler.verify_signature(payload, signature):
                return jsonify({'error': 'توقيع غير صالح'}), 401
        
        # معالجة الـ Webhook
        result = webhook_handler.handle_webhook(data)
        
        return jsonify(result), 200
    
    except Exception as e:
        logger.error(f"❌ خطأ في معالجة webhook: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/webhook/test', methods=['GET'])
def test_webhook():
    """اختبار Webhook Endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Webhook endpoint is working!',
        'receiver_wallet': webhook_handler.RECEIVER_WALLET,
        'subscription_amount_sol': webhook_handler.SUBSCRIPTION_AMOUNT_LAMPORTS / 1_000_000_000
    })




# ==================== Account Performance & Overview ====================

@app.route('/api/v1/account/performance', methods=['GET'])
def get_account_performance():
    """الحصول على بيانات أداء الحساب"""
    try:
        wallet_address = request.args.get('wallet_address')
        period = request.args.get('period', '7d')
        
        if not wallet_address:
            return jsonify({'error': 'عنوان المحفظة مطلوب'}), 400
        
        portfolio = get_portfolio(wallet_address)
        
        # الحصول على سجل التداولات
        history = portfolio.get_trade_history(limit=1000)
        
        # حساب الأرباح
        weekly_profit = calculate_period_profit(history, days=7)
        monthly_profit = calculate_period_profit(history, days=30)
        total_profit = sum(t.get('pnl', 0) for t in history if t.get('pnl'))
        
        # بيانات المخطط
        chart_data = get_performance_chart_data(history, period)
        
        return jsonify({
            'status': 'success',
            'wallet_address': wallet_address,
            'weekly_profit': round(weekly_profit, 2),
            'monthly_profit': round(monthly_profit, 2),
            'total_profit': round(total_profit, 2),
            'chart_data': chart_data,
            'period': period
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/account/overview', methods=['GET'])
def get_account_overview():
    """الحصول على نظرة عامة على الحساب"""
    try:
        wallet_address = request.args.get('wallet_address')
        
        if not wallet_address:
            return jsonify({'error': 'عنوان المحفظة مطلوب'}), 400
        
        portfolio = get_portfolio(wallet_address)
        info = portfolio.get_portfolio_info()
        history = portfolio.get_trade_history(limit=1000)
        
        # حساب الإحصائيات
        total_trades = len(history)
        winning_trades = len([t for t in history if t.get('pnl', 0) > 0])
        win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
        
        avg_profit = sum(t.get('pnl', 0) for t in history) / total_trades if total_trades > 0 else 0
        
        best_trade = max(history, key=lambda t: t.get('pnl', 0)) if history else None
        worst_trade = min(history, key=lambda t: t.get('pnl', 0)) if history else None
        
        return jsonify({
            'status': 'success',
            'total_trades': total_trades,
            'winning_trades': winning_trades,
            'losing_trades': total_trades - winning_trades,
            'win_rate': round(win_rate, 2),
            'avg_profit': round(avg_profit, 2),
            'best_trade': best_trade,
            'worst_trade': worst_trade,
            'current_balance': info.get('current_balance', 0),
            'total_profit': info.get('total_profit', 0)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/ai/status', methods=['GET'])
def get_ai_status():
    """الحصول على حالة محرك AI"""
    try:
        engine = get_decision_engine()
        
        # إشارات وهمية للتجربة (يمكن استبدالها بإشارات حقيقية لاحقاً)
        signals = [
            {'pair': 'SOL/USDT', 'signal': 'شراء', 'confidence': 0.85, 'time': datetime.now().isoformat()},
            {'pair': 'BTC/USDT', 'signal': 'احتفاظ', 'confidence': 0.72, 'time': datetime.now().isoformat()},
            {'pair': 'ETH/USDT', 'signal': 'بيع', 'confidence': 0.68, 'time': datetime.now().isoformat()}
        ]
        
        return jsonify({
            'status': 'success',
            'ai_status': 'active',
            'accuracy': 94.5,  # يمكن حسابها من الصفقات السابقة
            'model_version': '2.0',
            'signals': signals,
            'last_update': datetime.now().isoformat(),
            'total_predictions': 1247
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/leaderboard', methods=['GET'])
def get_leaderboard():
    """الحصول على المتصدرين"""
    try:
        # TODO: جلب البيانات الحقيقية من قاعدة البيانات
        # هذه بيانات وهمية للتجربة
        leaderboard = [
            {'rank': 1, 'wallet': 'SANAD...ABC123', 'profit': 45.2, 'trades': 156},
            {'rank': 2, 'wallet': 'SANAD...DEF456', 'profit': 38.7, 'trades': 142},
            {'rank': 3, 'wallet': 'SANAD...GHI789', 'profit': 32.1, 'trades': 128},
            {'rank': 4, 'wallet': 'SANAD...JKL012', 'profit': 28.5, 'trades': 115},
            {'rank': 5, 'wallet': 'SANAD...MNO345', 'profit': 24.3, 'trades': 98}
        ]
        
        return jsonify({
            'status': 'success',
            'leaderboard': leaderboard
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== Helper Functions ====================

def calculate_period_profit(history: List[Dict], days: int) -> float:
    """حساب الربح لفترة معينة"""
    if not history:
        return 0.0
    
    now = datetime.now()
    period_start = now - timedelta(days=days)
    
    period_trades = [
        t for t in history 
        if t.get('exit_time') and datetime.fromisoformat(t['exit_time'].replace('Z', '+00:00')) >= period_start
    ]
    
    if not period_trades:
        return 0.0
    
    total_pnl = sum(t.get('pnl', 0) for t in period_trades)
    return total_pnl


def get_performance_chart_data(history: List[Dict], period: str = '7d') -> List[Dict]:
    """الحصول على بيانات المخطط"""
    if not history:
        return []
    
    # تحديد عدد الأيام
    days_map = {'7d': 7, '30d': 30, '90d': 90, '1y': 365}
    days = days_map.get(period, 7)
    
    now = datetime.now()
    start_date = now - timedelta(days=days)
    
    # تجميع البيانات حسب اليوم
    daily_data = {}
    for i in range(days + 1):
        date = start_date + timedelta(days=i)
        date_str = date.strftime('%Y-%m-%d')
        daily_data[date_str] = {'day': i + 1, 'value': 0, 'trades': 0}
    
    # حساب الربح اليومي
    cumulative_profit = 0
    for trade in history:
        if trade.get('exit_time'):
            try:
                exit_date = datetime.fromisoformat(trade['exit_time'].replace('Z', '+00:00'))
                if exit_date >= start_date:
                    date_str = exit_date.strftime('%Y-%m-%d')
                    if date_str in daily_data:
                        cumulative_profit += trade.get('pnl', 0)
                        daily_data[date_str]['value'] = cumulative_profit
                        daily_data[date_str]['trades'] += 1
            except:
                continue
    
    # تحويل إلى قائمة مرتبة
    chart_data = [daily_data[date] for date in sorted(daily_data.keys())]
    
    return chart_data


# ==================== Run Server ====================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

