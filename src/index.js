import express from 'express'
import mongoose from 'mongoose'
import { pool } from './db/postgres.js'
import User from './models/User'

let server

const app = express()
app.use(express.json())

const PORT = 3000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/testdb'

// Rotta di test
app.get('/', (req, res) => {
  res.send('API attiva 🚀')
})
app.post('/users', async (req, res) => {
  try {
    const user = new User(req.body)
    await user.save()
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
// app.post('/subscribe', (req, res) => {
//   const { name, email } = req.body
//   const user = new User({ name, email })
//   user
//     .save()
//     .then(() => res.status(201).send('User subscribed successfully'))
//     .catch((err) => {
//       console.error('Error subscribing user', err)
//       res.status(500).send('Error subscribing user')
//     })
// })

app.post('/setup', async (req, res) => {
  try {
    const { name } = req.body
    await pool.query(
      'CREATE TABLE IF NOT EXISTS test (id SERIAL PRIMARY KEY, name VARCHAR(100))'
    )
    res.status(201).send('Table created successfully')
  } catch (err) {
    console.error('Error setting up database', err)
    res.status(500).send('Error setting up database')
  }
})

app.get('/test', (req, res) => {
  try {
    pool.query('SELECT * FROM test', (error, results) => {
      if (error) {
        console.error('Error executing query', error.stack)
        res.status(500).send('Error fetching data')
      } else {
        res.status(200).json(results.rows)
      }
    })
  } catch (err) {
    console.error('Error fetching data', err)
    res.status(500).send('Error fetching data')
  }
})

app.post('/insert', (req, res) => {
  const { name } = req.body
  try {
    pool.query(
      'INSERT INTO test (name) VALUES ($1)',
      [name],
      (error, results) => {
        if (error) {
          console.error('Error executing query', error.stack)
          res.status(500).send('Error saving data')
        } else {
          res.status(201).send('Data saved successfully')
        }
      }
    )
  } catch (err) {
    console.error('Error parsing request body', err)
    res.status(400).send('Invalid request')
  }
})

app.post('/test', (req, res) => {
  const { name } = req.body
  try {
    pool.query(
      'INSERT INTO test (name) VALUES ($1)',
      [name],
      (error, results) => {
        if (error) {
          console.error('Error executing query', error.stack)
          res.status(500).send('Error saving data')
        } else {
          res.status(201).send('Data saved successfully')
        }
      }
    )
  } catch (err) {
    console.error('Error parsing request body', err)
    res.status(400).send('Invalid request')
  }
})

function buildMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI
  const user = process.env.MONGO_INITDB_ROOT_USERNAME || 'root'
  const pass = process.env.MONGO_INITDB_ROOT_PASSWORD || 'pass'
  const host = process.env.MONGODB_HOST || 'mongo'
  const port = process.env.MONGODB_PORT || '27017'
  const db = process.env.MONGODB_DB || 'mydb'
  const authSource = process.env.MONGODB_AUTHSOURCE || 'admin'
  return `mongodb://${user}:${pass}@${host}:${port}/${db}?authSource=${authSource}`
}

async function connectWithRetry(retries = 10, delayMs = 2000) {
  const uri = buildMongoUri()
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
      console.log('✅ Connected to MongoDB')
      return
    } catch (err) {
      console.error(
        `MongoDB connection attempt ${attempt} failed:`,
        err.message
      )
      if (attempt === retries) {
        console.error('❌ Could not connect to MongoDB. Exiting.')
        process.exit(1)
      }
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`)
  await connectWithRetry()
})

process.on('SIGINT', async () => {
  await gracefulShutdown()
  process.exit(0)
})
process.on('SIGTERM', async () => {
  await gracefulShutdown()
  process.exit(0)
})
