import { ObjectId, Schema, model, models } from 'mongoose'

export interface UserSchema {
  _id: ObjectId
  name: string
  email: string
}

const userSchema = new Schema<UserSchema>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      lowercase: true,
      index: true,
      unique: true,
      trim: true,
      required: true
    }
  },
  { timestamps: true }
)

const User = models?.User || model<UserSchema>('User', userSchema)

export default User
