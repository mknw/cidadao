use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock;

declare_id!("Czu3SZdaZoHxX6X3yohJxnsGEuHNfy6frnAdJQYS6qHv");

#[program]
pub mod network_cidadao {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let base_account = &mut ctx.accounts.base_account;
        base_account.total_actions = 00000000;
        Ok(())
    }
    
    // add function to:
    pub fn submit_action(ctx: Context<AddAction>,
                      action_name: String,
                      action_description: String,
                      action_type: String,) -> Result<()> {
        let base_account = &mut ctx.accounts.base_account;
        let user = &mut ctx.accounts.user;
        
        // let ts: i64 = OffsetDateTime::now_utc().unix_timestamp().unwrap();
        let ts: i64 = clock::Clock::get()?.unix_timestamp;
        // println!("datetime is: {}", datetime);
        // let action = &mut ctx.accounts.action_details;
        let new_item = ItemStruct{ 
                        action_name,
                        action_id: Some(base_account.total_actions.clone()),
                        action_description,
                        action_type,
                        action_requester_address: *user.to_account_info().key,
                        action_requested_time: Some(ts),
                        action_status: Some(String::from("pending-review")),
                        ..Default::default()
                        };
        base_account.pending_action_list.push(new_item);

        base_account.total_actions += 1;
        Ok(())
    }
    
    // should we put this in a separate program?
    pub fn review_action(_ctx: Context<ReviewAction>,
                        action_approved: bool) -> Result<()> {
        // let base_account = &mut ctx.accounts.base_account;
        // let user = &mut ctx.accounts.user;
        if action_approved {
            // 1. find action ItemStruct in pending
            
            // 2. add to approved_action_list
            // base_account.approved_action_list.push();
        } else {
            // add to reviewed_action_list
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 9000)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddAction<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    // #[account(mut)]
    // pub action_details: Account<'info, ItemStruct<
    // 'info>>, 
    // ItemStruct,
}

#[derive(Accounts)]
pub struct ReviewAction<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize, Default)]
pub struct ItemStruct {
    // Option is used when defaults other than `None` may be misleading.
    pub action_name: String,
    pub action_id: Option<u64>,
    pub action_requester_address: Pubkey,
    pub action_assignee_address: Option<Pubkey>,
    // Person or organization who is responsible for the action
    pub action_assignee_name: Option<String>,
    pub action_description: String, 
    // will use T enum.
    pub action_type: String,
    pub action_requested_time: Option<i64>,
    pub action_location: Option<String>,
    // will use T enum.
    pub action_status: Option<String>,
    pub action_approved: bool,
    // pub action_tags: Option<Vec<String>>,
    // In the future, comments could be held separately.
    pub action_comments: Vec<String>,
}

#[account]
pub struct BaseAccount {
    pub total_actions: u64,
    // can we add a vec of maps here,
    // to hold details for each Action? 
    pub reviewed_action_list: Vec<ItemStruct>,
    pub pending_action_list: Vec<ItemStruct>,
    pub approved_action_list: Vec<ItemStruct>,
}
