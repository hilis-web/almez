const mongoose = require("mongoose");
const SectionNew = require("./models/SectionNew");

const MONGO_URI = process.env.MONGO_URI;

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(MONGO_URI);

    console.log("Connected!");

    // migration code here
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();

    console.log("Disconnected.");
  }
}

//migrate();
