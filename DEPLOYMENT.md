# دليل النشر - SANAD AI Trader

## نظرة عامة

هذا الدليل يوضح خطوات نشر مشروع SANAD AI Trader على بيئة الإنتاج.

## المتطلبات الأساسية

### الأدوات المطلوبة

1. **Solana CLI** (الإصدار 1.17+)
2. **Anchor CLI** (الإصدار 0.29+)
3. **Rust** (الإصدار 1.70+)
4. **Node.js** (الإصدار 22.x)
5. **Python** (الإصدار 3.11)

### الحسابات المطلوبة

1. محفظة Solana مع رصيد كافٍ للنشر
2. حساب RPC موثوق (QuickNode, Alchemy, أو Helius)
3. خادم للواجهة الخلفية (VPS أو Cloud)

## الخطوة 1: إعداد بيئة Solana

### تثبيت Solana CLI

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

### تكوين المحفظة

```bash
# إنشاء محفظة جديدة (أو استيراد موجودة)
solana-keygen new --outfile ~/.config/solana/id.json

# عرض العنوان
solana address

# التبديل إلى Mainnet
solana config set --url mainnet-beta

# التحقق من الرصيد
solana balance
```

⚠️ **مهم**: احتفظ بنسخة احتياطية آمنة من ملف المحفظة!

## الخطوة 2: تثبيت Anchor

```bash
# تثبيت Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.29.0
avm use 0.29.0

# التحقق من التثبيت
anchor --version
```

## الخطوة 3: بناء ونشر برنامج Anchor

### على Devnet (للاختبار)

```bash
cd anchor_program

# بناء البرنامج
anchor build

# نشر على Devnet
anchor deploy --provider.cluster devnet

# احفظ Program ID الناتج
# مثال: Program Id: 7XYZ...ABC
```

### على Mainnet (للإنتاج)

```bash
# تأكد من وجود رصيد كافٍ (حوالي 5-10 SOL للنشر)
solana balance

# نشر على Mainnet
anchor deploy --provider.cluster mainnet

# احفظ Program ID
```

### تحديث Program ID في الكود

```bash
# في ملف lib.rs
declare_id!("YOUR_ACTUAL_PROGRAM_ID");

# في ملف Anchor.toml
[programs.mainnet]
sanad_trading = "YOUR_ACTUAL_PROGRAM_ID"

# إعادة البناء
anchor build
```

## الخطوة 4: إعداد الواجهة الخلفية

### إنشاء بيئة افتراضية

```bash
cd ai_backend
python3.11 -m venv venv
source venv/bin/activate
```

### تثبيت التبعيات

```bash
pip install -r requirements.txt
```

### تكوين متغيرات البيئة

```bash
# إنشاء ملف .env
cat > .env << EOF
FLASK_ENV=production
FLASK_DEBUG=False
SOLANA_RPC_URL=https://your-rpc-url.com
SUBSCRIPTION_WALLET=YOUR_SUBSCRIPTION_WALLET_ADDRESS
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://localhost:6379
SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))')
EOF
```

### تدريب نموذج AI

```bash
# تدريب النموذج على بيانات حقيقية
python trading_bot.py

# سيتم حفظ النموذج في solana_trading_bot_ppo.zip
```

### تشغيل الخادم

```bash
# للاختبار
python enhanced_app.py

# للإنتاج (استخدم Gunicorn)
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 enhanced_app:app
```

## الخطوة 5: إعداد الواجهة الأمامية

### تحديث ملف .env

```bash
# في المجلد الرئيسي
cat > .env << EOF
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://your-rpc-url.com
VITE_API_URL=https://api.your-domain.com
VITE_SANAD_PROGRAM_ID=YOUR_ACTUAL_PROGRAM_ID
VITE_SANAD_TOKEN_ADDRESS=2z9M1AMb7eNhJgoh48cPNMQV4BwcHmUz1YMysiYQkYU7
VITE_SUBSCRIPTION_WALLET=YOUR_SUBSCRIPTION_WALLET_ADDRESS
VITE_SUBSCRIPTION_FEE_SOL=0.1
VITE_TRADE_FEE_PERCENTAGE=3
VITE_MIN_TRADE_AMOUNT=50
VITE_MAX_TRADE_AMOUNT=5000
VITE_JUPITER_API_URL=https://quote-api.jup.ag/v6
EOF
```

### بناء للإنتاج

```bash
npm run build
```

سيتم إنشاء مجلد `dist` يحتوي على الملفات الجاهزة للنشر.

## الخطوة 6: النشر

### الخيار 1: Vercel (موصى به للواجهة الأمامية)

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel --prod
```

### الخيار 2: Netlify

```bash
# تثبيت Netlify CLI
npm i -g netlify-cli

# تسجيل الدخول
netlify login

# النشر
netlify deploy --prod --dir=dist
```

### الخيار 3: استضافة ذاتية (Nginx)

```bash
# نسخ الملفات إلى الخادم
scp -r dist/* user@your-server:/var/www/sanad-ai-trader/

# تكوين Nginx
sudo nano /etc/nginx/sites-available/sanad-ai-trader

# إضافة التكوين:
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/sanad-ai-trader;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/sanad-ai-trader /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### نشر الواجهة الخلفية (Docker)

```bash
# إنشاء Dockerfile
cat > ai_backend/Dockerfile << EOF
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "enhanced_app:app"]
EOF

# بناء الصورة
docker build -t sanad-backend ai_backend/

# تشغيل الحاوية
docker run -d -p 5000:5000 --env-file .env sanad-backend
```

## الخطوة 7: إعداد قاعدة البيانات

### PostgreSQL

```bash
# تثبيت PostgreSQL
sudo apt install postgresql postgresql-contrib

# إنشاء قاعدة بيانات
sudo -u postgres psql
CREATE DATABASE sanad_ai_trader;
CREATE USER sanad_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sanad_ai_trader TO sanad_user;
\q
```

### Redis (للتخزين المؤقت)

```bash
# تثبيت Redis
sudo apt install redis-server

# تشغيل Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## الخطوة 8: إعداد SSL/TLS

```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# التجديد التلقائي
sudo certbot renew --dry-run
```

## الخطوة 9: المراقبة والصيانة

### إعداد PM2 (لإدارة العمليات)

```bash
# تثبيت PM2
npm install -g pm2

# تشغيل الواجهة الخلفية
cd ai_backend
pm2 start enhanced_app.py --name sanad-backend --interpreter python3

# حفظ التكوين
pm2 save
pm2 startup
```

### إعداد Monitoring

```bash
# تثبيت أدوات المراقبة
pip install prometheus-flask-exporter

# إضافة إلى enhanced_app.py
from prometheus_flask_exporter import PrometheusMetrics
metrics = PrometheusMetrics(app)
```

### Logging

```bash
# إنشاء مجلد السجلات
mkdir -p /var/log/sanad-ai-trader

# تكوين Logrotate
sudo nano /etc/logrotate.d/sanad-ai-trader

# إضافة:
/var/log/sanad-ai-trader/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

## الخطوة 10: الاختبار النهائي

### قائمة التحقق

- [ ] برنامج Anchor منشور على Mainnet
- [ ] Program ID محدث في جميع الملفات
- [ ] الواجهة الأمامية منشورة ومتاحة
- [ ] الواجهة الخلفية تعمل وتستجيب
- [ ] قاعدة البيانات متصلة
- [ ] Redis يعمل
- [ ] SSL/TLS مفعل
- [ ] المحفظة تتصل بنجاح
- [ ] الاشتراك يعمل
- [ ] التداول التجريبي ناجح
- [ ] Monitoring مفعل
- [ ] Backups مجدولة

### اختبار الوظائف

```bash
# اختبار الواجهة الخلفية
curl https://api.your-domain.com/

# اختبار الاتصال بـ Solana
curl https://api.your-domain.com/api/v1/ai/status

# اختبار قائمة الأزواج
curl https://api.your-domain.com/api/v1/market/top200
```

## الخطوة 11: النسخ الاحتياطي

### قاعدة البيانات

```bash
# إنشاء نسخة احتياطية يومية
crontab -e

# إضافة:
0 2 * * * pg_dump sanad_ai_trader > /backup/sanad_$(date +\%Y\%m\%d).sql
```

### الملفات

```bash
# نسخ احتياطي للملفات المهمة
rsync -avz /var/www/sanad-ai-trader/ /backup/frontend/
rsync -avz /app/ai_backend/ /backup/backend/
```

## الأمان

### Firewall

```bash
# تكوين UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Fail2Ban

```bash
# تثبيت Fail2Ban
sudo apt install fail2ban

# تكوين
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## الدعم والصيانة

### التحديثات

```bash
# تحديث التبعيات بانتظام
npm update
pip install --upgrade -r requirements.txt

# تحديث النظام
sudo apt update && sudo apt upgrade
```

### المراقبة

- راقب استخدام الموارد (CPU, RAM, Disk)
- راقب السجلات للأخطاء
- راقب معاملات Blockchain
- راقب أداء نموذج AI

## استكشاف الأخطاء

### مشكلة: البرنامج لا ينشر

```bash
# تحقق من الرصيد
solana balance

# تحقق من الشبكة
solana config get

# زيادة حد الحساب
anchor deploy --provider.cluster mainnet --program-name sanad_trading
```

### مشكلة: الواجهة الخلفية لا تستجيب

```bash
# تحقق من السجلات
pm2 logs sanad-backend

# إعادة التشغيل
pm2 restart sanad-backend
```

### مشكلة: المحفظة لا تتصل

- تأكد من RPC URL صحيح
- تأكد من Program ID صحيح
- تحقق من إعدادات CORS

## الخلاصة

بعد اتباع هذه الخطوات، يجب أن يكون مشروع SANAD AI Trader منشوراً ويعمل بشكل كامل على الإنتاج.

⚠️ **تذكير مهم**: 
- اختبر كل شيء على Devnet أولاً
- ابدأ بمبالغ صغيرة على Mainnet
- راقب الأداء باستمرار
- احتفظ بنسخ احتياطية منتظمة

للحصول على الدعم، راجع [README.md](README.md) أو اتصل بفريق الدعم.

