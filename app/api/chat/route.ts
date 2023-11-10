import { getServerSession } from 'next-auth'
import mongoose, { isValidObjectId } from 'mongoose'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

import { CHAT_REQUEST_KEYS } from '@/lib/types'
import { connectToDB } from '@/lib/connectToMongoDB'
import { getChat, getChats, removeChat, clearChats } from '@/app/actions'
import ChatModel from '@/model/chat'
import { authOptions } from '@/auth'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

const prepParams = async (req: Request) => {
  if (['GET', 'DELETE'].includes(req.method.toUpperCase())) {
    const requestUrl = new URL(req.url)
    const id = requestUrl.searchParams.get('id')
    const key = requestUrl.searchParams.get('key')
    return { id, key }
  }

  const json = await req.json()

  return json
}

export async function POST(req: Request) {
  await connectToDB()

  const session = await getServerSession(authOptions)

  const json = await prepParams(req)
  const userId = session?.user.id

  const { messages, previewToken } = json

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  if (previewToken) {
    configuration.apiKey = previewToken
  }

  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    stream: true
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)

      const payload = {
        title,
        userId: new mongoose.Types.ObjectId(userId),
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }

      if (json.id && isValidObjectId(json.id)) {
        await ChatModel.findOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(json.id),
            userId: new mongoose.Types.ObjectId(userId)
          },
          {
            $set: payload,
            $setOnInsert: { _id: new mongoose.Types.ObjectId(json.id) }
          },
          { upsert: true }
        )
      } else {
        //! May never occur!
        await ChatModel.create(payload)
      }
    }
  })

  return new StreamingTextResponse(stream)
}

export async function GET(req: Request) {
  await connectToDB()
  const session = await getServerSession(authOptions)

  const json = await prepParams(req)
  const userId = session?.user.id

  switch (json.key) {
    case CHAT_REQUEST_KEYS.GET_CHAT: {
      const data = await getChat(json.id, userId as string)

      return Response.json(data)
    }

    case CHAT_REQUEST_KEYS.GET_CHATS: {
      const data = await getChats(userId)

      return Response.json(data)
    }
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  const userId = session?.user.id as string

  if (!userId) {
    return Response.json({
      error: 'Unauthorized!'
    })
  }

  await connectToDB()

  const json = await prepParams(req)

  switch (json.key) {
    case CHAT_REQUEST_KEYS.REMOVE_CHAT: {
      const data = await removeChat(json.id, userId)

      return Response.json(data)
    }

    case CHAT_REQUEST_KEYS.CLEAR_CHATS: {
      const data = await clearChats(userId)

      return Response.json(data)
    }
  }
}
