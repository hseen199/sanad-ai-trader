# دليل البدء السريع - SANAD AI Trader

## معلومات المشروع الأساسية

**عنوان محفظة الرسوم**: `4WFksLbfb1hsBbUx8Xn3bic9esKfqy47x8phyYwbSBcK`  
**توكن SANAD (SNDX)**: `2z9M1AMb7eNhJgoh48cPNMQV4BwcHmUz1YMysiYQkYU7`  
**رسوم الاشتراك**: 0.1 SOL شهرياً  
**رسوم التداول**: 3% من كل صفقة

---

## الخطوات السريعة للبدء

### 1️⃣ فك الضغط

```bash
unzip sanad_ai_trader_final.zip
cd sanad_ai_trader_complete
```

### 2️⃣ تثبيت التبعيات

**الواجهة الأمامية:**
```bash
npm install
```

**الواجهة الخلفية:**
```bash
cd ai_backend
python3.11 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 3️⃣ إعداد ملف البيئة

```bash
cp .env.example .env
```

**عدّل `.env` وأضف:**
- `VITE_SOLANA_RPC_URL`: رابط RPC الخاص بك
- `VITE_SANAD_PROGRAM_ID`: سيتم إضافته بعد نشر البرنامج

### 4️⃣ بناء ونشر برنامج Anchor

⚠️ **يتطلب بيئة Rust/Anchor على جهازك:**

```bash
# تثبيت Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# تثبيت Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# تثبيت Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.29.0
avm use 0.29.0

# بناء ونشر
cd anchor_program
anchor build
anchor deploy --provider.cluster devnet  # للاختبار
# أو
anchor deploy --provider.cluster mainnet  # للإنتاج
```

**بعد النشر:**
1. احفظ Program ID
2. حدّث `lib.rs`: `declare_id!("YOUR_PROGRAM_ID");`
3. حدّث `Anchor.toml`
4. حدّث `.env`: `VITE_SANAD_PROGRAM_ID=YOUR_PROGRAM_ID`
5. أعد البناء: `anchor build`

### 5️⃣ تدريب نموذج AI (اختياري)

```bash
cd ai_backend
source venv/bin/activate
python trading_bot.py
```

### 6️⃣ تشغيل المشروع

**الواجهة الخلفية:**
```bash
cd ai_backend
source venv/bin/activate
python enhanced_app.py
```

**الواجهة الأمامية (نافذة جديدة):**
```bash
npm run dev
```

افتح المتصفح: `http://localhost:3000`

---

## اختبار سريع

1. ✅ افتح التطبيق في المتصفح
2. ✅ اضغط "Connect Wallet"
3. ✅ اختر محفظتك (Phantom, Solflare, إلخ)
4. ✅ وقّع رسالة المصادقة
5. ✅ ادفع الاشتراك (0.1 SOL)
6. ✅ جرّب التداول التجريبي

---

## الملفات المهمة

- **`README.md`**: التوثيق الكامل
- **`DEPLOYMENT.md`**: دليل النشر التفصيلي
- **`PROJECT_STRUCTURE.md`**: شرح البنية
- **`FINAL_REPORT.md`**: تقرير الإنجاز
- **`anchor_program/README.md`**: توثيق البرنامج الذكي

---

## روابط المجتمع

- **Twitter**: https://x.com/SNDXCommunity
- **Telegram**: https://t.me/SNDXCommunity
- **Instagram**: https://www.instagram.com/sanadprotocol/
- **DexScreener**: https://dexscreener.com/solana/2z9M1AMb7eNhJgoh48cPNMQV4BwcHmUz1YMysiYQkYU7
- **GeckoTerminal**: https://www.geckoterminal.com/solana/pools/4BUUZXfD9cyBUKUJpxnWgCPYeakanGYzgbBFc5ctyGme

---

## الدعم

للحصول على المساعدة:
- راجع `README.md` للتوثيق الكامل
- راجع `DEPLOYMENT.md` لدليل النشر
- تواصل عبر Telegram: https://t.me/SNDXCommunity

---

## ملاحظات مهمة

⚠️ **قبل الإنتاج:**
- اختبر على Devnet أولاً
- أجرِ Security Audit للبرنامج الذكي
- استخدم RPC موثوق
- فعّل HTTPS
- أعد Monitoring

🔒 **الأمان:**
- لا تشارك المفاتيح الخاصة
- استخدم متغيرات البيئة
- احتفظ بنسخ احتياطية

---

**تم إعداد المشروع بواسطة Manus AI**  
**تاريخ**: 18 أكتوبر 2024

