// Uncaught Exception Error Handling
process.on('uncaughtException', (err) => {
  console.log(`uncaught exception error occured app shuting down`);
  console.log(err.name, err.message);
  process.exit(1);
});

import 'dotenv/config';
import app from './app.js';
import connectWithMongoDB from './configs/mongodbConnection.js';

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectWithMongoDB();
  app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
  });
};
await startServer();

//Unhandled Rejection Error Handling
process.on('unhandledRejection', (err) => {
  console.log('unhandled rejection error occured app shuting down');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
