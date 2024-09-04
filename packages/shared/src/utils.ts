import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to create a WebSocket message
// export function createWebSocketMessage<T extends WebSocketActionType, D>(
//   type: T,
//   data: D
// ): WebSocketMessage<T, D> {
//   return {
//     type,
//     data: {
//       ...data,
//       timestamp: Date.now(),
//     },
//   };
// }
