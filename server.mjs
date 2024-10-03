// Import necessary modules
import express from "express";
import Ably from "ably";
import dotenv from "dotenv";
import { connectDB } from "./config/db.mjs";
import authRouter from "./routes/authRoutes.mjs";
import bodyParser from "body-parser";
import resgisterRouter from "./contollers/registerOTP.mjs";
import loginRouter from "./contollers/loginOTP.mjs";
import { chatRouter } from "./routes/chatRoute.mjs";

// Load environment variables
dotenv.config();

// Initialize Express and Ably
const app = express();
const ablyRealtime = new Ably.Realtime({
  key: process.env.ABLY_API_KEY,
});
// Connect to MongoDB
connectDB();

app.locals.ablyRealtime = ablyRealtime;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Define Routes
app.use("/api/users", resgisterRouter);
app.use("/api/users", loginRouter);
app.use("/api/users", authRouter);
app.use("/api/chat", chatRouter);

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Server Started");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
