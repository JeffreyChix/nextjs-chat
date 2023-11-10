import NextAuth, { type DefaultSession, type AuthOptions } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from './google'
import { USER_SERVICE } from './service/user'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string
    }),
    Google({ clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET }),
    CredentialsProvider({
      id: 'googleonetap',
      name: 'google-one-tap',
      credentials: {
        credential: { type: 'text' }
      },
      authorize: async credentials => {
        const token = credentials?.credential
        const response = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
        )

        const user = await response.json()

        if (!user) {
          throw new Error('Cannot extract payload from signin token')
        }

        return user as any
      }
    })
  ],
  theme: {
    colorScheme: 'light'
  },
  callbacks: {
    async jwt({ token, profile, user, account }) {
      if (profile) {
        token.image = (profile as any)?.picture ?? (profile as any)?.avatar_url
        token.provider = account?.provider
      }

      if (user && !profile) {
        token.image = (user as any)?.picture
        token.provider = account?.provider
      }

      return token
    },
    async session({ session, token }) {
      const updatedUser = await USER_SERVICE.DB_UPDATE_USER(token)

      if (updatedUser && updatedUser?._id) {
        session.user.id = updatedUser._id
      }

      return session
    }
  },
  pages: {
    signIn: '/sign-in'
  }
}

export const handler = NextAuth(authOptions)
