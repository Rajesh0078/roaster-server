// Import necessary modules
import express from "express";
import Ably from "ably";
import dotenv from "dotenv";
import { connectDB } from "./config/db.mjs";
import router from "./contollers/otp.mjs";
import authRouter from "./routes/authRoutes.mjs";
import bodyParser from "body-parser";

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
app.use("/api/users", router);
app.use("/api/users", authRouter);

app.get("/", (req, res) => {
  res.send("Server Started");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
