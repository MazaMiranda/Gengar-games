import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getRepositories } from '@/infrastructure/container';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'customer' | 'admin';
    } & DefaultSession['user'];
  }

  interface User {
    role?: 'customer' | 'admin';
  }
}

export const credentialsSchema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres.'),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? 'gengar-games-dev-secret-change-me',
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: '/login', error: '/login' },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { users } = await getRepositories();
        const user = await users.findByEmail(parsed.data.email);
        if (!user) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? 'customer';
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.id = token.id as string;
      session.user.role = (token.role as 'customer' | 'admin') ?? 'customer';
      return session;
    },
  },
});

/** Sessão exigida — usada nas rotas da área do cliente. */
export async function requireSession() {
  const session = await auth();
  return session?.user ? session : null;
}

export async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === 'admin' ? session : null;
}
