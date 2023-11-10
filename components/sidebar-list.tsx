'use server'

import { headers } from 'next/headers'

import { SidebarActions } from '@/components/sidebar-actions'
import { SidebarItem } from '@/components/sidebar-item'
import { CHAT_SERVICE } from '@/service/chat'
import { CHAT_REQUEST_KEYS, Chat } from '@/lib/types'

export async function SidebarList() {
  const chats = (await CHAT_SERVICE.MAKE_REQUEST({
    key: CHAT_REQUEST_KEYS.GET_CHATS,
    method: 'GET',
    headers: headers()
  })) as Chat[]

  return (
    <div className="flex-1 overflow-auto">
      {chats?.length ? (
        <div className="space-y-2 px-2">
          {chats.map(
            chat =>
              chat && (
                <SidebarItem key={chat?._id} chat={chat}>
                  <SidebarActions chat={chat} />
                </SidebarItem>
              )
          )}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No chat history</p>
        </div>
      )}
    </div>
  )
}
