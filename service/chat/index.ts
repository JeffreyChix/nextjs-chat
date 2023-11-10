import { CHAT_REQUEST_KEYS } from '@/lib/types'

type Param = {
  id?: string
  userId?: string
  key: CHAT_REQUEST_KEYS
  method: 'POST' | 'GET' | 'DELETE'
}

export const CHAT_SERVICE = {
  async MAKE_REQUEST({ id, key, method }: Param) {
    const endpoint = new URL(`${process.env.NEXTAUTH_URL}/api/chat`)

    if (method === 'GET') {
      endpoint.searchParams.append('key', key)

      if (id) {
        endpoint.searchParams.append('id', id)
      }
    }

    try {
      const response = await fetch(endpoint.href, {
        method,
        ...(method !== 'GET' && { body: JSON.stringify({ id, key }) }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      return data
    } catch (err) {
      console.error('Chat Error => ', err)
    }
  }
}
