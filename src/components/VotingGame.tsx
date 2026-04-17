import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Upload, Play, Square, Settings, Trophy, Music, Image as ImageIcon, Users, Copy } from 'lucide-react';

export interface VotingTeam {
  id: string;
  name: string;
  keyword: string;
  logoUrl: string;
  anthemUrl: string;
  votes: number;
}

export interface VotingSettings {
  title: string;
  subtitle: string;
  giftMultipliers: { id: string; giftName: string; multiplier: number }[];
}

export interface VotingGameState {
  status: 'idle' | 'running';
  teams: VotingTeam[];
  settings: VotingSettings;
  userTeams: Record<string, string>;
}

interface VotingGameDashboardProps {
  gameState: VotingGameState;
  setGameState: React.Dispatch<React.SetStateAction<VotingGameState>>;
  username?: string;
}

export const VotingGameDashboard: React.FC<VotingGameDashboardProps> = ({ gameState, setGameState, username }) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'settings'>('teams');

  const addTeam = () => {
    const newTeam: VotingTeam = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Yeni Takım',
      keyword: 'TAKIM',
      logoUrl: '',
      anthemUrl: '',
      votes: 0
    };
    setGameState(prev => ({ ...prev, teams: [...prev.teams, newTeam] }));
  };

  const updateTeam = (id: string, updates: Partial<VotingTeam>) => {
    setGameState(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const removeTeam = (id: string) => {
    setGameState(prev => ({
      ...prev,
      teams: prev.teams.filter(t => t.id !== id)
    }));
  };

  const addGiftMultiplier = () => {
    const newMultiplier = {
      id: Math.random().toString(36).substr(2, 9),
      giftName: 'Rose',
      multiplier: 10
    };
    setGameState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        giftMultipliers: [...prev.settings.giftMultipliers, newMultiplier]
      }
    }));
  };

  const updateGiftMultiplier = (id: string, updates: any) => {
    setGameState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        giftMultipliers: prev.settings.giftMultipliers.map(m => m.id === id ? { ...m, ...updates } : m)
      }
    }));
  };

  const removeGiftMultiplier = (id: string) => {
    setGameState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        giftMultipliers: prev.settings.giftMultipliers.filter(m => m.id !== id)
      }
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        callback(data.url);
      } else {
        alert('Upload failed. Using local URL for preview.');
        callback(URL.createObjectURL(file));
      }
    } catch (err) {
      alert('Upload failed. Using local URL for preview.');
      callback(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Oylama Oyunu v1</h2>
          <p className="text-sm text-gray-400">İzleyicilerin takımlara katılıp hediye/yorum ile oy verdiği interaktif oyun.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              const url = `${window.location.origin}${window.location.pathname}?mode=voting${username ? `&username=${username}` : ''}`;
              navigator.clipboard.writeText(url);
              alert('Oylama Oyunu URL kopyalandı!');
            }}
            className="bg-white/5 border border-white/10 text-white px-4 md:px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Copy size={16} />
            OBS URL Kopyala
          </button>
          {gameState.status === 'idle' ? (
            <button
              onClick={() => setGameState(prev => ({ ...prev, status: 'running', userTeams: {}, teams: prev.teams.map(t => ({ ...t, votes: 0 })) }))}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
            >
              <Play size={18} />
              Oyunu Başlat
            </button>
          ) : (
            <button
              onClick={() => setGameState(prev => ({ ...prev, status: 'idle' }))}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
            >
              <Square size={18} />
              Oyunu Bitir
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('teams')}
          className={`pb-3 px-2 text-sm font-bold transition-colors border-b-2 ${activeTab === 'teams' ? 'border-cyan-500 text-cyan-500' : 'border-transparent text-gray-500 hover:text-white'}`}
        >
          Takımlar ({gameState.teams.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-2 text-sm font-bold transition-colors border-b-2 ${activeTab === 'settings' ? 'border-cyan-500 text-cyan-500' : 'border-transparent text-gray-500 hover:text-white'}`}
        >
          Oyun Ayarları
        </button>
      </div>

      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={addTeam} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              <Plus size={16} /> Yeni Takım Ekle
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gameState.teams.map((team, index) => (
              <div key={team.id} className="bg-[#111317] border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-white font-bold">Takım {index + 1}</h3>
                  <button onClick={() => removeTeam(team.id)} className="text-gray-500 hover:text-red-500 transition-colors" aria-label="Remove Team">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Takım Adı</label>
                    <input
                      type="text"
                      value={team.name}
                      onChange={e => updateTeam(team.id, { name: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Katılım Kelimesi</label>
                    <input
                      type="text"
                      value={team.keyword}
                      onChange={e => updateTeam(team.id, { keyword: e.target.value })}
                      placeholder="Örn: GS"
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Takım Logosu (URL veya Yükle)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={team.logoUrl}
                      onChange={e => updateTeam(team.id, { logoUrl: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none"
                    />
                    <label className="bg-white/10 hover:bg-white/20 cursor-pointer px-3 py-2 rounded-lg flex items-center justify-center transition-colors">
                      <Upload size={16} className="text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, url => updateTeam(team.id, { logoUrl: url }))} />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Takım Marşı (URL veya Yükle)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={team.anthemUrl}
                      onChange={e => updateTeam(team.id, { anthemUrl: e.target.value })}
                      placeholder="https://...mp3"
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none"
                    />
                    <label className="bg-white/10 hover:bg-white/20 cursor-pointer px-3 py-2 rounded-lg flex items-center justify-center transition-colors">
                      <Upload size={16} className="text-white" />
                      <input type="file" accept="audio/*" className="hidden" onChange={e => handleFileUpload(e, url => updateTeam(team.id, { anthemUrl: url }))} />
                    </label>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                  <span className="text-xs text-gray-400">Mevcut Oy:</span>
                  <span className="text-lg font-black text-cyan-500">{team.votes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-[#111317] border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2"><Settings size={18} className="text-cyan-500"/> Genel Ayarlar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Ana Başlık</label>
                <input
                  type="text"
                  value={gameState.settings.title}
                  onChange={e => setGameState(prev => ({ ...prev, settings: { ...prev.settings, title: e.target.value } }))}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-cyan-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Alt Başlık</label>
                <input
                  type="text"
                  value={gameState.settings.subtitle}
                  onChange={e => setGameState(prev => ({ ...prev, settings: { ...prev.settings, subtitle: e.target.value } }))}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-cyan-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#111317] border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold flex items-center gap-2"><Trophy size={18} className="text-yellow-500"/> Özel Hediye Çarpanları</h3>
              <button onClick={addGiftMultiplier} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                <Plus size={14} /> Ekle
              </button>
            </div>
            <p className="text-xs text-gray-400">Belirli hediyeler gönderildiğinde, kullanıcının bulunduğu takıma kaç oy ekleneceğini ayarlayın.</p>
            
            <div className="space-y-3">
              {gameState.settings.giftMultipliers.map((mult) => (
                <div key={mult.id} className="flex gap-3 items-center bg-black/30 p-3 rounded-lg border border-white/5">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Hediye Adı</label>
                    <input
                      type="text"
                      value={mult.giftName}
                      onChange={e => updateGiftMultiplier(mult.id, { giftName: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div className="w-32 space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Oy Değeri</label>
                    <input
                      type="number"
                      value={mult.multiplier}
                      onChange={e => updateGiftMultiplier(mult.id, { multiplier: parseInt(e.target.value) || 0 })}
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <button onClick={() => removeGiftMultiplier(mult.id)} className="mt-5 p-2 text-gray-500 hover:text-red-500 transition-colors" aria-label="Remove Multiplier">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {gameState.settings.giftMultipliers.length === 0 && (
                <div className="text-center py-4 text-sm text-gray-500">Henüz hediye çarpanı eklenmemiş.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const VotingGameOverlay: React.FC<{ gameState: VotingGameState }> = ({ gameState }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentAnthem, setCurrentAnthem] = useState<string | null>(null);

  // Calculate max votes for progress bars
  const maxVotes = Math.max(...gameState.teams.map(t => t.votes), 1); // Prevent division by zero

  // Handle Anthem Playback
  useEffect(() => {
    if (gameState.status !== 'running') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setCurrentAnthem(null);
      return;
    }

    let highestVotes = -1;
    let leadingTeams: VotingTeam[] = [];
    
    gameState.teams.forEach(team => {
      if (team.votes > highestVotes) {
        highestVotes = team.votes;
        leadingTeams = [team];
      } else if (team.votes === highestVotes) {
        leadingTeams.push(team);
      }
    });

    // Only play if there is a single clear leader with > 0 votes
    if (leadingTeams.length === 1 && highestVotes > 0) {
      const leader = leadingTeams[0];
      if (leader.anthemUrl && leader.anthemUrl !== currentAnthem) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const newAudio = new Audio(leader.anthemUrl);
        newAudio.loop = true;
        newAudio.volume = 0.5;
        newAudio.play().catch(e => console.warn("VotingGame Anthem play failed:", e));
        audioRef.current = newAudio;
        setCurrentAnthem(leader.anthemUrl);
      }
    } else if (highestVotes === 0 || leadingTeams.length > 1) {
      // Tie or no votes, stop music
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setCurrentAnthem(null);
    }
  }, [gameState.teams, gameState.status]);

  return (
    <div className="fixed inset-0 bg-[#1a1b26] flex flex-col items-center justify-between py-12 px-8 font-sans overflow-hidden">
      {/* Title */}
      <div className="text-center z-10">
        <div className="inline-block bg-blue-600 text-white px-8 py-3 rounded-2xl text-4xl font-black shadow-lg mb-4">
          {gameState.settings.title}
        </div>
      </div>

      {/* Teams Grid */}
      <div className="flex-1 w-full flex items-center justify-center z-10">
        <div className="flex flex-wrap justify-center gap-6 max-w-6xl w-full">
          {gameState.teams.map((team) => {
            const percentage = (team.votes / maxVotes) * 100;
            
            return (
              <div key={team.id} className="bg-[#24283b] border border-white/5 rounded-3xl p-6 flex flex-col items-center w-64 shadow-2xl relative overflow-hidden">
                {/* Logo */}
                <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center overflow-hidden mb-4 border-4 border-[#1a1b26] shadow-inner">
                  {team.logoUrl ? (
                    <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={48} className="text-gray-300" />
                  )}
                </div>
                
                {/* Name */}
                <h3 className="text-white text-2xl font-bold mb-4 text-center w-full truncate">{team.name}</h3>
                
                {/* Progress Bar Container */}
                <div className="w-full h-6 bg-[#1a1b26] rounded-full overflow-hidden relative mb-2">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                {/* Vote Count */}
                <div className="text-gray-300 font-medium">
                  {team.votes} oy
                </div>
                
                {/* Keyword Hint */}
                <div className="absolute top-3 right-3 bg-black/40 px-2 py-1 rounded text-[10px] text-gray-400 font-bold uppercase">
                  Yaz: {team.keyword}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtitle */}
      <div className="text-center z-10 mt-8">
        <p className="text-yellow-400 text-2xl font-medium">
          {gameState.settings.subtitle}
        </p>
      </div>
      
      {/* Background Watermark/Logo (Optional styling based on screenshots) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <div className="text-[20vw] font-black tracking-tighter">VOTE</div>
      </div>
    </div>
  );
};
