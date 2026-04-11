import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Play, Square, Users, Shield, Map as MapIcon, RefreshCw, X } from 'lucide-react';

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
  };
}

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export function PixelConquestDashboard({ state, setState, onStart, onStop }: { state: PixelConquestState, setState: any, onStart: () => void, onStop: () => void }) {
  const handleKick = (id: string) => {
    setState((prev: PixelConquestState) => ({
      ...prev,
      players: prev.players.filter(p => p.id !== id),
      grid: prev.grid.map(row => row.map(cell => cell.ownerId === id ? { ownerId: null, color: null } : cell))
    }));
  };

  const handleReset = () => {
    setState((prev: PixelConquestState) => ({
      ...prev,
      players: [],
      grid: Array(prev.settings.gridHeight).fill(null).map(() => Array(prev.settings.gridWidth).fill({ ownerId: null, color: null })),
      reignPlayerId: null
    }));
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
            <MapIcon className="text-red-500" />
            Piksel Fetih
          </h2>
          <p className="text-sm text-gray-500">İzleyicilerinizle interaktif harita fethetme oyunu</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.open('/?mode=pixel-conquest', '_blank', 'width=1280,height=720')}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-colors border border-white/10"
          >
            Open Overlay
          </button>
          {state.status === 'idle' ? (
            <button onClick={onStart} className="flex items-center gap-2 bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
              <Play size={16} className="fill-white" /> Start Game
            </button>
          ) : (
            <button onClick={onStop} className="flex items-center gap-2 bg-red-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
              <Square size={16} className="fill-white" /> Stop Game
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
                Active Players ({state.players.length})
              </h3>
              <button onClick={handleReset} className="text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg">
                <RefreshCw size={12} /> Reset All
              </button>
            </div>
            
            <div className="space-y-3">
              {state.players.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">No players yet. Viewers can join by sending gifts.</div>
              ) : (
                state.players.sort((a, b) => b.score - a.score).map((player, i) => (
                  <div key={player.id} className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={player.avatar} className="w-10 h-10 rounded-lg border-2" style={{ borderColor: player.color }} />
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
                          <p className="text-xs text-gray-500">Score: <span className="text-white font-mono">{player.score}</span></p>
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
                      <button onClick={() => handleKick(player.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
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
              Game Settings
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Grid Size</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">Width</span>
                    <input 
                      type="number" 
                      value={state.settings.gridWidth}
                      onChange={(e) => setState((prev: PixelConquestState) => ({ ...prev, settings: { ...prev.settings, gridWidth: parseInt(e.target.value) || 40 } }))}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-cyan-500/50 outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">Height</span>
                    <input 
                      type="number" 
                      value={state.settings.gridHeight}
                      onChange={(e) => setState((prev: PixelConquestState) => ({ ...prev, settings: { ...prev.settings, gridHeight: parseInt(e.target.value) || 30 } }))}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-cyan-500/50 outline-none"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Warning: Changing size resets the map.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Reign Mode</label>
                <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-lg p-3">
                  <span className="text-sm text-white">Enable Reign Shield</span>
                  <button 
                    onClick={() => setState((prev: PixelConquestState) => ({ ...prev, settings: { ...prev.settings, reignMode: !prev.settings.reignMode } }))}
                    className={`w-10 h-6 rounded-full transition-colors relative ${state.settings.reignMode ? 'bg-cyan-500' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${state.settings.reignMode ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Dominant player gets an automatic shield.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PixelConquestOverlay({ state, events }: { state: PixelConquestState, events: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [localState, setLocalState] = useState<PixelConquestState>(state);
  const engineRef = useRef<any>(null); // For matter-js if needed, but let's use simple canvas drawing first

  // Sync with parent state
  useEffect(() => {
    setLocalState(state);
  }, [state]);

  // Draw grid
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

    // Draw cells
    for (let y = 0; y < localState.settings.gridHeight; y++) {
      for (let x = 0; x < localState.settings.gridWidth; x++) {
        const cell = localState.grid[y]?.[x];
        if (cell?.color) {
          ctx.fillStyle = cell.color;
          ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
        }
        // Draw grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.strokeRect(x * cellW, y * cellH, cellW, cellH);
      }
    }
  }, [localState.grid, localState.settings]);

  return (
    <div className="w-screen h-screen bg-transparent overflow-hidden relative font-sans">
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="w-full h-full max-w-6xl max-h-[800px] bg-black/80 backdrop-blur-md rounded-3xl border-4 border-white/10 overflow-hidden relative shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="h-20 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-8 z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/50">
                <MapIcon className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-widest" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Piksel Fetih</h1>
                <p className="text-sm text-red-400 font-bold">Hediye göndererek toprak kazan!</p>
              </div>
            </div>
            
            {/* Reign Player */}
            {localState.reignPlayerId && (
              <div className="flex items-center gap-3 bg-yellow-500/20 border border-yellow-500/50 px-4 py-2 rounded-2xl">
                <Shield className="text-yellow-500" size={20} />
                <div className="text-right">
                  <p className="text-[10px] text-yellow-500/80 font-bold uppercase">Hükümdar</p>
                  <p className="text-sm font-black text-yellow-500">{localState.players.find(p => p.id === localState.reignPlayerId)?.nickname}</p>
                </div>
                <img src={localState.players.find(p => p.id === localState.reignPlayerId)?.avatar} className="w-8 h-8 rounded-full border-2 border-yellow-500" />
              </div>
            )}
          </div>

          {/* Canvas Area */}
          <div className="flex-1 relative">
            <canvas 
              ref={canvasRef}
              width={1200}
              height={800}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Leaderboard Overlay */}
          <div className="absolute top-24 right-8 w-64 space-y-2 pointer-events-none">
            {localState.players.sort((a, b) => b.score - a.score).slice(0, 5).map((player, i) => (
              <motion.div 
                key={player.id}
                layout
                className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: player.color }}>
                  {i + 1}
                </div>
                <img src={player.avatar} className="w-8 h-8 rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{player.nickname}</p>
                  <p className="text-[10px] text-gray-400">{player.score} Piksel</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
