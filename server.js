const express = require("express");
const DBCOnfig = require("./config/DbConfig");
const authRoutes = require("./routes/AuthRoutes");
const bodyParser = require("body-parser");
const path = require("path");
const matchRoutes = require("./routes/matchesRoutes");
const chatRoutes = require("./routes/chatRoutes");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
DBCOnfig();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const port = process.env.PORT || 8000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Make io accessible to routes
app.set("io", io);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/", authRoutes);
app.use("/api/v1/", matchRoutes);
app.use("/api/v1/", chatRoutes);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("user-login", (userId) => {
    console.log(`User logged in: ${userId}`);
    socket.broadcast.emit("user-connected", { userId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server started on ${port}`);
});
