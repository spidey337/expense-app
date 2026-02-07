import {
  pgTable,
  text,
  timestamp,
  numeric,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Users ──────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  expenses: many(expenses),
}));

// ─── Tags ───────────────────────────────────────────────
export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  expenseTags: many(expenseTags),
}));

// ─── Expenses ───────────────────────────────────────────
export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  store: text("store").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  items: many(expenseItems),
  expenseTags: many(expenseTags),
}));

// ─── Expense Items (sub-items) ──────────────────────────
export const expenseItems = pgTable("expense_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  expenseId: uuid("expense_id")
    .notNull()
    .references(() => expenses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
});

export const expenseItemsRelations = relations(expenseItems, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseItems.expenseId],
    references: [expenses.id],
  }),
}));

// ─── Expense <-> Tags (many-to-many) ────────────────────
export const expenseTags = pgTable(
  "expense_tags",
  {
    expenseId: uuid("expense_id")
      .notNull()
      .references(() => expenses.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.expenseId, t.tagId] })]
);

export const expenseTagsRelations = relations(expenseTags, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseTags.expenseId],
    references: [expenses.id],
  }),
  tag: one(tags, {
    fields: [expenseTags.tagId],
    references: [tags.id],
  }),
}));

// ─── Type exports ───────────────────────────────────────
export type User = typeof users.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type ExpenseItem = typeof expenseItems.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type NewExpenseItem = typeof expenseItems.$inferInsert;
