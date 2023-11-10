import mongoose from 'mongoose'

import { type Chat } from '@/lib/types'
import ChatModel from '@/model/chat'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  const chats = await ChatModel.find({
    userId: new mongoose.Types.ObjectId(userId)
  }).sort({ createdAt: -1 })

  return chats.map(chat => ({
    ...chat.toObject(),
    path: `/chat/${chat._id.toString()}`
  })) as Chat[]
}

export async function getChat(id: string, userId: string) {
  const chat = await ChatModel.findOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(userId)
  })

  if (!chat || chat.userId.toString() !== userId) {
    return null
  }

  return { ...chat.toObject(), path: `/chat/${chat._id.toString()}` } as Chat
}

export async function removeChat(id: string, userId: string) {
  const chat = await ChatModel.findOne({ _id: new mongoose.Types.ObjectId(id) })

  if (!chat) {
    return {
      error: 'Chat not found!'
    }
  }

  if (chat.userId.toString() !== userId) {
    return {
      error: 'Unauthorized!'
    }
  }

  await chat.deleteOne()

  return true
}

export async function clearChats(userId: string) {
  await ChatModel.deleteMany({
    userId: new mongoose.Types.ObjectId(userId)
  })

  return true
}
