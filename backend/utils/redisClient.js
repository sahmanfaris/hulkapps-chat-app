const { createClient } = require("redis");
const dotenv = require("dotenv");

dotenv.config();

const redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
  },
});

redisClient.on("error", (err) => {
  console.log("Redis Client Error", err);
});

async function connectRedis() {
  await redisClient.connect();
}

connectRedis();

module.exports = redisClient;
