const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace precisely inside gift handler
const giftLogicBlock = `
      if (data.repeatCount === 1 || !data.repeatCount) {
        handleTikTokEvent({ ...data, type: 'gift' });
      }

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

      // Voting Game Logic`;

content = content.replace(
  `      if (data.repeatCount === 1 || !data.repeatCount) {
        handleTikTokEvent({ ...data, type: 'gift' });
      }

      // Voting Game Logic`,
  giftLogicBlock
);
fs.writeFileSync('src/App.tsx', content);
