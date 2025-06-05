// import express from "express";
// import dotenv from "dotenv";

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 8000;

// app.get("/", (req, res) => {
//   res.send("Server is running...");
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });


import mongoose from "mongoose";

;( async () => {
  try {
    mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
  }
})