import express from "express";
import { config } from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import redisClient from "./utils/redisClient.js";
import authRoutes from "./routes/authRoutes.js";
import chatController from "./controllers/chatController.js";
import authMiddleware from "./middlewares/authMiddleware.js";
import path from "path";

config();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

const app = express();
const server = createServer(app);

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

app.use(express.static(path.join(__dirname, "frontend/dist")));

app.get("*", function (req, res) {
  res.sendFile(join(__dirname, "frontend/dist", "index.html"));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

io.use(authMiddleware);

io.on("connection", chatController(io, redisClient));
