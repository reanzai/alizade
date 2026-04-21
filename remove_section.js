import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const sectionStart = content.indexOf('function Section({ title, description, children }');
if (sectionStart !== -1) {
  const nextFunc = content.indexOf('function SettingsSection(', sectionStart); // wait SettingsSection might be before or after
  const sectionEnd = content.indexOf('}', sectionStart) + 1; // Section is just one function block
  // Wait, let's just do a regex replace
  content = content.replace(/function Section\(\{ title, description, children \}: \{ title: string, description: string, children: ReactNode \}\) \{\s*return \(\s*<div className="space-y-4">\s*<div>\s*<h3 className="text-xl font-bold text-white">\{title\}<\/h3>\s*<p className="text-sm text-gray-500">\{description\}<\/p>\s*<\/div>\s*\{children\}\s*<\/div>\s*\);\s*\}/s, '');
  
  if (!content.includes('import { Section } from')) {
    content = content.replace("import { ActionsAndEvents } from './components/ActionsAndEvents';", "import { ActionsAndEvents } from './components/ActionsAndEvents';\nimport { Section } from './components/Section';");
  }
  
  fs.writeFileSync('src/App.tsx', content);
  console.log('Section removed and imported');
} else {
  console.log('Section function not found');
}
