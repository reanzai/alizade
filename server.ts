import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { WebcastPushConnection } from "tiktok-live-connector";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fs from "fs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "tikgifty_secret_key_123";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tikgifty";

// --- MongoDB Models ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: String,
  photoURL: String,
  isSubscribed: { type: Boolean, default: false },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const settingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  listSettings: Object,
  giftSettings: Object,
  layout: Object,
  beybladeLeaderboard: Array,
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Settings = mongoose.model('Settings', settingsSchema);

// --- Database Connection ---
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(cors());
  app.use(express.json());

  const PORT = 3000;

  // Store active connections
  const connections = new Map<string, WebcastPushConnection>();

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, displayName } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword, displayName });
      await user.save();
      
      // Initialize empty settings for new user
      const settings = new Settings({ userId: user._id, listSettings: {}, giftSettings: {}, layout: {} });
      await settings.save();

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
      res.json({ token, user: { id: user._id, email: user.email, displayName: user.displayName } });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error("Database connection is not ready. Please check if MongoDB is running.");
      }
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
      res.json({ token, user: { id: user._id, email: user.email, displayName: user.displayName, isSubscribed: user.isSubscribed } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Settings Routes ---
  app.get("/api/settings", authenticateToken, async (req: any, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        // Fallback for demo/preview if DB is down
        return res.json({ 
          userId: req.user.id,
          listSettings: {},
          giftSettings: {},
          layout: {},
          note: "Running in offline mode (MongoDB not connected)"
        });
      }
      const settings = await Settings.findOne({ userId: req.user.id });
      res.json(settings || {});
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/settings", authenticateToken, async (req: any, res) => {
    try {
      const settings = await Settings.findOneAndUpdate(
        { userId: req.user.id },
        { ...req.body, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      res.json({ status: "ok", settings });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/gift-settings", authenticateToken, async (req: any, res) => {
    try {
      const settings = await Settings.findOne({ userId: req.user.id });
      res.json(settings?.giftSettings || {});
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/gift-settings", authenticateToken, async (req: any, res) => {
    try {
      const settings = await Settings.findOneAndUpdate(
        { userId: req.user.id },
        { giftSettings: req.body, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      res.json({ status: "ok", settings: settings.giftSettings });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/beyblade/leaderboard", authenticateToken, async (req: any, res) => {
    try {
      const settings = await Settings.findOneAndUpdate(
        { userId: req.user.id },
        { beybladeLeaderboard: req.body, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      res.json({ status: "ok", leaderboard: settings.beybladeLeaderboard });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("connect-tiktok", (username: string) => {
      console.log(`Connecting to TikTok user: ${username}`);

      // Disconnect existing if any for this socket (simplified)
      if (connections.has(socket.id)) {
        connections.get(socket.id)?.disconnect();
        connections.delete(socket.id);
      }

      const tiktokConnection = new WebcastPushConnection(username);

      console.log(`Attempting to connect to TikTok user: ${username}...`);

      tiktokConnection.connect().then(state => {
        console.info(`Successfully connected to TikTok user: ${username} (roomId: ${state.roomId})`);
        socket.emit("tiktok-connected", { roomId: state.roomId, username });
      }).catch(err => {
        console.error(`Failed to connect to TikTok user: ${username}`, err);
        socket.emit("tiktok-error", err.toString());
      });

      // Event listeners
      tiktokConnection.on('chat', data => {
        console.log(`[Chat] ${data.uniqueId}: ${data.comment}`);
        socket.emit('chat', { ...data, username });
      });

      tiktokConnection.on('gift', data => {
        console.log(`[Gift] ${data.uniqueId} sent ${data.giftName} (x${data.repeatCount})`);
        socket.emit('gift', { ...data, username });
      });

      tiktokConnection.on('social', data => {
        console.log(`[Social] ${data.uniqueId} ${data.displayType || data.label}`);
        socket.emit('social', { ...data, username });
      });

      tiktokConnection.on('like', data => {
        console.log(`[Like] ${data.uniqueId} sent ${data.likeCount} likes`);
        socket.emit('like', { ...data, username });
      });

      tiktokConnection.on('questionNew', data => {
        socket.emit('question', { ...data, username });
      });

      tiktokConnection.on('member', data => {
        socket.emit('member', { ...data, username });
      });

      tiktokConnection.on('disconnected', () => {
        console.log('TikTok connection disconnected');
        socket.emit('tiktok-disconnected');
      });

      tiktokConnection.on('streamEnd', () => {
        console.log('TikTok stream ended');
        socket.emit('tiktok-stream-ended');
      });

      connections.set(socket.id, tiktokConnection);
    });

    socket.on("disconnect-tiktok", () => {
      if (connections.has(socket.id)) {
        connections.get(socket.id)?.disconnect();
        connections.delete(socket.id);
        socket.emit("tiktok-disconnected");
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      if (connections.has(socket.id)) {
        connections.get(socket.id)?.disconnect();
        connections.delete(socket.id);
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
