import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.ts";

import authRoutes from './routes/authRoutes.js'; // Adjust path as needed

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // change to your frontend URL later
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO Logic
// let totalUsers = 0;
// let totalChats = 0;

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);
//   totalUsers++;

//   // Notify everyone user joined
//   io.emit("userCount", totalUsers);
//   io.emit("chatCount", totalChats);

//   // When a message is sent
//   socket.on("message", (msg) => {
//     totalChats++;
//     io.emit("message", msg);
//     io.emit("chatCount", totalChats);
//   });

//   // When a user disconnects
//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//     totalUsers--;
//     io.emit("userCount", totalUsers);
//   });
// });


// Routes
app.get("/", (req, res) => {
  res.send("Server is running");
});

//Routes
app.use('/api/auth', authRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
