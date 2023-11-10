import { type Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/auth'
import { Chat } from '@/components/chat'
import { CHAT_SERVICE } from '@/service/chat'
import { CHAT_REQUEST_KEYS } from '@/lib/types'

export const runtime = 'edge'
export const preferredRegion = 'home'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const session = await auth()

  if (!session?.user) {
    return {}
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/chat?key=${CHAT_REQUEST_KEYS.GET_CHAT}&id=${params.id}`,
    { headers: headers() }
  )

  const chat = await response.json()

  // const chat = await CHAT_SERVICE.MAKE_REQUEST({
  //   id: params.id,
  //   key: CHAT_REQUEST_KEYS.GET_CHAT,
  //   method: 'GET',
  //   headers: headers()
  // })

  return {
    title: chat?.title.toString().slice(0, 50) ?? 'Chat'
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect(`/sign-in?next=/chat/${params.id}`)
  }

  const chat = await CHAT_SERVICE.MAKE_REQUEST({
    id: params.id,
    key: CHAT_REQUEST_KEYS.GET_CHAT,
    method: 'GET',
    headers: headers()
  })

  if (!chat) {
    notFound()
  }

  if (chat?.userId !== session?.user?.id) {
    notFound()
  }

  return <Chat id={chat._id} initialMessages={chat.messages} />
}
