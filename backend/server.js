import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import redisClient from "./utils/redisClient.js";
import authRoutes from "./routes/authRoutes.js";
import chatController from "./controllers/chatController.js";
import authMiddleware from "./middlewares/authMiddleware.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

const allowCrossDomain = (req, res, next) => {
  res.header(
    `Access-Control-Allow-Origin`,
    `https://hulkapps-chat-app-cjm7.vercel.app`
  );
  res.header(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
  res.header(`Access-Control-Allow-Headers`, `Content-Type`);
  next();
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://hulkapps-chat-app-cjm7.vercel.app",
  },
});

app.use(allowCrossDomain);

app.use(cors({ origin: "https://hulkapps-chat-app-cjm7.vercel.app" }));
app.use(express.json());
app.use("/api/auth", authRoutes);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

io.use(authMiddleware);

io.on("connection", chatController(io, redisClient));
