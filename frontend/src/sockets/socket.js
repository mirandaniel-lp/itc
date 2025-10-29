import { io } from "socket.io-client";
import cfg from "../config";

let socket = null;

export function initSocket() {
  if (!socket) {
    socket = io(cfg.WS_URL, {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
}

export function getSocket() {
  return socket || initSocket();
}

export function connectWithUser(userId) {
  const s = getSocket();
  if (s.connected) s.disconnect();
  s.connect();
  s.emit("auth:identify", userId);
}
