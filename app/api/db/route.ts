import { connectToDB } from '@/lib/connectToMongoDB'
import User from '@/model/user'

export async function POST(req: Request) {
  await connectToDB()

  const { email, name } = await req.json()

  const _user = await User.findOneAndUpdate(
    { email },
    { $set: { email, name } },
    { upsert: true, new: true }
  )

  return Response.json(_user)
}
