import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import rateLimit from 'express-rate-limit';


const app = express()

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 🛡️ CORS Configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// 🧠 Body Parsers
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))

// 📂 Static Files and Cookie Parsing
app.use(express.static("public"))
app.use(cookieParser()) // Req -> cookie Access

// 🚏 Routes Import & Mounting
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users", userRouter) 
// http://localhost:5000/api/v1/users/register

// app.get("/", (req, res) => {
//   res.send("Server is working!");
// });


export {app}  // (OR) export default app