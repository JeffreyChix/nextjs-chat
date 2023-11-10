import { type Message } from 'ai'
import { ObjectId, Schema, model, models, type Model } from 'mongoose'

export interface ChatSchema {
  _id: ObjectId
  title: string
  dateCreated: Date
  userId: ObjectId
  messages: Message[]
}

const chatSchema = new Schema<ChatSchema>(
  {
    title: {
      type: String,
      required: true
    },
    dateCreated: {
      type: Date,
      default: () => Date.now()
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    messages: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
)

const Chat = (models?.Chat || model('Chat', chatSchema)) as Model<ChatSchema>

export default Chat
