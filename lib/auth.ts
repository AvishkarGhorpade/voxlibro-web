import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { ApiError } from "@/lib/api-response";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // The adapter persists Account/Session rows for future OAuth providers.
  // Credentials logins use JWT sessions below (adapter sessions don't mix
  // with the Credentials provider per NextAuth's own constraints).
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hour admin session
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Brute-force protection: throttle by the email being attempted,
        // independent of source IP (which is unavailable inside authorize()
        // and trivially rotated anyway). A thrown error here surfaces to
        // the client as a generic CredentialsSignin failure.
        try {
          await enforceRateLimit({ key: `login:${email}`, limit: 5, windowSeconds: 60 });
        } catch (err) {
          if (err instanceof ApiError) return null;
          throw err;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash || !user.isActive) {
          // Same generic failure path whether the user doesn't exist,
          // is disabled, or the password is wrong — avoids user enumeration.
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});
