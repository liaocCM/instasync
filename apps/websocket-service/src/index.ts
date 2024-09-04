import dotenv from "dotenv";
import { createServer } from "http";
import { setupWebSocket } from "./config/websocket";
import { setupRedis } from "./config/redis";

async function main() {
  try {
    dotenv.config({
      path: process.env.NODE_ENV === "production" ? ".env.production" : ".env",
    });

    const server = createServer();
    setupWebSocket(server);
    await setupRedis();

    const port = process.env.PORT || 8080;
    server.listen(port, () => {
      console.log(`WebSocket service running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting the WebSocket service:", error);
  }
}

main();
