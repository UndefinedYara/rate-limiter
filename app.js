// app.js
require("dotenv").config(); // Load environment variables
const express = require("express");
const { initializeRedis } = require("./config/redis");
const rateLimiter = require("./rate_limiter/fixed_window");
const app = express();
const PORT = process.env.PORT || 3000;

let redisClient;

async function startServer() {
  await initializeRedis();
  app.use(rateLimiter.fixedWindowRateLimiter);
  app.get("/", async (req, res) => {
    return res.status(200).json({
      success: true,
      message: "pong",
    });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
