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
