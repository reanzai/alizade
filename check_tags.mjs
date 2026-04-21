import fs from 'fs';

const htmlStr = fs.readFileSync('src/App.tsx', 'utf8');

let startIndex = htmlStr.indexOf('<div className="min-h-screen bg-[#0B0E14]');
let endIndex = htmlStr.indexOf('function Toggle', startIndex);

const str = htmlStr.slice(startIndex, endIndex);

const lines = str.split('\n');
let totalDivs = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div(\s|>)/g) || []).length;
  const selfClosed = (line.match(/<div[^>]*\/>/g) || []).length;
  const closed = (line.match(/<\/div>/g) || []).length;
  totalDivs += opens - selfClosed;
  totalDivs -= closed;
  if (totalDivs < 0) {
    console.log(`Negative at line offset ${i}: ${line}`);
    break; // Break on first negative
  }
}
console.log('Final div count', totalDivs);
