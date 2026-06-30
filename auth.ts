import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    signIn: async ({ user }) => {
      if (user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, deletedAt: true },
        });
        if (dbUser?.deletedAt) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { deletedAt: null },
          });
        }
      }
      return true;
    },
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
        // @ts-expect-error - username is added to User model via Prisma
        session.user.username = user.username;
      }
      return session;
    },
  },
};