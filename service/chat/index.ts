import { CHAT_REQUEST_KEYS } from '@/lib/types'

type Param = {
  id?: string
  userId?: string
  key: CHAT_REQUEST_KEYS
  method: 'POST' | 'GET' | 'DELETE'
  headers?: any
}

export const CHAT_SERVICE = {
  async MAKE_REQUEST({
    id,
    key,
    method,
    headers
  }: Param) {
    const endpoint = new URL(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/chat`)

    if (['GET', 'DELETE'].includes(method)) {
      endpoint.searchParams.append('key', key)

      if (id) {
        endpoint.searchParams.append('id', id)
      }
    }

    try {
      const response = await fetch(endpoint.href, {
        method,
        ...(method === 'POST' && {
          body: JSON.stringify({ id, key })
        }),
        headers: headers
      })

      const data = await response.json()

      return data
    } catch (err) {
      console.error('Chat Error => ', err)
    }
  }
}
