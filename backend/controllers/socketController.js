// Updated socketController.js
import Message from "../models/Message.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Import User model for fallback name fetch

// In-memory storage for online users (use Redis for production)
const onlineUsers = new Map(); // key: socket.id, value: { userId, username, room }

// Middleware to authenticate socket connection
const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Attach user to socket (id, email, name if present)
    
    // Fallback: Fetch user name if not in token
    if (!decoded.name) {
      const user = await User.findById(decoded.id).select('name');
      if (user) {
        socket.user.name = user.name;
      } else {
        socket.user.name = decoded.email; // Ultimate fallback
      }
    }
    
    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid token"));
  }
};

// Handle connection and events
const handleConnection = (io, socket) => {
  // console.log(`User ${socket.user.id} connected with socket ${socket.id}`);

  // Add to online users with robust username
  const username = socket.user.name || socket.user.email;
  onlineUsers.set(socket.id, {
    userId: socket.user.id,
    username,
    room: "global",
  });

  // Emit total online users to all clients
  io.emit("userCountUpdate", onlineUsers.size);

  // Join global room
  socket.join("global");

  // Notify others of user join (exclude the joining user)
  socket.to("global").emit("userJoined", {
    userId: socket.user.id,
    username,
  });

  // Send recent chat history (last 50 messages)
  Message.find({ room: "global" })
    .sort({ timestamp: 1 })  // Ascending (as you confirmed works)
    .limit(50)
    .populate("sender", "name initials")
    .then((messages) => {
      // Fallback for orphaned senders
      messages.forEach((msg) => {
        if (!msg.sender) {
          msg.sender = { name: 'Deleted User', initials: 'DU' };
        }
      });
      socket.emit("chatHistory", messages); // Now safe, ascending order
    })
    .catch((err) => console.error("Error fetching history:", err));

  // In sendMessage event
  socket.on("sendMessage", async (messageData) => {
    const { content } = messageData;
    if (!content.trim()) return;

    try {
      // Save to MongoDB
      const message = new Message({
        sender: socket.user.id,
        room: "global",
        content: content.trim(),
      });
      await message.save();

      // Populate sender info
      await message.populate("sender", "name initials");

      // Fallback for orphaned senders (rare here, but for consistency)
      if (!message.sender) {
        message.sender = { name: 'Deleted User', initials: 'DU' };
      }

      // Emit to global room
      io.to("global").emit("newMessage", message);

      // Emit updated chat count
      const totalChats = await Message.countDocuments({ room: "global" });
      io.to("global").emit("chatCountUpdate", totalChats);
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("messageError", { message: "Failed to send message" });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    // console.log(`User ${socket.user.id} disconnected`);
    const disconnectedUser = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);
    io.emit("userCountUpdate", onlineUsers.size);
    // Notify room of user left (exclude the disconnecting user, but since disconnected, to room is fine)
    if (disconnectedUser) {
      const leaveUsername = disconnectedUser.username || 'Unknown User';
      socket.to("global").emit("userLeft", {
        userId: disconnectedUser.userId,
        username: leaveUsername,
      });
    }
  });
};

export { authenticateSocket, handleConnection, onlineUsers };