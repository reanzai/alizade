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
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";
import multer from "multer";
import mongoSanitize from "express-mongo-sanitize";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "tikgifty_production_secret_8822";
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tikgifty";

if (!MONGODB_URI.startsWith("mongodb://") && !MONGODB_URI.startsWith("mongodb+srv://")) {
  console.warn(`⚠️ Invalid MONGODB_URI scheme detected ("${MONGODB_URI}"). Falling back to default local MongoDB URI.`);
  MONGODB_URI = "mongodb://127.0.0.1:27017/tikgifty";
}

// --- MongoDB Models ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  displayName: String,
  photoURL: String,
  plan: { type: String, enum: ['free', 'pro', 'admin'], default: 'free' },
  subscriptionExpires: { type: Date, default: null },
  isSubscribed: { type: Boolean, default: false },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const settingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  listSettings: { type: Object, default: {} },
  giftSettings: { type: Object, default: {} },
  layout: { type: Object, default: {} },
  actions: { type: Array, default: [] },
  overlayPresets: { type: Array, default: [] },
  beybladeLeaderboard: { type: Array, default: [] },
  pixelConquest: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Settings = mongoose.model('Settings', settingsSchema);

// --- Database Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err: any) {
    const isLocal = MONGODB_URI.includes('127.0.0.1') || MONGODB_URI.includes('localhost');
    
    if (isLocal) {
      console.log("ℹ️ Local MongoDB not detected. Running in 'Guest Mode' (Auth and Cloud Settings disabled).");
      console.log("💡 To enable cloud features, add a remote MONGODB_URI (e.g., MongoDB Atlas) to your environment variables.");
    } else {
      console.error("❌ MongoDB connection error:", err.message);
    }
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
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false, // Disable for Vite dev compatibility, enable in production
  }));
  app.use(mongoSanitize()); // Prevent NoSQL injection
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
  app.use(express.json({ limit: '10kb' })); // Limit body size

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
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only audio and images are allowed.'));
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

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ error: "Database offline. Self-hosted registration is currently unavailable." });
      }
      const { email, password, displayName } = req.body;
      
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) return res.status(400).json({ error: "Email already exists" });

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({ email, password: hashedPassword, displayName });
      await user.save();
      
      const settings = new Settings({ userId: user._id });
      await settings.save();

      const token = jwt.sign({ id: user._id, email: user.email, plan: user.plan }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user._id, email: user.email, displayName: user.displayName, plan: user.plan } });
    } catch (err: any) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      if (mongoose.connection.readyState !== 1) throw new Error("Database offline");
      
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user._id, email: user.email, plan: user.plan }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ 
        token, 
        user: { 
          id: user._id, 
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
      const user = await User.findById(req.user.id).select("-password");
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  });

  // --- Settings Routes ---
  app.get("/api/settings", authenticateToken, async (req: any, res) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.json({ userId: req.user.id, listSettings: {}, giftSettings: {}, note: "Offline mode" });
      }
      const settings = await Settings.findOne({ userId: req.user.id });
      res.json(settings || {});
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

      const settings = await Settings.findOneAndUpdate(
        { userId: req.user.id },
        { $set: updateData },
        { upsert: true, new: true }
      );
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

  io.on("connection", (socket) => {
    socket.on("join-room", (username: string) => {
      socket.join(`room_${username}`);
    });

    socket.on("sync-state", (data: { username: string, state: any }) => {
      socket.to(`room_${data.username}`).emit("state-sync", data.state);
    });

    socket.on("request-state", (username: string) => {
      socket.to(`room_${username}`).emit("request-state");
    });

    socket.on("connect-tiktok", async (username: string, token: string) => {
      try {
        // Verify user plan for restrictions
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) return socket.emit("tiktok-error", "User not found");

        // Example restriction: Free users can only connect for 30 mins
        // (Logic can be added here)

        if (connections.has(socket.id)) {
          connections.get(socket.id)?.disconnect();
          connections.delete(socket.id);
        }

        const tiktokConnection = new WebcastPushConnection(username);
        
        tiktokConnection.connect().then(async state => {
          let profilePic = '';
          try {
            if (state.roomInfo?.owner?.avatar_thumb?.url_list?.length > 0) {
              profilePic = state.roomInfo.owner.avatar_thumb.url_list[0];
            } else if (state.roomInfo?.owner?.avatar_url?.url_list?.length > 0) {
              profilePic = state.roomInfo.owner.avatar_url.url_list[0];
            }
            
            if (profilePic) {
              await User.findByIdAndUpdate(decoded.id, { photoURL: profilePic, displayName: username });
            }
          } catch (e) {
            console.error("Failed to extract profile pic", e);
          }
          
          socket.join(`room_${username}`);
          io.to(`room_${username}`).emit("tiktok-connected", { roomId: state.roomId, username, profilePic });
        }).catch(err => {
          socket.emit("tiktok-error", err.toString());
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
