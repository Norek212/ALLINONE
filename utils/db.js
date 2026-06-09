const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data.json');

function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    const defaultData = { users: {}, repCount: 0, legitCount: 0, exchanges: {} };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  if (typeof data.legitCount !== 'number') data.legitCount = 0;
  if (typeof data.repCount !== 'number') data.repCount = 0;
  if (!data.users) data.users = {};
  if (!data.exchanges) data.exchanges = {};
  return data;
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getUser(userId) {
  const db = loadDB();
  if (!db.users[userId]) {
    db.users[userId] = { rep: 0, exchanges: [], backupKey: null };
    saveDB(db);
  }
  return db.users[userId];
}

function addRep(userId, details) {
  const db = loadDB();
  if (!db.users[userId]) db.users[userId] = { rep: 0, exchanges: [], backupKey: null };
  db.users[userId].rep += 1;
  db.users[userId].exchanges.push({ ...details, date: new Date().toISOString() });
  saveDB(db);
  return db.users[userId].rep;
}

function incrementTotalRep() {
  const db = loadDB();
  db.repCount = (db.repCount || 0) + 1;
  saveDB(db);
  return db.repCount;
}

function incrementLegitCount() {
  const db = loadDB();
  db.legitCount = (db.legitCount || 0) + 1;
  saveDB(db);
  return db.legitCount;
}

function getUserRep(userId) {
  const db = loadDB();
  return db.users[userId]?.rep || 0;
}

function getUserExchanges(userId) {
  const db = loadDB();
  return db.users[userId]?.exchanges || [];
}

function getUserSummary(userId) {
  const user = getUser(userId);
  const exchanges = user.exchanges || [];
  const totalAmount = exchanges.reduce((sum, exchange) => sum + (Number(exchange.amount) || 0), 0);

  return {
    rep: user.rep || 0,
    exchangesCount: exchanges.length,
    totalAmount,
    exchanges
  };
}

function getTotalRep() {
  const db = loadDB();
  return db.repCount || 0;
}

function getLegitCount() {
  const db = loadDB();
  return db.legitCount || 0;
}

function setBackupKey(userId, key) {
  const db = loadDB();
  if (!db.users[userId]) db.users[userId] = { rep: 0, exchanges: [], backupKey: null };
  db.users[userId].backupKey = key;
  saveDB(db);
}

function getBackupKey(userId) {
  const db = loadDB();
  return db.users[userId]?.backupKey || null;
}

function transferRanks(fromId, toId) {
  const db = loadDB();
  if (!db.users[fromId]) return false;
  if (!db.users[toId]) db.users[toId] = { rep: 0, exchanges: [], backupKey: null };
  db.users[toId].rep += db.users[fromId].rep;
  db.users[toId].exchanges = [...(db.users[toId].exchanges || []), ...(db.users[fromId].exchanges || [])];
  db.users[fromId].rep = 0;
  db.users[fromId].exchanges = [];
  saveDB(db);
  return true;
}

function recoverByKey(key, newUserId) {
  const db = loadDB();
  for (const [uid, udata] of Object.entries(db.users)) {
    if (udata.backupKey === key) {
      if (!db.users[newUserId]) db.users[newUserId] = { rep: 0, exchanges: [], backupKey: null };
      db.users[newUserId].rep += udata.rep;
      db.users[newUserId].exchanges = [...(db.users[newUserId].exchanges || []), ...(udata.exchanges || [])];
      udata.rep = 0;
      udata.exchanges = [];
      udata.backupKey = null;
      saveDB(db);
      return true;
    }
  }
  return false;
}

module.exports = {
  getUser, addRep, getUserRep, getUserExchanges,
  getUserSummary,
  getTotalRep, incrementTotalRep, getLegitCount, incrementLegitCount, setBackupKey, getBackupKey,
  transferRanks, recoverByKey
};
