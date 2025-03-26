import NextAuth from "next-auth/next";
import { authOptions } from "../../../utils/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };



// import NextAuth from "next-auth/next";
// import { AuthOptions } from "next-auth";
// import GithubProvider from "next-auth/providers/github";
// import { DefaultSession } from "next-auth";


// import  { authOptions } from '../../../utils/route';


// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user?: {
//       id?: string;
//     } & DefaultSession["user"]
//   }
// }

// export const authOptions: AuthOptions = {
//   providers: [
//     GithubProvider({
//       clientId: process.env.GITHUB_CLIENT_ID as string,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
//     }),
//   ],
//   callbacks: {
//     async session({ session, token }) {
//       if (session.user && token.sub) {
//         session.user.id = token.sub;
//       }
//       return session;
//     },
//     async redirect({ url, baseUrl }) {
//       if (url.startsWith(baseUrl)) return url;
//       if (url.startsWith("/")) return `${baseUrl}${url}`;
//       return baseUrl;
//     },
//   },
//   debug: true,
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

// // export const { GET, POST } = handler;

// // const { handlers: { GET, POST } } = NextAuth(authOptions);

// // export { GET, POST }; 