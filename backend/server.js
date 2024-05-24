const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const redisClient = require("./utils/redisClient.js");
const authRoutes = require("./routes/authRoutes.js");
const chatController = require("./controllers/chatController.js");
const authMiddleware = require("./middlewares/authMiddleware.js");

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://hulkapps-chat-app-cjm7.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "https://hulkapps-chat-app-cjm7.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

io.use(authMiddleware);

io.on("connection", chatController(io, redisClient));
