const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/etymonline.json'), 'utf8'));

// Find 'impede'
const impede = data.find(item => item.word === 'impede');
console.log('Impede entry:', impede);

// Find 'impediment'
const impediment = data.find(item => item.word === 'impediment');
console.log('Impediment entry:', impediment);

// Find 'expedition'
const expedition = data.find(item => item.word === 'expedition');
console.log('Expedition entry:', expedition);

// Find 'expedite'
const expedite = data.find(item => item.word === 'expedite');
console.log('Expedite entry:', expedite);

// Test regex extraction on impediment
const rootRegex = /PIE root \*([a-z-]+)/;
const match = impediment.etymology.match(rootRegex);
console.log('Regex match on impediment:', match);



