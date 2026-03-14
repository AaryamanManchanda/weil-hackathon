import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SOCKET_URL ?? "http://127.0.0.1:8000", {
  autoConnect: false,
  transports: ["websocket"],
});
