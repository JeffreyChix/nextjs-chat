import { type Message } from 'ai'

export interface Chat extends Record<string, any> {
  _id: string
  title: string
  dateCreated: Date
  userId: string
  path: string
  messages: Message[]
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export enum CHAT_REQUEST_KEYS {
  NEW_CHAT = 'NEW_CHAT',
  GET_CHAT = 'GET_CHAT',
  GET_CHATS = 'GET_CHATS',
  REMOVE_CHAT = 'REMOVE_CHAT',
  CLEAR_CHATS = 'CLEAR_CHATS'
}
