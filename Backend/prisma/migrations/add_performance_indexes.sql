-- Performance indexes for frequently queried fields

-- Composite index for transaction queries by user and date range
CREATE INDEX IF NOT EXISTS "transactions_user_date_idx" ON "transactions"("user_id", "date" DESC, "deleted_at");

-- Composite index for transaction queries by user, account and date
CREATE INDEX IF NOT EXISTS "transactions_user_account_date_idx" ON "transactions"("user_id", "account_id", "date" DESC);

-- Composite index for transaction queries by user, category and date
CREATE INDEX IF NOT EXISTS "transactions_user_category_date_idx" ON "transactions"("user_id", "category_id", "date" DESC);

-- Index for transaction type filtering
CREATE INDEX IF NOT EXISTS "transactions_user_type_idx" ON "transactions"("user_id", "type", "deleted_at");

-- Composite index for goals progress queries
CREATE INDEX IF NOT EXISTS "goals_user_status_idx" ON "goals"("user_id", "deleted_at") WHERE "deleted_at" IS NULL;

-- Composite index for installments status queries
CREATE INDEX IF NOT EXISTS "installments_user_status_idx" ON "installments"("user_id", "current_installment", "installments", "deleted_at");

-- Index for refresh token lookups
CREATE INDEX IF NOT EXISTS "refresh_tokens_user_expires_idx" ON "refresh_tokens"("user_id", "expires_at");

-- Partial index for active accounts
CREATE INDEX IF NOT EXISTS "accounts_user_active_idx" ON "accounts"("user_id") WHERE "deleted_at" IS NULL;

-- Partial index for active categories
CREATE INDEX IF NOT EXISTS "categories_user_type_active_idx" ON "categories"("user_id", "type") WHERE "deleted_at" IS NULL;
