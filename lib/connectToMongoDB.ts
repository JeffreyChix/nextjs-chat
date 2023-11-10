import * as mongoose from 'mongoose'

export const connectToDB = async () => {
  try {
    mongoose.set('strictQuery', true)

    console.log('=> Connecting to database...')

    await mongoose.connect(
      process.env.MONGODB_URI as string,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      } as mongoose.ConnectOptions
    )

    console.log('✔✔ App connected to database!')
  } catch (err) {
    console.log("Couldn't connect to database => ", err)
  }
}
