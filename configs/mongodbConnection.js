import mongoose from 'mongoose';

// @ connect locally if internet is not working
const connectLocal = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL_LOCAL);
    console.log('connect with mongodb locally');
  } catch (error) {
    console.log(error.message);
  }
};

// @ connect if internet is working fine
const connectWithMongoDB = async (port) => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('connected to mongodb successfully');
  } catch (error) {
    console.log(error.message);
    await connectLocal();
  }
};

export default connectWithMongoDB;
