import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

declare module 'next-auth' {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
  }
}

const ADMIN_EMAIL = 'akashsingh404x@gmail.com';
const ADMIN_PASSWORD = 'akash@#singh@#1025802156';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Authenticate with Firebase
          const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
          const firebaseUser = userCredential.user;

          // Check if this is the admin email
          const isAdmin = firebaseUser.email === ADMIN_EMAIL;

          return {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            image: firebaseUser.photoURL,
            role: isAdmin ? 'admin' : 'user',
          };
        } catch (error) {
          console.error('Firebase auth error:', error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.email = user.email;
        // Assign admin role if email matches (for any provider)
        if (user.email === ADMIN_EMAIL) {
          token.role = 'admin';
        } else {
          token.role = user.role || 'user';
        }
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
};
