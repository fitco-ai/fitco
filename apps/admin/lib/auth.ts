import { signInUser } from '@/actions/auth/signInUser';
import { env } from '@/env';
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import { type NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30,
    updateAge: 60 * 60,
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      credentials: {
        login: { label: 'Login', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }
        const { login, password } = credentials;

        const response = await signInUser(login, password);

        if (!response.ok) {
          throw new Error('오류가 발생했습니다.');
        }
        if (response.data?.isNotFound) {
          throw new Error('존재하지 않는 사용자입니다.');
        }
        if (response.data?.isPasswordNotMatch) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }
        if (response.data?.user) {
          return {
            id: response.data.user.id,
            role: 'admin',
          };
        }

        return null;
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    session({ session, token }) {
      session.user = {
        id: token.id as number,
        role: token.role as 'admin' | 'member',
      };
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export function auth(
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions);
}
