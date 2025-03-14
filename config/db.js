import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Data Base Connected to ${process.env.MONGO_URI}`);
  } catch (error) {
    console.log('Error in Data Base Connection');
  }
};
