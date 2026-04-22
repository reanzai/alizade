import React, { useState } from 'react';
import { TikTokAction, TikTokEventTrigger, EventTimer } from '../App';
import { Plus, Bell, Mic, Zap, Copy, Edit3, Trash2, Gift, UserPlus, Monitor, Clock, Play } from 'lucide-react';
import { Section } from './Section';

interface SimButtonProps {
  label: string;
  onClick: () => void;
}
const SimButton: React.FC<SimButtonProps> = ({ label, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-xs font-bold text-gray-300 py-2.5 rounded-lg transition-all active:scale-95"
  >
    {label}
  </button>
);

interface ActionsAndEventsProps {
  actions: TikTokAction[];
  setActions: React.Dispatch<React.SetStateAction<TikTokAction[]>>;
  setEditingAction: React.Dispatch<React.SetStateAction<TikTokAction | null>>;
  eventTriggers: TikTokEventTrigger[];
  setEventTriggers: React.Dispatch<React.SetStateAction<TikTokEventTrigger[]>>;
  setEditingTrigger: React.Dispatch<React.SetStateAction<TikTokEventTrigger | null>>;
  timers: EventTimer[];
  setTimers: React.Dispatch<React.SetStateAction<EventTimer[]>>;
  handleTikTokEvent: (data: any) => void;
}

export function ActionsAndEvents({
  actions, setActions, setEditingAction, 
  eventTriggers, setEventTriggers, setEditingTrigger,
  timers, setTimers, handleTikTokEvent
}: ActionsAndEventsProps) {
  const [selectedGift, setSelectedGift] = useState('Rose');

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-black tracking-tighter text-white">TikTok Hediye Etkileşim</h2>
        <p className="text-sm text-gray-500">
          Burada özel eylemlerinizi ve olaylarınızı tanımlayabilirsiniz. İlk olarak bir Eylem oluşturun, 
          daha sonra bu Eylemi bir Olaya veya Zamanlayıcıya bağlayın. OBS/LIVE Studio için Eylemlerim Kaplaması gereklidir.
        </p>
      </header>

      {/* Eylemler */}
      <Section title="Eylemler" description="Eylemleri (Ses, Alert, vb) tanımlayın.">
        <div className="bg-[#111317] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white">Eylemlerim</h3>
            <button 
              onClick={() => setActions([...actions, { 
                id: Math.random().toString(36).substr(2, 9), 
                name: 'Yeni Eylem', type: 'alert', screen: 'Screen 1', duration: 5, animation: 'fade',
                imageUrl: '', soundUrl: '', videoUrl: '', description: 'Custom action',
                textColor: '#ec4899', fontSize: '36', ttsEnabled: true, ttsTemplate: '{nickname} gönderdi!', ttsVoice: ''
              }])}
              className="bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-cyan-600 transition-colors"
            >
              <Plus size={14} /> Yeni Eylem Oluştur
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actions.map((action) => (
              <div key={action.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-500">
                    {action.type === 'alert' ? <Bell size={20} /> : action.type === 'tts' ? <Mic size={20} /> : <Zap size={20} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{action.name}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{action.type}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingAction(action)} className="p-2 text-gray-500 hover:text-white" title="Düzenle"><Edit3 size={16} /></button>
                  <button onClick={() => setActions(actions.filter(a => a.id !== action.id))} className="p-2 text-gray-500 hover:text-red-500" title="Sil"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Olaylar -> Gift to Action */}
      <Section title="TikTok Gift to Action (Tetikleyiciler)" description="Belirli bir TikTok hediyesini bir Eyleme (Action) bağlayın / tetikleyin.">
        <div className="bg-[#111317] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-white">Event Triggers / Bağlantılar</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Örn: Rose -{'>'} Zombi Sesi Çal</p>
            </div>
            <button 
              onClick={() => {
                setEditingTrigger({
                  id: Math.random().toString(36).substr(2, 9),
                  active: true, user: 'Any', triggerType: 'Gift', triggerValue: 'Rose', actionIds: []
                });
              }}
              className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Plus size={14} /> Yeni Hediye Bağla (Gift -{'>'} Action)
            </button>
          </div>
          
          <div className="space-y-3">
            {eventTriggers.map((trigger) => (
              <div key={trigger.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                    <Gift size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {trigger.triggerType === 'Gift' ? `🎁 TikTok Hediyesi: ${trigger.triggerValue || 'Herhangi'}` : `${trigger.triggerType} - ${trigger.triggerValue || 'Herhangi'}`}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Tetikler:</span>
                      <div className="flex gap-1 flex-wrap">
                        {trigger.actionIds.length === 0 ? (
                          <span className="text-[10px] text-red-400 bg-red-400/10 px-2 py-0.5 rounded">Eylem Seçilmedi</span>
                        ) : (
                          trigger.actionIds.map(id => {
                            const a = actions.find(a => a.id === id);
                            return a ? <span key={id} className="text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">{a.name}</span> : null;
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${trigger.active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-gray-600'}`} />
                  <button onClick={() => setEditingTrigger(trigger)} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors" title="Düzenle"><Edit3 size={16} /></button>
                  <button onClick={() => setEventTriggers(eventTriggers.filter(t => t.id !== trigger.id))} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-red-500 transition-colors" title="Sil"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Ekranlar */}
      <Section title="Kaplama Ekran Ayarları" description="OBS veya Live Studio için URL kaynaklarınız">
        <div className="bg-[#111317] border border-white/5 rounded-2xl p-6">
          <div className="space-y-3">
            {Array.from({length: 8}, (_, i) => i + 1).map(num => (
              <div key={num} className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Monitor size={16} className="text-gray-500" />
                  <span className="text-xs font-bold text-gray-300">Ekran {num}</span>
                </div>
                <div className="flex-1 max-w-lg bg-black/60 rounded px-3 py-2 border border-white/10 font-mono text-[10px] text-cyan-400 overflow-x-auto whitespace-nowrap">
                  https://tikgifty.com/overlay?mode=actions&screen=Screen%20{num}
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(`https://tikgifty.com/overlay?mode=actions&screen=Screen%20${num}`)}
                  className="p-2 bg-white/5 rounded hover:bg-white/10 text-gray-400 hover:text-white"
                  title="Kopyala"
                >
                  <Copy size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Zamanlayıcı */}
      <Section title="Zamanlayıcı" description="Belirli aralıklarla eylemleri çalıştırın">
        <div className="bg-[#111317] border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white">Aktif Zamanlayıcılar</h3>
            <button 
              onClick={() => {
                setTimers([...timers, {
                  id: Math.random().toString(36).substr(2, 9),
                  active: true, intervalMinutes: 15, actionId: ''
                }]);
              }}
              className="bg-violet-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-violet-600 transition-colors"
            >
              <Plus size={14} /> Zamanlayıcı Ekle
            </button>
          </div>

          <div className="space-y-3">
            {timers.map((timer) => (
              <div key={timer.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-violet-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-violet-500" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{timer.intervalMinutes} Dakikada Bir</h4>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <select 
                    value={timer.actionId}
                    onChange={(e) => setTimers(timers.map(t => t.id === timer.id ? { ...t, actionId: e.target.value } : t))}
                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold focus:border-violet-500/50 outline-none text-white w-48"
                  >
                    <option value="">Eylem Seç</option>
                    {actions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-gray-500 uppercase font-black">Aktif</span>
                    <input 
                      type="checkbox" 
                      checked={timer.active}
                      onChange={(e) => setTimers(timers.map(t => t.id === timer.id ? { ...t, active: e.target.checked } : t))}
                      className="rounded bg-black border-white/20 text-violet-500 focus:ring-violet-500 focus:ring-offset-0"
                    />
                  </label>
                  <button onClick={() => setTimers(timers.filter(t => t.id !== timer.id))} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Event Simülatörü */}
      <Section title="Event Simulator" description="Tetikleyicileri test et">
        <div className="bg-[#111317] border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SimButton label="Takip Et" onClick={() => handleTikTokEvent({ nickname: 'SimUser', type: 'social', displayType: 'follow', timestamp: Date.now(), profilePictureUrl: 'https://picsum.photos/seed/1/100/100' })} />
            <SimButton label="Paylaş" onClick={() => handleTikTokEvent({ nickname: 'SimUser', type: 'social', displayType: 'share', timestamp: Date.now(), profilePictureUrl: 'https://picsum.photos/seed/2/100/100' })} />
            <SimButton label="Abone Ol" onClick={() => handleTikTokEvent({ nickname: 'SimUser', type: 'social', displayType: 'subscribe', timestamp: Date.now(), profilePictureUrl: 'https://picsum.photos/seed/3/100/100' })} />
            <SimButton label="15 Beğeni" onClick={() => handleTikTokEvent({ nickname: 'SimUser', type: 'like', likeCount: 15, timestamp: Date.now(), profilePictureUrl: 'https://picsum.photos/seed/4/100/100' })} />
          </div>
          <div className="h-[1px] bg-white/5" />
          <div className="flex gap-3">
            <select 
              value={selectedGift}
              onChange={(e) => setSelectedGift(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-xs font-bold focus:border-cyan-500/50 outline-none text-white"
            >
              <option value="Rose">Rose</option>
              <option value="Finger Heart">Finger Heart</option>
              <option value="Diamond">Diamond</option>
            </select>
            <button 
              onClick={() => handleTikTokEvent({ nickname: 'SimUser', type: 'gift', giftName: selectedGift, timestamp: Date.now(), profilePictureUrl: 'https://picsum.photos/seed/5/100/100', uniqueId: 'simuser123' })}
              className="bg-cyan-500 text-white px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-cyan-600 transition-colors flex items-center gap-2"
            >
              <Play size={14} /> Gönder
            </button>
          </div>
        </div>
      </Section>

    </div>
  );
}
