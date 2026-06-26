const fs = require('fs');
let c = fs.readFileSync('CasualForm.jsx', 'utf8');
c = c.replace(/<input type="text" /g, '<DynamicInput ');
c = c.replace(/<input type="email" /g, '<DynamicInput ');
c = c.replace(/<textarea /g, '<DynamicInput ');
c = c.replace(/import '\.\/CasualForm\.css';/, "import './CasualForm.css';\nimport DynamicInput from './DynamicInput';");
fs.writeFileSync('CasualForm.jsx', c);
