import { Server } from "socket.io";

let io = null;

export function initSockets(server) {
  io = new Server(server, {
    cors: { origin: "http://localhost:8080", credentials: true },
  });
  io.on("connection", (socket) => {
    socket.on("auth:identify", (userId) => {
      try {
        socket.join(`user:${userId}`);
      } catch {}
    });
  });
}

export function emitToUsers(userIds, event, payload) {
  if (!io) return;
  for (const uid of userIds) {
    io.to(`user:${uid}`).emit(event, payload);
  }
}
