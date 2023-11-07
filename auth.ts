import NextAuth, { type DefaultSession } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
// import { OAuth2Client } from 'google-auth-library'

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from './google'

// const googleAuthClient = new OAuth2Client(GOOGLE_CLIENT_ID)

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
  auth,
  CSRF_experimental // will be removed in future
} = NextAuth({
  providers: [
    GitHub,
    Google({ clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET }),
    // CredentialsProvider({
    //   id: 'googleonetap',
    //   name: 'google-one-tap',
    //   credentials: {
    //     credential: { type: 'text' }
    //   },
    //   authorize: async credentials => {
    //     const token = credentials?.credential
    //     const ticket = await googleAuthClient.verifyIdToken({
    //       idToken: token,
    //       audience: GOOGLE_CLIENT_ID
    //     })
    //     const user = ticket.getPayload() // This is the user

    //     if (!user) {
    //       throw new Error('Cannot extract payload from signin token')
    //     }

    //     return user as any
    //   }
    // })
  ],
  callbacks: {
    jwt({ token, profile, user, account }) {
      if (profile) {
        token.id = profile.id ?? user?.id
        token.image = profile.picture
        token.provider = account?.provider
      }
      return token
    },
    authorized({ auth }) {
      return !!auth?.user // this ensures there is a logged in user for -every- request
    }
  },
  pages: {
    signIn: '/sign-in' // overrides the next-auth default signin page https://authjs.dev/guides/basics/pages
  }
})
