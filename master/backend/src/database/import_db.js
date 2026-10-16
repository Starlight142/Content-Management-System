const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const OBJECT_ID_KEYS = new Set([
  '_id',
  'leader',
  'user',
  'teamId',
  'creatorId',
  'assignedTo',
  'contentId',
  'createdBy',
  'entityId'
]);

const isObjectIdHex = (str) => typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str);
const isIsoDate = (str) => typeof str === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str);

const reviveDocument = (data) => {
  if (Array.isArray(data)) {
    return data.map(reviveDocument);
  }
  if (data !== null && typeof data === 'object') {
    const res = {};
    for (const [key, val] of Object.entries(data)) {
      if (OBJECT_ID_KEYS.has(key) && isObjectIdHex(val)) {
        res[key] = new mongoose.Types.ObjectId(val);
      } else if (isIsoDate(val)) {
        res[key] = new Date(val);
      } else if (typeof val === 'object') {
        res[key] = reviveDocument(val);
      } else {
        res[key] = val;
      }
    }
    return res;
  }
  return data;
};

const importDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/content_management';
  const dumpDir = path.join(__dirname, '..', '..', 'dump', 'content_management');

  if (!fs.existsSync(dumpDir)) {
    console.error(`Dump directory not found at: ${dumpDir}`);
    process.exit(1);
  }

  const collections = [
    'users',
    'teams',
    'contents',
    'tasks',
    'ideas',
    'teamactivities'
  ];

  try {
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected successfully.\nStarting restore...');

    const db = mongoose.connection.db;

    for (const collName of collections) {
      const filePath = path.join(dumpDir, `${collName}.json`);
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}, skipping...`);
        continue;
      }

      const raw = fs.readFileSync(filePath, 'utf-8');
      const docs = JSON.parse(raw);

      if (!Array.isArray(docs) || docs.length === 0) {
        console.log(`[${collName}] No documents to import.`);
        continue;
      }

      const coll = db.collection(collName);
      // Clean existing collection first
      await coll.deleteMany({});

      // Revive ObjectIds and Dates
      const revivedDocs = docs.map(reviveDocument);
      await coll.insertMany(revivedDocs);
      console.log(`Restored collection [${collName}]: ${revivedDocs.length} documents.`);
    }

    console.log('\nDatabase restore completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error importing database:', error);
    process.exit(1);
  }
};

importDatabase();
