import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "";

    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", (error as Error).message);
    process.exit(1);
  }
};
