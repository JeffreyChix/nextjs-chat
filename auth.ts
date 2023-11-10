import NextAuth, { type DefaultSession } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from './google'
import { USER_SERVICE } from './service/user'

declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's id. */
      id: string
    } & DefaultSession['user']
  }
}

export const {
  handlers: { GET, POST },
  auth
} = NextAuth({
  providers: [
    GitHub,
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
  secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
  session: {
    strategy: 'jwt'
  },
  jwt: {
    secret: process.env.NEXT_PUBLIC_AUTH_SECRET
  },
  theme: {
    colorScheme: 'light'
  },
  callbacks: {
    async jwt({ token, profile, user, account }) {
      const updatedUser = await USER_SERVICE.DB_UPDATE_USER({
        user,
        account,
        profile
      })

      if (updatedUser && updatedUser?._id) {
        token.id = updatedUser._id
      }

      if (profile) {
        token.image = profile?.picture ?? profile?.avatar_url
        token.provider = account?.provider
      }

      if (user && !profile) {
        token.image = (user as any)?.picture
        token.provider = account?.provider
      }

      return token
    },
    authorized({ auth }) {
      return !!auth?.user
    }
  },
  pages: {
    signIn: '/sign-in'
  }
})
