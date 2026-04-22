const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{editingTrigger && \([\s\S]*?<div className="fixed inset-0 z-\[100\] flex items-center justify-center p-4">[\s\S]*?<motion\.div[\s\S]*?className="absolute inset-0 bg-black\/80 backdrop-blur-sm"[\s\S]*?\/>[\s\S]*?<motion\.div[\s\S]*?className="relative w-full max-w-2xl bg-\[#0a0a0a\] border border-white\/10 rounded-\[32px\] overflow-hidden shadow-2xl"[\s\S]*?>[\s\S]*?<div className="p-8 border-b border-white\/5 flex justify-between items-center">[\s\S]*?Save Trigger\s*<\/button>\s*<\/div>\s*<\/motion.div>\s*<\/div>\s*\)\}/m;

const newContent = `{editingTrigger && (
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
              <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-[#0F131A] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl rounded-full" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-black tracking-tighter text-white">Bağlantı Düzenle</h3>
                  <p className="text-sm text-gray-400">TikTok Etkileşimi ➔ Eylem bağlantısını yapılandır</p>
                </div>
                <button onClick={() => setEditingTrigger(null)} className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors relative z-10" aria-label="Kapat">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-[#0B0E14]">
                {/* 1. Tetikleyici Tipi Seçimi */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 tracking-wide">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-black">1</span>
                    TikTok Etkileşimi (Tetikleyici)
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {['Gift', 'Follow', 'Like', 'Share', 'Subscribe', 'Join'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setEditingTrigger({...editingTrigger, triggerType: type as any, triggerValue: type === 'Gift' ? 'Rose' : ''})}
                        className={\`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all \${
                          editingTrigger.triggerType === type
                            ? 'bg-gradient-to-br from-cyan-500/20 to-transparent border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                            : 'bg-[#151923] border-[#252A36] text-gray-500 hover:border-white/20 hover:text-gray-300'
                        }\`}
                      >
                        {type === 'Gift' && <Gift size={20} />}
                        {type === 'Follow' && <UserPlus size={20} />}
                        {type === 'Like' && <Heart size={20} />}
                        {type === 'Share' && <Share2 size={20} />}
                        {type === 'Subscribe' && <Zap size={20} />}
                        {type === 'Join' && <Users size={20} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Hediye Adı (Eğer Gift seçiliyse) */}
                {editingTrigger.triggerType === 'Gift' && (
                  <div className="space-y-4 bg-[#11141C] border border-[#252A36] rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute -right-12 -top-12 opacity-10">
                        <Gift size={120} className="text-pink-500" />
                    </div>
                    <label className="text-[10px] font-black text-pink-500 uppercase tracking-widest flex items-center gap-2 relative z-10">
                       <Gift size={14} /> Hangi Hediye Geldiğinde Çalışsın?
                    </label>
                    
                    <div className="space-y-4 relative z-10">
                      <input 
                        type="text" 
                        value={editingTrigger.triggerValue || ''}
                        onChange={(e) => setEditingTrigger({...editingTrigger, triggerValue: e.target.value})}
                        placeholder="Örn: Rose, GG, Leon the Kitten..."
                        className="w-full bg-[#1A1F2C] border border-[#252A36] rounded-xl p-4 text-sm font-bold text-white focus:outline-none focus:border-pink-500 transition-colors shadow-inner"
                      />
                      <div className="flex gap-2 flex-wrap pb-2">
                        {['Rose', 'GG', 'TikTok', 'Finger Heart', 'Corgi', 'Leon the Kitten', 'Doughnut', 'Ice Cream'].map(preset => (
                          <button
                            key={preset}
                            onClick={() => setEditingTrigger({...editingTrigger, triggerValue: preset})}
                            className="bg-black/40 hover:bg-pink-500/20 hover:text-pink-400 hover:border-pink-500/50 border border-[#252A36] text-gray-400 text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest border-t border-white/5 pt-3">
                         Not: Hediye adını tam olarak TikTok'ta görüldüğü gibi (Büyük/Küçük harfe duyarlı) girin.
                      </p>
                    </div>
                  </div>
                )}

                {/* Gelişmiş Şartlar (Ardışık / Sayı) */}
                <div className="bg-[#11141C] border border-[#252A36] rounded-2xl p-6 space-y-4 shadow-lg shadow-black/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white tracking-wide">Gelişmiş Şartlar (İsteğe Bağlı)</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                        Art arda (Streak) veya Toplam Sayı Şartı
                      </p>
                    </div>
                    <div onClick={() => setEditingTrigger({...editingTrigger, isStreak: !editingTrigger.isStreak})} className="scale-90 opacity-80 hover:opacity-100 transition-opacity">
                      <Toggle active={!!editingTrigger.isStreak} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-[#252A36]">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-relaxed block">
                         Tetiklenme Çarpanı / Sınırı <br/>(Örn: En az 10 tane atarsa çalış)
                      </label>
                      <input 
                        type="number" 
                        value={editingTrigger.minCount || 0}
                        onChange={(e) => setEditingTrigger({...editingTrigger, minCount: parseInt(e.target.value) || 0})}
                        className="w-full max-w-[120px] bg-[#1A1F2C] border border-[#252A36] rounded-xl p-3 text-lg font-black text-white focus:outline-none focus:border-cyan-500 transition-colors text-center"
                      />
                    </div>
                    <div className="flex items-center">
                      <p className="text-[10px] text-cyan-500/80 font-bold tracking-widest uppercase bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/10">
                        {editingTrigger.isStreak 
                          ? "Eylem sadece gönderilen öğe ART ARDA (Combo) belirtilen sayıya ulaştığında tetiklenir." 
                          : "Eylem, toplamda belirtilen adet ulaşıldıktan sonraki HER gönderimde çalışır (İptal etmek için 0 yapın)."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Çalışacak Eylemler */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 tracking-wide">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-black">2</span>
                    Bu Olay Olduğunda Hangi Eylemler Çalışsın?
                  </h4>
                  {actions.length === 0 ? (
                     <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                        <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Hiç Eylem (Action) Tanımlanmamış!</p>
                        <p className="text-[10px] text-red-400/70 mt-1">Lütfen önce ana menüden bir Eylem oluşturun.</p>
                     </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                          className={\`p-4 rounded-xl border text-left transition-all relative overflow-hidden \${
                            editingTrigger.actionIds.includes(action.id)
                              ? 'bg-gradient-to-br from-cyan-500/20 to-[#11141C] border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                              : 'bg-[#151923] border-[#252A36] hover:border-white/20 hover:bg-[#1A1E29]'
                          }\`}
                        >
                          <div className={\`absolute top-0 right-0 w-8 h-8 rounded-bl-2xl flex items-center justify-center transition-all duration-300 \${editingTrigger.actionIds.includes(action.id) ? 'bg-cyan-500' : 'bg-transparent'}\`}>
                             {editingTrigger.actionIds.includes(action.id) && <Check size={12} className="text-[#0A0D14] font-black" />}
                          </div>
                          <p className={\`text-sm font-black tracking-tight \${editingTrigger.actionIds.includes(action.id) ? 'text-cyan-400' : 'text-white'}\`}>{action.name}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 text-gray-400 mt-1">{action.type}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 md:p-8 bg-[#0F131A] border-t border-[#1C202B] flex justify-end gap-3 rounded-b-[32px] items-center">
                <button 
                  onClick={() => {
                    if (eventTriggers.find(t => t.id === editingTrigger.id)) {
                      setEventTriggers(eventTriggers.filter(t => t.id !== editingTrigger.id));
                    }
                    setEditingTrigger(null);
                  }}
                  className="px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Bağlantıyı Sil
                </button>
                <div className="flex-1" />
                <button 
                  onClick={() => setEditingTrigger(null)}
                  className="px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-gray-400 hover:text-white transition-colors hover:bg-white/5"
                >
                  İptal
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
                  className="bg-cyan-500 text-[#0A0D14] px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2"
                >
                  <Check size={14} /> Kaydet
                </button>
              </div>
            </motion.div>
          </div>
        )}`;

if (regex.test(content)) {
  content = content.replace(regex, newContent);
  fs.writeFileSync('src/App.tsx', content);
  console.log('Successfully updated Edit Trigger modal via script');
} else {
  console.log('Could not match regex.');
}
