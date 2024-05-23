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

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/api/auth", authRoutes);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

io.use(authMiddleware);

io.on("connection", chatController(io, redisClient));
