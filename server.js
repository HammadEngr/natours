const app = require('./app');
// Reading ENV Variables
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION 😎');
  console.log(err);

  process.exit();
});

dotenv.config({ path: './config.env' });
//
const mongoose = require('mongoose');

// Define the database URL
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// Connecting to DB
mongoose.connect(DB).then(() => {
  console.log('DB connection successful 😀');
});
// Defining and Listening to port
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Listening to ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION 😎');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
