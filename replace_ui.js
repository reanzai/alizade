import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const startMarker = "{activeTab === 'actions' && (";
const endMarker = "{activeTab === 'overlay' && (";

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const before = content.slice(0, startIdx);
  const after = content.slice(endIdx);
  
  const replacement = `{activeTab === 'actions' && (
            <ActionsAndEvents 
              actions={actions} 
              setActions={setActions} 
              setEditingAction={setEditingAction} 
              eventTriggers={eventTriggers} 
              setEventTriggers={setEventTriggers} 
              setEditingTrigger={setEditingTrigger} 
              timers={timers} 
              setTimers={setTimers} 
              handleTikTokEvent={handleTikTokEvent} 
            />
          )}

          `;

  fs.writeFileSync('src/App.tsx', before + replacement + after);
  console.log('Replacement successful');
} else {
  console.log('Markers not found', startIdx, endIdx);
}
