import express from "express";
import { ENV } from "./lib/env.js";
import path from "path";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import {app, server} from "./lib/socket.js";


const PORT = ENV.PORT || 3000;

const __dirname = path.resolve();
app.use(express.json({limit:"5mb"})); // req.body
app.use(cors({origin:ENV.CLIENT_URL, credentials: true}));
app.use(cookieParser()); // req.cookies

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// make ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

server.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
  connectDB();
});