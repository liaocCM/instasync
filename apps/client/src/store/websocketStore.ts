import { WebSocketActionType, WebSocketMessageData } from '@instasync/shared';
import { create } from 'zustand';

interface WebSocketStore {
  socket: WebSocket | null;
  isConnected: boolean;
  messageListeners: ((message: WebSocketMessageData) => void)[];
  connect: (url?: string) => Promise<void>;
  disconnect: () => void;
  sendMessage: (message: string | WebSocketMessageData) => void;
  subscribe: (listener: (message: WebSocketMessageData) => void) => () => void;
  pingInterval: number | null;
  startPinging: () => void;
  stopPinging: () => void;
}

const handleGeneralWSMessage = (message: WebSocketMessageData) => {
  try {
    // Handle the message based on its type
    switch (message.type) {
      case WebSocketActionType.ADD_COMMENT:
        const photoUrl = message.data.photoUrl;
        if (photoUrl) {
          // Handle the image URL
        }
        // Handle ADD_CONTENT message
        break;
      // Add cases for different message types
      default:
        console.log('Unhandled message type:', message.type);
    }
  } catch (error) {
    console.error('Error parsing WebSocket message:', error);
  }
};

const websocketUrl =
  import.meta.env.VITE_WS_URL === '/'
    ? `wss://${location.host}/websocket/`
    : import.meta.env.VITE_WS_URL;

const useWebSocketStore = create<WebSocketStore>((set, get) => ({
  socket: null,
  isConnecting: false,
  isConnected: false,
  messageListeners: [],
  pingInterval: null,

  connect: (userToken = '') => {
    get().disconnect();
    return new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(`${websocketUrl}?token=${userToken}`);

      socket.onopen = () => {
        console.log('WebSocket connected');
        set({ isConnected: true, socket });
        // get().startPinging();
        resolve();
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        set({ isConnected: false }); // socket: null

        console.log('WebSocket reconnecting');
        get().connect(userToken);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      socket.onmessage = (event: MessageEvent) => {
        try {
          if (typeof event.data === 'string') {
            const parsedData = JSON.parse(event.data);
            if (
              parsedData &&
              typeof parsedData === 'object' &&
              'type' in parsedData
            ) {
              handleGeneralWSMessage(parsedData);
              const { messageListeners } = get();
              messageListeners.forEach((listener) => listener(parsedData));
            }
          } else {
            console.log('Received non-string message:', event.data);
          }
        } catch (error) {
          console.log('Error parsing WebSocket message:', error);
        }
      };
    });
  },

  disconnect: () => {
    const { socket } = get();
    // stopPinging();
    if (socket) {
      socket.close();
    }
  },

  sendMessage: (message: string | WebSocketMessageData) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      const messageToSend =
        typeof message === 'string' ? message : JSON.stringify(message);
      socket.send(messageToSend);
    } else {
      console.error('Cannot send message: WebSocket is not connected');
    }
  },

  subscribe: (listener) => {
    set((state) => ({
      messageListeners: [...state.messageListeners, listener]
    }));
    // Return an unsubscribe function
    return () => {
      set((state) => ({
        messageListeners: state.messageListeners.filter((l) => l !== listener)
      }));
    };
  },

  startPinging: () => {
    const pingInterval = setInterval(() => {
      const { sendMessage } = get();
      console.log('Sending ping');
      sendMessage('PING');
    }, 30 * 1000); // Send a ping every 30 seconds
    set({ pingInterval });
  },

  stopPinging: () => {
    const { pingInterval } = get();
    if (pingInterval) {
      clearInterval(pingInterval);
      set({ pingInterval: null });
    }
  }
}));

export default useWebSocketStore;
