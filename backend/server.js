import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.ts";

import authRoutes from './routes/authRoutes.js';
import { authenticateSocket, handleConnection } from "./controllers/socketController.js";

dotenv.config();

const app = express();
const server = http.createServer(app);


connectDB();

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.get("/", (req, res) => {
  res.send("Server is running");
});

//Routes
app.use('/api/auth', authRoutes);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*", // change to your frontend URL later
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

global.io = io;


// Authenticate all connections
io.use(authenticateSocket);

// Handle connections
io.on("connection", (socket) => {
  handleConnection(io, socket);
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
