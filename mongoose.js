import mongoose from 'mongoose';

// const dotenv = require('dotenv');
// dotenv.config();
 async function connectMongo() {
  const usr = 'root';
  const pwd = 'devroot';
  const URL = `mongodb://root:devroot@mongo:27017/mydatabase?authSource=admin`;


  await mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
   console.log('MongoDB connected');

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    console.log('Connected to MongoDB');
  });
}
export { connectMongo };





