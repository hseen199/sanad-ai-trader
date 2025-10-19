use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("YOUR_PROGRAM_ID_HERE");

#[program]
pub mod sanad_trading {
    use super::*;

    /// تهيئة حساب التداول للمستخدم
    pub fn initialize_trading_account(
        ctx: Context<InitializeTradingAccount>,
        max_trade_amount: u64,
        fee_percentage: u16, // 300 = 3%
    ) -> Result<()> {
        let trading_account = &mut ctx.accounts.trading_account;
        trading_account.owner = ctx.accounts.user.key();
        trading_account.authority = ctx.accounts.authority.key();
        trading_account.max_trade_amount = max_trade_amount;
        trading_account.fee_percentage = fee_percentage;
        trading_account.total_trades = 0;
        trading_account.total_fees_paid = 0;
        trading_account.is_active = true;
        trading_account.bump = ctx.bumps.trading_account;
        
        Ok(())
    }

    /// تنفيذ صفقة تداول مع خصم الرسوم تلقائياً
    pub fn execute_trade(
        ctx: Context<ExecuteTrade>,
        amount: u64,
    ) -> Result<()> {
        let trading_account = &mut ctx.accounts.trading_account;
        
        // التحقق من أن الحساب نشط
        require!(trading_account.is_active, ErrorCode::AccountNotActive);
        
        // التحقق من أن المبلغ لا يتجاوز الحد الأقصى
        require!(amount <= trading_account.max_trade_amount, ErrorCode::AmountExceedsLimit);
        
        // حساب الرسوم (3%)
        let fee_amount = (amount as u128)
            .checked_mul(trading_account.fee_percentage as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;
        
        let net_amount = amount.checked_sub(fee_amount).unwrap();
        
        // تحويل الرسوم إلى حساب الرسوم
        let cpi_accounts_fee = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.fee_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx_fee = CpiContext::new(cpi_program.clone(), cpi_accounts_fee);
        token::transfer(cpi_ctx_fee, fee_amount)?;
        
        // تحديث إحصائيات الحساب
        trading_account.total_trades = trading_account.total_trades.checked_add(1).unwrap();
        trading_account.total_fees_paid = trading_account.total_fees_paid.checked_add(fee_amount).unwrap();
        
        emit!(TradeExecuted {
            user: ctx.accounts.user.key(),
            amount,
            fee_amount,
            net_amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    /// تحديث إعدادات الحساب
    pub fn update_trading_settings(
        ctx: Context<UpdateTradingSettings>,
        max_trade_amount: Option<u64>,
        is_active: Option<bool>,
    ) -> Result<()> {
        let trading_account = &mut ctx.accounts.trading_account;
        
        if let Some(amount) = max_trade_amount {
            trading_account.max_trade_amount = amount;
        }
        
        if let Some(active) = is_active {
            trading_account.is_active = active;
        }
        
        Ok(())
    }

    /// إغلاق حساب التداول واسترداد الإيجار
    pub fn close_trading_account(
        _ctx: Context<CloseTradingAccount>,
    ) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeTradingAccount<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + TradingAccount::INIT_SPACE,
        seeds = [b"trading", user.key().as_ref()],
        bump
    )]
    pub trading_account: Account<'info, TradingAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    /// CHECK: This is the authority that can execute trades
    pub authority: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteTrade<'info> {
    #[account(
        mut,
        seeds = [b"trading", user.key().as_ref()],
        bump = trading_account.bump,
        has_one = owner @ ErrorCode::Unauthorized,
    )]
    pub trading_account: Account<'info, TradingAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub fee_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateTradingSettings<'info> {
    #[account(
        mut,
        seeds = [b"trading", user.key().as_ref()],
        bump = trading_account.bump,
        has_one = owner @ ErrorCode::Unauthorized,
    )]
    pub trading_account: Account<'info, TradingAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct CloseTradingAccount<'info> {
    #[account(
        mut,
        close = user,
        seeds = [b"trading", user.key().as_ref()],
        bump = trading_account.bump,
        has_one = owner @ ErrorCode::Unauthorized,
    )]
    pub trading_account: Account<'info, TradingAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct TradingAccount {
    pub owner: Pubkey,
    pub authority: Pubkey,
    pub max_trade_amount: u64,
    pub fee_percentage: u16,
    pub total_trades: u64,
    pub total_fees_paid: u64,
    pub is_active: bool,
    pub bump: u8,
}

#[event]
pub struct TradeExecuted {
    pub user: Pubkey,
    pub amount: u64,
    pub fee_amount: u64,
    pub net_amount: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("الحساب غير نشط")]
    AccountNotActive,
    #[msg("المبلغ يتجاوز الحد الأقصى المسموح")]
    AmountExceedsLimit,
    #[msg("غير مصرح")]
    Unauthorized,
}

