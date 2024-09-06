import app from "./app";
import http from "http";
import { initializePrisma } from "./config/prisma";
import { setupRedis } from "./config/redis";

async function main() {
  try {
    // Initialize Prisma
    await initializePrisma();
    await setupRedis();

    // Create HTTP server
    const server = http.createServer(app);

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
