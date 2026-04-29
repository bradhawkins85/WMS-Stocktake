import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Trust the incoming host header. Required when the app is accessed via a
  // hostname/IP that doesn't match NEXTAUTH_URL (e.g. behind a reverse proxy,
  // via a LAN IP, or in Docker). Without this, Auth.js v5 rejects requests
  // with an "UntrustedHost" error, which surfaces in the browser as a 500 on
  // /api/auth/session and the message "There was a problem with the server
  // configuration".
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })

          if (!user) return null

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          )

          if (!isValid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (err) {
          console.error('[auth] Database error during sign-in for user:', credentials.email, err)
          // Re-throw so Auth.js surfaces a server error rather than silently
          // treating a DB failure as invalid credentials.
          throw err
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string
        ;(session.user as { id?: string }).id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
})
