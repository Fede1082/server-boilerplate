const express = require('express');
const {pool} = require('./db/postgres');
const User = require('./models/User');

const {connectMongo} = require('./db/mongoose');


const app = express();
app.use(express.json());
const PORT =  3000;

(async () => {
  try {
    await connectMongo(); // usa process.env.MONGODB_URI dal compose
    server = app.listen(PORT, () => {
      console.log(`✅ API on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start:", err);
    process.exit(1);
  }
})();


app.post('/subscribe', (req, res) => {
  const {name, email} = req.body;
  const user = new User({name, email});
  user.save()
    .then(() => res.status(201).send('User subscribed successfully'))
    .catch(err => {
      console.error('Error subscribing user', err);
      res.status(500).send('Error subscribing user');
    });
});

app.post('/setup', async (req, res) => {
  try {
    const { name } = req.body;
    await pool.query('CREATE TABLE IF NOT EXISTS test (id SERIAL PRIMARY KEY, name VARCHAR(100))');
    res.status(201).send('Table created successfully');
  } catch (err) {
    console.error('Error setting up database', err);
    res.status(500).send('Error setting up database');
  }
});

app.get('/test', (req, res) => {
  try {
    pool.query('SELECT * FROM test', (error, results) => {
      if (error) {
        console.error('Error executing query', error.stack);
        res.status(500).send('Error fetching data');
      } else {
        res.status(200).json(results.rows);
      }
    });
  } catch (err) {
    console.error('Error fetching data', err);
    res.status(500).send('Error fetching data');
  }
});

app.post('/insert', (req, res) => {
  const { name } = req.body;
  try {
    pool.query('INSERT INTO test (name) VALUES ($1)', [name], (error, results) => {
      if (error) {
        console.error('Error executing query', error.stack);
        res.status(500).send('Error saving data');
      } else {
        res.status(201).send('Data saved successfully');
      }
    });
  } catch (err) {
    console.error('Error parsing request body', err);
    res.status(400).send('Invalid request');
  }
});

app.post('/test', (req, res) => {
  const { name } = req.body;
  try {
    pool.query('INSERT INTO test (name) VALUES ($1)', [name], (error, results) => {
      if (error) {
        console.error('Error executing query', error.stack);
        res.status(500).send('Error saving data');
      } else {
        res.status(201).send('Data saved successfully');
      }
    });
  } catch (err) {
    console.error('Error parsing request body', err);
    res.status(400).send('Invalid request');
  }
});


/**
 * Mongoose connection and user creation is handled in src/db/mongoose.js
 */
const user = new User({
  name: 'John Doe',
  age: 30,
  email: 'john.doe@example.com'
});

user.save()
  .then(() => console.log('User saved'))
  .catch(err => console.error('Error saving user', err));




  app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
