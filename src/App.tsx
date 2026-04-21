import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Settings, 
  MessageSquare, 
  Gift, 
  UserPlus, 
  Heart, 
  Play, 
  Square, 
  ExternalLink,
  Layout,
  Terminal,
  Activity,
  Zap,
  Volume2,
  VolumeX,
  Bell,
  Search,
  Trophy,
  User,
  Filter,
  X,
  Plus,
  Crown,
  LogOut,
  LogIn,
  ShieldCheck,
  Copy,
  Check,
  Globe,
  Cpu,
  BarChart3,
  Layers,
  Monitor,
  Share2,
  Eye,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Music,
  Twitter,
  Trash2,
  Mic,
  Edit3,
  Gamepad2,
  Disc,
  Shield,
  CreditCard,
  Zap as PowerIcon,
  Flame,
  Snowflake,
  Orbit,
  Ghost,
  Save,
  Download,
  Upload,
  MicOff,
  Map as MapIcon,
  Menu,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useTranslation } from 'react-i18next';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

dayjs.extend(relativeTime);
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  handleFirestoreError,
  OperationType
} from './firebase';
import { PixelConquestDashboard, PixelConquestOverlay, PixelConquestState } from './components/PixelConquest';
import { VotingGameDashboard, VotingGameOverlay, VotingGameState } from './components/VotingGame';
import { ActionsAndEvents } from './components/ActionsAndEvents';
import { Section } from './components/Section';

// --- Types ---
export interface TikTokAction {
  id: string;
  name: string;
  type: 'alert' | 'sound' | 'animation' | 'tts';
  screen: string;
  duration: number;
  animation: string;
  imageUrl: string;
  soundUrl: string;
  videoUrl: string;
  description: string;
  ttsEnabled?: boolean;
  ttsTemplate?: string;
  ttsVoice?: string;
  ttsSoundEffect?: string;
  textColor?: string;
  fontSize?: string;
}

export interface EventTimer {
  id: string;
  active: boolean;
  intervalMinutes: number;
  actionId: string;
}

export interface TikTokEventTrigger {
  id: string;
  active: boolean;
  user: string;
  triggerType: 'Follow' | 'Gift' | 'Like' | 'Subscribe' | 'Share' | 'Join';
  triggerValue?: string; // e.g. "Rose" for Gift, or "100" for Likes
  actionIds: string[];
  minCount?: number;
  isStreak?: boolean;
}

interface OverlayElement {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  visible: boolean;
}

interface OverlayLayout {
  stats: OverlayElement;
  goals: OverlayElement;
  events: OverlayElement;
  alerts: OverlayElement;
}

interface OverlayPreset {
  id: string;
  name: string;
  layout: OverlayLayout;
  selectedTheme: 'minimal' | 'vibrant' | 'dark' | 'neon' | 'cyberpunk' | 'glassmorphism';
  font: string;
  accentColor: string;
}

interface OverlayScreen {
  id: string;
  name: string;
  maxQueue: number;
  status: 'Ready' | 'Offline';
}

interface TikTokEvent {
  id: string;
  type: 'chat' | 'gift' | 'social' | 'like' | 'member' | 'bot';
  nickname: string;
  uniqueId: string;
  profilePictureUrl: string;
  comment?: string;
  giftName?: string;
  giftId?: number;
  repeatCount?: number;
  diamondCount?: number;
  label?: string; // for social events like follow/share
  timestamp: number;
  response?: string; // For bot responses
}

interface ChatCommand {
  id: string;
  command: string;
  response: string;
  enabled: boolean;
}

interface UserStat {
  nickname: string;
  uniqueId: string;
  profilePictureUrl: string;
  likes: number;
  diamonds: number;
  messages: number;
}

interface ActiveAlert {
  id: string;
  nickname: string;
  giftName: string;
  gifUrl: string;
  soundUrl: string;
  type: 'alert' | 'sound' | 'animation' | 'tts';
  textColor?: string;
  fontSize?: string;
  screen?: string;
}

interface WordGame {
  currentWord: string;
  category: string;
  revealedLetters: number[];
  timer: number;
  status: 'idle' | 'playing' | 'won' | 'timeout';
  winner?: string;
  combo: Record<string, number>;
  scores: Record<string, number>;
  players: Record<string, { nickname: string, profilePictureUrl: string }>;
  roundDuration: number;
}

interface Beyblade {
  id: string;
  nickname: string;
  profilePictureUrl: string;
  hp: number;
  maxHp: number;
  shield: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  color: string;
  lastHit: number;
  isDead: boolean;
  deathTimer?: number;
}

interface BeybladeGame {
  status: 'idle' | 'playing';
  players: Beyblade[];
  arena: 'classic' | 'magma' | 'cyber' | 'galaxy' | 'glacier' | 'forest' | 'desert' | 'void';
  settings: {
    startHp: number;
    collisionDamage: number;
    maxPlayers: number;
    likeThreshold: number;
    followJoin: boolean;
    borderType: 'neon' | 'spiky';
  };
  leaderboard: { nickname: string, wins: number }[];
}

const WORD_LIST = [
  { category: 'Meyve', words: ['Elma', 'Armut', 'Çilek', 'Muz', 'Karpuz', 'Kavun', 'Ananas', 'Kivi', 'Mango', 'Şeftali', 'Portakal', 'Mandalina', 'Üzüm', 'Erik', 'Kiraz', 'Vişne', 'Kayısı', 'Nar', 'İncir', 'Böğürtlen'] },
  { category: 'Hayvan', words: ['Aslan', 'Kaplan', 'Zürafa', 'Fil', 'Maymun', 'Köpek', 'Kedi', 'Tavşan', 'Kurt', 'Ayı', 'Zebra', 'Kanguru', 'Panda', 'Koala', 'Penguen', 'Yunus', 'Balina', 'Köpekbalığı', 'Kartal', 'Şahin'] },
  { category: 'Şehir', words: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Mersin', 'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli', 'Şanlıurfa', 'Adapazarı', 'Malatya', 'Kahramanmaraş', 'Erzurum', 'Van', 'Batman'] },
  { category: 'Eşya', words: ['Masa', 'Sandalye', 'Televizyon', 'Bilgisayar', 'Telefon', 'Lamba', 'Kitap', 'Kalem', 'Defter', 'Çanta', 'Saat', 'Gözlük', 'Anahtar', 'Cüzdan', 'Şemsiye', 'Bardak', 'Tabak', 'Kaşık', 'Çatal', 'Bıçak'] },
  { category: 'Renk', words: ['Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Turuncu', 'Mor', 'Pembe', 'Siyah', 'Beyaz', 'Gri', 'Kahverengi', 'Lacivert', 'Turkuaz', 'Bordo', 'Bej', 'Haki', 'Altın', 'Gümüş', 'Bronz', 'Eflatun'] },
  { category: 'Meslek', words: ['Doktor', 'Mühendis', 'Öğretmen', 'Avukat', 'Polis', 'Pilot', 'Aşçı', 'Berber', 'Terzi', 'Çiftçi', 'Mimar', 'Eczacı', 'Hemşire', 'Gazeteci', 'Yazar', 'Ressam', 'Müzisyen', 'Oyuncu', 'Sporcu', 'Asker'] }
];

interface GiftSetting {
  giftName: string;
  soundUrl: string;
  gifUrl: string;
  duration: number;
  alertStyle: 'classic' | 'modern' | 'minimal';
  textColor: string;
  fontSize: string;
}

const GIFT_PRESETS = {
  GIFS: [
    { name: 'Confetti', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.gif' },
    { name: 'Heart Pop', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfuxV5x5u7Dq0/giphy.gif' },
    { name: 'Money Rain', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.gif#money' },
    { name: 'Firework', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/26tPq76G1iJ6bY5yM/giphy.gif' },
    { name: 'Rocket', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6B15XN60/giphy.gif' },
    { name: 'Party Horn', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lUj6G9u9u9u9u9/giphy.gif' },
    { name: 'Gold Star', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.gif#star' },
    { name: 'Diamond', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lUj6G9u9u9u9u9/giphy.gif#diamond' }
  ],
  SOUNDS: [
    { name: 'Tada', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
    { name: 'Success', url: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3' },
    { name: 'Coin', url: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3' },
    { name: 'Notification', url: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3' },
    { name: 'Magic', url: 'https://assets.mixkit.co/active_storage/sfx/2436/2436-preview.mp3' },
    { name: 'Level Up', url: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3' },
    { name: 'Cheer', url: 'https://assets.mixkit.co/active_storage/sfx/2528/2528-preview.mp3' },
    { name: 'Win', url: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3' }
  ]
};

interface ListSetting {
  id: string;
  label: string;
  assetUrl: string;
  enabled: boolean;
}

const IS_SELF_HOSTED = true;

export default function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('tikgifty_token'));
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [events, setEvents] = useState<TikTokEvent[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'actions' | 'events' | 'overlay' | 'leaderboard' | 'settings' | 'games' | 'kelime-oyunu' | 'beyblade' | 'pixel-conquest' | 'voting' | 'pricing' | 'about'>('dashboard');
  const [editingAction, setEditingAction] = useState<TikTokAction | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'sound') => {
    const file = e.target.files?.[0];
    if (!file || !authToken) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.url) {
        if (editingAction) {
          if (type === 'image') {
            setEditingAction({ ...editingAction, imageUrl: data.url });
          } else {
            setEditingAction({ ...editingAction, soundUrl: data.url });
          }
        }
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  const [editingTrigger, setEditingTrigger] = useState<TikTokEventTrigger | null>(null);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'bot' | 'integrations' | 'account'>('general');
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<Record<string, UserStat>>({});
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [gameOverlayMode, setGameOverlayMode] = useState<'game' | 'leaderboard' | 'stream' | 'beyblade' | 'pixel-conquest' | 'voting' | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<'minimal' | 'vibrant' | 'dark' | 'neon' | 'cyberpunk' | 'glassmorphism'>('vibrant');
  const [overlayFont, setOverlayFont] = useState<string>('font-sans');
  const [overlayAccent, setOverlayAccent] = useState<string>('');
  const [savedPresets, setSavedPresets] = useState<OverlayPreset[]>(() => {
    const saved = localStorage.getItem('tikgifty_overlay_presets');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tikgifty_overlay_presets', JSON.stringify(savedPresets));
  }, [savedPresets]);

  const [layout, setLayout] = useState<OverlayLayout>({
    stats: { id: 'stats', name: 'Stream Stats', x: 5, y: 5, width: 90, visible: true },
    goals: { id: 'goals', name: 'Goals', x: 5, y: 15, width: 40, visible: true },
    events: { id: 'events', name: 'Recent Events', x: 5, y: 70, width: 40, visible: true },
    alerts: { id: 'alerts', name: 'Gift Alerts', x: 0, y: 30, width: 100, visible: true },
  });
  const [editingLayoutElement, setEditingLayoutElement] = useState<keyof OverlayLayout | null>(null);
  const [giftSoundUrl, setGiftSoundUrl] = useState<string>('');
  
  // Volume & Mute States
  const [isMuted, setIsMuted] = useState(false);
  const [volumes, setVolumes] = useState({
    tts: 0.8,
    alerts: 0.7,
    game: 0.5
  });

  const isPro = userProfile?.isSubscribed || userProfile?.plan === 'pro' || userProfile?.plan === 'admin';

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', displayName: '' });

  // Beyblade Game State
  const [beybladeGame, setBeybladeGame] = useState<BeybladeGame>({
    status: 'idle',
    players: [],
    arena: 'classic',
    settings: {
      startHp: 100,
      collisionDamage: 5,
      maxPlayers: 12,
      likeThreshold: 100,
      followJoin: true,
      borderType: 'spiky'
    },
    leaderboard: []
  });

  const [pixelConquest, setPixelConquest] = useState<PixelConquestState>({
    status: 'idle',
    players: [],
    grid: Array(30).fill(null).map(() => Array(40).fill({ ownerId: null, color: null })),
    reignPlayerId: null,
    settings: {
      gridWidth: 40,
      gridHeight: 30,
      shieldMax: 100,
      reignMode: true,
      playerColors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']
    }
  });

  const [votingGame, setVotingGame] = useState<VotingGameState>({
    status: 'idle',
    teams: [
      { id: '1', name: 'Galatasaray', keyword: 'GS', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Galatasaray_Sports_Club_Logo.png/1200px-Galatasaray_Sports_Club_Logo.png', anthemUrl: '', votes: 0 },
      { id: '2', name: 'Fenerbahçe', keyword: 'FB', logoUrl: 'https://upload.wikimedia.org/wikipedia/tr/8/86/Fenerbah%C3%A7e_SK.png', anthemUrl: '', votes: 0 },
      { id: '3', name: 'Beşiktaş', keyword: 'BJK', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Be%C5%9Fikta%C5%9F_Logo_Be%C5%9Fikta%C5%9F_Amblem_Be%C5%9Fikta%C5%9F_Arma.png/1200px-Be%C5%9Fikta%C5%9F_Logo_Be%C5%9Fikta%C5%9F_Amblem_Be%C5%9Fikta%C5%9F_Arma.png', anthemUrl: '', votes: 0 },
    ],
    settings: {
      title: 'Takımına Oy Ver',
      subtitle: 'Önde olan takımın marşı otomatik çalıyor',
      giftMultipliers: [{ id: '1', giftName: 'Rose', multiplier: 10 }]
    },
    userTeams: {}
  });

  // Word Game State
  const [game, setGame] = useState<WordGame>({
    currentWord: '',
    category: '',
    revealedLetters: [],
    timer: 30,
    status: 'idle',
    combo: {},
    scores: {},
    players: {},
    roundDuration: 30
  });
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hintTimerRef = useRef<NodeJS.Timeout | null>(null);

  const streaks = useRef<Record<string, number>>({});
  const lastGift = useRef<string | null>(null);
  const gameRef = useRef(game);
  const beybladeGameRef = useRef(beybladeGame);
  const votingGameRef = useRef(votingGame);
  const pixelConquestRef = useRef(pixelConquest);
  const usernameRef = useRef(username);

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    gameRef.current = game;
    const params = new URLSearchParams(window.location.search);
    if (!params.get('mode') && username && socket) {
      socket.emit('sync-state', { username, state: { type: 'wordGame', data: game } });
    }
  }, [game, username, socket]);

  useEffect(() => {
    beybladeGameRef.current = beybladeGame;
    const params = new URLSearchParams(window.location.search);
    if (!params.get('mode') && username && socket) {
      socket.emit('sync-state', { username, state: { type: 'beybladeGame', data: beybladeGame } });
    }
  }, [beybladeGame, username, socket]);

  useEffect(() => {
    votingGameRef.current = votingGame;
    const params = new URLSearchParams(window.location.search);
    if (!params.get('mode') && username && socket) {
      socket.emit('sync-state', { username, state: { type: 'votingGame', data: votingGame } });
    }
  }, [votingGame, username, socket]);

  useEffect(() => {
    pixelConquestRef.current = pixelConquest;
    const params = new URLSearchParams(window.location.search);
    if (!params.get('mode') && username && socket) {
      socket.emit('sync-state', { username, state: { type: 'pixelConquest', data: pixelConquest } });
    }
  }, [pixelConquest, username, socket]);

  const addBeybladePlayer = (data: any) => {
    setBeybladeGame(prev => {
      if (prev.status !== 'playing') return prev;
      if (prev.players.length >= prev.settings.maxPlayers) return prev;
      if (prev.players.find(p => p.id === data.uniqueId)) return prev;

      const newPlayer: Beyblade = {
        id: data.uniqueId,
        nickname: data.nickname,
        profilePictureUrl: data.profilePictureUrl,
        hp: prev.settings.startHp,
        maxHp: prev.settings.startHp,
        shield: 0,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        rotation: 0,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        lastHit: 0,
        isDead: false
      };

      return { ...prev, players: [...prev.players, newPlayer] };
    });
  };

  const handlePixelConquestAction = (data: any) => {
    if (pixelConquest.status !== 'playing') return;

    setPixelConquest(prev => {
      const { gridWidth, gridHeight, shieldMax } = prev.settings;
      let players = [...prev.players];
      let grid = prev.grid.map(row => [...row]);
      
      let player = players.find(p => p.id === data.uniqueId);
      if (!player) {
        const colors = prev.settings.playerColors && prev.settings.playerColors.length > 0 ? prev.settings.playerColors : ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
        player = {
          id: data.uniqueId,
          nickname: data.nickname,
          avatar: data.profilePictureUrl,
          color: colors[players.length % colors.length],
          score: 0,
          shield: 0
        };
        players.push(player);
      }

      // Calculate impact based on gift value (diamonds)
      const impact = data.diamondCount || 1;
      const radius = Math.max(1, Math.floor(Math.sqrt(impact)));
      
      // Pick a random starting point if player has no pixels, else pick a point near their existing pixels
      let startX = Math.floor(Math.random() * gridWidth);
      let startY = Math.floor(Math.random() * gridHeight);
      
      const playerPixels: {x: number, y: number}[] = [];
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          if (grid[y][x].ownerId === player.id) {
            playerPixels.push({x, y});
          }
        }
      }

      if (playerPixels.length > 0) {
        const randomPixel = playerPixels[Math.floor(Math.random() * playerPixels.length)];
        startX = randomPixel.x;
        startY = randomPixel.y;
      }

      let conquered = 0;
      for (let y = Math.max(0, startY - radius); y <= Math.min(gridHeight - 1, startY + radius); y++) {
        for (let x = Math.max(0, startX - radius); x <= Math.min(gridWidth - 1, startX + radius); x++) {
          // Distance check for circular impact
          if (Math.pow(x - startX, 2) + Math.pow(y - startY, 2) <= Math.pow(radius, 2)) {
            const cell = grid[y][x];
            if (cell.ownerId !== player.id) {
              // If cell is owned by reign player and they have shield, reduce shield instead of conquering
              if (cell.ownerId === prev.reignPlayerId) {
                const reignPlayer = players.find(p => p.id === prev.reignPlayerId);
                if (reignPlayer && reignPlayer.shield > 0) {
                  reignPlayer.shield--;
                  continue;
                }
              }
              
              // If cell was owned by someone else, reduce their score
              if (cell.ownerId) {
                const oldOwner = players.find(p => p.id === cell.ownerId);
                if (oldOwner) oldOwner.score--;
              }
              
              grid[y][x] = { ...cell, ownerId: player.id, color: player.color };
              conquered++;
            }
          }
        }
      }

      player.score += conquered;

      // Update Reign Player
      let newReignPlayerId = prev.reignPlayerId;
      if (prev.settings.reignMode) {
        const topPlayer = [...players].sort((a, b) => b.score - a.score)[0];
        if (topPlayer && topPlayer.score > 0 && topPlayer.id !== newReignPlayerId) {
          newReignPlayerId = topPlayer.id;
          topPlayer.shield = shieldMax; // Give shield to new reign player
        }
      }

      return { ...prev, players, grid, reignPlayerId: newReignPlayerId };
    });
  };

  const handleBeybladeAction = (uid: string, action: 'heal' | 'shield' | 'chaos' | 'death') => {
    setBeybladeGame(prev => {
      const players = prev.players.map(p => {
        if (p.id === uid) {
          if (action === 'heal') return { ...p, hp: Math.min(p.maxHp, p.hp + 20) };
          if (action === 'shield') return { ...p, shield: Math.min(100, p.shield + 50) };
          if (action === 'death') return { ...p, deathTimer: 10 };
        }
        if (action === 'chaos') {
          return { ...p, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10 };
        }
        return p;
      });
      return { ...prev, players };
    });
  };

  useEffect(() => {
    let animationFrame: number;
    const update = () => {
      if (beybladeGameRef.current.status === 'playing') {
        setBeybladeGame(prev => {
          const newPlayers = prev.players.map(p => {
            if (p.isDead) return p;

            let nx = p.x + p.vx;
            let ny = p.y + p.vy;
            let nvx = p.vx * 0.99; // Friction
            let nvy = p.vy * 0.99;

            // Wall collisions
            if (nx < 5 || nx > 95) nvx *= -1;
            if (ny < 5 || ny > 95) nvy *= -1;

            nx = Math.max(5, Math.min(95, nx));
            ny = Math.max(5, Math.min(95, ny));

            return { ...p, x: nx, y: ny, vx: nvx, vy: nvy, rotation: p.rotation + (Math.abs(nvx) + Math.abs(nvy)) * 5 };
          });

          // Player collisions
          for (let i = 0; i < newPlayers.length; i++) {
            for (let j = i + 1; j < newPlayers.length; j++) {
              const p1 = newPlayers[i];
              const p2 = newPlayers[j];
              if (p1.isDead || p2.isDead) continue;

              const dx = p1.x - p2.x;
              const dy = p1.y - p2.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 8) { // Collision radius
                const angle = Math.atan2(dy, dx);
                const force = 1;
                
                p1.vx += Math.cos(angle) * force;
                p1.vy += Math.sin(angle) * force;
                p2.vx -= Math.cos(angle) * force;
                p2.vy -= Math.sin(angle) * force;

                // Damage
                const damage = prev.settings.collisionDamage;
                if (p1.shield > 0) p1.shield -= damage; else p1.hp -= damage;
                if (p2.shield > 0) p2.shield -= damage; else p2.hp -= damage;

                if (p1.hp <= 0) p1.isDead = true;
                if (p2.hp <= 0) p2.isDead = true;
              }
            }
          }

          // Check for winner
          const alivePlayers = newPlayers.filter(p => !p.isDead);
          if (prev.players.length > 1 && alivePlayers.length === 1) {
            const winner = alivePlayers[0];
            const newLeaderboard = [...prev.leaderboard];
            const idx = newLeaderboard.findIndex(l => l.nickname === winner.nickname);
            if (idx > -1) newLeaderboard[idx].wins += 1;
            else newLeaderboard.push({ nickname: winner.nickname, wins: 1 });

            return { ...prev, players: newPlayers, status: 'idle', leaderboard: newLeaderboard };
          }

          return { ...prev, players: newPlayers };
        });
      }
      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Save Beyblade Leaderboard
  useEffect(() => {
    if (!user || !isPro || beybladeGame.leaderboard.length === 0) return;

    if (IS_SELF_HOSTED && authToken) {
      fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ beybladeLeaderboard: beybladeGame.leaderboard })
      })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          console.error('Failed to save beyblade leaderboard:', text);
        }
      })
      .catch(err => console.error('Failed to save beyblade leaderboard:', err));
    }
  }, [beybladeGame.leaderboard]);

  const startNewGame = () => {
    const categoryObj = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    const word = categoryObj.words[Math.floor(Math.random() * categoryObj.words.length)].toUpperCase();
    
    setGame(prev => ({
      ...prev,
      currentWord: word,
      category: categoryObj.category,
      revealedLetters: [],
      timer: prev.roundDuration,
      status: 'playing',
      winner: undefined
    }));
  };

  const stopGame = () => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (hintTimerRef.current) clearInterval(hintTimerRef.current);
    setGame(prev => ({ ...prev, status: 'idle', timer: prev.roundDuration }));
  };

  const revealHint = () => {
    setGame(prev => {
      if (prev.status !== 'playing') return prev;
      
      const hiddenIndices = [];
      for (let i = 0; i < prev.currentWord.length; i++) {
        if (!prev.revealedLetters.includes(i)) {
          hiddenIndices.push(i);
        }
      }

      if (hiddenIndices.length <= 1) return prev; // Keep at least one letter hidden or don't reveal all

      const randomIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
      return {
        ...prev,
        revealedLetters: [...prev.revealedLetters, randomIndex]
      };
    });
  };

  useEffect(() => {
    if (game.status === 'playing') {
      gameTimerRef.current = setInterval(() => {
        setGame(prev => {
          if (prev.timer <= 1) {
            clearInterval(gameTimerRef.current!);
            return { ...prev, timer: 0, status: 'timeout' };
          }
          return { ...prev, timer: prev.timer - 1 };
        });
      }, 1000);

      hintTimerRef.current = setInterval(() => {
        revealHint();
      }, 10000);
    } else {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (hintTimerRef.current) clearInterval(hintTimerRef.current);

      if (game.status === 'won' || game.status === 'timeout') {
        const timeout = setTimeout(() => {
          startNewGame();
        }, 5000);
        return () => clearTimeout(timeout);
      }
    }

    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (hintTimerRef.current) clearInterval(hintTimerRef.current);
    };
  }, [game.status]);

  useEffect(() => {
    if (gameOverlayMode && game.status === 'idle') {
      startNewGame();
    }
  }, [gameOverlayMode, game.status]);

  const CELEBRATORY_SOUNDS = [
    { name: 'None', url: '' },
    { name: 'Victory Fanfare', url: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3' },
    { name: 'Magic Sparkle', url: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3' },
    { name: 'Level Up', url: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3' },
    { name: 'Coin Collect', url: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3' },
    { name: 'Applause', url: 'https://assets.mixkit.co/active_storage/sfx/2021/2021-preview.mp3' },
  ];

  const OVERLAY_THEMES = {
    minimal: {
      name: 'Minimal',
      eventClass: 'bg-black/40 border-white/5 backdrop-blur-sm',
      giftClass: 'bg-white/10 border-white/20',
      alertClass: 'bg-black/60 border-white/5',
      accentColor: 'text-white',
      goalColor: 'bg-white/10'
    },
    vibrant: {
      name: 'Vibrant',
      eventClass: 'bg-black/40 border-white/10 backdrop-blur-xl',
      giftClass: 'bg-violet-500/20 border-violet-500/30',
      alertClass: 'bg-black/60 border-white/10',
      accentColor: 'text-cyan-500',
      goalColor: 'bg-cyan-500/20'
    },
    dark: {
      name: 'Dark Mode',
      eventClass: 'bg-zinc-900 border-zinc-800',
      giftClass: 'bg-zinc-800 border-zinc-700',
      alertClass: 'bg-zinc-950 border-zinc-800',
      accentColor: 'text-emerald-500',
      goalColor: 'bg-emerald-500/20'
    },
    neon: {
      name: 'Neon Nights',
      eventClass: 'bg-black/80 border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.3)] backdrop-blur-md',
      giftClass: 'bg-fuchsia-500/20 border-fuchsia-400/50 shadow-[0_0_20px_rgba(217,70,239,0.5)]',
      alertClass: 'bg-black/90 border-fuchsia-500/80 shadow-[0_0_30px_rgba(217,70,239,0.6)]',
      accentColor: 'text-fuchsia-400',
      goalColor: 'bg-fuchsia-500/30'
    },
    cyberpunk: {
      name: 'Cyberpunk',
      eventClass: 'bg-yellow-400/10 border-yellow-400/50 backdrop-blur-md',
      giftClass: 'bg-cyan-500/20 border-cyan-400/50',
      alertClass: 'bg-black/80 border-yellow-400 shadow-[4px_4px_0px_rgba(250,204,21,1)]',
      accentColor: 'text-yellow-400',
      goalColor: 'bg-yellow-400/20'
    },
    glassmorphism: {
      name: 'Glassmorphism',
      eventClass: 'bg-white/5 border-white/20 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-3xl',
      giftClass: 'bg-white/10 border-white/30 backdrop-blur-2xl rounded-3xl',
      alertClass: 'bg-white/10 border-white/20 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl',
      accentColor: 'text-white',
      goalColor: 'bg-white/20'
    }
  };
  
  const [actions, setActions] = useState<TikTokAction[]>([
    {
      id: '1',
      name: 'Rose Alert',
      type: 'alert',
      screen: 'Screen 1',
      duration: 3,
      animation: 'bounce',
      imageUrl: GIFT_PRESETS.GIFS[0].url,
      soundUrl: GIFT_PRESETS.SOUNDS[0].url,
      videoUrl: '',
      description: 'Standard rose alert',
      ttsEnabled: true,
      ttsTemplate: '{nickname} sent a Rose!'
    },
    {
      id: '2',
      name: 'Follow Alert',
      type: 'alert',
      screen: 'Screen 1',
      duration: 4,
      animation: 'fade',
      imageUrl: GIFT_PRESETS.GIFS[1].url,
      soundUrl: GIFT_PRESETS.SOUNDS[1].url,
      videoUrl: '',
      description: 'New follower alert',
      ttsEnabled: true,
      ttsTemplate: 'Welcome to the family, {nickname}!'
    }
  ]);

  const [timers, setTimers] = useState<EventTimer[]>([]);

  const [eventTriggers, setEventTriggers] = useState<TikTokEventTrigger[]>([
    {
      id: '1',
      active: true,
      user: 'Any',
      triggerType: 'Gift',
      triggerValue: 'Rose',
      actionIds: ['1']
    },
    {
      id: '2',
      active: true,
      user: 'Any',
      triggerType: 'Follow',
      actionIds: ['2']
    }
  ]);

  const [overlayScreens, setOverlayScreens] = useState<OverlayScreen[]>([
    { id: '1', name: 'Screen 1', maxQueue: 5, status: 'Ready' },
    { id: '2', name: 'Screen 2', maxQueue: 5, status: 'Offline' },
    { id: '3', name: 'Screen 3', maxQueue: 5, status: 'Offline' }
  ]);

  const [giftSettings, setGiftSettings] = useState<Record<string, GiftSetting>>({});

  const [stats, setStats] = useState({
    likes: 0,
    viewers: 0,
    gifts: 0,
    follows: 0
  });

  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [ttsVoice, setTtsVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [followerGoal, setFollowerGoal] = useState({ current: 0, target: 100, label: 'Follower Goal' });
  const [giftGoal, setGiftGoal] = useState({ current: 0, target: 1000, label: 'Diamond Goal' });
  const [commands, setCommands] = useState<ChatCommand[]>([
    { id: '1', command: '!discord', response: 'Join our community: discord.gg/tiklocal', enabled: true },
    { id: '2', command: '!socials', response: 'Follow me on Instagram & Twitter @creator', enabled: true },
    { id: '3', command: '!setup', response: 'I use TikLocal Pro for my stream alerts!', enabled: true }
  ]);
  const [currentSong, setCurrentSong] = useState({ title: 'Not Playing', artist: 'Connect Spotify', albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop' });

  const [listSettings, setListSettings] = useState<Record<string, ListSetting>>({
    'likes': { id: 'likes', label: 'Like List', assetUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfuxV5x5u7Dq0/giphy.gif', enabled: true },
    'followers': { id: 'followers', label: 'Follower List', assetUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.gif', enabled: true },
    'gifts': { id: 'gifts', label: 'Gift List', assetUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6Znd6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.gif#money', enabled: true }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const urlUsername = params.get('username');

    if (mode === 'game' || mode === 'leaderboard' || mode === 'stream' || mode === 'beyblade' || mode === 'pixel-conquest' || mode === 'voting') {
      setGameOverlayMode(mode as any);
    }

    if (urlUsername) {
      setUsername(urlUsername);
    }

    // Fetch settings from backend (only if not self-hosted or if we want public settings)
    if (!IS_SELF_HOSTED) {
      fetch('/api/settings')
        .then(async res => {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            return res.json();
          }
          return null;
        })
        .then(data => {
          if (data && data.listSettings) setListSettings(data.listSettings);
        })
        .catch(err => console.error('Failed to fetch settings:', err));
    }
  }, []);

  const saveSettings = (newSettings: any) => {
    const headers: any = { 'Content-Type': 'application/json' };
    if (IS_SELF_HOSTED && authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const payload = {
      ...newSettings,
      actions,
      overlayPresets: savedPresets,
      pixelConquest,
      events: eventTriggers,
      timers
    };

    fetch('/api/settings', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
    .then(async res => {
      if (!res.ok) {
        const text = await res.text();
        console.error('Failed to save settings:', text);
      }
    })
    .catch(err => console.error('Failed to save settings:', err));
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const ttsQueueRef = useRef<{text: string, voiceName?: string, soundUrl?: string}[]>([]);
  const isSpeakingRef = useRef(false);

  // TTS Logic
  const speak = (text: string, voiceName?: string, soundUrl?: string) => {
    if (!isTTSEnabled || !window.speechSynthesis) return;
    
    ttsQueueRef.current.push({text, voiceName, soundUrl});
    processTTSQueue();
  };

  const processTTSQueue = () => {
    if (isSpeakingRef.current || ttsQueueRef.current.length === 0 || isMuted) return;
    
    isSpeakingRef.current = true;
    const nextItem = ttsQueueRef.current.shift();
    if (nextItem) {
      if (nextItem.soundUrl) {
        const audio = new Audio(nextItem.soundUrl);
        audio.volume = volumes.alerts;
        audio.play().catch(e => console.warn('TTS sound play failed:', e));
      }

      const utterance = new SpeechSynthesisUtterance(nextItem.text);
      
      let selectedVoice = ttsVoice;
      if (nextItem.voiceName) {
        const specificVoice = window.speechSynthesis.getVoices().find(v => v.name === nextItem.voiceName);
        if (specificVoice) selectedVoice = specificVoice;
      }
      
      if (selectedVoice) utterance.voice = selectedVoice;
      
      utterance.volume = volumes.tts;
      utterance.rate = 1;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        isSpeakingRef.current = false;
        processTTSQueue();
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setTtsVoice(voices.find(v => v.lang.includes('en')) || voices[0]);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Simulation for Demo Mode
  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      const types: ('chat' | 'gift' | 'social' | 'like')[] = ['chat', 'chat', 'gift', 'social', 'like'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const mockData = {
        nickname: ['Alex', 'Sarah', 'Mike', 'Luna', 'Zen'][Math.floor(Math.random() * 5)],
        uniqueId: 'user_' + Math.floor(Math.random() * 1000),
        profilePictureUrl: `https://picsum.photos/seed/${Math.random()}/100/100`,
        comment: ['Hello!', 'Wow!', 'Cool stream!', 'Love this!', 'Nice!'][Math.floor(Math.random() * 5)],
        giftName: ['Rose', 'Finger Heart', 'Diamond'][Math.floor(Math.random() * 3)],
        diamondCount: Math.floor(Math.random() * 10) + 1,
        repeatCount: 1,
        likeCount: Math.floor(Math.random() * 50) + 1,
        displayType: 'pm_mt_guidance_viewer_follow'
      };

      if (type === 'chat') {
        const newEvent: TikTokEvent = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'chat',
          nickname: mockData.nickname,
          uniqueId: mockData.uniqueId,
          profilePictureUrl: mockData.profilePictureUrl,
          comment: mockData.comment,
          timestamp: Date.now()
        };
        setEvents(prev => [newEvent, ...prev].slice(0, 500));
        updateUserStats(mockData, 'chat');
        if (isTTSEnabled) speak(`${mockData.nickname} says: ${mockData.comment}`);

        // Check for commands
        const matchingCommand = commands.find(c => c.enabled && mockData.comment?.toLowerCase().includes(c.command.toLowerCase()));
        if (matchingCommand) {
          const botEvent: TikTokEvent = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'bot',
            nickname: 'TikLocal Bot',
            uniqueId: 'system',
            profilePictureUrl: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png',
            response: matchingCommand.response,
            timestamp: Date.now()
          };
          setTimeout(() => {
            setEvents(prev => [botEvent, ...prev].slice(0, 500));
          }, 500);
        }
      } else if (type === 'gift') {
        const newEvent: TikTokEvent = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'gift',
          nickname: mockData.nickname,
          uniqueId: mockData.uniqueId,
          profilePictureUrl: mockData.profilePictureUrl,
          giftName: mockData.giftName,
          repeatCount: 1,
          diamondCount: mockData.diamondCount,
          timestamp: Date.now()
        };
        setEvents(prev => [newEvent, ...prev].slice(0, 500));
        setStats(prev => ({ ...prev, gifts: prev.gifts + mockData.diamondCount }));
        setGiftGoal(prev => ({ ...prev, current: prev.current + mockData.diamondCount }));
        updateUserStats(mockData, 'gift');
        handleTikTokEvent(mockData);
      } else if (type === 'social') {
        const newEvent: TikTokEvent = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'social',
          nickname: mockData.nickname,
          uniqueId: mockData.uniqueId,
          profilePictureUrl: mockData.profilePictureUrl,
          label: 'followed you',
          timestamp: Date.now()
        };
        setEvents(prev => [newEvent, ...prev].slice(0, 500));
        setStats(prev => ({ ...prev, follows: prev.follows + 1 }));
        setFollowerGoal(prev => ({ ...prev, current: prev.current + 1 }));
      } else if (type === 'like') {
        setStats(prev => ({ ...prev, likes: prev.likes + mockData.likeCount }));
        updateUserStats(mockData, 'like');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  // Firebase Auth Listener
  useEffect(() => {
    if (IS_SELF_HOSTED) {
      if (authToken) {
        Promise.all([
          fetch('/api/user/me', { headers: { 'Authorization': `Bearer ${authToken}` } }).then(res => res.ok ? res.json() : null),
          fetch('/api/settings', { headers: { 'Authorization': `Bearer ${authToken}` } }).then(res => res.ok ? res.json() : null)
        ])
        .then(([userData, settingsData]) => {
          if (!userData) {
            setAuthToken(null);
            localStorage.removeItem('tikgifty_token');
            setIsAuthLoading(false);
            return;
          }
          
          setUser({ uid: userData.id, email: userData.email, displayName: userData.displayName, photoURL: userData.photoURL });
          setUserProfile({ isSubscribed: userData.isSubscribed, plan: userData.plan, role: userData.role });
          
          if (settingsData) {
            if (settingsData.listSettings && Object.keys(settingsData.listSettings).length > 0) setListSettings(settingsData.listSettings);
            if (settingsData.giftSettings && Object.keys(settingsData.giftSettings).length > 0) setGiftSettings(settingsData.giftSettings);
            if (settingsData.beybladeLeaderboard) setBeybladeGame(prev => ({ ...prev, leaderboard: settingsData.beybladeLeaderboard }));
            if (settingsData.actions && settingsData.actions.length > 0) setActions(settingsData.actions);
            if (settingsData.overlayPresets && settingsData.overlayPresets.length > 0) setSavedPresets(settingsData.overlayPresets);
            if (settingsData.pixelConquest && Object.keys(settingsData.pixelConquest).length > 0) setPixelConquest(settingsData.pixelConquest);
            if (settingsData.events && settingsData.events.length > 0) setEventTriggers(settingsData.events);
            if (settingsData.timers && settingsData.timers.length > 0) setTimers(settingsData.timers);
          }
          setIsAuthLoading(false);
        })
        .catch(err => {
          console.error("Failed to load user data", err);
          setIsAuthLoading(false);
        });
      } else {
        setIsAuthLoading(false);
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            const isAdmin = currentUser.email === 'bensanayeminederim@gmail.com';
            const newProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: isAdmin ? 'admin' : 'user',
              isSubscribed: isAdmin, // Admin is auto-subscribed
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          } else {
            setUserProfile(userDoc.data());
          }

          // Load Gift Settings
          const settingsDoc = await getDoc(doc(db, 'giftSettings', currentUser.uid));
          if (settingsDoc.exists()) {
            setGiftSettings(settingsDoc.data().settings);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Save Gift Settings to Firebase
  const saveGiftSettings = async (newSettings: Record<string, GiftSetting>) => {
    if (!user || !isPro) return;

    if (IS_SELF_HOSTED && authToken) {
      fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ giftSettings: newSettings })
      })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          console.error('Failed to save gift settings:', text);
        }
      })
      .catch(err => console.error('Failed to save gift settings:', err));
      return;
    }

    try {
      await setDoc(doc(db, 'giftSettings', user.uid), {
        uid: user.uid,
        settings: newSettings,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `giftSettings/${user.uid}`);
    }
  };

  useEffect(() => {
    // Check for overlay mode in URL
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'overlay' || mode === 'actions') {
      setIsOverlayMode(true);
    } else if (mode === 'game' || mode === 'leaderboard' || mode === 'stream' || mode === 'beyblade' || mode === 'pixel-conquest' || mode === 'voting') {
      setGameOverlayMode(mode as any);
    }
  }, []);

  // Timer Orchestration
  useEffect(() => {
    if (!isConnected) return;
    
    const activeTimers = timers.filter(t => t.active && t.actionId);
    if (activeTimers.length === 0) return;

    const intervals = activeTimers.map(timer => {
      return setInterval(() => {
        triggerAction('System', timer.actionId);
      }, timer.intervalMinutes * 60 * 1000);
    });

    return () => intervals.forEach(clearInterval);
  }, [isConnected, timers]);

  const triggerAction = (nickname: string, actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) return;

    const alertId = Math.random().toString(36).substr(2, 9);
    
    // Only add to activeAlerts if it has a visual component
    if (action.type === 'alert' || action.type === 'animation') {
      const newAlert: ActiveAlert = {
        id: alertId,
        nickname,
        giftName: action.name,
        gifUrl: action.imageUrl,
        soundUrl: action.soundUrl,
        type: action.type,
        textColor: action.textColor,
        fontSize: action.fontSize,
        screen: action.screen
      };
      setActiveAlerts(prev => [...prev, newAlert]);

      setTimeout(() => {
        setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
      }, action.duration * 1000);
    }

    // Handle sound
    if ((action.type === 'alert' || action.type === 'sound') && action.soundUrl && !isMuted) {
      const audio = new Audio(action.soundUrl);
      audio.volume = volumes.alerts;
      audio.play().catch(e => {
        console.warn(`Audio play failed for ${action.name}:`, e.message);
      });
    }

    // Handle TTS
    if (action.type === 'tts' || (action.ttsEnabled && action.ttsTemplate)) {
      const template = action.type === 'tts' ? (action.ttsTemplate || '{nickname} triggered an action!') : action.ttsTemplate!;
      const message = template.replace('{nickname}', nickname).replace('{giftName}', action.name);
      speak(message, action.ttsVoice, action.ttsSoundEffect);
    }
  };

  const handleTikTokEvent = (data: any) => {
    // Play global gift sound if configured
    if (data.type === 'gift' && giftSoundUrl && !isMuted) {
      const audio = new Audio(giftSoundUrl);
      audio.volume = volumes.alerts;
      audio.play().catch(e => console.warn('Global gift sound failed:', e.message));
    }

    if (data.type === 'gift') {
      handlePixelConquestAction(data);
    }

    // Update streaks for gifts
    if (data.type === 'gift') {
      if (lastGift.current === data.giftName) {
        streaks.current[data.giftName] = (streaks.current[data.giftName] || 0) + 1;
      } else {
        // Reset old streak
        if (lastGift.current) streaks.current[lastGift.current] = 0;
        streaks.current[data.giftName] = 1;
        lastGift.current = data.giftName;
      }
    }

    // Find matching events
    const matchingEvents = eventTriggers.filter(et => {
      if (!et.active) return false;
      
      let matches = false;
      // Basic trigger matching
      if (et.triggerType === 'Gift' && data.type === 'gift' && data.giftName === et.triggerValue) matches = true;
      if (et.triggerType === 'Follow' && data.type === 'social' && data.displayType?.includes('follow')) matches = true;
      if (et.triggerType === 'Like' && data.type === 'like' && data.likeCount >= parseInt(et.triggerValue || '0')) matches = true;
      if (et.triggerType === 'Subscribe' && data.type === 'social' && data.displayType?.includes('subscribe')) matches = true;
      if (et.triggerType === 'Share' && data.type === 'social' && data.displayType?.includes('share')) matches = true;
      if (et.triggerType === 'Join' && data.type === 'social' && data.displayType?.includes('join')) matches = true;
      
      if (!matches) return false;

      // Check complex conditions
      if (et.triggerType === 'Gift' && et.minCount) {
        const currentStreak = streaks.current[data.giftName] || 0;
        if (et.isStreak && currentStreak < et.minCount) return false;
      }

      return true;
    });

    matchingEvents.forEach(et => {
      et.actionIds.forEach(actionId => {
        triggerAction(data.nickname, actionId);
      });
    });

    // Beyblade Game Integration
    if (beybladeGameRef.current.status === 'playing') {
      // Join via Like
      if (data.type === 'like' && data.likeCount >= beybladeGameRef.current.settings.likeThreshold) {
        addBeybladePlayer(data);
      }
      // Join via Follow
      if (beybladeGameRef.current.settings.followJoin && data.type === 'social' && data.displayType?.includes('follow')) {
        addBeybladePlayer(data);
      }
      // Power-ups via Gifts
      if (data.type === 'gift') {
        const giftName = data.giftName.toLowerCase();
        if (giftName.includes('rose')) handleBeybladeAction(data.uniqueId, 'heal');
        if (giftName.includes('heart')) handleBeybladeAction(data.uniqueId, 'shield');
        if (giftName.includes('finger heart')) handleBeybladeAction(data.uniqueId, 'chaos');
        if (giftName.includes('perfume')) handleBeybladeAction(data.uniqueId, 'death');
      }
    }
  };

  const updateUserStats = (data: any, type: 'chat' | 'gift' | 'like') => {
    const uid = data.uniqueId;
    setUserStats(prev => {
      const existing = prev[uid];
      const current = existing ? { ...existing } : {
        nickname: data.nickname,
        uniqueId: data.uniqueId,
        profilePictureUrl: data.profilePictureUrl,
        likes: 0,
        diamonds: 0,
        messages: 0
      };

      if (type === 'chat') current.messages += 1;
      if (type === 'gift') current.diamonds += (data.diamondCount || 0);
      if (type === 'like') current.likes += (data.likeCount || 1);

      return { ...prev, [uid]: current };
    });
  };

  useEffect(() => {
    if (socket && username) {
      socket.emit('join-room', username);
    }
  }, [socket, username]);

  useEffect(() => {
    const newSocket = io({
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      const urlUsername = params.get('username');
      if (mode && urlUsername) {
        newSocket.emit('join-room', urlUsername);
        newSocket.emit('request-state', urlUsername);
      }
    });

    newSocket.on('request-state', () => {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      const currentUsername = usernameRef.current;
      if (!mode && currentUsername) {
        newSocket.emit('sync-state', { username: currentUsername, state: { type: 'votingGame', data: votingGameRef.current } });
        newSocket.emit('sync-state', { username: currentUsername, state: { type: 'wordGame', data: gameRef.current } });
        newSocket.emit('sync-state', { username: currentUsername, state: { type: 'beybladeGame', data: beybladeGameRef.current } });
        newSocket.emit('sync-state', { username: currentUsername, state: { type: 'pixelConquest', data: pixelConquestRef.current } });
      }
    });

    newSocket.on('state-sync', (stateObj: any) => {
      if (stateObj.type === 'votingGame') setVotingGame(stateObj.data);
      if (stateObj.type === 'wordGame') setGame(stateObj.data);
      if (stateObj.type === 'beybladeGame') setBeybladeGame(stateObj.data);
      if (stateObj.type === 'pixelConquest') setPixelConquest(stateObj.data);
    });

    newSocket.on('tiktok-connected', (data) => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      console.log('Connected to TikTok:', data);
      if (data.profilePic) {
        setUser((prev: any) => prev ? { ...prev, photoURL: data.profilePic } : prev);
      }
    });

    newSocket.on('tiktok-error', (err) => {
      setIsConnecting(false);
      if (err === 'Authentication failed') {
        setError('Oturumunuzun süresi dolmuş olabilir. Lütfen tekrar giriş yapın.');
        setIsLoginModalOpen(true);
      } else {
        setError(err);
      }
    });

    newSocket.on('tiktok-disconnected', () => {
      setIsConnected(false);
      setIsConnecting(false);
    });

    // Event handlers
    newSocket.on('chat', (data) => {
      const newEvent: TikTokEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'chat',
        nickname: data.nickname,
        uniqueId: data.uniqueId,
        profilePictureUrl: data.profilePictureUrl,
        comment: data.comment,
        timestamp: Date.now()
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 500));
      updateUserStats(data, 'chat');
      if (isTTSEnabled) speak(`${data.nickname} says: ${data.comment}`);

      // Check for word game guess
      const guess = data.comment?.toUpperCase().trim();
      if (gameRef.current.status === 'playing' && guess === gameRef.current.currentWord) {
        setGame(prev => {
          const newScores = { ...prev.scores };
          const newCombo = { ...prev.combo };
          const newPlayers = { ...prev.players };
          
          newPlayers[data.uniqueId] = {
            nickname: data.nickname,
            profilePictureUrl: data.profilePictureUrl
          };

          const userCombo = (newCombo[data.uniqueId] || 0) + 1;
          
          Object.keys(newCombo).forEach(uid => {
            if (uid !== data.uniqueId) newCombo[uid] = 0;
          });
          
          newCombo[data.uniqueId] = userCombo;
          
          const points = 10 + (userCombo > 1 ? (userCombo - 1) * 5 : 0);
          newScores[data.uniqueId] = (newScores[data.uniqueId] || 0) + points;
          
          return {
            ...prev,
            status: 'won',
            winner: data.nickname,
            scores: newScores,
            combo: newCombo,
            players: newPlayers
          };
        });
      }

      // Check for commands
      const matchingCommand = commands.find(c => c.enabled && data.comment?.toLowerCase().includes(c.command.toLowerCase()));
      if (matchingCommand) {
        const botEvent: TikTokEvent = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'bot',
          nickname: 'TikLocal Bot',
          uniqueId: 'system',
          profilePictureUrl: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png',
          response: matchingCommand.response,
          timestamp: Date.now()
        };
        setTimeout(() => {
          setEvents(prev => [botEvent, ...prev].slice(0, 500));
        }, 500);
      }

      // Voting Game Logic
      setVotingGame(prev => {
        if (prev.status !== 'running') return prev;
        const comment = data.comment?.trim().toLowerCase();
        const matchedTeam = prev.teams.find(t => t.keyword.toLowerCase() === comment);
        
        if (matchedTeam) {
          const newTeams = prev.teams.map(t => 
            t.id === matchedTeam.id ? { ...t, votes: t.votes + 1 } : t
          );
          return {
            ...prev,
            teams: newTeams,
            userTeams: { ...prev.userTeams, [data.uniqueId]: matchedTeam.id }
          };
        }
        return prev;
      });
    });

    newSocket.on('gift', (data) => {
      const newEvent: TikTokEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'gift',
        nickname: data.nickname,
        uniqueId: data.uniqueId,
        profilePictureUrl: data.profilePictureUrl,
        giftName: data.giftName,
        giftId: data.giftId,
        repeatCount: data.repeatCount,
        diamondCount: data.diamondCount,
        timestamp: Date.now()
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 500));
      setStats(prev => ({ ...prev, gifts: prev.gifts + (data.diamondCount || 0) }));
      setGiftGoal(prev => ({ ...prev, current: prev.current + (data.diamondCount || 0) }));
      updateUserStats(data, 'gift');
      
      // Trigger Alert if it's the first gift in a streak or a single gift
      if (data.repeatCount === 1 || !data.repeatCount) {
        handleTikTokEvent({ ...data, type: 'gift' });
      }

      // Voting Game Logic
      setVotingGame(prev => {
        if (prev.status !== 'running') return prev;
        const userTeamId = prev.userTeams[data.uniqueId];
        if (userTeamId) {
          const multiplierSetting = prev.settings.giftMultipliers.find(
            m => m.giftName.toLowerCase() === data.giftName?.toLowerCase()
          );
          const votesToAdd = multiplierSetting ? multiplierSetting.multiplier : 0;
          
          if (votesToAdd > 0) {
            const newTeams = prev.teams.map(t =>
              t.id === userTeamId ? { ...t, votes: t.votes + votesToAdd } : t
            );
            return { ...prev, teams: newTeams };
          }
        }
        return prev;
      });
    });

    newSocket.on('social', (data) => {
      const isFollow = data.displayType?.includes('follow') || data.label?.includes('follow');
      const isShare = data.displayType?.includes('share') || data.label?.includes('share');
      const isJoin = data.displayType?.includes('join') || data.label?.includes('join');
      const isSubscribe = data.displayType?.includes('subscribe') || data.label?.includes('subscribe');

      const newEvent: TikTokEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'social',
        nickname: data.nickname,
        uniqueId: data.uniqueId,
        profilePictureUrl: data.profilePictureUrl,
        label: data.label || (isFollow ? 'followed you' : isShare ? 'shared the stream' : isJoin ? 'joined the stream' : 'interacted'),
        timestamp: Date.now()
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 500));
      
      if (isFollow) {
        setStats(prev => ({ ...prev, follows: prev.follows + 1 }));
        setFollowerGoal(prev => ({ ...prev, current: prev.current + 1 }));
      }

      handleTikTokEvent({ ...data, type: 'social' });
    });

    newSocket.on('like', (data) => {
      setStats(prev => ({ ...prev, likes: prev.likes + (data.likeCount || 0) }));
      updateUserStats(data, 'like');
      handleTikTokEvent({ ...data, type: 'like' });
    });
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleConnect = () => {
    if (!username) return;
    
    if (IS_SELF_HOSTED && !authToken) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsConnecting(true);
    setError(null);
    
    // Set a timeout for the connection attempt
    const timeout = setTimeout(() => {
      setIsConnecting(prev => {
        if (prev) {
          setError('Connection timed out. The server might be busy or TikTok is not responding.');
          return false;
        }
        return prev;
      });
    }, 15000);

    if (IS_SELF_HOSTED) {
      socket?.emit('connect-tiktok', username, authToken);
    } else {
      socket?.emit('connect-tiktok', username);
    }
    
    // Clear timeout if connected or error received
    socket?.once('tiktok-connected', () => clearTimeout(timeout));
    socket?.once('tiktok-error', () => clearTimeout(timeout));
  };

  const handleDisconnect = () => {
    socket?.emit('disconnect-tiktok');
  };

  // Auto-scroll to top when new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events]);

  const handleLogin = async (email?: string, password?: string) => {
    if (IS_SELF_HOSTED) {
      if (email && password) {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          
          const contentType = res.headers.get("content-type");
          if (!contentType || contentType.indexOf("application/json") === -1) {
            const text = await res.text();
            throw new Error(text || "Server returned an invalid response");
          }

          const data = await res.json();
          if (data.token) {
            localStorage.setItem('tikgifty_token', data.token);
            setAuthToken(data.token);
            setUser({ uid: data.user.id, email: data.user.email, displayName: data.user.displayName });
            setUserProfile({ isSubscribed: data.user.isSubscribed, role: 'user' });
          } else {
            alert(data.error || "Login failed");
          }
        } catch (err) {
          console.error("Login failed:", err);
          alert("Login failed. Please check your credentials and server connection.");
        }
      } else {
        // If called without credentials in self-hosted mode, open the modal
        setIsLoginModalOpen(true);
      }
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleRegister = async (email: string, password: string, displayName: string) => {
    if (IS_SELF_HOSTED) {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, displayName })
        });
        
        const contentType = res.headers.get("content-type");
        if (!contentType || contentType.indexOf("application/json") === -1) {
          const text = await res.text();
          throw new Error(text || "Server returned an invalid response");
        }

        const data = await res.json();
        if (data.token) {
          localStorage.setItem('tikgifty_token', data.token);
          setAuthToken(data.token);
          setUser({ uid: data.user.id, email: data.user.email, displayName: data.user.displayName });
          setUserProfile({ isSubscribed: false, role: 'user' });
        } else {
          alert(data.error || "Registration failed");
        }
      } catch (err) {
        console.error("Registration failed:", err);
      }
    }
  };

  const handleLogout = async () => {
    if (IS_SELF_HOSTED) {
      localStorage.removeItem('tikgifty_token');
      setAuthToken(null);
      setUser(null);
      setUserProfile(null);
      setIsConnected(false);
      return;
    }

    try {
      await signOut(auth);
      setIsConnected(false);
      if (socket) socket.disconnect();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;
    
    if (IS_SELF_HOSTED) {
      alert("In self-hosted mode, subscriptions must be managed by the administrator.");
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { isSubscribed: true });
      setUserProfile((prev: any) => ({ ...prev, isSubscribed: true }));
      alert("Subscription activated! You now have professional features.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-2 border-pink-500/20 rounded-full animate-ping absolute inset-0"></div>
            <div className="w-20 h-20 border-t-2 border-pink-500 rounded-full animate-spin relative z-10"></div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tighter text-white mb-1">TIK GIFTY <span className="text-pink-500">PRO</span></h2>
            <p className="text-gray-500 text-xs font-mono uppercase tracking-[0.3em]">Initializing Core Systems</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user && !isOverlayMode) {
    return (
      <main className="min-h-screen bg-[#050505] text-white selection:bg-pink-500/30 overflow-x-hidden">
        <Helmet>
          <title>TikGifty - TikTok Canlı Yayın Etkileşim Paneli</title>
          <meta name="description" content="TikTok canlı yayınlarınız için en gelişmiş etkileşim, hediye takip ve interaktif oyun sistemi. Yayınınıza renk katın!" />
          <meta name="keywords" content="tiktok, canlı yayın, hediye takibi, tiktok etkileşim, tikgifty, tiktok oyunları, beyblade oyunu, kelime oyunu, tiktok overlay, obs tiktok" />
        </Helmet>
        {/* Navigation */}
        <header className="fixed top-0 left-0 right-0 h-20 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl z-50 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Zap size={24} className="text-white fill-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">Tik Gifty <span className="text-pink-500">Pro</span></span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Pricing</a>
            <button 
              onClick={() => IS_SELF_HOSTED ? setIsLoginModalOpen(true) : handleLogin()}
              className="bg-white text-black px-6 py-2.5 rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-40 pb-20 px-6 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-pink-500/10 blur-[120px] rounded-full -z-10"></div>
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-pink-500"
            >
              <Sparkles size={12} />
              The Future of TikTok Interaction
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.9]"
            >
              Level Up Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500">Live Stream</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
            >
              Engage your audience like never before with interactive games, real-time overlays, and automated gift alerts.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
            >
              <button 
                onClick={() => IS_SELF_HOSTED ? setIsLoginModalOpen(true) : handleLogin()}
                className="w-full sm:w-auto bg-pink-500 text-white px-10 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(236,72,153,0.3)]"
              >
                <LogIn size={24} />
                Get Started Free
              </button>
              <button className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-white/10 transition-all">
                View Demo
              </button>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Gamepad2 />, title: 'Interactive Games', desc: 'Word games, Beyblade battles, and more directly in your stream.' },
              { icon: <Monitor />, title: 'Smart Overlays', desc: 'Real-time stats, goal bars, and dynamic event lists.' },
              { icon: <Zap />, title: 'Instant Alerts', desc: 'Custom sounds and animations for every gift and follow.' }
            ].map((f, i) => (
              <div key={i} className="p-8 bg-[#0a0a0a] border border-white/5 rounded-[32px] space-y-4 hover:border-pink-500/30 transition-all">
                <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black tracking-tighter">Simple, Transparent Pricing</h2>
            <p className="text-gray-500">Choose the plan that fits your creator journey.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="p-10 bg-[#0a0a0a] border border-white/5 rounded-[48px] space-y-8 relative overflow-hidden">
              <div>
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black">$0</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>
              <ul className="space-y-4">
                {['Basic Overlays', 'Standard Word Game', '5 Gift Alerts', 'Community Support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                    <Check size={16} className="text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => IS_SELF_HOSTED ? setIsLoginModalOpen(true) : handleLogin()}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all"
              >
                Start for Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="p-10 bg-gradient-to-br from-pink-500/10 to-violet-600/10 border border-pink-500/30 rounded-[48px] space-y-8 relative overflow-hidden">
              <div className="absolute top-6 right-6 px-3 py-1 bg-pink-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Popular</div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black">$8</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>
              <ul className="space-y-4">
                {['Unlimited Overlays', 'Beyblade Arena Access', 'Custom TTS Voices', 'Priority Support', 'Ad-Free Experience'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white">
                    <Check size={16} className="text-pink-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => IS_SELF_HOSTED ? setIsLoginModalOpen(true) : handleLogin()}
                className="w-full py-4 bg-pink-500 text-white rounded-2xl font-bold shadow-lg shadow-pink-500/20 hover:scale-[1.02] transition-all"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-20 border-t border-white/5 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Zap size={24} className="text-pink-500 fill-pink-500" />
            <span className="text-xl font-black tracking-tighter uppercase">Tik Gifty</span>
          </div>
          <p className="text-gray-600 text-xs font-black uppercase tracking-[0.4em]">© 2026 Tik Gifty. All Rights Reserved.</p>
        </footer>

        {/* Self-Hosted Login Modal */}
        <AnimatePresence>
          {isLoginModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-[#111317] border border-white/10 rounded-[40px] p-10 relative z-10 shadow-2xl"
              >
                <div className="text-center space-y-2 mb-8">
                  <h3 className="text-3xl font-black tracking-tighter text-white uppercase">
                    {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {authMode === 'login' ? 'Sign in to manage your TikTok stream' : 'Join the community of pro creators'}
                  </p>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (authMode === 'login') {
                      handleLogin(authForm.email, authForm.password);
                    } else {
                      handleRegister(authForm.email, authForm.password, authForm.displayName);
                    }
                    setIsLoginModalOpen(false);
                  }}
                  className="space-y-4"
                >
                  {authMode === 'register' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Display Name</label>
                      <input 
                        type="text"
                        required
                        value={authForm.displayName}
                        onChange={(e) => setAuthForm({ ...authForm, displayName: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-pink-500/50 transition-colors"
                        placeholder="Your Streamer Name"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Email Address</label>
                    <input 
                      type="email"
                      required
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-pink-500/50 transition-colors"
                      placeholder="name@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Password</label>
                    <input 
                      type="password"
                      required
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-pink-500/50 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-pink-500 text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-pink-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                  >
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <button 
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="text-sm font-bold text-gray-500 hover:text-white transition-colors"
                  >
                    {authMode === 'login' ? "Don't have an account? Register" : "Already have an account? Sign In"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    );
  }

  if (gameOverlayMode) {
    if (gameOverlayMode === 'pixel-conquest') {
      return <PixelConquestOverlay state={pixelConquest} events={events} />;
    }
    
    if (gameOverlayMode === 'voting') {
      return <VotingGameOverlay gameState={votingGame} />;
    }

    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex flex-col items-center justify-center p-12">
        <div className="w-full max-w-4xl flex flex-col items-center gap-12">
          {gameOverlayMode === 'beyblade' && (
            <div className="w-full max-w-2xl bg-black/40 backdrop-blur-xl border border-white/10 p-12 rounded-[48px] shadow-2xl">
              <BeybladeArena game={beybladeGame} />
            </div>
          )}
          {(gameOverlayMode === 'game' || gameOverlayMode === 'stream') && (
            <div className="w-full bg-black/40 backdrop-blur-xl border border-white/10 p-12 rounded-[48px] shadow-2xl">
              <WordGameDisplay game={game} onStart={startNewGame} />
            </div>
          )}
          
          {(gameOverlayMode === 'leaderboard' || gameOverlayMode === 'stream') && (
            <div className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl">
              <WordGameLeaderboard scores={game.scores} combo={game.combo} players={game.players} />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isOverlayMode) {
    const theme = OVERLAY_THEMES[selectedTheme];
    return (
      <div 
        className={`fixed inset-0 pointer-events-none overflow-hidden ${overlayFont}`}
        style={overlayAccent ? { '--tw-text-opacity': 1, color: overlayAccent } as any : {}}
      >
        {/* Gift Alert Layer */}
        {layout.alerts.visible && (
          <div 
            className="absolute z-50 flex flex-col items-center justify-center"
            style={{ 
              left: `${layout.alerts.x}%`, 
              top: `${layout.alerts.y}%`, 
              width: `${layout.alerts.width}%` 
            }}
          >
            <AnimatePresence>
              {activeAlerts
                .filter(alert => !new URLSearchParams(window.location.search).get('screen') || alert.screen === new URLSearchParams(window.location.search).get('screen'))
                .map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, scale: 0.5, y: 100 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.5, y: -100 }}
                  className="flex flex-col items-center gap-6"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  >
                    <img 
                      src={alert.gifUrl} 
                      alt="Alert GIF" 
                      className="w-64 h-64 object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.6)]"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                  
                  {alert.type === 'alert' && (
                    <div className={`text-center p-8 rounded-[32px] border shadow-2xl ${theme.alertClass}`}>
                      <h2 
                        className={`text-4xl font-black italic uppercase tracking-tighter mb-1 ${!alert.textColor ? theme.accentColor : ''}`}
                        style={{ 
                          color: alert.textColor || undefined,
                          fontSize: alert.fontSize ? `${alert.fontSize}px` : undefined
                        }}
                      >
                        {alert.nickname}
                      </h2>
                      <p 
                        className="text-white font-bold text-xl uppercase tracking-widest opacity-80"
                        style={{ 
                          fontSize: alert.fontSize ? `${parseInt(alert.fontSize) * 0.5}px` : undefined
                        }}
                      >
                        {alert.giftName}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Stats Layer */}
        {layout.stats.visible && (
          <div 
            className="absolute flex justify-between items-start"
            style={{ 
              left: `${layout.stats.x}%`, 
              top: `${layout.stats.y}%`, 
              width: `${layout.stats.width}%` 
            }}
          >
            <div className={`rounded-full px-6 py-3 flex items-center gap-4 border ${theme.eventClass}`}>
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-white">Live</span>
            </div>
            <div className={`rounded-full px-6 py-3 flex items-center gap-4 border ${theme.eventClass}`}>
              <Heart size={16} className="text-pink-500 fill-pink-500" />
              <span className="text-xs font-black tracking-widest text-white">{stats.likes.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Goals Layer */}
        {layout.goals.visible && (
          <div 
            className="absolute space-y-4"
            style={{ 
              left: `${layout.goals.x}%`, 
              top: `${layout.goals.y}%`, 
              width: `${layout.goals.width}%` 
            }}
          >
            <GoalBar goal={followerGoal} color="emerald" theme={theme} />
            <GoalBar goal={giftGoal} color="violet" theme={theme} />
          </div>
        )}

        {/* Events List Layer */}
        {layout.events.visible && (
          <div 
            className="absolute flex flex-col items-start gap-4"
            style={{ 
              left: `${layout.events.x}%`, 
              top: `${layout.events.y}%`, 
              width: `${layout.events.width}%` 
            }}
          >
            <AnimatePresence>
              {events.slice(0, 5).reverse().map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className={`border p-4 rounded-2xl flex items-center gap-4 w-full transition-all ${
                    event.type === 'gift' ? theme.giftClass : theme.eventClass
                  }`}
                >
                  <img src={event.profilePictureUrl} alt={event.nickname} className="w-10 h-10 rounded-full border border-white/20" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${theme.accentColor} opacity-80 truncate`}>{event.nickname}</p>
                    <p className="text-sm text-white font-medium truncate">
                      {event.type === 'chat' && event.comment}
                      {event.type === 'gift' && `Sent ${event.giftName} x${event.repeatCount}`}
                      {event.type === 'social' && event.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-gray-300 font-sans selection:bg-cyan-500/30">
      <Helmet>
        <title>{`TikGifty - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}</title>
      </Helmet>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 bottom-0 w-64 bg-[#0F131A] border-r border-[#1C202B] flex flex-col py-6 z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-6 mb-8 mt-2">
          <Zap size={28} className="text-cyan-400 fill-cyan-400" />
          <span className="text-2xl font-black italic tracking-tight">
            <span className="text-cyan-400">Tik</span>
            <span className="text-pink-500">Gifty</span>
          </span>
        </div>

        {/* Creator Hub Title */}
        <div className="px-6 mb-6">
          <h3 className="text-white font-bold text-[17px] tracking-wide leading-tight">Creator Hub</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)] ${isConnected ? 'bg-cyan-400' : 'bg-red-500'}`}></div>
            <span className="text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
              {isConnected ? 'LIVE STATUS: ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full no-scrollbar px-0">
          <nav className="flex flex-col gap-1 w-full">
            <SidebarItem 
              icon={<Layout size={20} />} 
              active={activeTab === 'dashboard'} 
              onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
              label="Dashboard"
            />
            <SidebarItem 
              icon={<Zap size={20} />} 
              active={activeTab === 'actions'} 
              onClick={() => { setActiveTab('actions'); setIsMobileMenuOpen(false); }}
              label="TikGifty"
            />
            <SidebarItem 
              icon={<Monitor size={20} />} 
              active={activeTab === 'overlay'} 
              onClick={() => { setActiveTab('overlay'); setIsMobileMenuOpen(false); }}
              label="Overlays"
            />
            <SidebarItem 
              icon={<Trophy size={20} />} 
              active={activeTab === 'leaderboard'} 
              onClick={() => { setActiveTab('leaderboard'); setIsMobileMenuOpen(false); }}
              label="Analytics"
            />
            <SidebarItem 
              icon={<Gamepad2 size={20} />} 
              active={activeTab === 'games' || activeTab === 'kelime-oyunu' || activeTab === 'beyblade' || activeTab === 'pixel-conquest' || activeTab === 'voting'} 
              onClick={() => { setActiveTab('games'); setIsMobileMenuOpen(false); }}
              label="Assets"
            />
            <SidebarItem 
              icon={<Settings size={20} />} 
              active={activeTab === 'settings'} 
              onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
              label="Settings"
            />
          </nav>
        </div>

        <div className="mt-auto px-6 pb-2 space-y-4">
          <button className={`w-full py-3.5 rounded-lg text-sm font-black uppercase tracking-widest text-[#0B0E14] ${isConnected ? 'bg-cyan-400 hover:bg-cyan-300' : 'bg-pink-500 hover:bg-pink-400'} transition-all flex items-center justify-center gap-2`}>
            <Monitor size={18} /> {isConnected ? 'Go Live' : 'Go Live'}
          </button>
        </div>
      </div>

      {/* Top Header */}
      <header className="fixed top-0 left-0 md:left-64 right-0 h-[72px] bg-[#0A0D14]/90 backdrop-blur-md border-b border-[#1C202B] flex items-center justify-between px-4 md:px-8 z-40">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
          
          {/* Mock Search Bar */}
          <div className="hidden md:flex items-center bg-[#151923] border border-[#252A36] rounded-full px-4 h-10 w-80 text-sm text-gray-400">
            <Search size={16} className="mr-2" />
            <span className="opacity-70">SEARCH COMMANDS, FOLLOWERS...</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <button className="relative text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-[#0A0D14]"></span>
          </button>
          <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-bold text-white">{user?.displayName || 'Creator'}</span>
                <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">PRO PARTNER</span>
             </div>
             <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=random`} alt="Profile" className="w-10 h-10 rounded-full border-2 border-cyan-400" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 md:pl-64 p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-cyan-900/40 via-[#151923] to-[#151923] border border-[#252A36] rounded-[24px] p-8 md:p-12 flex flex-col justify-between min-h-[300px]">
               <div className="absolute top-6 left-6 flex items-center gap-2 bg-red-500/20 text-red-500 px-3 py-1.5 rounded-full text-xs font-bold border border-red-500/20">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  PREVIEW MODE
               </div>
               
               <div className="mt-16 md:mt-auto space-y-6 z-10 w-full md:w-1/2">
                 <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">READY FOR PRIME TIME?</h1>
                 <div className="flex flex-wrap items-center gap-4">
                   <button className="flex items-center gap-2 bg-cyan-400 text-[#0A0D14] px-6 py-3 rounded-xl font-bold hover:bg-cyan-300 transition-colors">
                     <Zap size={18} />
                     Go Live
                   </button>
                   <button className="flex items-center gap-2 bg-[#1A1F2C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#252A36] border border-[#252A36] transition-colors">
                     <MicOff size={18} />
                     Mute
                   </button>
                   <button 
                     onClick={() => setActiveTab('overlay')}
                     className="flex items-center gap-2 bg-[#1A1F2C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#252A36] border border-[#252A36] transition-colors"
                   >
                     <Monitor size={18} />
                     Overlays
                   </button>
                 </div>
               </div>
               
               {/* Background abstract decoration */}
               <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-black/20 to-transparent pointer-events-none hidden md:block"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#151923] border border-[#252A36] p-6 rounded-2xl flex flex-col justify-between min-h-[140px]">
                 <div className="flex justify-between items-start">
                   <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                     <Eye size={20} />
                   </div>
                   <span className="text-cyan-400 text-xs font-bold bg-cyan-500/10 px-2 py-1 rounded">+12%</span>
                 </div>
                 <div className="mt-4">
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">VIEWERS</p>
                   <p className="text-3xl font-black text-white">{stats.viewers.toLocaleString()}</p>
                 </div>
              </div>
              
              <div className="bg-[#151923] border border-[#252A36] p-6 rounded-2xl flex flex-col justify-between min-h-[140px]">
                 <div className="flex justify-between items-start">
                   <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                     <Share2 size={20} /> {/* Diamond icon substitute */}
                   </div>
                   <span className="text-pink-500 text-xs font-bold bg-pink-500/10 px-2 py-1 rounded">+24%</span>
                 </div>
                 <div className="mt-4">
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">DIAMONDS</p>
                   <p className="text-3xl font-black text-white">{stats.gifts.toLocaleString()}</p>
                 </div>
              </div>
              
              <div className="bg-[#151923] border border-[#252A36] p-6 rounded-2xl flex flex-col justify-between min-h-[140px]">
                 <div className="flex justify-between items-start">
                   <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                     <UserPlus size={20} />
                   </div>
                   <span className="text-gray-400 text-xs font-bold bg-white/5 px-2 py-1 rounded">Stable</span>
                 </div>
                 <div className="mt-4">
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">FOLLOWERS</p>
                   <p className="text-3xl font-black text-white">{stats.follows.toLocaleString()}</p>
                 </div>
              </div>

              <div className="bg-[#151923] border border-[#252A36] p-6 rounded-2xl flex flex-col justify-between min-h-[140px]">
                 <div className="flex justify-between items-start">
                   <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                     <Heart size={20} />
                   </div>
                   <span className="text-red-400 text-xs font-bold bg-red-500/10 px-2 py-1 rounded">-3%</span>
                 </div>
                 <div className="mt-4">
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">ENGAGEMENT</p>
                   <p className="text-3xl font-black text-white">92.4%</p>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6 bg-[#11141C] p-6 rounded-[24px] border border-[#252A36]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black tracking-tighter text-white">Recent Activity</h3>
                  <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300">View All History</button>
                </div>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
                  {events.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-sm text-gray-500 font-medium">No recent activity</p>
                    </div>
                  ) : (
                    events.slice(0, 10).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-[#151923] border border-[#252A36] rounded-xl hover:bg-[#1A1E29] transition-colors">
                        <div className="flex items-center gap-4">
                          <img src={event.profilePictureUrl || `https://ui-avatars.com/api/?name=${event.nickname}&background=random`} alt={event.nickname} className="w-10 h-10 rounded-lg" referrerPolicy="no-referrer" />
                          <div>
                            <p className="text-sm text-gray-300">
                              <span className="font-bold text-white mr-1">{event.nickname}</span>
                              {event.type === 'gift' && `sent a ${event.giftName}`}
                              {event.type === 'social' && event.label}
                              {event.type === 'like' && `sent ${event.repeatCount} likes`}
                            </p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mt-1">
                              {dayjs(event.timestamp).fromNow()}
                            </p>
                          </div>
                        </div>
                        {event.type === 'gift' && (
                          <div className="font-black text-cyan-400">
                            +{event.diamondCount} Diamonds
                          </div>
                        )}
                        {event.type === 'social' && (
                           <div className="font-bold text-xs px-3 py-1 bg-white/5 rounded-full text-gray-300 border border-white/10">
                              Welcome
                           </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#11141C] border border-[#252A36] rounded-3xl p-6 relative overflow-hidden">
                   <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-pink-500/20 blur-3xl rounded-full"></div>
                   <h3 className="text-xl font-black tracking-tighter text-white mb-1">Current Goal</h3>
                   <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-6">SUBATHON - LEVEL 2 UNLOCKED</p>
                   
                   <div className="space-y-2 mb-8">
                     <div className="flex justify-between text-xs font-bold text-white tracking-wide">
                       <span>NEW SUBSCRIBERS</span>
                       <span>{followerGoal.current} / {followerGoal.target}</span>
                     </div>
                     <div className="h-2 bg-[#1A1E29] rounded-full overflow-hidden">
                       <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, (followerGoal.current / followerGoal.target) * 100)}%` }} />
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-[#151923] border border-[#252A36] rounded-xl p-4">
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">TIME LEFT</p>
                        <p className="text-xl font-bold text-white">02:14:45</p>
                      </div>
                      <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 flex items-center justify-between">
                         <div>
                            <p className="text-[9px] font-black uppercase text-pink-400 tracking-widest mb-1">REWARD</p>
                            <p className="text-sm font-bold text-pink-100 leading-tight">Cosplay<br/>Stream</p>
                         </div>
                         <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center">
                            <Zap size={14} className="text-white fill-white"/>
                         </div>
                      </div>
                   </div>

                   <button className="w-full py-4 rounded-xl border border-[#252A36] font-bold text-xs uppercase tracking-widest text-gray-300 hover:bg-[#1A1E29] transition-all">
                     BOOST GOAL WITH ADS
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}

          {activeTab === 'actions' && (
            <ActionsAndEvents 
              actions={actions} 
              setActions={setActions} 
              setEditingAction={setEditingAction} 
              eventTriggers={eventTriggers} 
              setEventTriggers={setEventTriggers} 
              setEditingTrigger={setEditingTrigger} 
              timers={timers} 
              setTimers={setTimers} 
              handleTikTokEvent={handleTikTokEvent} 
            />
          )}

          {activeTab === 'overlay' && (
            <div className="space-y-8">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter text-white">Overlay</h2>
                  <p className="text-sm text-gray-500">Preview and manage your stream overlays</p>
                </div>
                <button 
                  onClick={() => {
                    const url = `${window.location.origin}${window.location.pathname}?mode=overlay`;
                    navigator.clipboard.writeText(url);
                    alert('Overlay URL copied to clipboard!');
                  }}
                  className="bg-white text-black font-black px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-[1.02] transition-all shadow-xl text-xs uppercase tracking-widest"
                >
                  <Copy size={16} />
                  Copy OBS URL
                </button>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual Editor */}
                <div className="lg:col-span-5 flex flex-col items-center gap-4">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Visual Layout Editor</p>
                  <div className="aspect-[9/16] w-full max-w-[350px] bg-black rounded-[40px] border-[12px] border-[#111317] shadow-2xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                    
                    {/* Layout Elements */}
                    {(Object.keys(layout) as Array<keyof OverlayLayout>).map((key) => {
                      const el = layout[key];
                      if (!el.visible) return null;
                      return (
                        <motion.div
                          key={key}
                          onClick={() => setEditingLayoutElement(key)}
                          className={`absolute cursor-pointer border-2 transition-all ${
                            editingLayoutElement === key ? 'border-cyan-500 z-10 bg-cyan-500/5' : 'border-transparent hover:border-white/20'
                          }`}
                          style={{
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            width: `${el.width}%`,
                          }}
                        >
                          <div className="p-2 bg-white/5 backdrop-blur-md rounded-lg text-[8px] font-black text-white/40 uppercase tracking-widest pointer-events-none">
                            {el.name}
                          </div>
                          {/* Mock content based on element type */}
                          <div className="p-2 opacity-30 scale-75 origin-top-left pointer-events-none">
                            {key === 'stats' && (
                              <div className="flex justify-between">
                                <div className="bg-white/20 rounded-full px-2 py-1 flex items-center gap-1 border border-white/10">
                                  <div className="w-1 h-1 rounded-full bg-red-500" />
                                  <span className="text-[6px] text-white">Live</span>
                                </div>
                              </div>
                            )}
                            {key === 'goals' && (
                              <div className="space-y-1">
                                <div className="h-1.5 bg-white/20 rounded-full w-full" />
                                <div className="h-1.5 bg-white/20 rounded-full w-full" />
                              </div>
                            )}
                            {key === 'events' && (
                              <div className="space-y-1">
                                <div className="h-4 bg-white/20 rounded-md w-full" />
                                <div className="h-4 bg-white/20 rounded-md w-full" />
                              </div>
                            )}
                            {key === 'alerts' && (
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-8 h-8 bg-white/20 rounded-full" />
                                <div className="h-2 bg-white/20 rounded-full w-12" />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-6">
                  <Section title="Layout Controls" description="Position and resize overlay elements">
                    <div className="bg-[#111317] border border-white/5 rounded-xl p-4 md:p-6 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(Object.keys(layout) as Array<keyof OverlayLayout>).map((key) => (
                          <button
                            key={key}
                            onClick={() => setEditingLayoutElement(key)}
                            className={`p-4 rounded-xl border transition-all text-left flex items-center justify-between ${
                              editingLayoutElement === key 
                                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-500' 
                                : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'
                            }`}
                          >
                            <span className="text-xs font-bold">{layout[key].name}</span>
                            <div onClick={(e) => {
                              e.stopPropagation();
                              setLayout({...layout, [key]: {...layout[key], visible: !layout[key].visible}});
                            }}>
                              <Toggle active={layout[key].visible} />
                            </div>
                          </button>
                        ))}
                      </div>

                      {editingLayoutElement && (
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-6 animate-in fade-in slide-in-from-top-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">
                              Editing: {layout[editingLayoutElement].name}
                            </h4>
                            <button onClick={() => setEditingLayoutElement(null)} className="text-gray-500 hover:text-white" aria-label="Close">
                              <X size={16} />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                                X Position <span>{layout[editingLayoutElement].x}%</span>
                              </label>
                              <input 
                                type="range" min="0" max="100" 
                                value={layout[editingLayoutElement].x}
                                onChange={(e) => setLayout({...layout, [editingLayoutElement]: {...layout[editingLayoutElement], x: parseInt(e.target.value)}})}
                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                                Y Position <span>{layout[editingLayoutElement].y}%</span>
                              </label>
                              <input 
                                type="range" min="0" max="100" 
                                value={layout[editingLayoutElement].y}
                                onChange={(e) => setLayout({...layout, [editingLayoutElement]: {...layout[editingLayoutElement], y: parseInt(e.target.value)}})}
                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                                Width <span>{layout[editingLayoutElement].width}%</span>
                              </label>
                              <input 
                                type="range" min="10" max="100" 
                                value={layout[editingLayoutElement].width}
                                onChange={(e) => setLayout({...layout, [editingLayoutElement]: {...layout[editingLayoutElement], width: parseInt(e.target.value)}})}
                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Section>

                  <Section title="Visual Theme" description="Choose a pre-defined style for your overlay">
                    <div className="grid grid-cols-3 gap-4">
                      {(Object.keys(OVERLAY_THEMES) as Array<keyof typeof OVERLAY_THEMES>).map((themeKey) => (
                        <button
                          key={themeKey}
                          onClick={() => setSelectedTheme(themeKey)}
                          className={`p-4 rounded-2xl border transition-all text-left space-y-3 ${
                            selectedTheme === themeKey 
                              ? 'bg-cyan-500/10 border-cyan-500 shadow-lg shadow-cyan-500/10' 
                              : 'bg-[#111317] border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className={`h-20 rounded-xl overflow-hidden relative ${OVERLAY_THEMES[themeKey].eventClass}`}>
                            <div className="absolute inset-0 p-3 flex flex-col justify-end gap-1">
                              <div className={`h-1.5 w-12 rounded-full ${OVERLAY_THEMES[themeKey].accentColor.replace('text-', 'bg-')}`} />
                              <div className="h-1 w-8 bg-white/10 rounded-full" />
                            </div>
                          </div>
                          <div>
                            <p className={`text-xs font-black uppercase tracking-widest ${selectedTheme === themeKey ? 'text-cyan-500' : 'text-white'}`}>
                              {OVERLAY_THEMES[themeKey].name}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Section>

                  <Section title="Customization" description="Override global fonts and colors">
                    <div className="bg-[#111317] border border-white/5 p-6 rounded-xl space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Overlay Font</label>
                          <select 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                            value={overlayFont}
                            onChange={(e) => setOverlayFont(e.target.value)}
                          >
                            <option value="font-sans" className="bg-[#111317]">Sans-Serif (Default)</option>
                            <option value="font-mono" className="bg-[#111317]">Monospace</option>
                            <option value="font-serif" className="bg-[#111317]">Serif</option>
                            <option value="font-comic" className="bg-[#111317]">Comic Sans</option>
                            <option value="font-impact" className="bg-[#111317]">Impact</option>
                            <option value="font-cursive" className="bg-[#111317]">Cursive</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Accent Color Override</label>
                          <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={overlayAccent || '#06b6d4'}
                              onChange={(e) => setOverlayAccent(e.target.value)}
                              className="w-12 h-11 bg-white/5 border border-white/10 rounded-xl p-1 cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={overlayAccent}
                              onChange={(e) => setOverlayAccent(e.target.value)}
                              placeholder="Leave empty for theme default"
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Section>

                  <Section title="Saved Presets" description="Save and load your overlay configurations">
                    <div className="bg-[#111317] border border-white/5 p-6 rounded-xl space-y-6">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => {
                            const name = prompt('Enter a name for this preset:');
                            if (name) {
                              setSavedPresets([...savedPresets, {
                                id: Math.random().toString(36).substr(2, 9),
                                name,
                                layout,
                                selectedTheme,
                                font: overlayFont,
                                accentColor: overlayAccent
                              }]);
                            }
                          }}
                          className="bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-cyan-600 transition-colors"
                        >
                          <Save size={16} />
                          Save Current Configuration
                        </button>
                      </div>

                      {savedPresets.length > 0 && (
                        <div className="space-y-3">
                          {savedPresets.map(preset => (
                            <div key={preset.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                              <div>
                                <h4 className="text-sm font-bold text-white">{preset.name}</h4>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                                  Theme: {OVERLAY_THEMES[preset.selectedTheme].name} | Font: {preset.font.replace('font-', '')}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                    setLayout(preset.layout);
                                    setSelectedTheme(preset.selectedTheme);
                                    setOverlayFont(preset.font);
                                    setOverlayAccent(preset.accentColor);
                                  }}
                                  className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                                  title="Load Preset"
                                >
                                  <Download size={16} />
                                </button>
                                <button 
                                  onClick={() => setSavedPresets(savedPresets.filter(p => p.id !== preset.id))}
                                  className="p-2 bg-red-500/10 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                  title="Delete Preset"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Section>

                  <Section title="Stream Goals" description="Configure your follower and gift goals">
                    <div className="bg-[#111317] border border-white/5 p-6 rounded-xl space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-white">Follower Goal</h4>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Target Followers</label>
                            <input 
                              type="number" 
                              value={followerGoal.target}
                              onChange={(e) => setFollowerGoal({...followerGoal, target: parseInt(e.target.value) || 1})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Current Followers (Manual Override)</label>
                            <input 
                              type="number" 
                              value={followerGoal.current}
                              onChange={(e) => setFollowerGoal({...followerGoal, current: parseInt(e.target.value) || 0})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-white">Diamond Goal</h4>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Target Diamonds</label>
                            <input 
                              type="number" 
                              value={giftGoal.target}
                              onChange={(e) => setGiftGoal({...giftGoal, target: parseInt(e.target.value) || 1})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Current Diamonds (Manual Override)</label>
                            <input 
                              type="number" 
                              value={giftGoal.current}
                              onChange={(e) => setGiftGoal({...giftGoal, current: parseInt(e.target.value) || 0})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Section>

                  <Section title="OBS Integration" description="How to use this overlay in your stream">
                    <div className="bg-[#111317] border border-white/5 p-6 rounded-xl space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-xl space-y-2">
                          <p className="text-xs font-black text-white uppercase tracking-widest">Step 1</p>
                          <p className="text-[10px] text-gray-500 leading-relaxed">Add a "Browser Source" in OBS.</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl space-y-2">
                          <p className="text-xs font-black text-white uppercase tracking-widest">Step 2</p>
                          <p className="text-[10px] text-gray-500 leading-relaxed">Paste the OBS URL copied above.</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl space-y-2">
                          <p className="text-xs font-black text-white uppercase tracking-widest">Step 3</p>
                          <p className="text-[10px] text-gray-500 leading-relaxed">Set resolution to 1080x1920.</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl space-y-2">
                          <p className="text-xs font-black text-white uppercase tracking-widest">Step 4</p>
                          <p className="text-[10px] text-gray-500 leading-relaxed">Check "Shutdown when not visible".</p>
                        </div>
                      </div>
                    </div>
                  </Section>

                  <Section title="Audio Settings" description="Configure global overlay sounds">
                    <div className="bg-[#111317] border border-white/5 p-6 rounded-xl space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                            TTS Volume <span>{Math.round(volumes.tts * 100)}%</span>
                          </label>
                          <input 
                            type="range" min="0" max="1" step="0.01"
                            value={volumes.tts}
                            onChange={(e) => setVolumes({...volumes, tts: parseFloat(e.target.value)})}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                            Alerts Volume <span>{Math.round(volumes.alerts * 100)}%</span>
                          </label>
                          <input 
                            type="range" min="0" max="1" step="0.01"
                            value={volumes.alerts}
                            onChange={(e) => setVolumes({...volumes, alerts: parseFloat(e.target.value)})}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                            Game Volume <span>{Math.round(volumes.game * 100)}%</span>
                          </label>
                          <input 
                            type="range" min="0" max="1" step="0.01"
                            value={volumes.game}
                            onChange={(e) => setVolumes({...volumes, game: parseFloat(e.target.value)})}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                        </div>
                      </div>

                      <div className="h-[1px] bg-white/5" />

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Gift Sound</label>
                        <p className="text-[10px] text-gray-500 mb-2">Plays every time a gift is received, regardless of specific alerts.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <select 
                            value={giftSoundUrl}
                            onChange={(e) => setGiftSoundUrl(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                          >
                            {CELEBRATORY_SOUNDS.map(sound => (
                              <option key={sound.name} value={sound.url} className="bg-[#111317]">
                                {sound.name}
                              </option>
                            ))}
                          </select>
                          <button 
                            onClick={() => {
                              if (giftSoundUrl) {
                                const audio = new Audio(giftSoundUrl);
                                audio.volume = volumes.alerts;
                                audio.play();
                              }
                            }}
                            disabled={!giftSoundUrl}
                            className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <Volume2 size={14} />
                            Test Sound
                          </button>
                        </div>
                      </div>
                    </div>
                  </Section>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-8">
              <header>
                <h2 className="text-3xl font-black tracking-tighter text-white">Leaderboard</h2>
                <p className="text-sm text-gray-500">Top contributors and active viewers</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Section title="Top Donors" description="Ranked by diamond contribution">
                  <div className="bg-[#111317] border border-white/5 rounded-xl overflow-hidden">
                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                      {(Object.values(userStats) as UserStat[])
                        .sort((a, b) => b.diamonds - a.diamonds)
                        .filter(u => u.diamonds > 0)
                        .map((user, index) => (
                          <LeaderboardItem key={user.uniqueId} user={user} index={index} type="diamonds" />
                        ))}
                      {(Object.values(userStats) as UserStat[]).filter(u => u.diamonds > 0).length === 0 && (
                        <div className="p-20 text-center text-gray-600">
                          <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                          <p className="text-sm font-medium">No donor data yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Section>

                <Section title="Top Likers" description="Ranked by interaction count">
                  <div className="bg-[#111317] border border-white/5 rounded-xl overflow-hidden">
                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                      {(Object.values(userStats) as UserStat[])
                        .sort((a, b) => b.likes - a.likes)
                        .filter(u => u.likes > 0)
                        .map((user, index) => (
                          <LeaderboardItem key={user.uniqueId} user={user} index={index} type="likes" />
                        ))}
                      {(Object.values(userStats) as UserStat[]).filter(u => u.likes > 0).length === 0 && (
                        <div className="p-20 text-center text-gray-600">
                          <Heart size={48} className="mx-auto mb-4 opacity-20" />
                          <p className="text-sm font-medium">No interaction data yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Section>
              </div>
            </div>
          )}

          {activeTab === 'games' && (
            <div className="space-y-8">
              <header>
                <h2 className="text-3xl font-black tracking-tighter text-white">Oyunlar</h2>
                <p className="text-sm text-gray-500">Canlı yayın etkileşimli oyunlarınızı yönetin</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Kelime Oyunu Card */}
                <div 
                  onClick={() => setActiveTab('kelime-oyunu')}
                  className="bg-[#111317] border border-white/10 rounded-3xl p-6 cursor-pointer hover:border-cyan-500/50 hover:bg-white/5 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <Gamepad2 size={24} className="text-cyan-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Kelime Oyunu</h3>
                  <p className="text-sm text-gray-400">İzleyicilerin harf harf kelime tahmin ettiği interaktif oyun.</p>
                </div>

                {/* Beyblade Card */}
                <div 
                  onClick={() => setActiveTab('beyblade')}
                  className="bg-[#111317] border border-white/10 rounded-3xl p-6 cursor-pointer hover:border-pink-500/50 hover:bg-white/5 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <Disc size={24} className="text-pink-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Beyblade</h3>
                  <p className="text-sm text-gray-400">İzleyicilerin hediye atarak katıldığı beyblade savaşı.</p>
                </div>

                {/* Pixel Conquest Card */}
                <div 
                  onClick={() => setActiveTab('pixel-conquest')}
                  className="bg-[#111317] border border-white/10 rounded-3xl p-6 cursor-pointer hover:border-emerald-500/50 hover:bg-white/5 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <MapIcon size={24} className="text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Pixel Conquest</h3>
                  <p className="text-sm text-gray-400">İzleyicilerin haritayı boyayarak ele geçirdiği strateji oyunu.</p>
                </div>

                {/* Voting Game Card */}
                <div 
                  onClick={() => setActiveTab('voting')}
                  className="bg-[#111317] border border-white/10 rounded-3xl p-6 cursor-pointer hover:border-blue-500/50 hover:bg-white/5 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <Users size={24} className="text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Oylama Oyunu v1</h3>
                  <p className="text-sm text-gray-400">İzleyicilerin takımlara katılıp oy verdiği interaktif oylama.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kelime-oyunu' && (
            <div className="space-y-8">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter text-white">Kelime Oyunu</h2>
                  <p className="text-sm text-gray-500">Canlı yayın etkileşimli kelime tahmin oyunu</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <button 
                    onClick={() => {
                      const url = `${window.location.origin}${window.location.pathname}?mode=stream&username=${username}`;
                      navigator.clipboard.writeText(url);
                      alert('Oyun URL kopyalandı!');
                    }}
                    className="bg-white/5 border border-white/10 text-white px-4 md:px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                  >
                    <Copy size={16} />
                    OBS URL
                  </button>
                  {game.status === 'playing' ? (
                    <button 
                      onClick={stopGame}
                      className="bg-red-500 text-white px-4 md:px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                    >
                      <Square size={18} fill="currentColor" />
                      Oyunu Durdur
                    </button>
                  ) : (
                    <button 
                      onClick={startNewGame}
                      className="bg-emerald-500 text-white px-4 md:px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      <Play size={18} fill="currentColor" />
                      Oyunu Başlat
                    </button>
                  )}
                </div>
              </header>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-[#111317] border border-white/5 rounded-3xl p-6 md:p-12 flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px]">
                  {game.status === 'idle' ? (
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto">
                        <Gamepad2 size={40} className="text-cyan-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Oyun Hazır</h3>
                        <p className="text-gray-500 max-w-md">
                          Oyunu başlatmak için yukarıdaki butona tıklayın. İzleyiciler chat üzerinden tahmin yapabilir.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <WordGameDisplay game={game} onStart={startNewGame} />
                  )}
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-[#111317] border border-white/5 rounded-3xl p-6">
                    <WordGameLeaderboard scores={game.scores} combo={game.combo} players={game.players} />
                  </div>

                  <Section title="Oyun Ayarları" description="Oyun parametrelerini özelleştirin">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                          Tur Süresi (Saniye) <span>{game.roundDuration}s</span>
                        </label>
                        <input 
                          type="range" min="10" max="120" step="5"
                          value={game.roundDuration}
                          onChange={(e) => setGame(prev => ({ ...prev, roundDuration: parseInt(e.target.value), timer: prev.status === 'idle' ? parseInt(e.target.value) : prev.timer }))}
                          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>
                    </div>
                  </Section>
                  
                  <Section title="Oyun Kuralları" description="Nasıl oynanır?">
                    <div className="space-y-4 text-xs text-gray-500 leading-relaxed">
                      <p>1. Sistem rastgele bir kategoriden kelime seçer.</p>
                      <p>2. İzleyiciler chat'e kelimeyi yazarak tahmin eder.</p>
                      <p>3. İlk doğru bilen 10 puan kazanır.</p>
                      <p>4. Üst üste bilenler kombo bonusu alır.</p>
                      <p>5. Her 10 saniyede bir ipucu harfi açılır.</p>
                    </div>
                  </Section>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'beyblade' && (
            <BeybladeDashboard 
              game={beybladeGame} 
              setGame={setBeybladeGame}
              onStart={() => setBeybladeGame(prev => ({ ...prev, status: 'playing', players: [] }))}
              onStop={() => setBeybladeGame(prev => ({ ...prev, status: 'idle' }))}
              username={username}
            />
          )}

          {activeTab === 'pixel-conquest' && (
            <PixelConquestDashboard 
              state={pixelConquest} 
              setState={setPixelConquest}
              onStart={() => setPixelConquest(prev => ({ ...prev, status: 'playing', players: [], grid: Array(prev.settings.gridHeight).fill(null).map(() => Array(prev.settings.gridWidth).fill({ ownerId: null, color: null })), reignPlayerId: null }))}
              onStop={() => setPixelConquest(prev => ({ ...prev, status: 'idle' }))}
              username={username}
            />
          )}

          {activeTab === 'voting' && (
            <VotingGameDashboard 
              gameState={votingGame}
              setGameState={setVotingGame}
              username={username}
            />
          )}

          {activeTab === 'pricing' && (
            <PricingPage 
              isSubscribed={isPro} 
              onSubscribe={() => setIsCheckingOut(true)} 
            />
          )}

          {isCheckingOut && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0a0a0a] border border-white/10 w-full max-w-xl rounded-[48px] overflow-hidden shadow-2xl"
              >
                <div className="p-12 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center">
                        <CreditCard size={20} className="text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Checkout</h3>
                    </div>
                    <button onClick={() => setIsCheckingOut(false)} className="p-2 text-gray-500 hover:text-white transition-colors" aria-label="Close">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="bg-white/5 p-6 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Selected Plan</span>
                      <span className="font-bold text-white">Pro Plan (Monthly)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Price</span>
                      <span className="font-bold text-white">$8.00</span>
                    </div>
                    <div className="h-[1px] bg-white/10" />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-white">Total</span>
                      <span className="text-2xl font-black text-pink-500">$8.00</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Card Details</label>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                        <CreditCard size={20} className="text-gray-500" />
                        <input type="text" placeholder="Card Number" className="bg-transparent border-none outline-none text-white w-full" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <input type="text" placeholder="MM/YY" className="bg-transparent border-none outline-none text-white w-full" />
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <input type="text" placeholder="CVC" className="bg-transparent border-none outline-none text-white w-full" />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      handleSubscribe();
                      setIsCheckingOut(false);
                    }}
                    className="w-full bg-pink-500 text-white py-5 rounded-2xl font-black text-xl shadow-lg shadow-pink-500/20 hover:scale-[1.02] transition-all"
                  >
                    Complete Payment
                  </button>

                  <p className="text-center text-[10px] text-gray-600 uppercase font-black tracking-widest">
                    Your payment is secured by Stripe encryption
                  </p>
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <header>
                <h2 className="text-3xl font-black tracking-tighter text-white">Settings</h2>
                <p className="text-sm text-gray-500">Configure your stream experience</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Section title="General Preferences" description="Basic application settings">
                    <div className="bg-[#111317] border border-white/5 rounded-xl p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">Auto-Connect</p>
                          <p className="text-xs text-gray-500">Automatically connect to TikTok on startup</p>
                        </div>
                        <button className="w-12 h-6 bg-cyan-500 rounded-full relative">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">Debug Mode</p>
                          <p className="text-xs text-gray-500">Show technical logs in the console</p>
                        </div>
                        <button className="w-12 h-6 bg-white/10 rounded-full relative">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white/40 rounded-full" />
                        </button>
                      </div>
                    </div>
                  </Section>

                  <Section title="Text-to-Speech" description="Configure alert voice and messages">
                    <div className="bg-[#111317] border border-white/5 rounded-xl p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">Enable TTS</p>
                          <p className="text-xs text-gray-500">Read out gift and follow alerts</p>
                        </div>
                        <div onClick={() => setIsTTSEnabled(!isTTSEnabled)}>
                          <Toggle active={isTTSEnabled} />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Voice</label>
                            <button 
                              onClick={() => speak("This is a test of the selected voice.")}
                              className="text-[10px] font-black text-cyan-500 uppercase tracking-widest hover:text-cyan-400 transition-colors"
                            >
                              Test Voice
                            </button>
                          </div>
                          <select 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                            value={ttsVoice?.name || ''}
                            onChange={(e) => {
                              const voice = window.speechSynthesis.getVoices().find(v => v.name === e.target.value);
                              if (voice) setTtsVoice(voice);
                            }}
                          >
                            {window.speechSynthesis.getVoices().map(voice => (
                              <option key={voice.name} value={voice.name} className="bg-[#111317]">
                                {voice.name} ({voice.lang})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                        <div className="flex items-center gap-2 text-cyan-500 mb-2">
                          <Sparkles size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Pro Tip</span>
                        </div>
                        <p className="text-xs text-gray-400">Use <code className="text-cyan-400">{'{nickname}'}</code> and <code className="text-cyan-400">{'{giftName}'}</code> in your alert templates for dynamic messages.</p>
                      </div>
                    </div>
                  </Section>

                  <Section title="Alert Orchestration" description="Configure gift alerts and sounds">
                    <div className="bg-[#111317] border border-white/5 rounded-xl p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {actions.filter(a => a.description.toLowerCase().includes('alert')).map((action) => (
                          <div key={action.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:border-cyan-500/30 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-500">
                                <Gift size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{action.name}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Custom Alert</p>
                                  {action.ttsEnabled && (
                                    <span className="flex items-center gap-1 text-[8px] text-cyan-500 font-black uppercase tracking-widest bg-cyan-500/10 px-1.5 py-0.5 rounded">
                                      <Volume2 size={8} /> TTS
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => setEditingAction(action)}
                              className="p-2 text-gray-500 hover:text-white transition-colors"
                            >
                              <Edit3 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => {
                          const newAction: TikTokAction = {
                            id: Math.random().toString(36).substr(2, 9),
                            name: 'New Gift Alert',
                            type: 'alert',
                            screen: 'Screen 1',
                            duration: 5,
                            animation: 'fade',
                            imageUrl: '',
                            soundUrl: '',
                            videoUrl: '',
                            description: 'Custom gift alert',
                            textColor: '#ec4899',
                            fontSize: '36',
                            ttsEnabled: true,
                            ttsTemplate: '{nickname} sent {giftName}!',
                            ttsVoice: ''
                          };
                          setActions([...actions, newAction]);
                          setEditingAction(newAction);
                        }}
                        className="w-full py-3 border border-dashed border-white/10 rounded-xl text-xs font-bold text-gray-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={14} />
                        Add New Gift Alert
                      </button>
                    </div>
                  </Section>

                  <Section title="Account" description="Your subscription and profile">
                    <div className="bg-[#111317] border border-white/5 rounded-xl p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=random`} alt={user?.displayName || 'User'} className="w-12 h-12 rounded-xl border border-white/10" />
                        <div>
                          <p className="text-sm font-bold text-white">{user?.displayName}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-pink-500/10 text-pink-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-pink-500/20">
                        {isPro ? t('header.proCreator') : t('header.freePlan')}
                      </span>
                    </div>
                  </Section>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 md:p-8 rounded-2xl md:rounded-3xl text-white shadow-2xl">
                    <h3 className="text-xl font-black tracking-tighter mb-2">Need Help?</h3>
                    <p className="text-xs font-medium opacity-80 mb-6">Join our Discord community for support and feature requests.</p>
                    <button className="w-full bg-white text-cyan-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors">
                      Join Discord
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'about' && (
            <div className="space-y-12 max-w-4xl mx-auto px-4">
              <header className="text-center space-y-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-cyan-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/20 mx-auto mb-6">
                  <Zap className="text-white fill-white" size={32} />
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white">About Tik Gifty</h2>
                <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto">The ultimate interaction toolkit for TikTok streamers. Boost engagement, automate alerts, and gamify your live stream.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-[#111317] border border-white/5 p-6 md:p-8 rounded-[24px] md:rounded-[32px] space-y-4">
                  <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Real-time Interaction</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Connect directly to your TikTok Live stream and react instantly to every gift, follow, and comment. Tik Gifty captures events as they happen, allowing you to focus on your content.</p>
                </div>

                <div className="bg-[#111317] border border-white/5 p-6 md:p-8 rounded-[24px] md:rounded-[32px] space-y-4">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-500">
                    <Gamepad2 size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Stream Gamification</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Turn your stream into an interactive playground. From "Kelime Oyunu" to "Beyblade" battles, give your viewers a reason to stay and participate in your community.</p>
                </div>

                <div className="bg-[#111317] border border-white/5 p-6 md:p-8 rounded-[24px] md:rounded-[32px] space-y-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                    <Bell size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Custom Alerts</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Design beautiful, high-performance overlays with custom GIFs, sounds, and text-to-speech. Make every gift feel special with personalized reactions that match your brand.</p>
                </div>

                <div className="bg-[#111317] border border-white/5 p-6 md:p-8 rounded-[24px] md:rounded-[32px] space-y-4">
                  <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-500">
                    <Cpu size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Self-Hosted Freedom</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Tik Gifty is designed for flexibility. Run it on our cloud or host it yourself on your own VDS for maximum privacy and control over your data and stream assets.</p>
                </div>
              </div>

              <Section title="How It Helps Streamers" description="Why top creators choose Tik Gifty">
                <div className="bg-[#111317] border border-white/5 p-6 md:p-8 rounded-[24px] md:rounded-[32px] space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-500 mt-1">
                      <Check size={14} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Increased Revenue</h4>
                      <p className="text-sm text-gray-500">Interactive alerts and games encourage viewers to send more gifts and participate in the stream economy.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-500 mt-1">
                      <Check size={14} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Higher Retention</h4>
                      <p className="text-sm text-gray-500">Gamified elements keep viewers engaged for longer periods, boosting your stream's visibility in the TikTok algorithm.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-500 mt-1">
                      <Check size={14} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Automated Moderation</h4>
                      <p className="text-sm text-gray-500">Focus on your performance while Tik Gifty handles the technical side of alert management and viewer interactions.</p>
                    </div>
                  </div>
                </div>
              </Section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Section title="Support" description="Get help when you need it">
                  <div className="bg-[#111317] border border-white/5 p-8 rounded-[32px] space-y-4">
                    <p className="text-sm text-gray-500">Have questions or need technical assistance? Our support team and community are here to help you get the most out of Tik Gifty.</p>
                    <div className="flex flex-col gap-3">
                      <a href="#" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                        <div className="flex items-center gap-3 text-white">
                          <MessageSquare size={18} className="text-cyan-500" />
                          <span className="text-sm font-bold">Discord Community</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
                      </a>
                      <a href="mailto:support@tikgifty.com" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                        <div className="flex items-center gap-3 text-white">
                          <Globe size={18} className="text-emerald-500" />
                          <span className="text-sm font-bold">Email Support</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
                      </a>
                    </div>
                  </div>
                </Section>

                <Section title="Social Media" description="Follow us for updates">
                  <div className="bg-[#111317] border border-white/5 p-8 rounded-[32px] space-y-4">
                    <p className="text-sm text-gray-500">Stay up to date with the latest features, tips, and community highlights by following our social channels.</p>
                    <div className="flex flex-col gap-3">
                      <a href="#" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                        <div className="flex items-center gap-3 text-white">
                          <Twitter size={18} className="text-blue-400" />
                          <span className="text-sm font-bold">Twitter / X</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
                      </a>
                      <a href="#" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                        <div className="flex items-center gap-3 text-white">
                          <Share2 size={18} className="text-pink-500" />
                          <span className="text-sm font-bold">TikTok Official</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
                      </a>
                    </div>
                  </div>
                </Section>
              </div>

              <footer className="text-center py-12 border-t border-white/5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">© 2026 Tik Gifty. All rights reserved.</p>
              </footer>
            </div>
          )}
      </main>

      <AnimatePresence>
        {editingTrigger && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingTrigger(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black tracking-tighter text-white">Edit Trigger</h3>
                  <p className="text-sm text-gray-500">Configure when actions should be triggered</p>
                </div>
                <button onClick={() => setEditingTrigger(null)} className="p-2 text-gray-500 hover:text-white transition-colors" aria-label="Close">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Event Type</label>
                    <select 
                      value={editingTrigger.triggerType}
                      onChange={(e) => setEditingTrigger({...editingTrigger, triggerType: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                    >
                      <option value="Gift">Gift</option>
                      <option value="Follow">Follow</option>
                      <option value="Like">Like</option>
                      <option value="Subscribe">Subscribe</option>
                      <option value="Share">Share</option>
                      <option value="Join">Join</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Trigger Value (e.g. Gift Name)</label>
                    <input 
                      type="text" 
                      value={editingTrigger.triggerValue || ''}
                      onChange={(e) => setEditingTrigger({...editingTrigger, triggerValue: e.target.value})}
                      placeholder={editingTrigger.triggerType === 'Gift' ? 'Rose' : 'Value'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">Complex Conditions</p>
                      <p className="text-xs text-gray-500">Trigger only after a certain count or streak</p>
                    </div>
                    <div onClick={() => setEditingTrigger({...editingTrigger, isStreak: !editingTrigger.isStreak})}>
                      <Toggle active={!!editingTrigger.isStreak} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Minimum Count</label>
                      <input 
                        type="number" 
                        value={editingTrigger.minCount || 0}
                        onChange={(e) => setEditingTrigger({...editingTrigger, minCount: parseInt(e.target.value)})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                    <div className="flex items-end pb-3">
                      <p className="text-[10px] text-gray-500 italic">
                        {editingTrigger.isStreak 
                          ? "Action triggers only if received consecutively X times." 
                          : "Action triggers every time after X total events."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Linked Actions</label>
                  <div className="grid grid-cols-2 gap-3">
                    {actions.map(action => (
                      <button
                        key={action.id}
                        onClick={() => {
                          const currentIds = editingTrigger.actionIds;
                          const newIds = currentIds.includes(action.id)
                            ? currentIds.filter(id => id !== action.id)
                            : [...currentIds, action.id];
                          setEditingTrigger({...editingTrigger, actionIds: newIds});
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          editingTrigger.actionIds.includes(action.id)
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-500'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <p className="text-xs font-bold">{action.name}</p>
                        <p className="text-[8px] uppercase tracking-widest opacity-60">{action.type}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-end gap-4">
                <button 
                  onClick={() => {
                    if (eventTriggers.find(t => t.id === editingTrigger.id)) {
                      setEventTriggers(eventTriggers.filter(t => t.id !== editingTrigger.id));
                    }
                    setEditingTrigger(null);
                  }}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Delete
                </button>
                <div className="flex-1" />
                <button 
                  onClick={() => setEditingTrigger(null)}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const exists = eventTriggers.find(t => t.id === editingTrigger.id);
                    if (exists) {
                      setEventTriggers(eventTriggers.map(t => t.id === editingTrigger.id ? editingTrigger : t));
                    } else {
                      setEventTriggers([...eventTriggers, editingTrigger]);
                    }
                    setEditingTrigger(null);
                  }}
                  className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Save Trigger
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingAction(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black tracking-tighter text-white">Edit Action</h3>
                  <p className="text-sm text-gray-500">Customize how this action behaves</p>
                </div>
                <button onClick={() => setEditingAction(null)} className="p-2 text-gray-500 hover:text-white transition-colors" aria-label="Close">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Action Name</label>
                    <input 
                      type="text" 
                      value={editingAction.name}
                      onChange={(e) => setEditingAction({...editingAction, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Action Type</label>
                    <select 
                      value={editingAction.type}
                      onChange={(e) => setEditingAction({...editingAction, type: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                    >
                      <option value="alert">Alert (Image + Sound)</option>
                      <option value="sound">Sound Only</option>
                      <option value="animation">Animation Only</option>
                      <option value="tts">TTS Only</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Screen</label>
                    <select 
                      value={editingAction.screen}
                      onChange={(e) => setEditingAction({...editingAction, screen: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                    >
                      {Array.from({length: 8}, (_, i) => i + 1).map(n => (
                        <option key={n} value={`Screen ${n}`}>Screen {n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Duration (seconds)</label>
                    <input 
                      type="number" 
                      value={editingAction.duration}
                      onChange={(e) => setEditingAction({...editingAction, duration: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Animation</label>
                    <select 
                      value={editingAction.animation}
                      onChange={(e) => setEditingAction({...editingAction, animation: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                    >
                      <option value="fade">Fade</option>
                      <option value="bounce">Bounce</option>
                      <option value="slide">Slide</option>
                      <option value="zoom">Zoom</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Image/GIF URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={editingAction.imageUrl}
                      onChange={(e) => setEditingAction({...editingAction, imageUrl: e.target.value})}
                      placeholder="https://..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <label className="cursor-pointer bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all flex items-center justify-center min-w-[48px]">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'image')}
                        disabled={isUploading}
                      />
                      {isUploading ? <RefreshCw size={18} className="animate-spin text-cyan-500" /> : <Upload size={18} className="text-gray-400" />}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sound URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={editingAction.soundUrl}
                      onChange={(e) => setEditingAction({...editingAction, soundUrl: e.target.value})}
                      placeholder="https://..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <label className="cursor-pointer bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all flex items-center justify-center min-w-[48px]">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="audio/*"
                        onChange={(e) => handleFileUpload(e, 'sound')}
                        disabled={isUploading}
                      />
                      {isUploading ? <RefreshCw size={18} className="animate-spin text-cyan-500" /> : <Upload size={18} className="text-gray-400" />}
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Text Color</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={editingAction.textColor || '#ec4899'}
                        onChange={(e) => setEditingAction({...editingAction, textColor: e.target.value})}
                        className="w-12 h-11 bg-white/5 border border-white/10 rounded-xl p-1 cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={editingAction.textColor || ''}
                        onChange={(e) => setEditingAction({...editingAction, textColor: e.target.value})}
                        placeholder="#HEX"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Font Size (px)</label>
                    <input 
                      type="number" 
                      value={editingAction.fontSize || '36'}
                      onChange={(e) => setEditingAction({...editingAction, fontSize: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">TTS for this action</p>
                      <p className="text-xs text-gray-500">Override global TTS for this specific action</p>
                    </div>
                    <div onClick={() => setEditingAction({...editingAction, ttsEnabled: !editingAction.ttsEnabled})}>
                      <Toggle active={!!editingAction.ttsEnabled} />
                    </div>
                  </div>
                  {editingAction.ttsEnabled && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">TTS Template</label>
                        <input 
                          type="text" 
                          value={editingAction.ttsTemplate}
                          onChange={(e) => setEditingAction({...editingAction, ttsTemplate: e.target.value})}
                          placeholder="{nickname} sent {giftName}!"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Voice (Optional)</label>
                          <button 
                            onClick={() => speak("Testing this specific voice.", editingAction.ttsVoice)}
                            className="text-[10px] font-black text-cyan-500 uppercase tracking-widest hover:text-cyan-400 transition-colors"
                          >
                            Test
                          </button>
                        </div>
                        <select 
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                          value={editingAction.ttsVoice || ''}
                          onChange={(e) => setEditingAction({...editingAction, ttsVoice: e.target.value})}
                        >
                          <option value="" className="bg-[#111317]">Default Global Voice</option>
                          {window.speechSynthesis.getVoices().map(voice => (
                            <option key={voice.name} value={voice.name} className="bg-[#111317]">
                              {voice.name} ({voice.lang})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Accompanying Sound Effect</label>
                        <select 
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                          value={editingAction.ttsSoundEffect || ''}
                          onChange={(e) => setEditingAction({...editingAction, ttsSoundEffect: e.target.value})}
                        >
                          <option value="" className="bg-[#111317]">None</option>
                          {GIFT_PRESETS.SOUNDS.map(sound => (
                            <option key={sound.name} value={sound.url} className="bg-[#111317]">
                              {sound.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-end gap-4">
                <button 
                  onClick={() => setEditingAction(null)}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setActions(actions.map(a => a.id === editingAction.id ? editingAction : a));
                    setEditingAction(null);
                  }}
                  className="bg-cyan-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/20"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1f2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #374151;
        }
      `}</style>
    </div>
  );
}

function Toggle({ active }: { active: boolean }) {
  return (
    <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 cursor-pointer ${active ? 'bg-pink-500' : 'bg-white/10'}`}>
      <div className={`w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  );
}

function StatCard({ label, value, icon, trend }: { label: string, value: string, icon: ReactNode, trend?: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-6 md:p-8 rounded-[24px] md:rounded-[32px] relative overflow-hidden group hover:border-white/10 transition-all shadow-xl">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5">
            {icon}
          </div>
          {trend && (
            <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-pink-500/10 text-pink-500'}`}>
              {trend}
            </div>
          )}
        </div>
        <p className="text-4xl font-black tracking-tighter text-white mb-2">{value}</p>
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{label}</p>
      </div>
    </div>
  );
}

function SidebarItem({ icon, active, onClick, label, badge }: { icon: ReactNode, active: boolean, onClick: () => void, label: string, badge?: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-12 rounded-r-lg flex items-center gap-4 px-4 transition-all relative ${
        active 
          ? 'bg-gradient-to-r from-[#172436] to-transparent border-l-[3px] border-cyan-400 text-cyan-400' 
          : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border-l-[3px] border-transparent'
      }`}
    >
      <div className="flex items-center justify-center w-5 h-5 opacity-90">
        {icon}
      </div>
      <span className={`text-sm font-semibold tracking-wide ${active ? 'text-white' : ''}`}>
        {label}
      </span>
      {badge && (
        <span className="ml-auto bg-cyan-500/20 text-cyan-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
          {badge}
        </span>
      )}
    </button>
  );
}

function EventItem({ event }: { event: TikTokEvent, key?: any }) {
  const [copied, setCopied] = useState(false);

  const getIcon = () => {
    switch (event.type) {
      case 'chat': return <MessageSquare size={14} className="text-gray-400" />;
      case 'gift': return <Gift size={14} className="text-violet-400" />;
      case 'social': return <UserPlus size={14} className="text-blue-400" />;
      case 'like': return <Heart size={14} className="text-pink-400" />;
      case 'bot': return <Zap size={14} className="text-amber-400" />;
      default: return <Activity size={14} className="text-gray-400" />;
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(event.nickname);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.tiktok.com/@${event.uniqueId}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-6 p-5 rounded-[24px] border transition-all group hover:bg-white/[0.02] ${
        event.type === 'gift' 
          ? 'bg-violet-500/[0.03] border-violet-500/10' 
          : 'bg-white/[0.01] border-white/5'
      }`}
    >
      <div className="relative shrink-0">
        <img 
          src={event.profilePictureUrl} 
          alt="" 
          onClick={openProfile}
          className="w-12 h-12 rounded-2xl border border-white/10 cursor-pointer hover:scale-105 transition-transform object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-pink-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          <ExternalLink size={10} className="text-white" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span 
              onClick={openProfile}
              className="font-black text-sm text-white truncate cursor-pointer hover:text-pink-500 transition-colors"
            >
              {event.nickname}
            </span>
            <button 
              onClick={handleCopy}
              className="text-gray-600 hover:text-white transition-colors"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            </button>
          </div>
          <span className="text-[10px] text-gray-600 font-bold font-mono">@{event.uniqueId}</span>
          <div className="ml-auto text-[10px] text-gray-700 font-mono">
            {dayjs(event.timestamp).fromNow()}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white/5 rounded-lg">
            {getIcon()}
          </div>
          <p className="text-sm text-gray-400 font-medium truncate">
            {event.type === 'chat' && event.comment}
            {event.type === 'gift' && (
              <span className="flex items-center gap-2">
                Sent <span className="font-black text-violet-400">{event.giftName}</span>
                <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded-full text-[10px] font-black">
                  x{event.repeatCount}
                </span>
              </span>
            )}
            {event.type === 'social' && <span className="text-blue-400 font-black uppercase text-[10px] tracking-widest">{event.label}</span>}
            {event.type === 'like' && <span className="text-pink-500 font-black uppercase text-[10px] tracking-widest">Sent Likes</span>}
            {event.type === 'bot' && (
              <span className="flex items-center gap-2">
                <span className="text-amber-500 font-black uppercase text-[10px] tracking-widest">Bot Response:</span>
                <span className="text-white font-medium italic">"{event.response}"</span>
              </span>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function LeaderboardItem({ user, index, type }: { user: UserStat, index: number, type: 'likes' | 'diamonds', key?: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(user.nickname);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.tiktok.com/@${user.uniqueId}`, '_blank');
  };

  return (
    <div className="flex items-center gap-5 p-4 bg-white/[0.01] rounded-[24px] border border-white/5 group hover:bg-white/[0.03] transition-all">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-lg ${
        index === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-600 text-black rotate-3' : 
        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' : 
        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-black' : 'bg-[#050505] text-gray-500 border border-white/5'
      }`}>
        {index + 1}
      </div>
      
      <div className="relative shrink-0">
        <img 
          src={user.profilePictureUrl} 
          alt="" 
          onClick={openProfile}
          className="w-12 h-12 rounded-2xl border border-white/10 cursor-pointer hover:scale-105 transition-transform object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-pink-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          <ExternalLink size={10} className="text-white" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p 
            onClick={openProfile}
            className="font-black text-sm text-white truncate cursor-pointer hover:text-pink-500 transition-colors"
          >
            {user.nickname}
          </p>
          <button 
            onClick={handleCopy}
            className="text-gray-600 hover:text-white transition-colors"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          </button>
        </div>
        <p className="text-[10px] text-gray-600 font-bold font-mono">@{user.uniqueId}</p>
      </div>

      <div className="text-right shrink-0">
        <p className={`text-lg font-black tracking-tighter ${type === 'likes' ? 'text-pink-500' : 'text-violet-500'}`}>
          {type === 'likes' ? user.likes.toLocaleString() : user.diamonds.toLocaleString()}
        </p>
        <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest">{type}</p>
      </div>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string, children: ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">{title}</h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}



function SimButton({ label, onClick }: { label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
    >
      {label}
    </button>
  );
}

function GoalWidget({ goal, icon, icon2, color }: { goal: { current: number, target: number, label: string }, icon: ReactNode, icon2?: ReactNode, color: string }) {
  const percentage = Math.min(Math.round((goal.current / goal.target) * 100), 100);
  
  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-6 md:p-8 rounded-[24px] md:rounded-[32px] relative overflow-hidden group hover:border-white/10 transition-all shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5">
            {icon}
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{goal.label}</p>
            <p className="text-2xl font-black tracking-tighter text-white">{goal.current.toLocaleString()} / {goal.target.toLocaleString()}</p>
          </div>
        </div>
        {icon2 && (
          <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5">
            {icon2}
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
          <span className="text-gray-500">Progress</span>
          <span className={`text-${color}-500`}>{percentage}%</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-600 shadow-[0_0_20px_rgba(236,72,153,0.3)]`}
          />
        </div>
      </div>
    </div>
  );
}

function WordGameDisplay({ game, onStart }: { game: WordGame, onStart: () => void }) {
  const wordDisplay = game.currentWord.split('').map((char, index) => {
    if (char === ' ') return ' ';
    return game.revealedLetters.includes(index) || game.status === 'won' || game.status === 'timeout' ? char : '_';
  }).join(' ');

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="text-center space-y-2">
        <span className="px-4 py-1 bg-cyan-500/10 text-cyan-500 rounded-full text-xs font-black uppercase tracking-widest border border-cyan-500/20">
          Kategori: {game.category || '---'}
        </span>
        <h3 className="text-6xl font-black tracking-[0.2em] text-white font-mono mt-4">
          {wordDisplay || '---'}
        </h3>
      </div>

      <div className="flex items-center gap-12">
        <div className="text-center">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Kalan Süre</p>
          <div className={`text-4xl font-black ${game.timer < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {game.timer}s
          </div>
        </div>
        
        {game.status === 'playing' ? (
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 flex items-center justify-center relative">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4"
                className="text-cyan-500"
                strokeDasharray={175.9}
                strokeDashoffset={175.9 - (175.9 * game.timer) / 30}
              />
            </svg>
            <Gamepad2 size={24} className="absolute text-cyan-500" />
          </div>
        ) : (
          <button 
            onClick={onStart}
            className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Play size={32} fill="currentColor" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {game.status === 'won' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl text-center"
          >
            <p className="text-emerald-500 font-black uppercase tracking-widest text-xs mb-1">Tebrikler!</p>
            <p className="text-white text-xl font-bold">{game.winner} kelimeyi bildi!</p>
            <p className="text-emerald-400 text-sm mt-2">Yeni oyun başlıyor...</p>
          </motion.div>
        )}
        {game.status === 'timeout' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl text-center"
          >
            <p className="text-red-500 font-black uppercase tracking-widest text-xs mb-1">Süre Doldu!</p>
            <p className="text-white text-xl font-bold">Kelime: {game.currentWord}</p>
            <p className="text-red-400 text-sm mt-2">Yeni oyun başlıyor...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WordGameLeaderboard({ scores, combo, players }: { scores: Record<string, number>, combo: Record<string, number>, players: Record<string, { nickname: string, profilePictureUrl: string }> }) {
  const sortedPlayers = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Sıralama</h4>
        <Trophy size={14} className="text-yellow-500" />
      </div>
      <div className="space-y-2">
        {sortedPlayers.map(([uid, score], index) => (
          <div key={uid} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                index === 0 ? 'bg-yellow-500 text-black' : 
                index === 1 ? 'bg-gray-300 text-black' : 
                index === 2 ? 'bg-orange-500 text-black' : 'bg-white/10 text-white'
              }`}>
                {index + 1}
              </span>
              <img src={players[uid]?.profilePictureUrl} alt={players[uid]?.nickname} className="w-6 h-6 rounded-full border border-white/10" referrerPolicy="no-referrer" />
              <span className="text-sm font-bold text-white truncate max-w-[100px]">{players[uid]?.nickname || uid}</span>
              {combo[uid] > 1 && (
                <span className="px-2 py-0.5 bg-orange-500 text-black text-[8px] font-black rounded-full animate-bounce">
                  {combo[uid]} KOMBO!
                </span>
              )}
            </div>
            <span className="text-sm font-black text-cyan-500">{score}</span>
          </div>
        ))}
        {sortedPlayers.length === 0 && (
          <div className="text-center py-8 text-gray-600 italic text-sm">
            Henüz puan kazanan yok.
          </div>
        )}
      </div>
    </div>
  );
}

function PricingPage({ isSubscribed, onSubscribe }: { isSubscribed: boolean, onSubscribe: () => void }) {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {IS_SELF_HOSTED && (
        <div className="bg-pink-500/10 border border-pink-500/30 p-6 rounded-2xl md:rounded-3xl text-center">
          <p className="text-pink-500 font-bold">Self-Hosted Mode Active</p>
          <p className="text-gray-400 text-sm">All professional features are unlocked as you are hosting the server yourself.</p>
        </div>
      )}
      <header className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white">Choose Your Plan</h2>
        <p className="text-sm md:text-base text-gray-500 px-4">Unlock professional features and take your stream to the next level.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pt-8 px-4 md:px-0">
        {/* Free Plan */}
        <div className="p-8 md:p-10 bg-[#111317] border border-white/5 rounded-[32px] md:rounded-[48px] space-y-8 relative overflow-hidden">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Free Plan</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl md:text-5xl font-black text-white">$0</span>
              <span className="text-gray-500">/month</span>
            </div>
          </div>
          <ul className="space-y-4">
            {['Basic Overlays', 'Standard Word Game', '5 Gift Alerts', 'Community Support'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                <Check size={16} className="text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
          <button 
            disabled={!isSubscribed}
            className={`w-full py-4 rounded-2xl font-bold transition-all ${
              !isSubscribed 
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                : 'bg-white/5 border border-white/10 text-gray-500'
            }`}
          >
            {!isSubscribed ? 'Current Plan' : 'Downgrade'}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="p-8 md:p-10 bg-gradient-to-br from-pink-500/10 to-violet-600/10 border border-pink-500/30 rounded-[32px] md:rounded-[48px] space-y-8 relative overflow-hidden">
          <div className="absolute top-6 right-6 px-3 py-1 bg-pink-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Recommended</div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Pro Plan</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl md:text-5xl font-black text-white">$8</span>
              <span className="text-gray-500">/month</span>
            </div>
          </div>
          <ul className="space-y-4">
            {['Unlimited Overlays', 'Beyblade Arena Access', 'Custom TTS Voices', 'Priority Support', 'Ad-Free Experience', 'Advanced Analytics'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-white">
                <Check size={16} className="text-pink-500" />
                {item}
              </li>
            ))}
          </ul>
          <button 
            onClick={onSubscribe}
            disabled={isSubscribed}
            className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg ${
              isSubscribed 
                ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' 
                : 'bg-pink-500 text-white shadow-pink-500/20 hover:scale-[1.02]'
            }`}
          >
            {isSubscribed ? 'Active Plan' : 'Upgrade to Pro'}
          </button>
        </div>
      </div>

      <div className="bg-[#111317] border border-white/5 p-6 md:p-8 rounded-[24px] md:rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 mx-4 md:mx-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="font-bold text-white">Secure Payment</p>
            <p className="text-xs text-gray-500">Powered by Stripe. Cancel anytime.</p>
          </div>
        </div>
        <div className="flex items-center gap-6 opacity-40 grayscale">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-6" referrerPolicy="no-referrer" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" referrerPolicy="no-referrer" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8" referrerPolicy="no-referrer" />
        </div>
      </div>
    </div>
  );
}

function BeybladeArena({ game }: { game: BeybladeGame }) {
  const arenaThemes = {
    classic: 'bg-zinc-900 border-zinc-800',
    magma: 'bg-orange-950 border-orange-800 shadow-[inset_0_0_100px_rgba(255,69,0,0.2)]',
    cyber: 'bg-slate-950 border-cyan-500/30 shadow-[inset_0_0_100px_rgba(6,182,212,0.1)]',
    galaxy: 'bg-indigo-950 border-purple-500/30 shadow-[inset_0_0_100px_rgba(168,85,247,0.1)]',
    glacier: 'bg-sky-950 border-blue-300/30 shadow-[inset_0_0_100px_rgba(125,211,252,0.1)]',
    forest: 'bg-emerald-950 border-green-800 shadow-[inset_0_0_100px_rgba(16,185,129,0.1)]',
    desert: 'bg-amber-950 border-yellow-800 shadow-[inset_0_0_100px_rgba(245,158,11,0.1)]',
    void: 'bg-black border-zinc-900 shadow-[inset_0_0_100px_rgba(255,255,255,0.05)]'
  };

  return (
    <div className={`relative w-full aspect-square rounded-full border-8 overflow-hidden transition-all duration-1000 ${arenaThemes[game.arena]} ${game.settings.borderType === 'neon' ? 'shadow-[0_0_50px_rgba(6,182,212,0.2)] border-solid' : 'border-dashed'}`}>
      {/* Grid Lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      {/* Players */}
      {game.players.map(p => (
        <motion.div
          key={p.id}
          className="absolute w-12 h-12 flex items-center justify-center"
          style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `translate(-50%, -50%)` }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Beyblade Body */}
            <motion.div 
              animate={{ rotate: p.rotation }}
              className="absolute inset-0 rounded-full border-4 border-white/20 shadow-xl"
              style={{ backgroundColor: p.color }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Disc size={20} className="text-white/50" />
              </div>
              {/* Spikes */}
              {[0, 90, 180, 270].map(angle => (
                <div key={angle} className="absolute w-2 h-4 bg-white/30 rounded-full" style={{ left: '50%', top: '-2px', transformOrigin: 'bottom center', transform: `translateX(-50%) rotate(${angle}deg)` }}></div>
              ))}
            </motion.div>

            {/* Shield Effect */}
            {p.shield > 0 && (
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -inset-2 rounded-full border-2 border-cyan-400/50 bg-cyan-400/10"
              />
            )}

            {/* Death Timer */}
            {p.deathTimer !== undefined && (
              <div className="absolute -bottom-6 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                {p.deathTimer}s
              </div>
            )}

            {/* Status Bars (HP & Shield) */}
            <div className="absolute -top-6 w-12 flex flex-col gap-0.5 pointer-events-none">
              <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  animate={{ width: `${(p.hp / p.maxHp) * 100}%` }}
                  className={`h-full ${p.hp < 30 ? 'bg-red-500' : 'bg-emerald-500'}`}
                />
              </div>
              {p.shield > 0 && (
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
                  <motion.div 
                    animate={{ width: `${Math.min(100, p.shield)}%` }}
                    className="h-full bg-cyan-400"
                  />
                </div>
              )}
            </div>

            {/* Nickname */}
            <div className="absolute -top-14 whitespace-nowrap bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
              <span className="text-[10px] font-black text-white uppercase tracking-tighter">{p.nickname}</span>
            </div>

            {/* Profile Pic */}
            <img src={p.profilePictureUrl} alt={p.nickname} className="absolute w-6 h-6 rounded-full border border-white/20 z-10" referrerPolicy="no-referrer" />
          </div>
        </motion.div>
      ))}

      {/* Arena Effects */}
      {game.arena === 'magma' && (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-orange-600/20 to-transparent" />
        </div>
      )}
    </div>
  );
}

function BeybladeDashboard({ game, setGame, onStart, onStop, username }: { game: BeybladeGame, setGame: any, onStart: () => void, onStop: () => void, username?: string }) {
  const arenas = [
    { id: 'classic', name: 'Klasik', icon: <Disc /> },
    { id: 'magma', name: 'Magma', icon: <Flame /> },
    { id: 'cyber', name: 'Siber Neon', icon: <Zap /> },
    { id: 'galaxy', name: 'Galaksi', icon: <Orbit /> },
    { id: 'glacier', name: 'Buzul', icon: <Snowflake /> },
    { id: 'forest', name: 'Orman', icon: <Activity /> },
    { id: 'desert', name: 'Çöl', icon: <Sparkles /> },
    { id: 'void', name: 'Boşluk', icon: <Ghost /> }
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white">Beyblade Arena</h2>
          <p className="text-sm text-gray-500">İzleyicilerin çarpıştığı interaktif arena</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              const url = `${window.location.origin}${window.location.pathname}?mode=beyblade${username ? `&username=${username}` : ''}`;
              navigator.clipboard.writeText(url);
              alert('Beyblade URL kopyalandı!');
            }}
            className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Copy size={16} />
            OBS URL
          </button>
          {game.status === 'playing' ? (
            <button onClick={onStop} className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
              <Square size={18} fill="currentColor" />
              Arenayı Kapat
            </button>
          ) : (
            <button onClick={onStart} className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
              <Play size={18} fill="currentColor" />
              Arenayı Başlat
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-[#111317] border border-white/5 rounded-[32px] md:rounded-[48px] p-6 md:p-12 flex items-center justify-center min-h-[400px] md:min-h-[600px]">
            {game.status === 'idle' ? (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto rotate-12">
                  <Disc size={48} className="text-cyan-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Arena Hazır</h3>
                  <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                    Arenayı başlattığınızda izleyiciler beğeni ve takip ile katılabilir. Hediyelerle güçlerini artırabilirler.
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-2xl">
                <BeybladeArena game={game} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {arenas.map(arena => (
              <button
                key={arena.id}
                onClick={() => setGame((prev: any) => ({ ...prev, arena: arena.id }))}
                className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${
                  game.arena === arena.id 
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-500' 
                    : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                }`}
              >
                {arena.icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{arena.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111317] border border-white/5 rounded-3xl p-6">
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Trophy size={14} className="text-yellow-500" />
              Arena Şampiyonları
            </h4>
            <div className="space-y-2">
              {game.leaderboard.sort((a, b) => b.wins - a.wins).slice(0, 5).map((l, i) => (
                <div key={l.nickname} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-white/20">#{i+1}</span>
                    <span className="text-sm font-bold text-white">{l.nickname}</span>
                  </div>
                  <span className="text-xs font-black text-cyan-500">{l.wins} Galibiyet</span>
                </div>
              ))}
              {game.leaderboard.length === 0 && (
                <div className="text-center py-8 text-gray-600 italic text-sm">Henüz şampiyon yok.</div>
              )}
            </div>
          </div>

          <Section title="Arena Ayarları" description="Savaş kurallarını belirleyin">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                  Başlangıç Canı (HP) <span>{game.settings.startHp}</span>
                </label>
                <input 
                  type="range" min="50" max="500" step="10"
                  value={game.settings.startHp}
                  onChange={(e) => setGame((prev: any) => ({ ...prev, settings: { ...prev.settings, startHp: parseInt(e.target.value) } }))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                  Çarpışma Hasarı <span>{game.settings.collisionDamage}</span>
                </label>
                <input 
                  type="range" min="1" max="20" step="1"
                  value={game.settings.collisionDamage}
                  onChange={(e) => setGame((prev: any) => ({ ...prev, settings: { ...prev.settings, collisionDamage: parseInt(e.target.value) } }))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                  Katılım Eşiği (Like) <span>{game.settings.likeThreshold}</span>
                </label>
                <input 
                  type="range" min="10" max="1000" step="10"
                  value={game.settings.likeThreshold}
                  onChange={(e) => setGame((prev: any) => ({ ...prev, settings: { ...prev.settings, likeThreshold: parseInt(e.target.value) } }))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                  Maksimum Oyuncu <span>{game.settings.maxPlayers}</span>
                </label>
                <input 
                  type="range" min="2" max="50" step="1"
                  value={game.settings.maxPlayers}
                  onChange={(e) => setGame((prev: any) => ({ ...prev, settings: { ...prev.settings, maxPlayers: parseInt(e.target.value) } }))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <p className="text-sm font-bold text-white">Takip ile Katılım</p>
                  <p className="text-[10px] text-gray-500">Takip edenler otomatik katılır</p>
                </div>
                <div onClick={() => setGame((prev: any) => ({ ...prev, settings: { ...prev.settings, followJoin: !prev.settings.followJoin } }))}>
                  <Toggle active={game.settings.followJoin} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Arena Kenarlığı</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                  value={game.settings.borderType}
                  onChange={(e) => setGame((prev: any) => ({ ...prev, settings: { ...prev.settings, borderType: e.target.value } }))}
                >
                  <option value="neon" className="bg-[#111317]">Neon (Düz)</option>
                  <option value="spiky" className="bg-[#111317]">Spiky (Dikenli)</option>
                </select>
              </div>
            </div>
          </Section>

          <Section title="Hediye Güçleri" description="Gelen hediyelerin etkileri">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/10 rounded-lg text-pink-500"><Heart size={14} /></div>
                  <span className="text-xs font-bold text-white">Rose (Gül)</span>
                </div>
                <span className="text-[10px] font-black text-emerald-500 uppercase">+20 HP</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500"><Shield size={14} /></div>
                  <span className="text-xs font-bold text-white">Heart (Kalp)</span>
                </div>
                <span className="text-[10px] font-black text-cyan-500 uppercase">+50 Zırh</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Zap size={14} /></div>
                  <span className="text-xs font-bold text-white">Finger Heart</span>
                </div>
                <span className="text-[10px] font-black text-orange-500 uppercase">Kaos Modu</span>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function GoalBar({ goal, color, theme }: { goal: { current: number, target: number, label: string }, color: string, theme?: any }) {
  const percentage = Math.min(Math.round((goal.current / goal.target) * 100), 100);
  
  return (
    <div className={`w-full p-4 rounded-[24px] space-y-2 border transition-all ${theme ? theme.eventClass : 'bg-black/40 backdrop-blur-xl border-white/10'}`}>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{goal.label}</span>
        <span className="text-[10px] font-black text-white uppercase tracking-widest">{goal.current} / {goal.target}</span>
      </div>
      <div className={`h-2 rounded-full overflow-hidden ${theme ? theme.goalColor : 'bg-white/5'}`}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-600`}
        />
      </div>
    </div>
  );
}
