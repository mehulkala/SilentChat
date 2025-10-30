import {Server} from 'socket.io';
import http from 'http';
import express from 'express';
import {ENV} from './env.js';
import { socketAuthMiddleware } from '../middleware/socket.auth.middleware.js';


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [ENV.CLIENT_URL],
        credentials: true
    }
});

// apply authentication middleware
io.use(socketAuthMiddleware);

// function to check if a user is online or not
export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

// this is for storing userId to socketId mapping (for online users tracking)
const userSocketMap = {}

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.fullName}`);

    const userId = socket.user._id.toString();
    userSocketMap[userId] = socket.id;

    // io.emit() is used to send events to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", ()=>{
        console.log(`User disconnected: ${socket.user.fullName}`);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

export {io, app, server}