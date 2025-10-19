# SANAD Trading Program - Anchor Smart Contract

## نظرة عامة

هذا البرنامج الذكي (Smart Contract) مكتوب بلغة Rust باستخدام إطار عمل Anchor. يوفر وظائف التداول الآمن مع خصم الرسوم التلقائي.

## الوظائف الرئيسية

### 1. `initialize_trading_account`

تهيئة حساب تداول جديد للمستخدم.

**المعاملات:**
- `max_trade_amount`: الحد الأقصى لمبلغ التداول (بالـ lamports)
- `fee_percentage`: نسبة الرسوم (300 = 3%)

**الحسابات المطلوبة:**
- `trading_account`: حساب التداول (PDA)
- `user`: المستخدم (Signer)
- `authority`: السلطة المخولة بالتنفيذ
- `system_program`: برنامج النظام

**مثال على الاستخدام:**

```typescript
const [tradingAccount] = PublicKey.findProgramAddressSync(
  [Buffer.from("trading"), user.publicKey.toBuffer()],
  program.programId
);

await program.methods
  .initializeTradingAccount(
    new BN(5000 * LAMPORTS_PER_SOL), // max 5000 SOL
    300 // 3%
  )
  .accounts({
    tradingAccount,
    user: user.publicKey,
    authority: authorityPublicKey,
    systemProgram: SystemProgram.programId,
  })
  .signers([user])
  .rpc();
```

### 2. `execute_trade`

تنفيذ صفقة تداول مع خصم الرسوم تلقائياً.

**المعاملات:**
- `amount`: مبلغ الصفقة

**الحسابات المطلوبة:**
- `trading_account`: حساب التداول
- `user`: المستخدم (Signer)
- `user_token_account`: حساب توكن المستخدم
- `fee_token_account`: حساب توكن الرسوم
- `token_program`: برنامج SPL Token

**العملية:**
1. التحقق من أن الحساب نشط
2. التحقق من أن المبلغ لا يتجاوز الحد الأقصى
3. حساب الرسوم (3%)
4. تحويل الرسوم إلى حساب الرسوم (4WFksLbfb1hsBbUx8Xn3bic9esKfqy47x8phyYwbSBcK)
5. تحديث إحصائيات الحساب
6. إصدار حدث `TradeExecuted`

**مثال على الاستخدام:**

```typescript
await program.methods
  .executeTrade(new BN(100 * LAMPORTS_PER_SOL))
  .accounts({
    tradingAccount,
    user: user.publicKey,
    userTokenAccount,
    feeTokenAccount,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .signers([user])
  .rpc();
```

### 3. `update_trading_settings`

تحديث إعدادات حساب التداول.

**المعاملات:**
- `max_trade_amount`: الحد الأقصى الجديد (اختياري)
- `is_active`: حالة التفعيل (اختياري)

**مثال على الاستخدام:**

```typescript
await program.methods
  .updateTradingSettings(
    new BN(10000 * LAMPORTS_PER_SOL), // new max
    true // active
  )
  .accounts({
    tradingAccount,
    user: user.publicKey,
  })
  .signers([user])
  .rpc();
```

### 4. `close_trading_account`

إغلاق حساب التداول واسترداد الإيجار.

**مثال على الاستخدام:**

```typescript
await program.methods
  .closeTradingAccount()
  .accounts({
    tradingAccount,
    user: user.publicKey,
  })
  .signers([user])
  .rpc();
```

## هيكل البيانات

### `TradingAccount`

```rust
pub struct TradingAccount {
    pub owner: Pubkey,              // مالك الحساب
    pub authority: Pubkey,          // السلطة المخولة
    pub max_trade_amount: u64,      // الحد الأقصى للتداول
    pub fee_percentage: u16,        // نسبة الرسوم (300 = 3%)
    pub total_trades: u64,          // إجمالي الصفقات
    pub total_fees_paid: u64,       // إجمالي الرسوم المدفوعة
    pub is_active: bool,            // حالة التفعيل
    pub bump: u8,                   // bump seed للـ PDA
}
```

## الأحداث (Events)

### `TradeExecuted`

يتم إصدار هذا الحدث عند تنفيذ صفقة بنجاح.

```rust
pub struct TradeExecuted {
    pub user: Pubkey,           // المستخدم
    pub amount: u64,            // المبلغ الإجمالي
    pub fee_amount: u64,        // مبلغ الرسوم
    pub net_amount: u64,        // المبلغ الصافي
    pub timestamp: i64,         // الوقت
}
```

## رموز الأخطاء

- `AccountNotActive`: الحساب غير نشط
- `AmountExceedsLimit`: المبلغ يتجاوز الحد الأقصى المسموح
- `Unauthorized`: غير مصرح

## البناء والنشر

### المتطلبات

```bash
# تثبيت Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# تثبيت Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# تثبيت Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.29.0
avm use 0.29.0
```

### البناء

```bash
anchor build
```

### النشر على Devnet

```bash
# تكوين الشبكة
solana config set --url devnet

# الحصول على SOL تجريبي
solana airdrop 2

# النشر
anchor deploy
```

### النشر على Mainnet

```bash
# تكوين الشبكة
solana config set --url mainnet-beta

# التأكد من وجود رصيد كافٍ
solana balance

# النشر
anchor deploy
```

### تحديث Program ID

بعد النشر، احصل على Program ID وقم بتحديثه في:

1. `lib.rs`:
```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```

2. `Anchor.toml`:
```toml
[programs.mainnet]
sanad_trading = "YOUR_PROGRAM_ID_HERE"
```

3. إعادة البناء:
```bash
anchor build
```

## الاختبار

### اختبارات الوحدة

```bash
anchor test
```

### اختبار يدوي

```bash
# تشغيل validator محلي
solana-test-validator

# في نافذة أخرى
anchor test --skip-local-validator
```

## الأمان

### أفضل الممارسات المطبقة

1. ✅ **استخدام PDA**: جميع الحسابات تستخدم Program Derived Addresses
2. ✅ **التحقق من الصلاحيات**: التحقق من `has_one` في كل عملية
3. ✅ **حدود قابلة للتخصيص**: كل مستخدم يحدد الحد الأقصى الخاص به
4. ✅ **قابل للإيقاف**: يمكن إيقاف الحساب في أي وقت
5. ✅ **استرداد الإيجار**: عند إغلاق الحساب
6. ✅ **أحداث قابلة للتتبع**: جميع العمليات تصدر أحداث

### توصيات إضافية

- إجراء Security Audit قبل النشر على Mainnet
- استخدام Multisig للحسابات الحساسة
- مراقبة الأحداث على blockchain
- تطبيق Rate Limiting على مستوى التطبيق

## التكامل مع Frontend

### مثال على الاستخدام في TypeScript

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SanadTrading } from "../target/types/sanad_trading";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.SanadTrading as Program<SanadTrading>;

// تهيئة حساب
const initTx = await program.methods
  .initializeTradingAccount(
    new anchor.BN(5000 * anchor.web3.LAMPORTS_PER_SOL),
    300
  )
  .accounts({
    tradingAccount,
    user: provider.wallet.publicKey,
    authority: authorityPublicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .rpc();

console.log("Transaction signature:", initTx);
```

## عنوان محفظة الرسوم

**عنوان المحفظة لاستقبال الاشتراكات والرسوم:**
```
4WFksLbfb1hsBbUx8Xn3bic9esKfqy47x8phyYwbSBcK
```

هذا العنوان يستقبل:
- رسوم الاشتراك الشهري (0.1 SOL)
- رسوم التداول (3% من كل صفقة)

## الدعم

للحصول على المساعدة:
- راجع [التوثيق الرئيسي](../README.md)
- افتح Issue على GitHub
- تواصل مع فريق التطوير

## الترخيص

MIT License

