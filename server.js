import express from "express";
import { Server } from "socket.io";
import http from "http";
import { ACTION } from "./Actions.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(express.static("dist"));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    
})

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};
const roomCodeMap = {}; // 🧠 Save the latest code for each room

function getAllConnectedClients(roomID) {
  return Array.from(io.sockets.adapter.rooms.get(roomID) || []).map(
    (socketID) => ({
      socketID,
      username: userSocketMap[socketID],
    })
  );
}

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // 🔹 Handle join
  socket.on(ACTION.JOIN, ({ roomID, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomID);

    const clients = getAllConnectedClients(roomID);
    console.log("🧩 Clients in room", roomID, clients);

    // Notify everyone (including new one)
    io.to(roomID).emit(ACTION.JOINED, {
      clients,
      username,
      socketID: socket.id,
    });

    // 🧠 Send the latest code if it exists
    if (roomCodeMap[roomID]) {
      io.to(socket.id).emit(ACTION.CODE_CHANGE, { code: roomCodeMap[roomID] });
    }
  });

  // 🔹 When a user edits code
  socket.on(ACTION.CODE_CHANGE, ({ roomID, code }) => {
    if (!roomID) return;
    roomCodeMap[roomID] = code; // Save latest code
    socket.to(roomID).emit(ACTION.CODE_CHANGE, { code }); // Broadcast to everyone else
  });

  // 🔹 Manual sync request (fallback)
  socket.on(ACTION.SYNC_CODE, ({ socketID, roomID }) => {
    const savedCode = roomCodeMap[roomID];
    if (savedCode) {
      io.to(socketID).emit(ACTION.CODE_CHANGE, { code: savedCode });
    }
  });

  // 🔹 Handle disconnects
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomID) => {
      socket.to(roomID).emit(ACTION.DISCONNECTED, {
        socketID: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
