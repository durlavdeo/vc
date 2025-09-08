const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});

const uidToSocketIdMap = new Map();
const socketIdToUidMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket connected : ${socket.id}`);
  socket.on("join-room", (data) => {
    const { uid, roomId } = data;
    socketIdToUidMap.set(socket.id, uid);
    uidToSocketIdMap.set(uid, socket.id);
    io.to(roomId).emit("user-joined", { uid, sid: socket.id });
    socket.join(roomId);
    io.to(socket.id).emit("join-room", data);
  });

  socket.on("call-user", (data) => {
    const { to, offer } = data;
    io.to(to).emit("incomming-call", { from: socket.id, offer });
  });

  socket.on("call-accepted", ({ to, answer }) => {
    io.to(to).emit("call-accepted", { from: socket.id, answer });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("end-call", ({ to }) => {
    io.to(to).emit("call-ended", { from: socket.id });
  });
});
