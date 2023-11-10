import * as mongoose from 'mongoose'

const connection = { isConnected: 0 }

export const connectToDB = async () => {
  if (connection.isConnected) return

  try {
    mongoose.set('strictQuery', true)

    console.log('=> Connecting to database...')

    const db = await mongoose.connect(process.env.MONGODB_URI as string)

    connection.isConnected = db.connections[0].readyState

    console.log('✔✔ App connected to database!')
  } catch (err) {
    console.log("Couldn't connect to database => ", err)
  }
}
