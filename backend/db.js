// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     // await mongoose.connect("mongodb://127.0.0.1:27017/weatherApp");
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("MongoDB Connected ✅");
//   } catch (error) {
//     console.error("MongoDB Error ❌", error);
//     process.exit(1);
//   }
// };

// export default connectDB;


import mongoose from "mongoose";
import dotenv from "dotenv";

// Load env based on NODE_ENV
dotenv.config();

const connectDB = async () => {
  try {
    const {
      MONGO_USER,
      MONGO_PASS,
      MONGO_HOST,
      MONGO_PORT,
      MONGO_DB,
      MONGO_AUTH_DB
    } = process.env;

    const uri = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=${MONGO_AUTH_DB}`;

    await mongoose.connect(uri);

    console.log(`MongoDB Connected to ${MONGO_DB} `);
  } catch (error) {
    console.error("MongoDB Error ", error);
    process.exit(1);
  }
};

export default connectDB;