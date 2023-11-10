import { getServerSession } from 'next-auth'
import mongoose, { isValidObjectId } from 'mongoose'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

import { connectToDB } from '@/lib/connectToMongoDB'
import { authOptions } from '@/auth'
import ChatModel from '@/model/chat'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  await connectToDB()

  const session = await getServerSession(authOptions)

  const json = await req.json()
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
