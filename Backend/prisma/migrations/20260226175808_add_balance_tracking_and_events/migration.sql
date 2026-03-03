-- CreateEnum
CREATE TYPE "AccountEventType" AS ENUM ('transaction_income', 'transaction_expense', 'installment_payment', 'transfer_in', 'transfer_out', 'adjustment', 'initial_balance');

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "available_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "current_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "last_transaction_at" TIMESTAMP(3),
ADD COLUMN     "reserved_amount" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "account_events" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "type" "AccountEventType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "transaction_id" TEXT,
    "installment_id" TEXT,
    "description" TEXT,
    "balance_before" DECIMAL(15,2) NOT NULL,
    "balance_after" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "account_events_account_id_idx" ON "account_events"("account_id");

-- CreateIndex
CREATE INDEX "account_events_transaction_id_idx" ON "account_events"("transaction_id");

-- CreateIndex
CREATE INDEX "account_events_installment_id_idx" ON "account_events"("installment_id");

-- CreateIndex
CREATE INDEX "account_events_created_at_idx" ON "account_events"("created_at");

-- AddForeignKey
ALTER TABLE "account_events" ADD CONSTRAINT "account_events_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
