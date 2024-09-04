import {
  UserRole,  
  WebSocketMessageData,
} from "@instasync/shared";
import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

export const setupRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis client connected");
  } else {
    console.log("Redis client already connected");
  }
};

const publishMessage = async (channel: string, message: string) => {
  try {
    const count = await redisClient.publish(channel, message);
    console.log(
      `Message published to ${count} subscribers on channel ${channel}`
    );
  } catch (err) {
    console.error("Failed to publish message:", err);
  }
};

export const pubWSMessage = async (
  data: WebSocketMessageData,
  level: UserRole | null = null
) => {
  try {
    await publishMessage("chat-messages", JSON.stringify({ data, level }));
  } catch (err) {
    console.error("Failed to publish message:", err);
  }
};

export default redisClient;
