-- CreateTable
CREATE TABLE "financial_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "income_type" TEXT,
    "estimated_monthly_income" DECIMAL(12,2),
    "financial_goal" TEXT,
    "default_saving_goal" DECIMAL(12,2),
    "fixed_expenses_notes" TEXT,
    "university" TEXT,
    "course" TEXT,
    "expected_graduation" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "financial_profiles_user_id_key" ON "financial_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "financial_profiles" ADD CONSTRAINT "financial_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
