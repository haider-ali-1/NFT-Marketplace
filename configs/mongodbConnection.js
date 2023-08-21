import mongoose from 'mongoose';
const connectWithMongoDB = async (port) => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('connected to mongodb successfully');
  } catch (error) {
    console.log(error.message);
  }
};

export default connectWithMongoDB;
