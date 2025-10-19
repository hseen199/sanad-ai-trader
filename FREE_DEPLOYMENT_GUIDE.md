# دليل النشر المجاني - SANAD AI Trader
## أسهل وأرخص طريقة للنشر (مجاناً أو بأقل تكلفة!)

---

## 💰 التكلفة الإجمالية

### الخطة المجانية (للاختبار):
```
✅ Vercel (Frontend): مجاناً
✅ Render (Backend): مجاناً
✅ Anchor على Devnet: مجاناً
✅ SSL/HTTPS: مجاناً
✅ الدومين sanadtrade.com: عندك
━━━━━━━━━━━━━━━━━━━━━━━━━
💵 التكلفة: 0$ شهرياً!
```

### الخطة المدفوعة (للإنتاج):
```
✅ Vercel Pro: 20$ شهرياً (اختياري)
✅ Render Starter: 7$ شهرياً
✅ Anchor على Mainnet: 2-3 SOL (مرة واحدة!)
━━━━━━━━━━━━━━━━━━━━━━━━━
💵 التكلفة الشهرية: 7-27$
💵 التكلفة الأولية: 300-450$ (نشر Anchor مرة واحدة)
```

---

## 🚀 الطريقة الأولى: Vercel + Render (الأسهل!)

### الخطوة 1: نشر Frontend على Vercel

#### 1.1 إنشاء حساب GitHub
```
1. اذهب إلى: https://github.com
2. اضغط "Sign up"
3. أكمل التسجيل
```

#### 1.2 رفع المشروع على GitHub
```
طريقة سهلة بدون أوامر:

1. اذهب إلى: https://github.com/new
2. اسم المستودع: sanad-ai-trader
3. اختر Public
4. اضغط "Create repository"
5. اضغط "uploading an existing file"
6. اسحب مجلد المشروع كاملاً
7. اضغط "Commit changes"
```

#### 1.3 نشر على Vercel
```
1. اذهب إلى: https://vercel.com
2. اضغط "Sign Up"
3. اختر "Continue with GitHub"
4. اضغط "New Project"
5. اختر مستودع: sanad-ai-trader
6. اضغط "Import"
```

**إعدادات المشروع:**
```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**Environment Variables (متغيرات البيئة):**

اضغط "Add" لكل متغير:

```
VITE_SOLANA_NETWORK = mainnet-beta
VITE_SOLANA_RPC_URL = https://api.mainnet-beta.solana.com
VITE_API_URL = https://sanad-backend.onrender.com
VITE_SUBSCRIPTION_WALLET = 4WFksLbfb1hsBbUx8Xn3bic9esKfqy47x8phyYwbSBcK
VITE_SUBSCRIPTION_FEE_SOL = 0.1
VITE_TRADE_FEE_PERCENTAGE = 3
```

**اضغط "Deploy"**

⏳ انتظر 2-3 دقائق...

✅ **تم! ستحصل على رابط مثل:**
```
https://sanad-ai-trader.vercel.app
```

---

### الخطوة 2: نشر Backend على Render

#### 2.1 إنشاء حساب Render
```
1. اذهب إلى: https://render.com
2. اضغط "Get Started"
3. اختر "Sign up with GitHub"
4. وافق على الصلاحيات
```

#### 2.2 نشر Backend
```
1. في Render Dashboard، اضغط "New +"
2. اختر "Web Service"
3. اختر مستودع: sanad-ai-trader
4. اضغط "Connect"
```

**إعدادات الخدمة:**
```
Name: sanad-backend
Region: اختر أقرب منطقة (Frankfurt للشرق الأوسط)
Branch: main
Root Directory: ai_backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: python ultimate_api.py
Instance Type: Free
```

**Environment Variables:**

اضغط "Add Environment Variable":

```
FLASK_ENV = production
FLASK_DEBUG = False
SOLANA_RPC_URL = https://api.mainnet-beta.solana.com
SUBSCRIPTION_WALLET = 4WFksLbfb1hsBbUx8Xn3bic9esKfqy47x8phyYwbSBcK
SECRET_KEY = اكتب_أي_نص_عشوائي_طويل_هنا_مثل_abc123xyz789
PORT = 5000
```

**اضغط "Create Web Service"**

⏳ انتظر 5-10 دقائق...

✅ **تم! ستحصل على رابط مثل:**
```
https://sanad-backend.onrender.com
```

---

### الخطوة 3: ربط الدومين sanadtrade.com

#### 3.1 في Vercel
```
1. اذهب إلى مشروعك في Vercel
2. اضغط "Settings"
3. اضغط "Domains"
4. اكتب: sanadtrade.com
5. اضغط "Add"
```

**سيعطيك Vercel معلومات DNS:**
```
Type: A
Name: @
Value: 76.76.21.21 (مثال - استخدم القيمة الفعلية)
```

#### 3.2 في Hostinger
```
1. اذهب إلى: https://hpanel.hostinger.com
2. اضغط "Domains"
3. اختر sanadtrade.com
4. اضغط "DNS / Name Servers"
5. احذف السجلات القديمة
6. أضف السجلات من Vercel:

   Type: A
   Name: @
   Points to: [القيمة من Vercel]
   TTL: 14400

   Type: CNAME
   Name: www
   Points to: cname.vercel-dns.com
   TTL: 14400

7. احفظ التغييرات
```

⏳ **انتظر 10-30 دقيقة لتحديث DNS**

✅ **الآن موقعك على:** https://sanadtrade.com

---

### الخطوة 4: إضافة subdomain للـ API

#### 4.1 في Render
```
1. اذهب إلى Backend Service
2. اضغط "Settings"
3. اضغط "Custom Domains"
4. اكتب: api.sanadtrade.com
5. اضغط "Add"
```

**سيعطيك Render:**
```
Type: CNAME
Name: api
Value: sanad-backend.onrender.com
```

#### 4.2 في Hostinger
```
1. في DNS Management
2. أضف سجل CNAME:
   Type: CNAME
   Name: api
   Points to: sanad-backend.onrender.com
   TTL: 14400
3. احفظ
```

⏳ **انتظر 10-30 دقيقة**

✅ **الآن API على:** https://api.sanadtrade.com

---

### الخطوة 5: تحديث رابط API في Vercel

```
1. اذهب إلى مشروعك في Vercel
2. اضغط "Settings"
3. اضغط "Environment Variables"
4. ابحث عن: VITE_API_URL
5. اضغط "Edit"
6. غيّر القيمة إلى: https://api.sanadtrade.com
7. احفظ
8. اذهب إلى "Deployments"
9. اضغط "Redeploy"
```

---

## 🔧 الطريقة الثانية: Netlify + Railway (بديل)

### نشر Frontend على Netlify

```
1. اذهب إلى: https://netlify.com
2. سجّل بـ GitHub
3. اضغط "Add new site"
4. اختر "Import an existing project"
5. اختر المستودع
6. Build command: npm run build
7. Publish directory: dist
8. أضف Environment Variables نفسها
9. Deploy!
```

### نشر Backend على Railway

```
1. اذهب إلى: https://railway.app
2. سجّل بـ GitHub
3. اضغط "New Project"
4. اختر "Deploy from GitHub repo"
5. اختر المستودع
6. Root Directory: ai_backend
7. Start Command: python ultimate_api.py
8. أضف Environment Variables
9. Deploy!
```

---

## 🎯 الطريقة الثالثة: Cloudflare Pages + Fly.io (الأسرع)

### Frontend على Cloudflare Pages

```
1. اذهب إلى: https://pages.cloudflare.com
2. سجّل الدخول
3. اضغط "Create a project"
4. اختر GitHub repo
5. Build command: npm run build
6. Build output: dist
7. Deploy!
```

### Backend على Fly.io

```
1. اذهب إلى: https://fly.io
2. سجّل الدخول
3. ثبّت flyctl
4. في مجلد ai_backend:
   fly launch
5. اتبع التعليمات
6. fly deploy
```

---

## 🔐 نشر برنامج Anchor

### الخيار 1: Devnet (مجاناً - للاختبار)

```bash
# على جهازك
cd anchor_program

# الاتصال بـ Devnet
solana config set --url devnet

# احصل على SOL مجاني
solana airdrop 2

# النشر
anchor deploy --provider.cluster devnet
```

**ستحصل على Program ID مجاناً!**

---

### الخيار 2: Mainnet (للإنتاج - 2-3 SOL)

```bash
# الاتصال بـ Mainnet
solana config set --url mainnet-beta

# التحقق من الرصيد (يجب أن يكون 2-3 SOL)
solana balance

# النشر
anchor deploy --provider.cluster mainnet
```

**ستحصل على Program ID**

---

### الخيار 3: Solana Playground (الأسهل!)

```
1. اذهب إلى: https://beta.solpg.io
2. ارفع ملفات anchor_program
3. اضغط "Build"
4. اضغط "Deploy"
5. اختر Devnet أو Mainnet
6. ادفع الرسوم
7. احصل على Program ID!
```

**بدون تثبيت أي شيء على جهازك!**

---

## 📊 مقارنة الخيارات

| الميزة | Vercel+Render | Netlify+Railway | Cloudflare+Fly |
|--------|---------------|-----------------|----------------|
| **السهولة** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **السرعة** | سريع | سريع جداً | أسرع |
| **المجاني** | ممتاز | جيد | جيد |
| **الدعم** | ممتاز | جيد | جيد |
| **التوصية** | ✅ الأفضل | جيد | للمتقدمين |

---

## ✅ قائمة التحقق النهائية

```
✅ Frontend منشور على Vercel
✅ Backend منشور على Render
✅ الدومين sanadtrade.com مربوط
✅ API على api.sanadtrade.com
✅ SSL/HTTPS يعمل
✅ برنامج Anchor منشور
✅ Environment Variables محدّثة
✅ الموقع يعمل بشكل كامل
```

---

## 🎉 تهانينا!

**موقعك الآن يعمل على:**

🌐 **الموقع**: https://sanadtrade.com  
🔌 **API**: https://api.sanadtrade.com

**بتكلفة:** 0-7$ شهرياً فقط!

---

## 💡 نصائح مهمة

### للبدء (الآن):
1. ✅ استخدم الخطة المجانية
2. ✅ انشر على Devnet (مجاناً)
3. ✅ اختبر كل شيء
4. ✅ تأكد من عمل كل شيء

### بعد التأكد (لاحقاً):
1. ترقية Render إلى 7$ شهرياً
2. نشر Anchor على Mainnet (2-3 SOL)
3. (اختياري) ترقية Vercel Pro

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. الخطوات واضحة ومباشرة
2. كل شيء من واجهة رسومية
3. لا حاجة لأوامر معقدة
4. إذا احتجت مساعدة، تواصل عبر Telegram

---

## 🚀 ابدأ الآن!

**الخطوة الأولى:**
1. اذهب إلى: https://vercel.com
2. اضغط "Sign Up"
3. اتبع الخطوات أعلاه

**سهل وبسيط!** 😊

---

**تم إعداد هذا الدليل بواسطة**: Manus AI  
**التاريخ**: 18 أكتوبر 2024  
**الدومين**: sanadtrade.com  
**التكلفة**: 0-7$ شهرياً!

