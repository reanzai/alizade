const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Rewrite SidebarItem
const oldSidebarItemRegex = /function SidebarItem\(\{ icon, active, onClick, label, badge \}: \{ icon: ReactNode, active: boolean, onClick: \(\) => void, label: string, badge\?: string \}\) \{[\s\S]*?return \([\s\S]*?<\/button>\s*\);\s*\}/m;

const newSidebarItem = `function SidebarItem({ icon, active, onClick, label, badge }: { icon: ReactNode, active: boolean, onClick: () => void, label: string, badge?: string }) {
  return (
    <button
      onClick={onClick}
      className={\`w-full h-12 rounded-r-lg flex items-center gap-4 px-4 transition-all relative \${
        active 
          ? 'bg-gradient-to-r from-[#172436] to-transparent border-l-[3px] border-cyan-400 text-cyan-400' 
          : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border-l-[3px] border-transparent'
      }\`}
    >
      <div className="flex items-center justify-center w-5 h-5 opacity-90">
        {icon}
      </div>
      <span className={\`text-sm font-semibold tracking-wide \${active ? 'text-white' : ''}\`}>
        {label}
      </span>
      {badge && (
        <span className="ml-auto bg-cyan-500/20 text-cyan-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
          {badge}
        </span>
      )}
    </button>
  );
}`;

content = content.replace(oldSidebarItemRegex, newSidebarItem);

// 2. Rewrite the main Layout structure up to the <main> tag
// Finding the start of the layout wrapper
const layoutStartRegex = /<div className="min-h-screen bg-\[#0a0b0d\] text-gray-300 font-sans selection:bg-cyan-500\/30">[\s\S]*?{activeTab === 'dashboard' && \(/m;

let newLayoutBlock = `<div className="min-h-screen bg-[#0B0E14] text-gray-300 font-sans selection:bg-cyan-500/30">
      <Helmet>
        <title>{\`TikGifty - \${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}\`}</title>
      </Helmet>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={\`fixed left-0 top-0 bottom-0 w-64 bg-[#0F131A] border-r border-[#1C202B] flex flex-col py-6 z-50 transition-transform duration-300 ease-in-out \${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}\`}>
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
            <div className={\`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)] \${isConnected ? 'bg-cyan-400' : 'bg-red-500'}\`}></div>
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
              label="Interactions"
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
          <button className={\`w-full py-3.5 rounded-lg text-sm font-black uppercase tracking-widest text-[#0B0E14] \${isConnected ? 'bg-cyan-400 hover:bg-cyan-300' : 'bg-pink-500 hover:bg-pink-400'} transition-all flex items-center justify-center gap-2\`}>
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
             <img src={user?.photoURL || \`https://ui-avatars.com/api/?name=\${user?.displayName || 'User'}&background=random\`} alt="Profile" className="w-10 h-10 rounded-full border-2 border-cyan-400" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 md:pl-64 p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      
        {activeTab === 'dashboard' && (`;

content = content.replace(layoutStartRegex, newLayoutBlock);

fs.writeFileSync('src/App.tsx', content);
console.log('App layout structure updated successfully');
