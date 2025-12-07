const { client: redisClient } = require("../config/redis");

module.exports = {
  fixedWindowRateLimiter: async (req, res, next) => {
    const WINDOW_SIZE_IN_SECONDS = 60;
    const MAX_REQUESTS = 5;

    const userId = req.headers["user_id"] || "anonymous";
    const key = `userId:${userId}`;

    const data = await redisClient.hGetAll(key);

    const currentTime = Date.now();

    if (!data.createdAt) {
      await redisClient.hSet(key, {
        createdAt: currentTime,
        count: 1,
      });
      await redisClient.expire(key, WINDOW_SIZE_IN_SECONDS);
      return next();
    }

    const timeDifference = currentTime - Number(data.createdAt);

    if (timeDifference > WINDOW_SIZE_IN_SECONDS * 1000) {
      await redisClient.hSet(key, {
        createdAt: currentTime,
        count: 1,
      });
      await redisClient.expire(key, WINDOW_SIZE_IN_SECONDS);
      return next();
    }

    const count = Number(data.count);

    if (count >= MAX_REQUESTS) {
      return res.status(429).json({ success: false, message: "Rate limited" });
    }

    await redisClient.hIncrBy(key, "count", 1);

    return next();
  },
};
