import mongoose from "mongoose";

export const dbConnection = async () => {
  if (!process.env.MONGO_URI) {
    console.error(
      "MONGO_URI is not set. Check that backend/config/config.env exists and is being loaded."
    );
    process.exit(1);
  }

  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "HMS",
      // Fail in 10s instead of the 30s default, so a bad URI or a blocked IP
      // surfaces quickly rather than looking like a hang.
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`Connected to database: ${connection.connection.host}/HMS`);
  } catch (error) {
    // The API is useless without Mongo — every route would return 500. Better
    // to stop now with a clear message than to serve a broken server.
    console.error("Failed to connect to database:", error.message);
    process.exit(1);
  }

  mongoose.connection.on("error", (error) => {
    console.error("Database error:", error.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("Database disconnected. Mongoose will retry automatically.");
  });
};
