import mongoose from "mongoose";

let isConnected = false; // track the connection

export const connectToDB = async () => {
  // Prevent multiple connections
  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    // Set strict query mode
    mongoose.set("strictQuery", true);

    // Connect with updated options for Mongoose 8
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "share_prompt",
      // Remove deprecated options for Mongoose 8
      // useNewUrlParser and useUnifiedTopology are no longer needed
    });

    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    isConnected = false;
    throw error;
  }
};
