import { JWT } from 'next-auth/jwt'

export const USER_SERVICE = {
  async DB_UPDATE_USER(token: JWT) {
    const { name, email } = token

    try {
      if (!name || !email) return

      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/db`, {
        method: 'POST',
        body: JSON.stringify({ name, email }),
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
