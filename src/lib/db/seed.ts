import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { tags } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

const defaultTags = [
  { name: "Mortgage", color: "#ef4444", icon: "🏠" },
  { name: "Food", color: "#f97316", icon: "🍔" },
  { name: "Groceries", color: "#84cc16", icon: "🛒" },
  { name: "Leisure", color: "#a855f7", icon: "🎮" },
  { name: "Tech", color: "#3b82f6", icon: "💻" },
  { name: "Utility", color: "#eab308", icon: "💡" },
  { name: "Transport", color: "#06b6d4", icon: "🚗" },
  { name: "Health", color: "#22c55e", icon: "🏥" },
  { name: "Clothing", color: "#ec4899", icon: "👕" },
  { name: "Education", color: "#6366f1", icon: "📚" },
  { name: "Gifts", color: "#f43f5e", icon: "🎁" },
  { name: "Subscriptions", color: "#8b5cf6", icon: "📱" },
  { name: "Dining Out", color: "#fb923c", icon: "🍽️" },
  { name: "Entertainment", color: "#c084fc", icon: "🎬" },
  { name: "Insurance", color: "#64748b", icon: "🛡️" },
];

async function seed() {
  console.log("Seeding tags...");

  for (const tag of defaultTags) {
    await db
      .insert(tags)
      .values(tag)
      .onConflictDoNothing({ target: tags.name });
  }

  console.log(`Seeded ${defaultTags.length} tags.`);
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
