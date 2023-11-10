import type { User, Account, Profile } from 'next-auth'

import { UserSchema } from '@/model/user'

type Params = {
  user: User
  account: Account | null
  profile?: Profile
}

export const USER_SERVICE = {
  async DB_UPDATE_USER({ account, profile, user }: Params) {
    const _userDetails: UserSchema = {} as UserSchema

    switch (account?.provider) {
      case 'google':
      case 'github': {
        const { name, email } = profile as Profile
        _userDetails.email = email as string
        _userDetails.name = name as string
        break
      }

      case 'googleonetap': {
        const { email, name } = user
        _userDetails.email = email as string
        _userDetails.name = name as string
        break
      }

      default:
        break
    }

    try {
      if (Object.keys(_userDetails).length !== 2) return true

      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/db`, {
        method: 'POST',
        body: JSON.stringify(_userDetails),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const _user = await response.json()

      return _user
    } catch (err) {
      console.log('Error', err)
    }
  }
}
