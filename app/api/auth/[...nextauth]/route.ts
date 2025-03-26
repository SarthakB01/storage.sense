import { authOptions } from './alternateroute'; // Update the path accordingly
import NextAuth from 'next-auth';


export { authOptions } from './alternateroute';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }