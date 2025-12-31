let io;

export const initSocket = (socketIO) => {
  io = socketIO;

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};

export const emitBookUpdate = (data) => {
  if (io) {
    io.emit('book:updated', data);
  }
};

export const emitLoanUpdate = (data) => {
  if (io) {
    io.emit('loan:updated', data);
  }
};

export const emitNotification = (userId, data) => {
  if (io) {
    io.to(userId.toString()).emit('notification', data);
  }
};