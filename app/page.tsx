import { Chat } from '@/components/chat'
import mongoose from 'mongoose'

export default function IndexPage() {
  const id = new mongoose.Types.ObjectId()

  return <Chat id={id.toString()} />
}
