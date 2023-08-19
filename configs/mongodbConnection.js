import mongoose from "mongoose";
const connectWithMongoDB = async (port) => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("connected to mongodb successfully");
    console.log(`server is running on port ${port}`);
  } catch (error) {
    console.log(error.message);
  }
};

export default connectWithMongoDB;
