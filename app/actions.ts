'use server'

import mongoose from 'mongoose'
import { getServerSession } from 'next-auth'

import { type Chat } from '@/lib/types'
import ChatModel from '@/model/chat'
import { authOptions } from '@/auth'
import { connectToDB } from '@/lib/connectToMongoDB'

export async function getChats() {
  const [session] = await Promise.all([
    getServerSession(authOptions),
    connectToDB()
  ])
  const userId = session?.user.id

  if (!userId) {
    return []
  }

  const chats = await ChatModel.find({
    userId: new mongoose.Types.ObjectId(userId)
  })
    .sort({ createdAt: -1 })
    .lean()

  return chats.map(chat => ({
    ...chat,
    _id: chat._id.toString(),
    userId: chat.userId.toString(),
    path: `/chat/${chat._id.toString()}`
  })) as unknown as Chat[]
}

export async function getChat(id: string) {
  const [session] = await Promise.all([
    getServerSession(authOptions),
    connectToDB()
  ])
  const userId = session?.user.id

  const chat = await ChatModel.findOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(userId)
  }).lean()

  if (!chat || chat.userId.toString() !== userId) {
    return null
  }

  return {
    ...chat,
    _id: chat._id.toString(),
    userId: chat.userId.toString(),
    path: `/chat/${chat._id.toString()}`
  } as unknown as Chat
}

export async function removeChat(id: string) {
  const [session] = await Promise.all([
    getServerSession(authOptions),
    connectToDB()
  ])
  const userId = session?.user.id

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

export async function clearChats() {
  const [session] = await Promise.all([
    getServerSession(authOptions),
    connectToDB()
  ])
  const userId = session?.user.id

  if (!userId) {
    return {
      error: 'Unauthorized!'
    }
  }

  await ChatModel.deleteMany({
    userId: new mongoose.Types.ObjectId(userId)
  })

  return true
}
