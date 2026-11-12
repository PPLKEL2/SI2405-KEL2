'use strict';

const fs = require('node:fs');
const path = require('node:path');

// Penyimpanan sederhana berbasis file JSON. Jika filePath null, data hanya di memori (dipakai di tes).
function createStore(filePath = null) {
  let data = { facilities: [], tarif: [], seq: { facilities: 0, tarif: 0 } };

  if (filePath && fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  return {
    data,
    nextId(name) {
      data.seq[name] += 1;
      return data.seq[name];
    },
    save() {
      if (!filePath) return;
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    },
  };
}

module.exports = { createStore };
