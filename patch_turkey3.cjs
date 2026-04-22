const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const sidebarReplace = `
            <SidebarItem 
              icon={<MapIcon size={20} />} 
              active={activeTab === 'turkey-map-war'} 
              onClick={() => { setActiveTab('turkey-map-war'); setIsMobileMenuOpen(false); }}
              label="Türkiye Harita Savaşı"
            />
            <SidebarItem 
              icon={<Disc size={20} />} 
`;
content = content.replace(
  `<SidebarItem \n              icon={<Disc size={20} />}`,
  sidebarReplace.trim()
);

const overlayReplace = `
    if (gameOverlayMode === 'voting') {
      return <VotingGameOverlay gameState={votingGame} />;
    }
    
    if (gameOverlayMode === 'turkey-map') {
      return <TurkeyMapOverlay gameState={turkeyMapGame} />;
    }
`;
content = content.replace(
  `    if (gameOverlayMode === 'voting') {
      return <VotingGameOverlay gameState={votingGame} />;
    }`,
  overlayReplace
);

const dashboardReplace = `
          {activeTab === 'voting' && (
            <VotingGameDashboard 
              gameState={votingGame}
              setGameState={setVotingGame}
              username={username}
            />
          )}

          {activeTab === 'turkey-map-war' && (
            <TurkeyMapDashboard 
              gameState={turkeyMapGame}
              setGameState={setTurkeyMapGame}
              username={username}
            />
          )}
`;
content = content.replace(
  `          {activeTab === 'voting' && (
            <VotingGameDashboard 
              gameState={votingGame}
              setGameState={setVotingGame}
              username={username}
            />
          )}`,
  dashboardReplace.trim()
);

fs.writeFileSync('src/App.tsx', content);
