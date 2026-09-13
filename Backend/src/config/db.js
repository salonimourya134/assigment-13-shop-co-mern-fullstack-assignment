const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("mongoDB connected successfully");
  } catch (error) {
    console.log("mongoDb connection failed");
    console.log(error.message);

  }
};

module.exports = connectDB;
