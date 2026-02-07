import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(users).values({
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
          });
        }

        return true;
      } catch (error) {
        console.error("SignIn callback error:", JSON.stringify(error, Object.getOwnPropertyNames(error as object)));
        console.error("DATABASE_URL exists:", !!process.env.DATABASE_URL);
        console.error("DATABASE_URL prefix:", process.env.DATABASE_URL?.substring(0, 30));
        return false;
      }
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, session.user.email))
          .limit(1);

        if (dbUser[0]) {
          session.user.id = dbUser[0].id;
        }
      }
      return session;
    },
  },
});
