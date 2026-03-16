import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../src/models/User.js";

dotenv.config({ path: new URL("../.env", import.meta.url) });

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("MONGO_URI is missing in .env");
  process.exit(1);
}

try {
  await mongoose.connect(mongoUri);
  const result = await User.deleteMany({});
  console.log(`Deleted ${result.deletedCount} user(s).`);
} catch (error) {
  console.error("Failed to clear users:", error);
  process.exitCode = 1;
} finally {
  await mongoose.connection.close();
}
