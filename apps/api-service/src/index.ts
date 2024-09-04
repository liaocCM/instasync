import app from "./app";
// import dotenv from "dotenv";
import http from "http";
// import { setupWebSocket } from "./websocket";
import { initializePrisma } from "./config/prisma";
import { setupRedis } from "./config/redis";
// import path from "path";

async function main() {
  try {
    // Load environment variables
    // dotenv.config({
    //   path: ".env.production",
    // });

    // Initialize Prisma
    await initializePrisma();
    await setupRedis();

    // Create HTTP server
    const server = http.createServer(app);

    // Setup WebSocket
    // setupWebSocket(server);
    // console.log(`WebSocket server is ready for connections`);

    // Start the server
    const port = process.env.PORT || 8080;
    server.listen(port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Unable to start the server:", error);
    process.exit(1);
  }
}

main();
