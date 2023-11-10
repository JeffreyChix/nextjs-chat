import mongoose from 'mongoose'

import { auth } from '@/auth'
import { type Chat } from '@/lib/types'
import ChatModel from '@/model/chat'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  const chats = await ChatModel.find({
    userId: new mongoose.Types.ObjectId(userId)
  })

  return chats.map(chat => ({
    ...chat.toObject(),
    path: `chat/${chat._id.toString()}`
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

  return { ...chat.toObject(), path: `chat/${chat._id.toString()}` } as Chat
}

export async function removeChat(id:string) {
  const session = await auth()

  if (!session) {
    return {
      error: 'Unauthorized!'
    }
  }

  const chat = await ChatModel.findOne({ _id: new mongoose.Types.ObjectId(id) })

  if (!chat) {
    return {
      error: 'Chat not found!'
    }
  }

  if (chat.userId.toString() !== session.user.id) {
    return {
      error: 'Unauthorized!'
    }
  }

  await chat.deleteOne()

  return true;
}

export async function clearChats() {
  const session = await auth()

  if (!session) {
    return {
      error: 'Unauthorized!'
    }
  }

  await ChatModel.deleteMany({
    userId: new mongoose.Types.ObjectId(session.user.id)
  })

  return true;
}

// export async function getChats(userId?: string | null) {
//   if (!userId) {
//     return []
//   }

//   try {
//     const pipeline = kv.pipeline()
//     const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, {
//       rev: true
//     })

//     for (const chat of chats) {
//       pipeline.hgetall(chat)
//     }

//     const results = await pipeline.exec()

//     return results as Chat[]
//   } catch (error) {
//     return []
//   }
// }

// export async function getChat(id: string, userId: string) {
//   const chat = await kv.hgetall<Chat>(`chat:${id}`)

//   if (!chat || (userId && chat.userId !== userId)) {
//     return null
//   }

//   return chat
// }

// export async function removeChat({ id, path }: { id: string; path: string }) {
//   const session = await auth()

//   if (!session) {
//     return {
//       error: 'Unauthorized'
//     }
//   }

//   const uid = await kv.hget<string>(`chat:${id}`, 'userId')

//   if (uid !== session?.user?.id) {
//     return {
//       error: 'Unauthorized'
//     }
//   }

//   await kv.del(`chat:${id}`)
//   await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)

//   revalidatePath('/')
//   return revalidatePath(path)
// }

// export async function clearChats() {
//   const session = await auth()

//   if (!session?.user?.id) {
//     return {
//       error: 'Unauthorized'
//     }
//   }

//   const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1)
//   if (!chats.length) {
//     return redirect('/')
//   }
//   const pipeline = kv.pipeline()

//   for (const chat of chats) {
//     pipeline.del(chat)
//     pipeline.zrem(`user:chat:${session.user.id}`, chat)
//   }

//   await pipeline.exec()

//   revalidatePath('/')
//   return redirect('/')
// }
