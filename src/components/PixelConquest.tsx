import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Play, Square, Users, Shield, Map as MapIcon, RefreshCw, X, Crown, Zap, Copy, Palette, Plus } from 'lucide-react';

// ... (keep existing interfaces)
export interface PixelPlayer {
  id: string;
  nickname: string;
  color: string;
  score: number;
  shield: number;
  avatar: string;
}

export interface PixelCell {
  ownerId: string | null;
  color: string | null;
  isValid: boolean;
}

export interface PixelConquestState {
  status: 'idle' | 'playing';
  players: PixelPlayer[];
  grid: PixelCell[][];
  reignPlayerId: string | null;
  settings: {
    gridWidth: number;
    gridHeight: number;
    shieldMax: number;
    reignMode: boolean;
    playerColors?: string[];
  };
}

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

// Rough polygon for Turkey map shape (relative coordinates 0-1)
const TURKEY_POLYGON = [
  [0.02, 0.3], [0.08, 0.2], [0.15, 0.25], [0.2, 0.15], [0.3, 0.18], [0.4, 0.15], [0.5, 0.1], [0.6, 0.12], [0.7, 0.1], [0.8, 0.15], [0.9, 0.2], [0.95, 0.3],
  [0.98, 0.4], [0.95, 0.5], [0.9, 0.6], [0.85, 0.65], [0.75, 0.6], [0.65, 0.7], [0.55, 0.8], [0.5, 0.95], [0.45, 0.8], [0.4, 0.7], [0.3, 0.65], [0.2, 0.7], [0.1, 0.6], [0.05, 0.5], [0.02, 0.4]
];

function isPointInPolygon(point: number[], vs: number[][]) {
  let x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i][0], yi = vs[i][1];
    let xj = vs[j][0], yj = vs[j][1];
    let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

import { useTranslation } from 'react-i18next';

export function PixelConquestDashboard({ state, setState, onStart, onStop, username }: { state: PixelConquestState, setState: any, onStart: () => void, onStop: () => void, username?: string }) {
  const { t } = useTranslation();
  
  const handleKick = (id: string) => {
    setState((prev: PixelConquestState) => ({
      ...prev,
      players: prev.players.filter(p => p.id !== id),
      grid: prev.grid.map(row => row.map(cell => cell.ownerId === id ? { ...cell, ownerId: null, color: null } : cell))
    }));
  };

  const handleReset = () => {
    setState((prev: PixelConquestState) => {
      const newGrid = Array(prev.settings.gridHeight).fill(null).map((_, y) => 
        Array(prev.settings.gridWidth).fill(null).map((_, x) => {
          const px = x / prev.settings.gridWidth;
          const py = y / prev.settings.gridHeight;
          return { ownerId: null, color: null, isValid: isPointInPolygon([px, py], TURKEY_POLYGON) };
        })
      );
      return {
        ...prev,
        players: [],
        grid: newGrid,
        reignPlayerId: null
      };
    });
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
            <MapIcon className="text-red-500" />
            {t('pixelConquest.title')}
          </h2>
          <p className="text-sm text-gray-500">{t('pixelConquest.desc')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => {
              const url = `${window.location.origin}${window.location.pathname}?mode=pixel-conquest${username ? `&username=${username}` : ''}`;
              navigator.clipboard.writeText(url);
              alert('Pixel Conquest URL kopyalandı!');
            }}
            className="bg-white/5 border border-white/10 text-white px-4 md:px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Copy size={16} />
            OBS URL
          </button>
          <button
            onClick={() => window.open('/?mode=pixel-conquest', '_blank', 'width=1280,height=720')}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-colors border border-white/10"
          >
            {t('pixelConquest.openOverlay')}
          </button>
          {state.status === 'idle' ? (
            <button onClick={() => { handleReset(); onStart(); }} className="flex items-center gap-2 bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
              <Play size={16} className="fill-white" /> {t('pixelConquest.startGame')}
            </button>
          ) : (
            <button onClick={onStop} className="flex items-center gap-2 bg-red-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
              <Square size={16} className="fill-white" /> {t('pixelConquest.stopGame')}
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111317] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-cyan-500" />
                {t('pixelConquest.activePlayers')} ({state.players.length})
              </h3>
              <button onClick={handleReset} className="text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg">
                <RefreshCw size={12} /> {t('pixelConquest.resetAll')}
              </button>
            </div>
            
            <div className="space-y-3">
              {state.players.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">{t('pixelConquest.noPlayers')}</div>
              ) : (
                state.players.sort((a, b) => b.score - a.score).map((player, i) => (
                  <div key={player.id} className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={player.avatar} alt={player.nickname} className="w-10 h-10 rounded-lg border-2" style={{ borderColor: player.color }} />
                        {state.reignPlayerId === player.id && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50">
                            <Shield size={10} className="text-black fill-black" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          {player.nickname}
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">#{i + 1}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-500">{t('pixelConquest.score')}: <span className="text-white font-mono">{player.score}</span></p>
                          {player.shield > 0 && (
                            <p className="text-xs text-blue-400 flex items-center gap-1"><Shield size={10} /> {player.shield}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={player.color}
                        onChange={(e) => {
                          setState((prev: PixelConquestState) => ({
                            ...prev,
                            players: prev.players.map(p => p.id === player.id ? { ...p, color: e.target.value } : p),
                            grid: prev.grid.map(row => row.map(cell => cell.ownerId === player.id ? { ...cell, color: e.target.value } : cell))
                          }));
                        }}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                      />
                      <button onClick={() => handleKick(player.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" aria-label="Kick Player">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111317] border border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Settings size={18} className="text-gray-400" />
              {t('pixelConquest.gameSettings')}
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('pixelConquest.gridSize')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">{t('pixelConquest.width')}</span>
                    <input 
                      type="number" 
                      value={state.settings.gridWidth}
                      onChange={(e) => setState((prev: PixelConquestState) => ({ ...prev, settings: { ...prev.settings, gridWidth: parseInt(e.target.value) || 80 } }))}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-cyan-500/50 outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">{t('pixelConquest.height')}</span>
                    <input 
                      type="number" 
                      value={state.settings.gridHeight}
                      onChange={(e) => setState((prev: PixelConquestState) => ({ ...prev, settings: { ...prev.settings, gridHeight: parseInt(e.target.value) || 40 } }))}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-cyan-500/50 outline-none"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">{t('pixelConquest.warningReset')}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{t('pixelConquest.reignMode')}</label>
                <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-lg p-3">
                  <span className="text-sm text-white">{t('pixelConquest.enableReign')}</span>
                  <button 
                    onClick={() => setState((prev: PixelConquestState) => ({ ...prev, settings: { ...prev.settings, reignMode: !prev.settings.reignMode } }))}
                    className={`w-10 h-6 rounded-full transition-colors relative ${state.settings.reignMode ? 'bg-cyan-500' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${state.settings.reignMode ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">{t('pixelConquest.reignDesc')}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                  <Palette size={14} />
                  Player Pool Colors
                </label>
                <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(state.settings.playerColors || COLORS).map((color, idx) => (
                      <div key={idx} className="relative group">
                        <input 
                          type="color" 
                          value={color}
                          onChange={(e) => {
                            setState((prev: PixelConquestState) => {
                              const newColors = [...(prev.settings.playerColors || COLORS)];
                              newColors[idx] = e.target.value;
                              return { ...prev, settings: { ...prev.settings, playerColors: newColors } };
                            });
                          }}
                          className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                        />
                        {(state.settings.playerColors || COLORS).length > 1 && (
                          <button
                            onClick={() => {
                              setState((prev: PixelConquestState) => {
                                const newColors = [...(prev.settings.playerColors || COLORS)];
                                newColors.splice(idx, 1);
                                return { ...prev, settings: { ...prev.settings, playerColors: newColors } };
                              });
                            }}
                            className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md"
                          >
                            <X size={10} className="text-white" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setState((prev: PixelConquestState) => {
                          const newColors = [...(prev.settings.playerColors || COLORS), '#ffffff'];
                          return { ...prev, settings: { ...prev.settings, playerColors: newColors } };
                        });
                      }}
                      className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 border border-white/20 flex flex-col items-center justify-center transition-colors"
                    >
                      <Plus size={14} className="text-white shadow-none" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    Colors configured here will be randomly assigned to new players joining the conquest.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PixelConquestOverlay({ state, events }: { state: PixelConquestState, events: any[] }) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [localState, setLocalState] = useState<PixelConquestState>(state);
  const [bubbles, setBubbles] = useState<{x: number, y: number, r: number, color: string}[]>([]);
  const [winner, setWinner] = useState<PixelPlayer | null>(null);

  // Sync with parent state
  useEffect(() => {
    setLocalState(state);
    
    // Check for winner
    let totalValid = 0;
    let maxScore = 0;
    let topPlayerId = null;
    
    state.grid.forEach(row => row.forEach(cell => {
      if (cell.isValid) totalValid++;
    }));

    if (totalValid > 0 && state.players.length > 0) {
      const topPlayer = [...state.players].sort((a, b) => b.score - a.score)[0];
      if (topPlayer && topPlayer.score >= totalValid * 0.95) { // 95% conquest is a win
        setWinner(topPlayer);
      } else {
        setWinner(null);
      }
    }
  }, [state]);

  // Generate random bubbles based on conquered territory
  useEffect(() => {
    const newBubbles: {x: number, y: number, r: number, color: string}[] = [];
    localState.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.ownerId && cell.color && Math.random() > 0.8) {
          newBubbles.push({
            x: x + Math.random(),
            y: y + Math.random(),
            r: Math.random() * 1.5 + 0.5,
            color: cell.color
          });
        }
      });
    });
    setBubbles(newBubbles);
  }, [localState.grid]);

  // Draw map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellW = width / localState.settings.gridWidth;
    const cellH = height / localState.settings.gridHeight;

    ctx.clearRect(0, 0, width, height);

    // Draw base map shadow/glow
    ctx.shadowColor = '#0f0';
    ctx.shadowBlur = 50;
    ctx.fillStyle = '#1a1a1a';
    
    // Draw cells
    for (let y = 0; y < localState.settings.gridHeight; y++) {
      for (let x = 0; x < localState.settings.gridWidth; x++) {
        const cell = localState.grid[y]?.[x];
        if (!cell?.isValid) continue;

        const px = x * cellW;
        const py = y * cellH;

        // Draw 3D effect (bottom face)
        ctx.shadowBlur = 0;
        ctx.fillStyle = cell.color ? darkenColor(cell.color, 40) : '#111';
        ctx.fillRect(px, py + cellH * 0.2, cellW, cellH);

        // Draw top face
        ctx.fillStyle = cell.color || '#222';
        ctx.fillRect(px, py, cellW, cellH);
        
        // Grid lines
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, cellW, cellH);
      }
    }

    // Draw bubbles
    bubbles.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x * cellW, b.y * cellH, b.r * Math.min(cellW, cellH), 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });

  }, [localState.grid, localState.settings, bubbles]);

  // Helper to darken hex color
  const darkenColor = (color: string, percent: number) => {
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);

    R = parseInt((R * (100 - percent) / 100).toString());
    G = parseInt((G * (100 - percent) / 100).toString());
    B = parseInt((B * (100 - percent) / 100).toString());

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    const RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    const GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    const BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
  }

  // Calculate player centroids for avatars
  const playerCentroids = useMemo(() => {
    const centroids: Record<string, {x: number, y: number, count: number}> = {};
    localState.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.ownerId) {
          if (!centroids[cell.ownerId]) centroids[cell.ownerId] = { x: 0, y: 0, count: 0 };
          centroids[cell.ownerId].x += x;
          centroids[cell.ownerId].y += y;
          centroids[cell.ownerId].count++;
        }
      });
    });

    Object.keys(centroids).forEach(id => {
      centroids[id].x /= centroids[id].count;
      centroids[id].y /= centroids[id].count;
    });

    return centroids;
  }, [localState.grid]);

  return (
    <div className="w-screen h-screen bg-[#333] overflow-hidden relative font-sans">
      {/* Map Container */}
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <div className="w-full h-full relative" style={{ filter: 'drop-shadow(0 0 30px rgba(0, 255, 0, 0.3))' }}>
          <canvas 
            ref={canvasRef}
            width={1600}
            height={800}
            className="w-full h-full object-contain"
          />
          
          {/* Player Avatars on Map */}
          {localState.players.map(player => {
            const centroid = playerCentroids[player.id];
            if (!centroid || centroid.count < 5) return null; // Only show if they have some territory

            // Calculate position percentage
            const left = `${(centroid.x / localState.settings.gridWidth) * 100}%`;
            const top = `${(centroid.y / localState.settings.gridHeight) * 100}%`;

            return (
              <motion.div
                key={player.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left, top }}
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full animate-ping opacity-50" style={{ backgroundColor: player.color }} />
                  <img 
                    src={player.avatar} 
                    className="w-16 h-16 rounded-full border-4 shadow-2xl relative z-10" 
                    style={{ borderColor: player.color, boxShadow: `0 0 20px ${player.color}` }}
                  />
                  {localState.reignPlayerId === player.id && (
                    <div className="absolute -top-4 -right-4 bg-yellow-500 rounded-full p-1.5 shadow-lg z-20 border-2 border-white">
                      <Crown size={16} className="text-white fill-white" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="absolute top-8 right-8 w-72 space-y-2 z-20">
        <div className="text-center mb-4">
          <h2 className="text-xl font-black text-white/80 tracking-[0.2em] uppercase">{t('pixelConquest.rulers')}</h2>
        </div>
        <AnimatePresence>
          {localState.players.sort((a, b) => b.score - a.score).slice(0, 6).map((player, i) => {
            const isFirst = i === 0;
            const isSecond = i === 1;
            const isThird = i === 2;
            
            let bgClass = "bg-[#1a1c23]";
            let textClass = "text-white";
            let rankIcon = <span className="text-sm font-bold text-gray-400">{i + 1}</span>;

            if (isFirst) {
              bgClass = "bg-[#f59e0b]";
              textClass = "text-white";
              rankIcon = <Crown size={16} className="text-white fill-white" />;
            } else if (isSecond) {
              bgClass = "bg-[#64748b]";
              textClass = "text-white";
            } else if (isThird) {
              bgClass = "bg-[#b45309]";
              textClass = "text-white";
            }

            return (
              <motion.div 
                key={player.id}
                layout
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`${bgClass} rounded-2xl p-2 flex items-center gap-3 shadow-lg border border-white/10`}
              >
                <div className="w-8 flex justify-center">
                  {rankIcon}
                </div>
                <img src={player.avatar} alt={player.nickname} className="w-10 h-10 rounded-full border-2 border-white/20" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${textClass}`}>{player.nickname}</p>
                </div>
                <div className="text-right pr-2">
                  <p className={`text-lg font-black leading-none ${textClass}`}>{player.score}</p>
                  <p className={`text-[8px] font-bold uppercase opacity-80 ${textClass}`}>{t('pixelConquest.times')}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Victory Screen */}
      <AnimatePresence>
        {winner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#111] border border-white/10 rounded-[3rem] p-12 flex flex-col items-center max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at center, ${winner.color}, transparent 70%)` }} />
              
              <Crown size={64} className="text-pink-400 fill-pink-400 mb-8 relative z-10" />
              
              <div className="relative z-10 mb-6">
                <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: winner.color }} />
                <img 
                  src={winner.avatar} 
                  className="w-40 h-40 rounded-full border-8 shadow-2xl relative z-10" 
                  style={{ borderColor: winner.color }}
                />
              </div>

              <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-2 relative z-10">{t('pixelConquest.greatVictory')}</h2>
              <div className="bg-white/10 px-6 py-2 rounded-full mb-8 relative z-10 flex items-center gap-2">
                <Zap size={16} className="text-pink-400 fill-pink-400" />
                <span className="text-sm font-bold text-white tracking-widest uppercase">{t('pixelConquest.mapConquered')}</span>
                <Zap size={16} className="text-pink-400 fill-pink-400" />
              </div>

              <div className="text-center relative z-10">
                <p className="text-6xl font-black text-white mb-4">{winner.score}</p>
                <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden mx-auto">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5 }}
                    className="h-full bg-white"
                  />
                </div>
                <p className="text-sm font-bold text-gray-500 mt-4 tracking-widest uppercase">@playtok.tr</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
