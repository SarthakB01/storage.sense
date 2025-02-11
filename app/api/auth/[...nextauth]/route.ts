// /app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If the URL is an internal URL, return it as-is
      if (url.startsWith(baseUrl)) return url;
      // If the URL is an absolute path, append it to the base URL
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };
