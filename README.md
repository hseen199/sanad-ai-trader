# SANAD AI Trader - بوت التداول على شبكة سولانا المدعوم بالذكاء الاصطناعي

## نظرة عامة

**SANAD AI Trader** هو بوت تداول آلي مدعوم بالذكاء الاصطناعي يعمل على شبكة **Solana**. يستخدم البوت خوارزميات التعلم المعزز (Reinforcement Learning) لاتخاذ قرارات تداول ذكية على البورصات اللامركزية (DEXs) مثل Jupiter و Raydium و Orca.

## المميزات الرئيسية

### 🤖 الذكاء الاصطناعي
- نموذج PPO (Proximal Policy Optimization) للتعلم المعزز
- تحليل تقني متقدم (RSI, MACD, EMA, ATR, OBV, VWAP)
- تحديثات أوزان دورية مع online learning

### 🔐 الأمان
- تكامل آمن مع محافظ Solana (Phantom, Solflare, Backpack, Trust, Coinbase)
- برنامج Anchor للتفويض الآمن وخصم الرسوم تلقائياً
- لا يتم تخزين المفاتيح الخاصة على الخادم
- تفويض محدود وقابل للإلغاء من قبل المستخدم

### 💰 نظام الاشتراك والرسوم
- اشتراك شهري: **0.1 SOL**
- رسوم تداول: **3%** من نتيجة كل صفقة (تُخصم تلقائياً)
- دفع آمن عبر blockchain

### 📊 التداول
- دعم أفضل 200 زوج تداول مقابل USDT
- تكامل مع Jupiter Aggregator للحصول على أفضل الأسعار
- إدارة مخاطر متقدمة (Stop-Loss, Take-Profit)
- حدود تداول قابلة للتخصيص (50$ - 5000$)

### 🎯 الوضع الآلي
- تداول تلقائي بدون تدخل يدوي
- تنفيذ صفقات بناءً على إشارات AI
- مراقبة السوق على مدار الساعة

## البنية التقنية

### الواجهة الأمامية (Frontend)
- **React 18** + **Vite**
- **Tailwind CSS** + **Radix UI** للتصميم
- **Framer Motion** للرسوم المتحركة
- **Solana Wallet Adapter** لدمج المحافظ
- **i18next** لدعم اللغات المتعددة

### الواجهة الخلفية (Backend)
- **Python 3.11** + **Flask**
- **Stable Baselines3** لنماذج التعلم المعزز
- **Gymnasium** لبيئة التداول
- **Pandas** + **NumPy** لمعالجة البيانات

### Blockchain
- **Solana** (Devnet/Mainnet)
- **Anchor Framework** لبرنامج التداول الذكي
- **SPL Token** للتعامل مع التوكنات
- **Jupiter SDK** للتوجيه والتداول

## المتطلبات الأساسية

### للتطوير المحلي
- Node.js 22.x
- Python 3.11
- Rust 1.70+ (لبناء برنامج Anchor)
- Solana CLI 1.17+
- Anchor CLI 0.29+

### للإنتاج
- خادم Linux (Ubuntu 22.04 موصى به)
- PostgreSQL أو MongoDB
- Redis (للتخزين المؤقت)
- Solana RPC Node (أو استخدام خدمة مثل QuickNode)

## التثبيت والإعداد

### 1. استنساخ المشروع

```bash
git clone https://github.com/your-repo/sanad-ai-trader.git
cd sanad-ai-trader
```

### 2. تثبيت تبعيات الواجهة الأمامية

```bash
npm install
```

### 3. تثبيت تبعيات الواجهة الخلفية

```bash
cd ai_backend
python3.11 -m venv venv
source venv/bin/activate  # على Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. إعداد ملف البيئة

```bash
cp .env.example .env
```

قم بتحرير ملف `.env` وإضافة التكوينات الخاصة بك:

```env
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_API_URL=http://localhost:5000
VITE_SANAD_PROGRAM_ID=YOUR_PROGRAM_ID_HERE
VITE_SUBSCRIPTION_WALLET=YOUR_SUBSCRIPTION_WALLET_ADDRESS
```

### 5. بناء ونشر برنامج Anchor

```bash
cd anchor_program
anchor build
anchor deploy --provider.cluster devnet
```

احفظ **Program ID** الناتج وأضفه إلى ملف `.env`.

### 6. تدريب نموذج AI (اختياري)

```bash
cd ai_backend
source venv/bin/activate
python trading_bot.py
```

سيتم حفظ النموذج المدرب في `solana_trading_bot_ppo.zip`.

## التشغيل

### تشغيل الواجهة الخلفية

```bash
cd ai_backend
source venv/bin/activate
python enhanced_app.py
```

الخادم سيعمل على `http://localhost:5000`

### تشغيل الواجهة الأمامية

```bash
npm run dev
```

التطبيق سيعمل على `http://localhost:3000`

## البنية الهيكلية للمشروع

```
sanad-ai-trader/
├── src/                          # الواجهة الأمامية
│   ├── components/               # مكونات React
│   │   ├── dashboard/            # مكونات لوحة التحكم
│   │   ├── admin/                # لوحة الإدارة
│   │   └── ui/                   # مكونات UI قابلة لإعادة الاستخدام
│   ├── contexts/                 # React Contexts
│   │   └── WalletProvider.jsx    # مزود المحفظة
│   ├── services/                 # خدمات API
│   │   ├── apiService.js         # خدمات API الخلفية
│   │   └── solanaService.js      # خدمات Solana
│   ├── pages/                    # صفحات التطبيق
│   ├── lib/                      # مكتبات مساعدة
│   └── i18n.js                   # تكوين اللغات
├── ai_backend/                   # الواجهة الخلفية
│   ├── enhanced_app.py           # خادم Flask الرئيسي
│   ├── trading_bot.py            # نموذج AI والتدريب
│   ├── app.py                    # خادم Flask الأساسي
│   └── sol_usdc_ohlcv_dummy.csv  # بيانات تجريبية
├── anchor_program/               # برنامج Solana
│   ├── programs/
│   │   └── sanad-trading/
│   │       ├── src/
│   │       │   └── lib.rs        # كود البرنامج الذكي
│   │       └── Cargo.toml
│   └── Anchor.toml               # تكوين Anchor
├── public/                       # ملفات عامة
├── plugins/                      # إضافات Vite
├── package.json                  # تبعيات Node.js
├── requirements.txt              # تبعيات Python
├── vite.config.js                # تكوين Vite
├── tailwind.config.js            # تكوين Tailwind
└── README.md                     # هذا الملف
```

## واجهات API

### المصادقة

#### POST `/api/v1/auth/connect`
تسجيل محفظة بعد توقيع رسالة المصادقة.

**الطلب:**
```json
{
  "walletAddress": "string",
  "signature": "string",
  "message": "string"
}
```

**الاستجابة:**
```json
{
  "success": true,
  "walletAddress": "string",
  "message": "Wallet connected successfully"
}
```

### الاشتراك

#### POST `/api/v1/subscription/pay`
تأكيد دفع الاشتراك.

**الطلب:**
```json
{
  "walletAddress": "string",
  "signature": "string"
}
```

**الاستجابة:**
```json
{
  "success": true,
  "subscription": {
    "active": true,
    "started_at": "2024-10-18T12:00:00",
    "expires_at": "2024-11-18T12:00:00"
  }
}
```

#### POST `/api/v1/subscription/status`
التحقق من حالة الاشتراك.

### التداول

#### POST `/api/v1/trade/execute`
تنفيذ صفقة تداول.

**الطلب:**
```json
{
  "walletAddress": "string",
  "pair": "SOL/USDT",
  "action": "BUY|SELL",
  "amount": 200,
  "slippage": 1.0
}
```

#### GET `/api/v1/trade/history`
الحصول على سجل الصفقات.

### الذكاء الاصطناعي

#### POST `/api/v1/ai/predict`
الحصول على توقع من نموذج AI.

**الطلب:**
```json
{
  "observation": [150.25, 1000000, 148.5, 152.0, 65.5, 2.3, 1.8]
}
```

**الاستجابة:**
```json
{
  "action": "BUY|SELL|HOLD",
  "confidence": 0.82,
  "timestamp": "2024-10-18T12:00:00"
}
```

#### GET `/api/v1/ai/insights`
الحصول على رؤى AI للمستخدم.

### السوق

#### GET `/api/v1/market/top200`
الحصول على قائمة أفضل 200 زوج تداول.

#### GET `/api/v1/market/ohlcv`
الحصول على بيانات OHLCV لزوج معين.

**المعاملات:**
- `pair`: زوج التداول (مثل: SOL/USDT)
- `interval`: الفترة الزمنية (1m, 5m, 1h, 4h, 1d)
- `limit`: عدد النقاط (افتراضي: 100)

## برنامج Anchor (Smart Contract)

### الوظائف الرئيسية

#### `initialize_trading_account`
تهيئة حساب تداول للمستخدم مع تحديد:
- الحد الأقصى لمبلغ التداول
- نسبة الرسوم (3%)
- صلاحيات التنفيذ

#### `execute_trade`
تنفيذ صفقة تداول مع:
- التحقق من الصلاحيات
- خصم الرسوم تلقائياً (3%)
- تحديث الإحصائيات

#### `update_trading_settings`
تحديث إعدادات الحساب (الحد الأقصى، تفعيل/تعطيل).

#### `close_trading_account`
إغلاق حساب التداول واسترداد الإيجار.

### الأمان

- استخدام **PDA** (Program Derived Addresses) للحسابات
- التحقق من الصلاحيات في كل عملية
- حدود قابلة للتخصيص لكل مستخدم
- إمكانية إيقاف الحساب في أي وقت

## استراتيجية التداول

### المؤشرات الفنية

1. **RSI (14)**: مؤشر القوة النسبية
   - RSI < 30: فرصة شراء محتملة
   - RSI > 70: إشارة بيع محتملة

2. **EMA (20, 50, 200)**: المتوسطات المتحركة الأسية
   - EMA20 > EMA50 > EMA200: اتجاه صاعد

3. **MACD (12, 26, 9)**: مؤشر تقارب وتباعد المتوسطات المتحركة
   - MACD Cross: إشارة تعزيزية

4. **ATR (14)**: متوسط المدى الحقيقي (للتقلب)

5. **OBV**: حجم التوازن (On-Balance Volume)

6. **VWAP**: متوسط السعر المرجح بالحجم

### إدارة المخاطر

- **حجم الصفقة**: قابل للتخصيص بين 50$ - 5000$
- **Stop-Loss**: إيقاف الخسارة التلقائي
- **Take-Profit**: جني الأرباح التلقائي
- **Slippage Control**: التحكم في الانزلاق السعري
- **Daily Loss Cap**: حد الخسارة اليومية

### التنفيذ

1. جمع البيانات من DEXs و Price Oracles
2. حساب المؤشرات الفنية
3. تمرير البيانات لنموذج AI
4. الحصول على قرار (BUY/SELL/HOLD)
5. التحقق من إدارة المخاطر
6. اختيار أفضل مسار عبر Jupiter
7. تنفيذ الصفقة مع خصم الرسوم

## الاختبار

### اختبار على Devnet

```bash
# تأكد من أنك على شبكة Devnet
solana config set --url devnet

# احصل على SOL تجريبي
solana airdrop 2

# نشر البرنامج
cd anchor_program
anchor deploy --provider.cluster devnet
```

### Backtesting

```bash
cd ai_backend
source venv/bin/activate
python trading_bot.py
```

سيتم تشغيل backtesting على البيانات التاريخية وعرض النتائج.

## النشر على الإنتاج

### 1. تحديث التكوينات

```env
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_API_URL=https://api.your-domain.com
```

### 2. بناء الواجهة الأمامية

```bash
npm run build
```

### 3. نشر على Vercel/Netlify

```bash
# مثال: Vercel
vercel --prod
```

### 4. نشر الواجهة الخلفية

يمكن استخدام:
- **Docker** + **Kubernetes**
- **AWS EC2** / **Google Cloud**
- **DigitalOcean** / **Linode**

### 5. نشر برنامج Anchor على Mainnet

```bash
anchor deploy --provider.cluster mainnet
```

⚠️ **تحذير**: تأكد من اختبار كل شيء بشكل شامل على Devnet قبل النشر على Mainnet.

## الأمان والامتثال

### ✅ أفضل الممارسات المطبقة

1. **لا تخزين للمفاتيح الخاصة**: جميع المعاملات تتطلب توقيع المستخدم
2. **تفويض محدود**: المستخدم يحدد الحد الأقصى للمبلغ
3. **قابل للإلغاء**: يمكن إلغاء التفويض في أي وقت
4. **تشفير البيانات**: جميع البيانات الحساسة مشفرة
5. **مصادقة ثنائية**: دعم 2FA (اختياري)
6. **Rate Limiting**: حماية من الإساءة
7. **Audit Trail**: سجل كامل لجميع العمليات

### 🔒 توصيات إضافية

- استخدام **KMS** (Key Management Service) لتخزين الأسرار
- تفعيل **HTTPS** على جميع الاتصالات
- إجراء **Security Audit** للبرنامج الذكي
- مراقبة **Anomalies** على blockchain
- تطبيق **Firewall** و **DDoS Protection**

## المساهمة

نرحب بالمساهمات! يرجى:

1. Fork المشروع
2. إنشاء فرع للميزة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE).

## المجتمع والروابط الرسمية

- **Twitter/X**: [SNDXCommunity](https://x.com/SNDXCommunity)
- **TikTok**: [@sanadprotocol](https://www.tiktok.com/@sanadprotocol)
- **Telegram**: [SNDXCommunity](https://t.me/SNDXCommunity)
- **Instagram**: [@sanadprotocol](https://www.instagram.com/sanadprotocol/)
- **DexScreener**: [SANAD/SOL on DexScreener](https://dexscreener.com/solana/2z9M1AMb7eNhJgoh48cPNMQV4BwcHmUz1YMysiYQkYU7)
- **GeckoTerminal**: [SANAD/SOL on GeckoTerminal](https://www.geckoterminal.com/solana/pools/4BUUZXfD9cyBUKUJpxnWgCPYeakanGYzgbBFc5ctyGme)

## الدعم

للحصول على الدعم:
- 📧 البريد الإلكتروني: support@sanad-ai-trader.com
- 💬 Discord: [انضم إلى خادمنا](https://discord.gg/sanad)
- 📚 التوثيق: [docs.sanad-ai-trader.com](https://docs.sanad-ai-trader.com)

## الإقرارات

- **Solana Foundation** لتوفير البنية التحتية الممتازة
- **Anchor Framework** لتسهيل تطوير البرامج الذكية
- **Jupiter Aggregator** لتوفير أفضل أسعار التداول
- **Stable Baselines3** لمكتبة التعلم المعزز

---

**تحذير**: التداول ينطوي على مخاطر. استخدم هذا البوت على مسؤوليتك الخاصة. لا تستثمر أكثر مما يمكنك تحمل خسارته.

**إخلاء المسؤولية**: هذا المشروع للأغراض التعليمية. تأكد من الامتثال للقوانين المحلية قبل الاستخدام في الإنتاج.

