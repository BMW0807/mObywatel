const fs = require('fs');
const path = require('path');

global.window = global;
global.location = { search: '' };
global.localStorage = { getItem: () => null };
global.document = { documentElement: { style: { setProperty: () => {} } } };

// Read osoby.js
const osobyCode = fs.readFileSync('mockup/osoby.js', 'utf8');
eval(osobyCode);

const results = [];

for (const [osobaId, persona] of Object.entries(OSOBY)) {
  for (const doc of persona.docs) {
    results.push({ osoba: osobaId, docId: doc.id, name: doc.name, img: doc.img, strip: doc.strip });
  }
}

// Check each file on disk or data url
for (const r of results) {
  const checkOne = (prop, val) => {
    if (!val) {
      console.log(`[MISSING PROP] ${r.osoba} -> ${r.docId} (${r.name}): ${prop} is empty!`);
      return;
    }
    if (val.startsWith('data:')) {
      console.log(`[DATA URL] ${r.osoba} -> ${r.docId} (${r.name}): ${prop} length=${val.length}`);
      return;
    }
    const cleanPath = val.split('?')[0];
    const fullPath = path.join('mockup', cleanPath);
    if (!fs.existsSync(fullPath)) {
      console.log(`[FILE NOT FOUND 404] ${r.osoba} -> ${r.docId} (${r.name}): ${prop}="${val}" -> ${fullPath}`);
    } else {
      const stat = fs.statSync(fullPath);
      // console.log(`[OK] ${r.osoba} -> ${r.docId} (${r.name}): ${prop}="${val}" (${stat.size} bytes)`);
    }
  };
  checkOne('img', r.img);
  checkOne('strip', r.strip);
}
console.log('Checked', results.length, 'cards across all personas.');
