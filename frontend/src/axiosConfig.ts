import axios from "axios";

const instance = axios.create({
  baseURL: "https://hulkapps-chat-app.vercel.app",
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
