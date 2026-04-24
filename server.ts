import dotenv from "dotenv";
dotenv.config(); // Must be explicitly called first

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { WebcastPushConnection } from "tiktok-live-connector";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fs from "fs";

import { PrismaClient } from '@prisma/client';
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";
import multer from "multer";

const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/tikgifty";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "tikgifty_production_secret_8822";

// (Removed MongoDB models and connection logic as we are using Prisma)
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Connected to PostgreSQL via Prisma");
  } catch (err: any) {
    console.error("❌ Database connection error:", err.message);
  }
};

connectDB();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  
  // Trust proxy for Nginx (Required for rate limiting behind a reverse proxy)
  app.set('trust proxy', 1);
  
  // Security & Performance Middleware
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
    xFrameOptions: false, // Critical for OBS Browser source and Iframe preview
  }));
  app.use(compression());
  app.use(morgan('combined'));
  const allowedOrigins = [
    'https://tikgifty.com',
    'https://www.tikgifty.com',
    'http://tikgifty.com',
    'http://www.tikgifty.com'
  ];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
  app.use(express.json({ limit: '1mb' })); // Limit body size

  // --- Multer Setup ---
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'image/jpeg', 'image/png', 'image/gif'];
      const allowedExtensions = ['.mp3', '.wav', '.ogg', '.jpg', '.jpeg', '.png', '.gif'];
      
      const ext = path.extname(file.originalname).toLowerCase();
      
      if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type or extension. Only audio and images are allowed.'));
      }
    }
  });

  // Serve uploads statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    validate: { trustProxy: false }, // We've set app.set('trust proxy', 1), so we can disable this validation
    message: { error: "Too many requests, please try again later." }
  });
  app.use("/api/", limiter);

  const PORT = 3000;
  const connections = new Map<string, WebcastPushConnection>();

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      
      try {
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return res.status(403).json({ error: "User not found or deleted" });
        req.user = user;
        next();
      } catch (dbErr) {
        return res.status(500).json({ error: "Internal Server Error" });
      }
    });
  };

  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, displayName, firstName, lastName, tiktokUsername, phoneCountryCode, phone, referredBy } = req.body;
      
      // Basic Input Validation
      if (!email || typeof email !== 'string' || email.length > 100 || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      if (!password || typeof password !== 'string' || password.length < 6 || password.length > 100) {
        return res.status(400).json({ error: "Password must be between 6 and 100 characters" });
      }
      if (displayName && (typeof displayName !== 'string' || displayName.length > 50)) {
        return res.status(400).json({ error: "Display name is too long" });
      }

      const userExist = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (userExist) return res.status(400).json({ error: "Email already exists" });

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          displayName,
          firstName,
          lastName,
          tiktokUsername,
          phoneCountryCode,
          phone,
          referredBy
        }
      });
      
      const settings = await prisma.settings.create({
        data: { userId: user.id }
      });

      const token = jwt.sign({ id: user.id, email: user.email, plan: user.plan }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, firstName: user.firstName, plan: user.plan } });
    } catch (err: any) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email, plan: user.plan }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          displayName: user.displayName, 
          plan: user.plan,
          isSubscribed: user.isSubscribed 
        } 
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Subscription & Plan Routes ---
  app.get("/api/user/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });
      if (user) {
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  });

  // --- Settings Routes ---
  app.get("/api/settings/public/:username", async (req, res) => {
    try {
      const user = await prisma.user.findFirst({
        where: { tiktokUsername: req.params.username }
      });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const settings = await prisma.settings.findUnique({
        where: { userId: user.id }
      });
      // We only return safe settings for the overlay
      if (settings) {
         res.json({
           layout: settings.layout,
           actions: settings.actions,
           giftSettings: settings.giftSettings,
           listSettings: settings.listSettings,
           pixelConquest: settings.pixelConquest
         });
      } else {
         res.json({});
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/settings", authenticateToken, async (req: any, res) => {
    try {
      const settings = await prisma.settings.findUnique({
        where: { userId: req.user.id }
      });
      res.json(settings || { userId: req.user.id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/settings", authenticateToken, async (req: any, res) => {
    try {
      const { listSettings, giftSettings, layout, actions, overlayPresets, beybladeLeaderboard, pixelConquest } = req.body;
      const updateData: any = { updatedAt: new Date() };
      
      if (listSettings !== undefined) updateData.listSettings = listSettings;
      if (giftSettings !== undefined) updateData.giftSettings = giftSettings;
      if (layout !== undefined) updateData.layout = layout;
      if (actions !== undefined) updateData.actions = actions;
      if (overlayPresets !== undefined) updateData.overlayPresets = overlayPresets;
      if (beybladeLeaderboard !== undefined) updateData.beybladeLeaderboard = beybladeLeaderboard;
      if (pixelConquest !== undefined) updateData.pixelConquest = pixelConquest;

      const settings = await prisma.settings.upsert({
        where: { userId: req.user.id },
        update: updateData,
        create: { ...updateData, userId: req.user.id }
      });
      res.json({ status: "ok", settings });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Upload Route ---
  app.post("/api/upload", authenticateToken, upload.single('file'), (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  // Socket.io for TikTok Live
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? allowedOrigins : '*',
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  const requestStateLimits = new Map<string, number>();

  io.on("connection", (socket) => {
    socket.on("join-room", (username: string) => {
      socket.join(`room_${username}`);
    });

    socket.on("sync-state", (data: { username: string, state: any }) => {
      // Security: Only the user who owns the TikTok connection (The Dashboard) can send state syncs.
      if (socket.data.isHostFor !== data.username) return;
      socket.to(`room_${data.username}`).emit("state-sync", data.state);
    });

    socket.on("request-state", (username: string) => {
      // Security: Prevent request-state ping storms (Rate Limit: 1 per 2 seconds per room)
      const now = Date.now();
      const last = requestStateLimits.get(username) || 0;
      if (now - last < 2000) return;
      requestStateLimits.set(username, now);
      
      socket.to(`room_${username}`).emit("request-state");
    });

    socket.on("connect-tiktok", async (username: string, token?: string) => {
      try {
        let userId = null;
        if (token) {
          try {
            const decoded: any = jwt.verify(token, JWT_SECRET);
            userId = decoded.id;
            socket.data.isHostFor = username; // Mark as authorized host for state syncing
          } catch (e) {
            console.warn("Invalid token provided to connect-tiktok");
            return socket.emit("tiktok-error", "Authentication failed"); // Fail fast if token is bad
          }
        } else if (!process.env.PUBLIC_DEMO_MODE) {
           socket.data.isHostFor = username; // If not in strict mode, allow them to act as host
        }

        if (connections.has(socket.id)) {
          connections.get(socket.id)?.disconnect();
          connections.delete(socket.id);
        }

        const tiktokConnection = new WebcastPushConnection(username, {
          processInitialData: true,
          enableExtendedGiftInfo: true,
          requestPollingIntervalMs: 2000
        });
        
        tiktokConnection.connect().then(async state => {
          let profilePic = '';
          try {
            if (state.roomInfo?.owner?.avatar_thumb?.url_list?.length > 0) {
              profilePic = state.roomInfo.owner.avatar_thumb.url_list[0];
            } else if (state.roomInfo?.owner?.avatar_url?.url_list?.length > 0) {
              profilePic = state.roomInfo.owner.avatar_url.url_list[0];
            }
            
            if (profilePic && userId) {
              await prisma.user.update({
                where: { id: userId },
                data: { photoURL: profilePic, tiktokUsername: username }
              });
            }
          } catch (e) {
            console.error("Failed to extract profile pic", e);
          }
          
          socket.join(`room_${username}`);
          io.to(`room_${username}`).emit("tiktok-connected", { roomId: state.roomId, username, profilePic });
        }).catch(err => {
          console.error(`TikTok Connection Error for ${username}:`, err);
          socket.emit("tiktok-error", err.toString() || "Could not connect to TikTok. Make sure the user is LIVE.");
        });

        // Forward events
        tiktokConnection.on('chat', data => io.to(`room_${username}`).emit('chat', data));
        tiktokConnection.on('gift', data => io.to(`room_${username}`).emit('gift', data));
        tiktokConnection.on('like', data => io.to(`room_${username}`).emit('like', data));
        tiktokConnection.on('social', data => io.to(`room_${username}`).emit('social', data));
        tiktokConnection.on('member', data => io.to(`room_${username}`).emit('member', data));
        tiktokConnection.on('questionNew', data => io.to(`room_${username}`).emit('question', data));
        
        tiktokConnection.on('disconnected', () => {
          io.to(`room_${username}`).emit('tiktok-disconnected');
          connections.delete(socket.id);
        });

        tiktokConnection.on('streamEnd', () => {
          io.to(`room_${username}`).emit('tiktok-stream-ended');
          connections.delete(socket.id);
        });
        
        connections.set(socket.id, tiktokConnection);
      } catch (err) {
        socket.emit("tiktok-error", "Authentication failed");
      }
    });

    socket.on("disconnect-tiktok", () => {
      if (connections.has(socket.id)) {
        connections.get(socket.id)?.disconnect();
        connections.delete(socket.id);
        socket.emit("tiktok-disconnected");
      }
    });

    socket.on("disconnect", () => {
      if (connections.has(socket.id)) {
        connections.get(socket.id)?.disconnect();
        connections.delete(socket.id);
      }
    });
  });

  // API 404 Handler (Prevent SPA fallback from serving HTML for missing API routes)
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Vite / Static Files
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
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
