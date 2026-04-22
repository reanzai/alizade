import React, { useState, useEffect } from 'react';
import TurkeyMap from 'turkey-map-react';
import { Settings, Play, Square, Users, Search, Plus, Trash2, Trophy, Crosshair, Map as MapIcon, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface MapTeam {
  id: string;
  name: string;
  color: string;
  giftName: string;
  capitalId: number; // Plate number of the starting city
  score: number;
}

export interface MapCity {
  plateNumber: number;
  name?: string;
  ownerId: string | null;
  health: number;
}

export interface TurkeyMapGameState {
  status: 'idle' | 'running';
  teams: MapTeam[];
  cities: Record<number, MapCity>; // plateNumber -> MapCity
  settings: {
    title: string;
    description: string;
    maxHealthPerCity: number;
    attackPowerPerGift: number;
  };
}

interface TurkeyMapDashboardProps {
  gameState: TurkeyMapGameState;
  setGameState: React.Dispatch<React.SetStateAction<TurkeyMapGameState>>;
  username?: string;
}

export const TurkeyMapDashboard: React.FC<TurkeyMapDashboardProps> = ({ gameState, setGameState, username }) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'settings'>('teams');

  const addTeam = () => {
    const newTeam: MapTeam = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Yeni Takım',
      color: '#ef4444',
      giftName: 'Rose',
      capitalId: 34, // Istanbul
      score: 0,
    };
    setGameState(prev => ({ ...prev, teams: [...prev.teams, newTeam] }));
  };

  const removeTeam = (id: string) => {
    setGameState(prev => ({
      ...prev,
      teams: prev.teams.filter(t => t.id !== id),
    }));
  };

  const updateTeam = (id: string, updates: Partial<MapTeam>) => {
    setGameState(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  };

  const startGame = () => {
    // Reset all cities and assign capitals
    const initialCities: Record<number, MapCity> = {};
    // Initialize 81 cities
    for (let i = 1; i <= 81; i++) {
      initialCities[i] = { plateNumber: i, ownerId: null, health: 0 };
    }
    // Assign capitals
    gameState.teams.forEach(team => {
      initialCities[team.capitalId] = {
        plateNumber: team.capitalId,
        ownerId: team.id,
        health: gameState.settings.maxHealthPerCity,
      };
      team.score = 1; // start with 1 city
    });

    setGameState(prev => ({
      ...prev,
      status: 'running',
      cities: initialCities,
      teams: prev.teams.map(t => ({ ...t, score: 1 }))
    }));
  };

  const stopGame = () => {
    setGameState(prev => ({ ...prev, status: 'idle' }));
  };

  const copyOverlayLink = () => {
    if (!username) {
      alert("Lütfen önce giriş yapın.");
      return;
    }
    const url = `${window.location.origin}/?mode=overlay&game=turkey-map&user=${username}`;
    navigator.clipboard.writeText(url);
    alert('Kaplama (Overlay) linki kopyalandı! OBS\'e Tarayıcı Kaynağı olarak ekleyin. (Genişlik: 1920, Yükseklik: 1080)');
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-2">
            <MapIcon className="text-pink-500" />
            Türkiye Hükümdarlık Harita Savaşı
          </h2>
          <p className="text-gray-500 text-sm mt-1">İzleyicilerinizin hediyelerle şehirleri fethettiği 100% Otomatik strateji oyunu.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyOverlayLink}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold flex items-center gap-2 transition-colors border border-white/10 text-sm"
          >
            <Copy size={16} />
            OBS Linki
          </button>
          {gameState.status === 'idle' ? (
            <button
              onClick={startGame}
              className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-pink-500/20 transition-all text-sm"
            >
              <Play size={16} />
              Oyunu Başlat
            </button>
          ) : (
            <button
              onClick={stopGame}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all text-sm"
            >
              <Square size={16} />
              Oyunu Bitir
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'teams' ? 'border-pink-500 text-white' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          Takımlar
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'settings' ? 'border-pink-500 text-white' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          Ayarlar
        </button>
      </div>

      <div className="bg-[#111317] border border-white/10 rounded-[24px] p-6 sm:p-8">
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Users size={20} className="text-pink-500" />
                Takımlar & Hediyeler
              </h3>
              <button
                onClick={addTeam}
                className="px-4 py-2 bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
              >
                <Plus size={14} /> Yeni Takım
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {gameState.teams.map((team, idx) => (
                <div key={team.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Takım {idx + 1}</span>
                    <button onClick={() => removeTeam(team.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Takım Adı</label>
                        <input
                          type="text"
                          value={team.name}
                          onChange={e => updateTeam(team.id, { name: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Tetikleyici Hediye</label>
                        <input
                          type="text"
                          value={team.giftName}
                          onChange={e => updateTeam(team.id, { giftName: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                          placeholder="Örn: Rose"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Renk</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={team.color}
                            onChange={e => updateTeam(team.id, { color: e.target.value })}
                            className="bg-transparent border-none w-8 h-8 rounded cursor-pointer"
                          />
                          <span className="text-xs text-gray-400 uppercase">{team.color}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Başlangıç Şehri (Plaka)</label>
                        <input
                          type="number"
                          value={team.capitalId}
                          onChange={e => updateTeam(team.id, { capitalId: parseInt(e.target.value) || 1 })}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                          min={1} max={81}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {gameState.teams.length === 0 && (
                <div className="col-span-2 text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
                  <p className="text-gray-500 text-sm">Henüz bir takım eklenmedi.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Settings size={20} className="text-pink-500" />
              Oyun Ayarları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase font-bold text-gray-400 mb-1 block">Üst Başlık</label>
                  <input
                    type="text"
                    value={gameState.settings.title}
                    onChange={e => setGameState(prev => ({ ...prev, settings: { ...prev.settings, title: e.target.value } }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-bold text-gray-400 mb-1 block">Alt Açıklama</label>
                  <input
                    type="text"
                    value={gameState.settings.description}
                    onChange={e => setGameState(prev => ({ ...prev, settings: { ...prev.settings, description: e.target.value } }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase font-bold text-gray-400 mb-1 block">Şehir Alma Canı (Gereken Hediye Puanı)</label>
                  <input
                    type="number"
                    value={gameState.settings.maxHealthPerCity}
                    onChange={e => setGameState(prev => ({ ...prev, settings: { ...prev.settings, maxHealthPerCity: parseInt(e.target.value) || 1 } }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-bold text-gray-400 mb-1 block">Standart Hediye Puanı</label>
                  <input
                    type="number"
                    value={gameState.settings.attackPowerPerGift}
                    onChange={e => setGameState(prev => ({ ...prev, settings: { ...prev.settings, attackPowerPerGift: parseInt(e.target.value) || 1 } }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
                    disabled // Automatically based on diamond cost typically, but leave it basic
                  />
                  <p className="text-[10px] text-gray-500 mt-1">İleride elmas değeriyle orantılı olarak da eklenebilir.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const TurkeyMapOverlay: React.FC<{ gameState: TurkeyMapGameState }> = ({ gameState }) => {
  const mapWrapper = (cityComponent: React.ReactElement, city: any) => {
    const cityState = gameState.cities[city.plateNumber];
    const ownerId = cityState?.ownerId;
    const team = ownerId ? gameState.teams.find(t => t.id === ownerId) : null;
    
    return React.cloneElement(cityComponent, {
      fill: team ? team.color : '#1e293b', // default gray if unowned
      stroke: '#0f172a',
      strokeWidth: 1,
      style: {
        transition: 'fill 0.5s ease',
      }
    });
  };

  const sortedTeams = [...gameState.teams].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 bg-transparent flex flex-col items-center justify-center overflow-hidden">
      {/* Map Area */}
      <div className="absolute inset-0 flex items-center justify-center scale-150 transform transition-transform duration-1000 ease-in-out">
        <TurkeyMap
          hoverable={false}
          cityWrapper={mapWrapper}
          customStyle={{ idleColor: '#1e293b', hoverColor: '#1e293b' }}
        />
      </div>

      {/* Header Info */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/10 px-8 py-4 rounded-[32px] text-center shadow-2xl shadow-black/50">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 uppercase tracking-widest drop-shadow-lg">
          {gameState.settings.title}
        </h1>
        <p className="text-xl text-gray-300 font-bold uppercase tracking-[0.2em] mt-2">
          {gameState.settings.description}
        </p>
      </div>

      {/* Leaderboard Cards on the sides */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col gap-4">
        <AnimatePresence>
          {sortedTeams.slice(0, 4).map((team, idx) => (
            <motion.div
              key={team.id}
              layout
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 w-72 shadow-xl shadow-black/50"
              style={{ borderLeftColor: team.color, borderLeftWidth: 4 }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-inner"
                style={{ backgroundColor: team.color }}
              >
                {idx + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-black text-lg truncate uppercase">{team.name}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-gray-400 text-sm font-bold">{team.giftName} At</p>
                  <p className="text-2xl font-black text-white">{team.score}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col gap-4">
        <AnimatePresence>
          {sortedTeams.slice(4, 8).map((team, idx) => (
             <motion.div
              key={team.id}
              layout
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 w-72 shadow-xl shadow-black/50"
              style={{ borderRightColor: team.color, borderRightWidth: 4 }}
            >
              <div className="flex-1 text-right">
                <h3 className="text-white font-black text-lg truncate uppercase">{team.name}</h3>
                <div className="flex justify-between items-center flex-row-reverse">
                  <p className="text-gray-400 text-sm font-bold">{team.giftName} At</p>
                  <p className="text-2xl font-black text-white">{team.score}</p>
                </div>
              </div>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-inner"
                style={{ backgroundColor: team.color }}
              >
                {idx + 5}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};
