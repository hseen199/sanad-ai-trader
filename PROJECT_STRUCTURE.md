# بنية المشروع - SANAD AI Trader

## نظرة عامة على البنية

```
sanad-ai-trader/
│
├── 📁 src/                                    # الواجهة الأمامية (Frontend)
│   ├── 📁 components/                         # مكونات React
│   │   ├── 📁 dashboard/                      # مكونات لوحة التحكم
│   │   │   ├── AIInsights.jsx                 # رؤى الذكاء الاصطناعي
│   │   │   ├── AIStatus.jsx                   # حالة نموذج AI
│   │   │   ├── AccountOverview.jsx            # نظرة عامة على الحساب
│   │   │   ├── ActiveTrades.jsx               # الصفقات النشطة
│   │   │   ├── AutonomousMode.jsx             # الوضع الآلي
│   │   │   ├── Leaderboard.jsx                # لوحة المتصدرين
│   │   │   ├── MarketAnalytics.jsx            # تحليلات السوق
│   │   │   ├── MarketMonitor.jsx              # مراقبة السوق
│   │   │   ├── MyAccount.jsx                  # حسابي
│   │   │   ├── PerformanceChart.jsx           # رسم بياني للأداء
│   │   │   ├── Settings.jsx                   # الإعدادات
│   │   │   ├── TradeHistory.jsx               # سجل الصفقات
│   │   │   └── TradingPanel.jsx               # لوحة التداول
│   │   │
│   │   ├── 📁 admin/                          # لوحة الإدارة
│   │   │   ├── AdminDashboard.jsx             # لوحة تحكم الإدارة
│   │   │   ├── GlobalSettings.jsx             # الإعدادات العامة
│   │   │   └── UserManagement.jsx             # إدارة المستخدمين
│   │   │
│   │   ├── 📁 ui/                             # مكونات UI قابلة لإعادة الاستخدام
│   │   │   ├── button.jsx                     # زر
│   │   │   ├── dropdown-menu.jsx              # قائمة منسدلة
│   │   │   ├── input.jsx                      # حقل إدخال
│   │   │   ├── slider.jsx                     # شريط تمرير
│   │   │   ├── switch.jsx                     # مفتاح تبديل
│   │   │   ├── tabs.jsx                       # علامات تبويب
│   │   │   ├── toast.jsx                      # إشعار منبثق
│   │   │   ├── toaster.jsx                    # مدير الإشعارات
│   │   │   └── use-toast.js                   # Hook للإشعارات
│   │   │
│   │   ├── AiPower.jsx                        # قسم قوة AI
│   │   ├── CallToAction.jsx                   # دعوة لاتخاذ إجراء
│   │   ├── Dashboard.jsx                      # لوحة التحكم الرئيسية
│   │   ├── Faq.jsx                            # الأسئلة الشائعة
│   │   ├── Features.jsx                       # المميزات
│   │   ├── FinalCTA.jsx                       # دعوة نهائية
│   │   ├── Footer.jsx                         # تذييل الصفحة
│   │   ├── Header.jsx                         # رأس الصفحة
│   │   ├── Hero.jsx                           # القسم البطل
│   │   ├── HeroImage.jsx                      # صورة القسم البطل
│   │   ├── HowItWorks.jsx                     # كيف يعمل
│   │   ├── Subscription.jsx                   # الاشتراك
│   │   └── WelcomeMessage.jsx                 # رسالة الترحيب
│   │
│   ├── 📁 contexts/                           # React Contexts
│   │   └── WalletProvider.jsx                 # مزود المحفظة (جديد)
│   │
│   ├── 📁 services/                           # خدمات API (جديد)
│   │   ├── apiService.js                      # خدمات API الخلفية
│   │   └── solanaService.js                   # خدمات Solana
│   │
│   ├── 📁 pages/                              # صفحات التطبيق
│   │   ├── DevAdminPage.jsx                   # صفحة إدارة المطورين
│   │   ├── HomePage.jsx                       # الصفحة الرئيسية
│   │   └── TutorialPage.jsx                   # صفحة الدروس
│   │
│   ├── 📁 lib/                                # مكتبات مساعدة
│   │   └── utils.js                           # دوال مساعدة
│   │
│   ├── App.jsx                                # مكون التطبيق الرئيسي
│   ├── main.jsx                               # نقطة الدخول
│   ├── index.css                              # أنماط عامة
│   └── i18n.js                                # تكوين اللغات المتعددة
│
├── 📁 ai_backend/                             # الواجهة الخلفية (Backend)
│   ├── enhanced_app.py                        # خادم Flask المحسّن (جديد)
│   ├── app.py                                 # خادم Flask الأساسي
│   ├── trading_bot.py                         # نموذج AI والتدريب
│   └── sol_usdc_ohlcv_dummy.csv              # بيانات تجريبية
│
├── 📁 anchor_program/                         # برنامج Solana الذكي (جديد)
│   ├── 📁 programs/
│   │   └── 📁 sanad-trading/
│   │       ├── 📁 src/
│   │       │   └── lib.rs                     # كود البرنامج الذكي
│   │       └── Cargo.toml                     # تبعيات Rust
│   ├── Anchor.toml                            # تكوين Anchor
│   └── README.md                              # توثيق البرنامج
│
├── 📁 public/                                 # ملفات عامة
│   └── llms.txt                               # ملف نصي
│
├── 📁 plugins/                                # إضافات Vite
│   ├── 📁 visual-editor/                      # محرر مرئي
│   └── vite-plugin-iframe-route-restoration.js
│
├── 📁 tools/                                  # أدوات مساعدة
│   └── generate-llms.js                       # توليد ملف llms
│
├── 📁 node_modules/                           # تبعيات Node.js (مثبتة)
├── 📁 venv/                                   # بيئة Python الافتراضية (مثبتة)
│
├── 📄 package.json                            # تبعيات Node.js
├── 📄 package-lock.json                       # قفل التبعيات
├── 📄 requirements.txt                        # تبعيات Python
│
├── 📄 vite.config.js                          # تكوين Vite
├── 📄 tailwind.config.js                      # تكوين Tailwind CSS
├── 📄 postcss.config.js                       # تكوين PostCSS
│
├── 📄 .env.example                            # مثال على ملف البيئة (جديد)
├── 📄 index.html                              # ملف HTML الرئيسي
│
├── 📄 README.md                               # التوثيق الرئيسي (جديد)
├── 📄 DEPLOYMENT.md                           # دليل النشر (جديد)
└── 📄 PROJECT_STRUCTURE.md                    # هذا الملف
```

## وصف المجلدات الرئيسية

### 📁 `src/` - الواجهة الأمامية

تحتوي على جميع مكونات React والصفحات والخدمات.

#### `components/dashboard/`
مكونات لوحة التحكم الرئيسية للمستخدم:
- **AIInsights**: عرض رؤى وتوصيات الذكاء الاصطناعي
- **AIStatus**: حالة نموذج AI والأداء
- **AccountOverview**: نظرة عامة على الحساب والرصيد
- **ActiveTrades**: الصفقات النشطة الحالية
- **AutonomousMode**: تفعيل/تعطيل الوضع الآلي
- **MarketMonitor**: مراقبة السوق في الوقت الفعلي
- **TradingPanel**: لوحة تنفيذ الصفقات اليدوية
- **TradeHistory**: سجل جميع الصفقات السابقة

#### `components/ui/`
مكونات UI قابلة لإعادة الاستخدام مبنية على Radix UI:
- أزرار، حقول إدخال، قوائم منسدلة
- مفاتيح تبديل، شرائط تمرير
- إشعارات منبثقة (Toasts)

#### `contexts/` (جديد)
- **WalletProvider**: مزود المحفظة للتكامل مع Solana Wallet Adapter

#### `services/` (جديد)
- **apiService**: خدمات الاتصال بالواجهة الخلفية
- **solanaService**: خدمات التفاعل مع blockchain

### 📁 `ai_backend/` - الواجهة الخلفية

تحتوي على خادم Flask ونموذج الذكاء الاصطناعي.

#### الملفات الرئيسية:
- **enhanced_app.py**: خادم Flask المحسّن مع جميع endpoints
- **trading_bot.py**: نموذج PPO للتعلم المعزز
- **sol_usdc_ohlcv_dummy.csv**: بيانات تاريخية للتدريب

#### Endpoints المتوفرة:
```
/api/v1/auth/connect          # المصادقة
/api/v1/subscription/pay      # الاشتراك
/api/v1/settings              # الإعدادات
/api/v1/market/top200         # أفضل 200 زوج
/api/v1/trade/execute         # تنفيذ صفقة
/api/v1/ai/predict            # توقع AI
```

### 📁 `anchor_program/` - البرنامج الذكي (جديد)

برنامج Solana مكتوب بـ Rust باستخدام Anchor Framework.

#### الوظائف الرئيسية:
- `initialize_trading_account`: تهيئة حساب تداول
- `execute_trade`: تنفيذ صفقة مع خصم رسوم 3%
- `update_trading_settings`: تحديث الإعدادات
- `close_trading_account`: إغلاق الحساب

## تدفق البيانات

```
┌─────────────────┐
│   المستخدم      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend       │ ◄─── Wallet Adapter
│  (React + Vite) │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌──────────────────┐
│  Backend API    │  │  Solana Program  │
│  (Flask)        │  │  (Anchor/Rust)   │
└────────┬────────┘  └────────┬─────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌──────────────────┐
│  AI Model       │  │  Solana          │
│  (PPO)          │  │  Blockchain      │
└─────────────────┘  └──────────────────┘
```

## التقنيات المستخدمة

### Frontend
- **React 18**: مكتبة UI
- **Vite**: أداة البناء
- **Tailwind CSS**: إطار عمل CSS
- **Radix UI**: مكونات UI
- **Framer Motion**: الرسوم المتحركة
- **Solana Wallet Adapter**: تكامل المحافظ
- **i18next**: اللغات المتعددة

### Backend
- **Python 3.11**: لغة البرمجة
- **Flask**: إطار عمل الويب
- **Stable Baselines3**: التعلم المعزز
- **Gymnasium**: بيئة التداول
- **Pandas**: معالجة البيانات
- **NumPy**: الحسابات الرياضية

### Blockchain
- **Solana**: البلوكشين
- **Anchor**: إطار عمل البرامج الذكية
- **Rust**: لغة البرمجة
- **SPL Token**: معيار التوكنات

## المعلومات المهمة

### عناوين Blockchain

**توكن SANAD (SNDX):**
```
2z9M1AMb7eNhJgoh48cPNMQV4BwcHmUz1YMysiYQkYU7
```

**محفظة الاشتراكات والرسوم:**
```
4WFksLbfb1hsBbUx8Xn3bic9esKfqy47x8phyYwbSBcK
```

### الرسوم

- **اشتراك شهري**: 0.1 SOL
- **رسوم تداول**: 3% من كل صفقة (أرباح أو خسائر)

### حدود التداول

- **الحد الأدنى**: 50 USD
- **الحد الأقصى**: 5000 USD

## ملفات التكوين

### `.env.example`
ملف مثال لمتغيرات البيئة. انسخه إلى `.env` وقم بتعديل القيم.

### `vite.config.js`
تكوين Vite للتطوير والبناء.

### `tailwind.config.js`
تكوين Tailwind CSS للتصميم.

### `Anchor.toml`
تكوين Anchor للبرنامج الذكي.

## الملفات المهمة

### `README.md`
التوثيق الرئيسي الشامل للمشروع.

### `DEPLOYMENT.md`
دليل خطوة بخطوة لنشر المشروع على الإنتاج.

### `anchor_program/README.md`
توثيق تفصيلي للبرنامج الذكي.

## الخطوات التالية

1. ✅ **تثبيت التبعيات**: تم
2. ✅ **إنشاء الملفات الأساسية**: تم
3. 🔄 **بناء برنامج Anchor**: يتطلب بيئة Rust/Anchor
4. 🔄 **نشر البرنامج**: يتطلب محفظة Solana
5. 🔄 **اختبار التكامل**: بعد النشر
6. 🔄 **النشر على الإنتاج**: بعد الاختبار

## ملاحظات مهمة

⚠️ **قبل النشر على Mainnet:**
- اختبر كل شيء على Devnet
- أجرِ Security Audit للبرنامج الذكي
- تأكد من جميع التكوينات
- احتفظ بنسخ احتياطية

🔒 **الأمان:**
- لا تشارك المفاتيح الخاصة
- استخدم متغيرات البيئة للأسرار
- فعّل HTTPS في الإنتاج
- راقب المعاملات على blockchain

📚 **للمزيد من المعلومات:**
- راجع [README.md](README.md)
- راجع [DEPLOYMENT.md](DEPLOYMENT.md)
- راجع [anchor_program/README.md](anchor_program/README.md)

