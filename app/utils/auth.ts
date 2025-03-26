import { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { DefaultSession } from "next-auth";

// Extend Session types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id?: string;
    } & DefaultSession["user"]
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};