import WebSocket from "ws";
import jwt from "jsonwebtoken";
import { IncomingMessage } from "http";
import { Server as HttpServer } from "http";
import { WebSocketActionType, WebSocketMessageData } from "@instasync/shared";
import { UserRole } from "@instasync/shared";

export let wss: WebSocket.Server;

const JWT_SECRET = process.env.JWT_SECRET;

export function setupWebSocket(server: HttpServer) {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws: WebSocket, request: IncomingMessage) => {
    handleConnection(ws, request);
    ws.on("message", (message: string) => handleMessage(ws, message));
    ws.on("close", () => handleDisconnection(ws));
  });
}

function handleConnection(ws: WebSocket, request: IncomingMessage) {
  console.log("New client connected");
  const token = extractToken(request);
  if (token) {
    try {
      if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
      }
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        roles: string[];
      };
      (ws as any).userId = decoded.userId;
      (ws as any).roles = decoded.roles;
      ws.send(
        JSON.stringify({
          type: "CONNECTION_SUCCESS",
          message: "Authenticated successfully",
        })
      );
    } catch (error) {
      console.error("Invalid token:", error);
      ws.close(1008, "Invalid token");
    }
  } else {
    (ws as any).roles = [];
    ws.send(
      JSON.stringify({
        type: "CONNECTION_SUCCESS",
        message: "Connected as guest",
      })
    );
  }
}

function extractToken(request: IncomingMessage): string | null {
  const url = new URL(request.url!, `http://${request.headers.host}`);
  return url.searchParams.get("token");
}

function handleMessage(ws: WebSocket, message: string) {
  console.log("Received message:", message.toString());

  if (message.toString() === "PING") {
    ws.send("PONG");
  }

  try {
    const messageData = JSON.parse(message) as WebSocketMessageData;
    if (messageData.type === WebSocketActionType.BROADCAST_CLIENTS) {
      sendWSMessage(messageData, UserRole.ADMIN);
    }
  } catch (error) {
    console.error("Error parsing message:", error);
  }
}

function handleDisconnection(ws: WebSocket) {
  console.log("Client disconnected");
}

function hasRequiredLevel(
  client: WebSocket,
  requiredLevel: UserRole | null
): boolean {
  const roles = (client as any).roles || [];
  return !requiredLevel || roles.includes(requiredLevel);
}

export function sendWSMessage(
  messageData: WebSocketMessageData,
  level: UserRole | null = null
) {
  if (wss && wss.clients.size > 0) {
    console.log("Send message", "| level:", level, "| message:", messageData);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        if (hasRequiredLevel(client, level)) {
          client.send(JSON.stringify(messageData));
        }
      }
    });
  } else {
    console.log("No clients connected");
  }
}
