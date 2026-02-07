import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Creating tables...");

  // Enable uuid extension
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

  // Users
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      image TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log("  - users");

  // Tags
  await sql`
    CREATE TABLE IF NOT EXISTS tags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL,
      icon TEXT NOT NULL
    )
  `;
  console.log("  - tags");

  // Expenses
  await sql`
    CREATE TABLE IF NOT EXISTS expenses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      store TEXT NOT NULL,
      amount NUMERIC(12,2) NOT NULL,
      date TIMESTAMP NOT NULL,
      receipt_url TEXT,
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log("  - expenses");

  // Expense Items
  await sql`
    CREATE TABLE IF NOT EXISTS expense_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      amount NUMERIC(12,2) NOT NULL
    )
  `;
  console.log("  - expense_items");

  // Expense Tags (junction)
  await sql`
    CREATE TABLE IF NOT EXISTS expense_tags (
      expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
      tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (expense_id, tag_id)
    )
  `;
  console.log("  - expense_tags");

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_expense_items_expense_id ON expense_items(expense_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_expense_tags_expense_id ON expense_tags(expense_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_expense_tags_tag_id ON expense_tags(tag_id)`;
  console.log("  - indexes");

  console.log("Migration complete!");
  process.exit(0);
}

migrate().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
