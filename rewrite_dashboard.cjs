const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const dashStartRegex = /\{activeTab === 'dashboard' && \([\s\S]*?<\/div>\s*\)\}/m;

const newDashboard = `{activeTab === 'dashboard' && (
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
                          <img src={event.profilePictureUrl || \`https://ui-avatars.com/api/?name=\${event.nickname}&background=random\`} alt={event.nickname} className="w-10 h-10 rounded-lg" referrerPolicy="no-referrer" />
                          <div>
                            <p className="text-sm text-gray-300">
                              <span className="font-bold text-white mr-1">{event.nickname}</span>
                              {event.type === 'gift' && \`sent a \${event.giftName}\`}
                              {event.type === 'social' && event.label}
                              {event.type === 'like' && \`sent \${event.repeatCount} likes\`}
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
                       <div className="h-full bg-cyan-400" style={{ width: \`\${Math.min(100, (followerGoal.current / followerGoal.target) * 100)}%\` }} />
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
        )}`;

content = content.replace(dashStartRegex, newDashboard);
fs.writeFileSync('src/App.tsx', content);
console.log('Dashboard content updated!');
