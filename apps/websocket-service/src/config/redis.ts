import { wss, sendWSMessage } from "./websocket";
import { createClient } from "redis";

const redisClient = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });

export const setupRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis client connected");
  } else {
    console.log("Redis client already connected");
  }

  redisClient.on("error", (err) => {
    console.error("Redis client error:", err);
  });

  redisClient.subscribe("chat-messages", (message) => {
    console.log("Received message:", message);
    if (wss.clients.size === 0) return;

    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);
    } catch (error) {
      console.error("Failed to parse message:", error);
      return;
    }
    if (
      parsedMessage &&
      typeof parsedMessage === "object" &&
      parsedMessage.data
    ) {
      const { data, level } = parsedMessage;
      sendWSMessage(data, level);
    } else {
      console.error("Invalid message format:", message);
    }
  });
};
