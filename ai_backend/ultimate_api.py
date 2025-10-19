"""
SANAD Ultimate API
API محدّث مع نظام AI المتكامل
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from ultimate_ai_engine import (
    PortfolioManager,
    DecisionEngine,
    calculate_all_indicators
)
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os

app = Flask(__name__)
CORS(app)

# تخزين المحافظ والجلسات
portfolios = {}
decision_engine = None  # سيتم تحميله عند الحاجة

def get_decision_engine():
    """تحميل محرك القرار عند الحاجة فقط"""
    global decision_engine
    if decision_engine is None:
        decision_engine = DecisionEngine()
    return decision_engine

# ==================== APIs ====================

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'success',
        'message': 'SANAD Ultimate AI Trading API',
        'version': '2.0',
        'features': [
            '10 استراتيجيات تداول متقدمة',
            'إدارة محفظة ذكية',
            'تقسيم صفقات تلقائي',
            'إدارة مخاطر متقدمة',
            'تحليل عميق قبل كل قرار'
        ]
    })


@app.route('/api/v1/portfolio/create', methods=['POST'])
def create_portfolio():
    """إنشاء محفظة جديدة"""
    try:
        data = request.json
        wallet_address = data.get('wallet_address')
        initial_balance = data.get('initial_balance', 10000)
        max_risk_per_trade = data.get('max_risk_per_trade', 0.02)
        
        if not wallet_address:
            return jsonify({'error': 'عنوان المحفظة مطلوب'}), 400
        
        portfolio = PortfolioManager(
            initial_balance=initial_balance,
            max_risk_per_trade=max_risk_per_trade
        )
        
        portfolios[wallet_address] = portfolio
        
        return jsonify({
            'status': 'success',
            'message': 'تم إنشاء المحفظة بنجاح',
            'portfolio': portfolio.get_portfolio_stats()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/portfolio/stats', methods=['POST'])
def get_portfolio_stats():
    """الحصول على إحصائيات المحفظة"""
    try:
        data = request.json
        wallet_address = data.get('wallet_address')
        
        if wallet_address not in portfolios:
            return jsonify({'error': 'المحفظة غير موجودة'}), 404
        
        portfolio = portfolios[wallet_address]
        stats = portfolio.get_portfolio_stats()
        
        return jsonify({
            'status': 'success',
            'stats': stats
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/analysis/market', methods=['POST'])
def analyze_market():
    """تحليل السوق والحصول على توصية"""
    try:
        data = request.json
        market_data = data.get('market_data')  # OHLCV data
        wallet_address = data.get('wallet_address')
        
        if not market_data:
            return jsonify({'error': 'بيانات السوق مطلوبة'}), 400
        
        # تحويل البيانات إلى DataFrame
        df = pd.DataFrame(market_data)
        
        # حساب المؤشرات
        df = calculate_all_indicators(df)
        
        # الحصول على القرار
        current_idx = len(df) - 1
        engine = get_decision_engine()
        signal, confidence, stop_loss, take_profit, strategies = engine.get_consensus_decision(df, current_idx)
        
        current_price = df['Close'].iloc[current_idx]
        
        # حساب حجم الصفقة إذا كانت المحفظة موجودة
        position_size = None
        if wallet_address and wallet_address in portfolios:
            portfolio = portfolios[wallet_address]
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
            'analysis': {
                'signal': signal_text,
                'confidence': float(confidence),
                'current_price': float(current_price),
                'stop_loss': float(stop_loss) if stop_loss else None,
                'take_profit': float(take_profit) if take_profit else None,
                'position_size': float(position_size) if position_size else None,
                'strategies_used': strategies,
                'timestamp': datetime.now().isoformat()
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/trade/open', methods=['POST'])
def open_trade():
    """فتح صفقة جديدة"""
    try:
        data = request.json
        wallet_address = data.get('wallet_address')
        symbol = data.get('symbol')
        entry_price = data.get('entry_price')
        position_size = data.get('position_size')
        stop_loss = data.get('stop_loss')
        take_profit = data.get('take_profit')
        confidence = data.get('confidence', 0.8)
        
        if wallet_address not in portfolios:
            return jsonify({'error': 'المحفظة غير موجودة'}), 404
        
        portfolio = portfolios[wallet_address]
        
        success, message = portfolio.open_position(
            symbol,
            entry_price,
            position_size,
            stop_loss,
            take_profit,
            confidence
        )
        
        if success:
            return jsonify({
                'status': 'success',
                'message': message,
                'portfolio': portfolio.get_portfolio_stats()
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
        exit_price = data.get('exit_price')
        
        if wallet_address not in portfolios:
            return jsonify({'error': 'المحفظة غير موجودة'}), 404
        
        portfolio = portfolios[wallet_address]
        
        success, message = portfolio.close_position(symbol, exit_price)
        
        if success:
            return jsonify({
                'status': 'success',
                'message': message,
                'portfolio': portfolio.get_portfolio_stats()
            })
        else:
            return jsonify({'error': message}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/trade/check_stops', methods=['POST'])
def check_stops():
    """فحص الستوب لوس والتيك بروفيت"""
    try:
        data = request.json
        wallet_address = data.get('wallet_address')
        symbol = data.get('symbol')
        current_price = data.get('current_price')
        
        if wallet_address not in portfolios:
            return jsonify({'error': 'المحفظة غير موجودة'}), 404
        
        portfolio = portfolios[wallet_address]
        
        result = portfolio.check_stop_loss_take_profit(symbol, current_price)
        
        return jsonify({
            'status': 'success',
            'result': result,
            'should_close': result is not None
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/trade/history', methods=['POST'])
def get_trade_history():
    """الحصول على سجل الصفقات"""
    try:
        data = request.json
        wallet_address = data.get('wallet_address')
        
        if wallet_address not in portfolios:
            return jsonify({'error': 'المحفظة غير موجودة'}), 404
        
        portfolio = portfolios[wallet_address]
        
        return jsonify({
            'status': 'success',
            'history': portfolio.trade_history
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/subscription/status', methods=['POST'])
def subscription_status():
    """التحقق من حالة الاشتراك (بدون شرط SNDX)"""
    try:
        data = request.json
        wallet_address = data.get('walletAddress')
        
        # هنا يمكنك إضافة منطق التحقق من الاشتراك
        # حالياً نفترض أن الاشتراك نشط إذا دفع 0.1 SOL
        
        return jsonify({
            'active': True,  # سيتم التحقق من قاعدة البيانات
            'expires_at': (datetime.now() + timedelta(days=30)).isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/subscription/verify', methods=['POST'])
def verify_subscription():
    """التحقق من دفع الاشتراك"""
    try:
        data = request.json
        signature = data.get('signature')
        wallet_address = data.get('walletAddress')
        
        # هنا يمكنك إضافة منطق التحقق من المعاملة على Solana
        
        return jsonify({
            'verified': True,
            'message': 'تم التحقق من الاشتراك بنجاح'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/health', methods=['GET'])
def health_check():
    """فحص صحة الخادم"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'active_portfolios': len(portfolios)
    })


# Production: Gunicorn will import this module and use 'app'
# Local development: Run Flask dev server
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

