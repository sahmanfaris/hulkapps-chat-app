const chatController = (io, redisClient) => (socket) => {
  console.log("a user connected", socket.user);

  socket.on("getRooms", async () => {
    const roomsList = await getRoomsList(redisClient);
    socket.emit("roomsList", roomsList);
  });

  socket.on("joinRoom", async (room) => {
    socket.join(room);
    const messages = await getMessages(redisClient, room);
    socket.emit("previousMessages", messages);

    const participants = getRoomParticipants(io, room);
    io.to(room).emit("userJoined", { room, participants });
  });

  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    console.log(`user ${socket.user.id} left room ${room}`);

    const participants = getRoomParticipants(io, room);
    io.to(room).emit("userLeft", { room, participants });
  });

  socket.on("getMessages", async (room) => {
    const messages = await getMessages(redisClient, room);
    socket.emit("previousMessages", messages);
  });

  socket.on("message", async (data) => {
    const { room, message } = data;
    const userId = socket.user.id;
    const username = socket.user.username;

    const key = `rateLimit:${userId}`;
    const currentCount = await redisClient.incr(key);
    if (currentCount === 1) {
      await redisClient.expire(key, 60); // set expiration to 60 seconds
    }
    if (currentCount > 5) {
      socket.emit(
        "errorMessage",
        "Rate limit exceeded. Please wait before sending more messages."
      );
      return;
    }

    const messageData = {
      user: { userId, username },
      message,
      timestamp: new Date(),
    };
    await storeMessage(redisClient, room, messageData);

    io.to(room).emit("message", messageData);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
};

const storeMessage = async (redisClient, room, message) => {
  const messageData = JSON.stringify(message);
  try {
    await redisClient.lPush(`chat:${room}`, messageData);
    console.log(`Message: ${messageData} stored in Redis under chat:${room}`);
  } catch (err) {
    console.error("Error storing message:", err);
  }
};

const getMessages = async (redisClient, room, count = 10) => {
  try {
    console.log(`Retrieving ${count} messages from Redis under chat:${room}`);
    const messages = await redisClient.lRange(`chat:${room}`, 0, count - 1);
    return messages.reverse().map((msg) => JSON.parse(msg));
  } catch (err) {
    console.error("Error retrieving messages:", err);
    return [];
  }
};

const getRoomParticipants = (io, room) => {
  const roomClients = io.sockets.adapter.rooms.get(room);
  if (roomClients) {
    return Array.from(roomClients).map(
      (clientId) => io.sockets.sockets.get(clientId).user
    );
  }
  return [];
};

const getRoomsList = async (redisClient) => {
  const rooms = await redisClient.keys("chat:*");

  const chats = await Promise.all(
    rooms.map(async (room) => {
      const roomName = room.split(":")[1];
      const participants = await redisClient.lLen(`chat:${roomName}`);
      return { name: roomName };
    })
  );

  return chats;
};

export default chatController;
