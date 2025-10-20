# 🚀 دليل النشر السريع - SANAD AI Trader

**آخر تحديث:** 20 أكتوبر 2025

---

## ✅ الحالة الحالية

- ✅ **الكود:** تم Push إلى GitHub بنجاح
- ✅ **Build:** ناجح بدون أخطاء
- ✅ **Backend APIs:** جاهزة ومتصلة
- ✅ **Keep-Alive:** مفعل لمنع نوم Backend

---

## 🔄 النشر التلقائي على Vercel

### الخطوات:

1. **Vercel متصل بـ GitHub** ✅
   - Repository: `hseen199/sanad-ai-trader`
   - Branch: `main`
   - Auto-deploy: مفعل

2. **بعد Push، Vercel سيقوم بـ:**
   - ✅ اكتشاف التغييرات تلقائياً
   - ✅ تشغيل `npm run build`
   - ✅ نشر النسخة الجديدة
   - ✅ تحديث الموقع على https://sanadtrade.com/

3. **وقت النشر المتوقع:** 2-3 دقائق

---

## 🔐 Environment Variables

### Vercel (Frontend)

تأكد من وجود هذه المتغيرات في Vercel Dashboard:

```bash
VITE_API_URL=https://sanad-backend-ld9d.onrender.com
```

**كيفية التحقق:**
1. افتح https://vercel.com/dashboard
2. اختر مشروع `sanad-ai-trader-ucof`
3. اذهب إلى Settings → Environment Variables
4. تأكد من وجود `VITE_API_URL`

---

### Render (Backend)

تأكد من وجود هذه المتغيرات في Render Dashboard:

```bash
DATABASE_URL=postgresql://...
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
TREASURY_WALLET=4WFksLbfb1hsBbUx8Xn3bic9esKfqy47x8phyYwbSBcK
SUBSCRIPTION_AMOUNT=0.1
TRIAL_DAYS=7
```

**كيفية التحقق:**
1. افتح https://dashboard.render.com/
2. اختر خدمة `sanad-backend`
3. اذهب إلى Environment
4. تأكد من وجود جميع المتغيرات

---

## 🧪 اختبار بعد النشر

### 1. اختبار Keep-Alive

افتح Console في المتصفح وابحث عن:
```
✅ Backend keep-alive ping successful
✅ Initial backend wake-up successful
```

### 2. اختبار Wallet Connection

1. افتح https://sanadtrade.com/
2. اضغط "Connect Wallet"
3. اختر Phantom Wallet
4. تأكد من ظهور العنوان في Header

### 3. اختبار Subscription

1. بعد توصيل المحفظة
2. إذا لم تستخدم Trial → يجب أن ترى زر "تفعيل الفترة التجريبية"
3. اضغط الزر وتأكد من التفعيل

### 4. اختبار Active Trades

1. فعّل البوت
2. افتح Console وابحث عن:
```
GET /api/v1/portfolio/positions?wallet_address=...
```
3. تأكد من عدم وجود أخطاء

### 5. اختبار Trading Panel

1. افتح لوحة التداول
2. تأكد من ظهور السعر الحقيقي لـ SOL
3. تأكد من ظهور إشارة AI
4. جرب الضغط على "شراء" أو "بيع"

---

## 🐛 استكشاف الأخطاء

### مشكلة: Backend يعطي خطأ 503

**الحل:**
- انتظر 30-60 ثانية (cold start على Render)
- Keep-alive سيمنع هذه المشكلة مستقبلاً

### مشكلة: CORS Error

**الحل:**
- تأكد من أن Backend يسمح بـ CORS من Vercel domain
- تحقق من ملف `ultimate_api.py`:
```python
CORS(app)  # يجب أن يكون موجود
```

### مشكلة: Environment Variables غير موجودة

**الحل:**
- أعد نشر Backend على Render بعد إضافة المتغيرات
- أعد نشر Frontend على Vercel بعد إضافة المتغيرات

### مشكلة: Subscription لا يعمل

**الحل:**
- تأكد من أن المحفظة متصلة
- تأكد من وجود SOL كافي في المحفظة (0.1 SOL + gas fees)
- تحقق من Console للأخطاء

---

## 📊 مراقبة الأداء

### Vercel Analytics

1. افتح https://vercel.com/dashboard
2. اختر مشروع `sanad-ai-trader-ucof`
3. اذهب إلى Analytics
4. راقب:
   - عدد الزيارات
   - وقت التحميل
   - الأخطاء

### Render Logs

1. افتح https://dashboard.render.com/
2. اختر خدمة `sanad-backend`
3. اذهب إلى Logs
4. راقب:
   - API requests
   - Database queries
   - Errors

---

## 🔄 تحديثات مستقبلية

### لإضافة ميزة جديدة:

1. عدّل الكود محلياً
2. اختبر بـ `npm run dev`
3. بناء بـ `npm run build`
4. Commit:
```bash
git add .
git commit -m "feat: وصف الميزة الجديدة"
git push origin main
```
5. Vercel سينشر تلقائياً

### لتحديث Backend:

1. عدّل الكود في `ai_backend/`
2. Commit و Push
3. Render سينشر تلقائياً (إذا كان متصل بـ GitHub)
4. أو: ارفع الملفات يدوياً على Render

---

## 📞 الدعم

إذا واجهت أي مشاكل:

1. **تحقق من Logs:**
   - Vercel: https://vercel.com/dashboard
   - Render: https://dashboard.render.com/

2. **تحقق من Console:**
   - افتح Developer Tools في المتصفح
   - ابحث عن أخطاء في Console

3. **تحقق من Network:**
   - افتح Network tab في Developer Tools
   - تأكد من نجاح API requests

---

## ✅ قائمة التحقق قبل الإطلاق

- [ ] Environment Variables مضبوطة على Vercel
- [ ] Environment Variables مضبوطة على Render
- [ ] Backend يعمل بدون أخطاء
- [ ] Frontend يتصل بـ Backend بنجاح
- [ ] Wallet connection يعمل
- [ ] Subscription system يعمل
- [ ] Trading panel يعمل
- [ ] Active trades يعمل
- [ ] Keep-alive يعمل
- [ ] لا توجد أخطاء في Console

---

## 🎉 جاهز للإطلاق!

بعد التأكد من جميع النقاط أعلاه، المشروع جاهز للاستخدام على:

**🌐 https://sanadtrade.com/**

---

**ملاحظة:** هذا الدليل يفترض أن Vercel و Render متصلين بـ GitHub للنشر التلقائي. إذا لم يكن كذلك، قد تحتاج إلى النشر اليدوي.

