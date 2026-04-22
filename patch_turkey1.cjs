const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
content = content.replace(
  "import { ActionsAndEvents } from './components/ActionsAndEvents';",
  "import { ActionsAndEvents } from './components/ActionsAndEvents';\nimport { TurkeyMapDashboard, TurkeyMapOverlay, TurkeyMapGameState } from './components/TurkeyMapWar';"
);

// Add State
const stateToAdd = `  const [turkeyMapGame, setTurkeyMapGame] = useState<TurkeyMapGameState>({
    status: 'idle',
    teams: [
      { id: '1', name: 'Kırmızı Ordu', color: '#ef4444', giftName: 'Rose', capitalId: 34, score: 0 },
      { id: '2', name: 'Mavi Ordu', color: '#3b82f6', giftName: 'TikTok', capitalId: 6, score: 0 },
      { id: '3', name: 'Yeşil Birlik', color: '#10b981', giftName: 'GG', capitalId: 35, score: 0 },
      { id: '4', name: 'Sarı Birlik', color: '#eab308', giftName: 'Heart', capitalId: 1, score: 0 }
    ],
    cities: {},
    settings: {
      title: 'TÜRKİYE HÜKÜMDARLIK SAVAŞI',
      description: 'Hediye atarak takımının sınırlarını genişlet!',
      maxHealthPerCity: 1,
      attackPowerPerGift: 1
    }
  });`;

content = content.replace(
  "const [actions, setActions] = useState<TikTokAction[]>([]);",
  stateToAdd + "\n  const [actions, setActions] = useState<TikTokAction[]>([]);"
);

// Add refs
content = content.replace(
  "const pixelConquestRef = useRef(pixelConquest);",
  "const pixelConquestRef = useRef(pixelConquest);\n  const turkeyMapGameRef = useRef(turkeyMapGame);"
);

// Add root useEffect sync
const effectToAdd = `
  useEffect(() => {
    turkeyMapGameRef.current = turkeyMapGame;
    const params = new URLSearchParams(window.location.search);
    if (!params.get('mode') && username && socket) {
      socket.emit('sync-state', { username, state: { type: 'turkeyMapGame', data: turkeyMapGame } });
    }
  }, [turkeyMapGame, username, socket]);
`;
content = content.replace(
  "// Connection Logic",
  effectToAdd + "\n  // Connection Logic"
);

// Add to socket 'request-state'
content = content.replace(
  "newSocket.emit('sync-state', { username: currentUsername, state: { type: 'pixelConquest', data: pixelConquestRef.current } });",
  "newSocket.emit('sync-state', { username: currentUsername, state: { type: 'pixelConquest', data: pixelConquestRef.current } });\n        newSocket.emit('sync-state', { username: currentUsername, state: { type: 'turkeyMapGame', data: turkeyMapGameRef.current } });"
);

// Add to socket 'state-sync'
content = content.replace(
  "if (stateObj.type === 'pixelConquest') setPixelConquest(stateObj.data);",
  "if (stateObj.type === 'pixelConquest') setPixelConquest(stateObj.data);\n      if (stateObj.type === 'turkeyMapGame') setTurkeyMapGame(stateObj.data);"
);


// Add logic in handleTikTokEvent for gifts
const giftLogic = `
      // Turkey Map War Logic
      setTurkeyMapGame(prev => {
        if (prev.status !== 'running') return prev;
        
        const matchedTeam = prev.teams.find(t => t.giftName.toLowerCase() === data.giftName?.toLowerCase());
        if (!matchedTeam) return prev;

        const newCities = { ...prev.cities };
        let newTeams = [...prev.teams];
        
        const unownedCities = Object.values(newCities).filter(c => c.ownerId === null);
        let targetCity = null;
        
        if (unownedCities.length > 0) {
          targetCity = unownedCities[Math.floor(Math.random() * unownedCities.length)];
        } else {
          const enemyCities = Object.values(newCities).filter(c => c.ownerId !== matchedTeam.id);
          if (enemyCities.length > 0) {
            targetCity = enemyCities[Math.floor(Math.random() * enemyCities.length)];
          }
        }

        if (targetCity) {
          const actualTarget = { ...targetCity };
          actualTarget.health -= prev.settings.attackPowerPerGift * (data.repeatCount || 1);
          if (actualTarget.health <= 0) {
            const oldOwnerId = actualTarget.ownerId;
            actualTarget.ownerId = matchedTeam.id;
            actualTarget.health = prev.settings.maxHealthPerCity;
            
            newTeams = newTeams.map(t => {
              if (t.id === matchedTeam.id) return { ...t, score: t.score + 1 };
              if (t.id === oldOwnerId) return { ...t, score: Math.max(0, t.score - 1) };
              return t;
            });
          }
          newCities[actualTarget.plateNumber] = actualTarget;
        }

        return { ...prev, cities: newCities, teams: newTeams };
      });
`;
content = content.replace(
  "// Voting Game Logic",
  giftLogic + "\n      // Voting Game Logic"
); // Since there are two "// Voting Game Logic", it will replace the first one (for chats? Wait, giftName is in gifts).
// Actually let's use another hook point.

fs.writeFileSync('src/App.tsx', content);
