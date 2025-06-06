import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

/*
import express from "express"
const app = express()
import mongoose from "mongoose";

;( async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    app.on("error", (error) => {
      console.log("Error:", error);
      throw error
    })
    app.listen(process.env.PORT, () => {
      console.log('App is listening on port ${process.env.PORT}');
    })


  } catch (error) {
    console.error("Error:", error)
    throw err
  }
})
*/