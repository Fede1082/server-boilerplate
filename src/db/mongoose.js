import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI
const opts = { autoIndex: true, maxPoolSize: 10 }

export async function connectWithRetry(retries = 10, delayMs = 2000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(uri, opts)
      console.log('✅ MongoDB connesso')
      return
    } catch (err) {
      console.error(`❌ Tentativo ${i} fallito:`, err.message)
      if (i === retries) throw err
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }
}

export async function gracefulShutdown() {
  await mongoose.connection.close()
  console.log('👋 Connessione MongoDB chiusa')
}
