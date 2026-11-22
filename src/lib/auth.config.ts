import type { NextAuthConfig } from "next-auth";
import { type Role } from "@prisma/client";

export const authConfig: NextAuthConfig = {
  // Behind Vercel (or any hosting proxy) the Host header is set by the platform.
  // Without this, Auth.js rejects every session request off-Vercel with "UntrustedHost".
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: (token.id as string) ?? "",
          role: token.role as Role,
        },
      };
    },
  },
  providers: [],
};
