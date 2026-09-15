import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { resolveSignInAccess } from "@/lib/access-control";
import { verifyPassword } from "@/lib/password";
import { verifyOtp } from "@/lib/otp";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      id: "credentials",
      name: "Email/Password",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        if (!verifyPassword(password, user.passwordHash)) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
    Credentials({
      id: "slack-otp",
      name: "Slack OTP",
      credentials: { email: {}, code: {} },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const code = String(credentials?.code ?? "");
        if (!email || !code) return null;

        const valid = await verifyOtp(email, code);
        if (!valid) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const decision = await resolveSignInAccess(user.email, {
        name: user.name,
        image: user.image,
      });
      return decision.allow ? true : decision.redirectTo;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email.toLowerCase() },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          session.user.departmentId = dbUser.departmentId;
        }
      }
      return session;
    },
  },
});
