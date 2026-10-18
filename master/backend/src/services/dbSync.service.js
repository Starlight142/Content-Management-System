const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Ensure all 6 Mongoose models are registered for index synchronization
const User = require('../database/models/User');
const Team = require('../database/models/Team');
const Content = require('../database/models/Content');
const Task = require('../database/models/Task');
const Idea = require('../database/models/Idea');
const TeamActivity = require('../database/models/TeamActivity');

const MODELS_BY_COLLECTION = {
  users: User,
  teams: Team,
  contents: Content,
  tasks: Task,
  ideas: Idea,
  teamactivities: TeamActivity,
};

const COLLECTIONS = [
  'users',
  'teams',
  'contents',
  'tasks',
  'ideas',
  'teamactivities',
];

const OBJECT_ID_KEYS = new Set([
  '_id',
  'teamId',
  'leader',
  'user',
  'createdBy',
  'ideaId',
  'uploadedBy',
  'submittedBy',
  'reviewerId',
  'contentId',
  'assignedTo',
  'proposedBy',
  'actor',
  'entityId',
  'creatorId',
]);

// Transient runtime fields ignored during content hash comparison
const VOLATILE_FIELDS = new Set([
  'isOnline',
  'lastActiveAt',
]);

const DB_ROOT_DIR = path.resolve(__dirname, '..', '..', '..', 'database');
const DUMP_DIR = path.join(DB_ROOT_DIR, 'mongodb-dump');
const COMPASS_DIR = path.join(DB_ROOT_DIR, 'compass-import');
const BACKUPS_DIR = path.join(DB_ROOT_DIR, 'backups');

let autoExportTimer = null;
let isSyncInProgress = false;

const isObjectIdHex = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);
const isIsoDateString = (val) =>
  typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(val);

/**
 * Convert raw MongoDB document (with ObjectId/Date instances) into plain JSON-serializable structure
 */
const toPlainJson = (data) => {
  if (data === null || data === undefined) return data;
  if (data instanceof mongoose.Types.ObjectId || (data._bsontype && data._bsontype === 'ObjectId')) {
    return data.toString();
  }
  if (data instanceof Date) {
    return data.toISOString();
  }
  if (Array.isArray(data)) {
    return data.map(toPlainJson);
  }
  if (typeof data === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(data)) {
      out[k] = toPlainJson(v);
    }
    return out;
  }
  return data;
};

/**
 * Convert plain JSON document to MongoDB Compass Extended JSON ($oid, $date)
 */
const toCompassExtendedJson = (data) => {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return data.map(toCompassExtendedJson);
  }
  if (typeof data === 'object') {
    if (data instanceof mongoose.Types.ObjectId || (data._bsontype && data._bsontype === 'ObjectId')) {
      return { $oid: data.toString() };
    }
    if (data instanceof Date) {
      return { $date: data.toISOString() };
    }
    const out = {};
    for (const [key, val] of Object.entries(data)) {
      if (OBJECT_ID_KEYS.has(key) && isObjectIdHex(val)) {
        out[key] = { $oid: val };
      } else if (isIsoDateString(val)) {
        out[key] = { $date: val };
      } else if (typeof val === 'object' && val !== null) {
        out[key] = toCompassExtendedJson(val);
      } else {
        out[key] = val;
      }
    }
    return out;
  }
  return data;
};

/**
 * Revive plain JSON or Extended JSON ($oid, $date) back into native MongoDB ObjectId and Date
 */
const reviveDocument = (data) => {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return data.map(reviveDocument);
  }
  if (typeof data === 'object') {
    if (Object.keys(data).length === 1 && typeof data.$oid === 'string' && isObjectIdHex(data.$oid)) {
      return new mongoose.Types.ObjectId(data.$oid);
    }
    if (Object.keys(data).length === 1 && typeof data.$date === 'string') {
      return new Date(data.$date);
    }
    const res = {};
    for (const [key, val] of Object.entries(data)) {
      if (OBJECT_ID_KEYS.has(key) && isObjectIdHex(val)) {
        res[key] = new mongoose.Types.ObjectId(val);
      } else if (isIsoDateString(val)) {
        res[key] = new Date(val);
      } else if (typeof val === 'object' && val !== null) {
        res[key] = reviveDocument(val);
      } else {
        res[key] = val;
      }
    }
    return res;
  }
  return data;
};

/**
 * Canonicalize a single document for deterministic SHA-256 content comparison
 */
const canonicalizeValue = (val) => {
  if (val === null || val === undefined) return null;
  if (val instanceof mongoose.Types.ObjectId || (val._bsontype && val._bsontype === 'ObjectId')) {
    return val.toString();
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (Array.isArray(val)) {
    return val.map(canonicalizeValue);
  }
  if (typeof val === 'object') {
    if (Object.keys(val).length === 1 && typeof val.$oid === 'string') {
      return val.$oid;
    }
    if (Object.keys(val).length === 1 && typeof val.$date === 'string') {
      return new Date(val.$date).toISOString();
    }
    const sortedKeys = Object.keys(val)
      .filter((k) => !VOLATILE_FIELDS.has(k))
      .sort();
    const result = {};
    for (const k of sortedKeys) {
      result[k] = canonicalizeValue(val[k]);
    }
    return result;
  }
  return val;
};

/**
 * Compute deep digest for a collection's documents (per-document hash, collection hash, and latest timestamp)
 */
const computeCollectionDigest = (rawDocs = []) => {
  const plainDocs = rawDocs.map(toPlainJson);
  const sortedDocs = [...plainDocs].sort((a, b) => {
    const idA = String(a._id || '');
    const idB = String(b._id || '');
    return idA.localeCompare(idB);
  });

  const docHashes = new Map();
  let latestUpdatedAt = null;

  const canonicalDocs = sortedDocs.map((doc) => {
    const id = String(doc._id || '');
    const canonical = canonicalizeValue(doc);
    const serialized = JSON.stringify(canonical);
    const docHash = crypto.createHash('sha256').update(serialized).digest('hex');
    if (id) {
      docHashes.set(id, docHash);
    }

    const candidates = [doc.updatedAt, doc.createdAt].filter(Boolean);
    for (const ts of candidates) {
      const iso = ts instanceof Date ? ts.toISOString() : String(ts);
      if (!latestUpdatedAt || iso > latestUpdatedAt) {
        latestUpdatedAt = iso;
      }
    }
    return canonical;
  });

  const collectionHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalDocs))
    .digest('hex');

  return {
    count: sortedDocs.length,
    hash: collectionHash,
    latestUpdatedAt,
    docHashes,
  };
};

/**
 * Clean automated Robot Framework test artifacts from the live MongoDB database
 */
const cleanJunkDataFromDatabase = async () => {
  const db = mongoose.connection.db;
  if (!db) return { removedTotal: 0, details: {} };

  const usersColl = db.collection('users');
  const teamsColl = db.collection('teams');
  const contentsColl = db.collection('contents');
  const tasksColl = db.collection('tasks');
  const ideasColl = db.collection('ideas');
  const activitiesColl = db.collection('teamactivities');

  // 1. Identify Robot test users
  const robotUsers = await usersColl
    .find({
      $or: [
        { email: { $regex: /^robot_/i } },
        { username: { $regex: /^robot_/i } },
      ],
    })
    .toArray();
  const robotUserIds = robotUsers.map((u) => u._id);
  const robotUserIdStrings = new Set(robotUserIds.map((id) => id.toString()));

  let removedUsers = 0;
  if (robotUserIds.length > 0) {
    const res = await usersColl.deleteMany({ _id: { $in: robotUserIds } });
    removedUsers = res.deletedCount || 0;
  }

  // Clean dangling robot user references from Team.members
  const allTeams = await teamsColl.find({}).toArray();
  let cleanedTeamMembers = 0;
  for (const team of allTeams) {
    if (Array.isArray(team.members)) {
      const filteredMembers = team.members.filter(
        (m) => !robotUserIdStrings.has(String(m.user))
      );
      if (filteredMembers.length !== team.members.length) {
        cleanedTeamMembers += team.members.length - filteredMembers.length;
        await teamsColl.updateOne(
          { _id: team._id },
          { $set: { members: filteredMembers } }
        );
      }
    }
  }

  // 2. Remove Robot test contents ("Robot Automated Showcase EP01")
  const robotContents = await contentsColl
    .find({ title: { $regex: /^Robot Automated Showcase/i } })
    .toArray();
  const robotContentIds = robotContents.map((c) => c._id);
  const deleteContentsRes = await contentsColl.deleteMany({
    title: { $regex: /^Robot Automated Showcase/i },
  });
  const removedContents = deleteContentsRes.deletedCount || 0;

  // 3. Remove Robot test tasks
  const deleteTasksRes = await tasksColl.deleteMany({
    $or: [
      { contentId: { $in: robotContentIds } },
      { submissionUrl: 'https://drive.google.com/robot-cut-v2' },
      { title: 'Editing Video EP01' },
    ],
  });
  const removedTasks = deleteTasksRes.deletedCount || 0;

  // 4. Remove Robot test ideas ("Future of AI Video Tools 2026")
  const deleteIdeasRes = await ideasColl.deleteMany({
    title: 'Future of AI Video Tools 2026',
    description: 'Exploring revolutionary generative AI for creators',
  });
  const removedIdeas = deleteIdeasRes.deletedCount || 0;

  // 5. Remove Robot test spam logs in teamactivities
  const deleteActivitiesRes = await activitiesColl.deleteMany({
    $or: [
      { actor: { $in: robotUserIds } },
      { entityId: { $in: [...robotUserIds, ...robotContentIds] } },
      { title: { $regex: /Robot Automated Showcase|robot_|Editing Video EP01|Future of AI Video Tools 2026/i } },
      // Automated Robot test loop login spam created on 2026-10-15 from 11:23:00Z onwards
      {
        actionType: 'USER_LOGIN',
        createdAt: { $gte: new Date('2026-10-15T11:23:00.000Z') },
      },
    ],
  });
  const removedActivities = deleteActivitiesRes.deletedCount || 0;

  // Drop deprecated legalarticles collection if present
  const legalColls = await db.listCollections({ name: 'legalarticles' }).toArray();
  if (legalColls.length > 0) {
    await db.dropCollection('legalarticles');
  }

  const removedTotal =
    removedUsers + removedContents + removedTasks + removedIdeas + removedActivities;

  return {
    removedTotal,
    details: {
      removedUsers,
      cleanedTeamMembers,
      removedContents,
      removedTasks,
      removedIdeas,
      removedActivities,
    },
  };
};

/**
 * Inspect local MongoDB and compare every internal record & field against master/database/mongodb-dump
 */
const inspectAndCompareDatabase = async () => {
  const db = mongoose.connection.db;
  const dumpExists =
    fs.existsSync(DUMP_DIR) &&
    COLLECTIONS.some((c) => fs.existsSync(path.join(DUMP_DIR, `${c}.json`)));

  const collectionComparisons = [];
  let totalDbDocs = 0;
  let totalDumpDocs = 0;
  let allCollectionsIdentical = true;
  let latestDbTimestamp = null;
  let latestDumpTimestamp = null;

  for (const collName of COLLECTIONS) {
    const dbDocs = db ? await db.collection(collName).find({}).toArray() : [];
    const dumpFilePath = path.join(DUMP_DIR, `${collName}.json`);
    let dumpDocs = [];
    if (fs.existsSync(dumpFilePath)) {
      try {
        dumpDocs = JSON.parse(fs.readFileSync(dumpFilePath, 'utf-8'));
      } catch {
        dumpDocs = [];
      }
    }

    const dbDigest = computeCollectionDigest(dbDocs);
    const dumpDigest = computeCollectionDigest(dumpDocs);

    totalDbDocs += dbDigest.count;
    totalDumpDocs += dumpDigest.count;

    if (dbDigest.latestUpdatedAt && (!latestDbTimestamp || dbDigest.latestUpdatedAt > latestDbTimestamp)) {
      latestDbTimestamp = dbDigest.latestUpdatedAt;
    }
    if (dumpDigest.latestUpdatedAt && (!latestDumpTimestamp || dumpDigest.latestUpdatedAt > latestDumpTimestamp)) {
      latestDumpTimestamp = dumpDigest.latestUpdatedAt;
    }

    // Calculate document-level internal differences (_id additions, deletions, field modifications)
    let addedInDb = 0;
    let removedInDb = 0;
    let modifiedFieldsCount = 0;

    for (const [id, hash] of dbDigest.docHashes.entries()) {
      if (!dumpDigest.docHashes.has(id)) {
        addedInDb++;
      } else if (dumpDigest.docHashes.get(id) !== hash) {
        modifiedFieldsCount++;
      }
    }
    for (const id of dumpDigest.docHashes.keys()) {
      if (!dbDigest.docHashes.has(id)) {
        removedInDb++;
      }
    }

    const isIdentical = dbDigest.hash === dumpDigest.hash && dbDigest.count === dumpDigest.count;
    if (!isIdentical) {
      allCollectionsIdentical = false;
    }

    collectionComparisons.push({
      collection: collName,
      dbCount: dbDigest.count,
      dumpCount: dumpDigest.count,
      dbHash: dbDigest.hash.slice(0, 12),
      dumpHash: dumpDigest.hash.slice(0, 12),
      dbLatestUpdatedAt: dbDigest.latestUpdatedAt,
      dumpLatestUpdatedAt: dumpDigest.latestUpdatedAt,
      isIdentical,
      diff: {
        addedInDb,
        removedInDb,
        modifiedFieldsCount,
      },
    });
  }

  let summaryExportedAt = null;
  const summaryPath = path.join(DUMP_DIR, 'export_summary.json');
  if (fs.existsSync(summaryPath)) {
    try {
      const summaryData = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
      summaryExportedAt = summaryData.exportedAt || null;
    } catch {
      summaryExportedAt = null;
    }
  }

  let status = 'IDENTICAL';
  if (!dumpExists || totalDumpDocs === 0) {
    status = totalDbDocs === 0 ? 'BOTH_EMPTY' : 'NO_DUMP';
  } else if (totalDbDocs === 0) {
    status = 'EMPTY_DB';
  } else if (allCollectionsIdentical) {
    status = 'IDENTICAL';
  } else {
    status = 'DIFFERENT';
  }

  let newerSide = 'EQUAL';
  if (latestDbTimestamp && latestDumpTimestamp) {
    if (latestDumpTimestamp > latestDbTimestamp) {
      newerSide = 'DUMP';
    } else if (latestDbTimestamp > latestDumpTimestamp) {
      newerSide = 'LOCAL_DB';
    }
  } else if (latestDumpTimestamp && !latestDbTimestamp) {
    newerSide = 'DUMP';
  } else if (latestDbTimestamp && !latestDumpTimestamp) {
    newerSide = 'LOCAL_DB';
  }

  return {
    databaseName: mongoose.connection.name || 'content_management',
    status,
    newerSide,
    totalDbDocs,
    totalDumpDocs,
    latestDbTimestamp,
    latestDumpTimestamp,
    summaryExportedAt,
    dumpDir: DUMP_DIR,
    collections: collectionComparisons,
  };
};

/**
 * Backup current local MongoDB collections into master/database/backups/backup-<timestamp>
 */
const backupCurrentDatabase = async (label = 'auto') => {
  const db = mongoose.connection.db;
  if (!db) return null;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFolder = path.join(BACKUPS_DIR, `backup-${label}-${timestamp}`);
  fs.mkdirSync(backupFolder, { recursive: true });

  const fullBackup = {};
  for (const collName of COLLECTIONS) {
    const docs = await db.collection(collName).find({}).toArray();
    const plainDocs = docs.map(toPlainJson);
    fullBackup[collName] = plainDocs;
    fs.writeFileSync(
      path.join(backupFolder, `${collName}.json`),
      JSON.stringify(plainDocs, null, 2),
      'utf-8'
    );
  }

  fs.writeFileSync(
    path.join(backupFolder, 'full_database_dump.json'),
    JSON.stringify(fullBackup, null, 2),
    'utf-8'
  );

  return backupFolder;
};

/**
 * Export all 6 collections from MongoDB to master/database/mongodb-dump/ and master/database/compass-import/
 */
const exportAllCollections = async ({ reason = 'manual', silent = false } = {}) => {
  if (isSyncInProgress) return null;
  const db = mongoose.connection.db;
  if (!db) return null;

  isSyncInProgress = true;
  try {
    fs.mkdirSync(DUMP_DIR, { recursive: true });
    fs.mkdirSync(COMPASS_DIR, { recursive: true });

    const fullDump = {};
    const summaryCollections = [];
    let latestRecordUpdatedAt = null;

    for (const collName of COLLECTIONS) {
      const rawDocs = await db.collection(collName).find({}).toArray();
      const plainDocs = rawDocs.map(toPlainJson);
      const compassDocs = plainDocs.map(toCompassExtendedJson);
      const digest = computeCollectionDigest(plainDocs);

      fullDump[collName] = plainDocs;

      if (
        digest.latestUpdatedAt &&
        (!latestRecordUpdatedAt || digest.latestUpdatedAt > latestRecordUpdatedAt)
      ) {
        latestRecordUpdatedAt = digest.latestUpdatedAt;
      }

      // 1. Write standard portable JSON
      const dumpFilePath = path.join(DUMP_DIR, `${collName}.json`);
      fs.writeFileSync(dumpFilePath, JSON.stringify(plainDocs, null, 2), 'utf-8');

      // 2. Write MongoDB Compass Extended JSON ($oid, $date)
      const compassFilePath = path.join(COMPASS_DIR, `${collName}.compass.json`);
      fs.writeFileSync(compassFilePath, JSON.stringify(compassDocs, null, 2), 'utf-8');

      summaryCollections.push({
        name: collName,
        count: digest.count,
        sha256: digest.hash,
        latestUpdatedAt: digest.latestUpdatedAt,
      });
    }

    const fullDumpPath = path.join(DUMP_DIR, 'full_database_dump.json');
    fs.writeFileSync(fullDumpPath, JSON.stringify(fullDump, null, 2), 'utf-8');

    const overallHash = crypto
      .createHash('sha256')
      .update(summaryCollections.map((c) => `${c.name}:${c.sha256}`).join('|'))
      .digest('hex');

    const summary = {
      database: mongoose.connection.name || 'content_management',
      exportedAt: new Date().toISOString(),
      exportReason: reason,
      overallSha256: overallHash,
      latestRecordUpdatedAt,
      totalDocuments: summaryCollections.reduce((acc, item) => acc + item.count, 0),
      collections: summaryCollections,
    };

    const summaryPath = path.join(DUMP_DIR, 'export_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');

    if (!silent) {
      console.log(
        `[DB-Sync] Exported ${summary.totalDocuments} records across ${COLLECTIONS.length} collections (${reason}) -> ${DUMP_DIR}`
      );
    }

    return summary;
  } finally {
    isSyncInProgress = false;
  }
};

/**
 * Import all 6 collections from master/database/mongodb-dump/ into local MongoDB and rebuild indexes
 */
const importAllCollections = async ({
  createBackupBeforeImport = false,
  reason = 'manual',
  silent = false,
} = {}) => {
  if (isSyncInProgress) return null;
  const db = mongoose.connection.db;
  if (!db) return null;

  if (!fs.existsSync(DUMP_DIR)) {
    throw new Error(`Portable database directory not found at: ${DUMP_DIR}`);
  }

  let backupFolder = null;
  if (createBackupBeforeImport) {
    backupFolder = await backupCurrentDatabase('pre-import');
  }

  isSyncInProgress = true;
  try {
    let totalImported = 0;
    const importedCollections = [];

    for (const collName of COLLECTIONS) {
      const filePath = path.join(DUMP_DIR, `${collName}.json`);
      if (!fs.existsSync(filePath)) {
        continue;
      }

      const raw = fs.readFileSync(filePath, 'utf-8');
      const docs = JSON.parse(raw);
      const coll = db.collection(collName);

      await coll.deleteMany({});

      if (Array.isArray(docs) && docs.length > 0) {
        const revivedDocs = docs.map(reviveDocument);
        await coll.insertMany(revivedDocs);
        totalImported += revivedDocs.length;
        importedCollections.push({ name: collName, count: revivedDocs.length });
      } else {
        importedCollections.push({ name: collName, count: 0 });
      }

      // Synchronize Mongoose schema indexes for this collection
      const model = MODELS_BY_COLLECTION[collName];
      if (model && typeof model.syncIndexes === 'function') {
        await model.syncIndexes();
      }
    }

    if (!silent) {
      console.log(
        `[DB-Sync] Imported ${totalImported} records across ${importedCollections.length} collections (${reason}) and synchronized indexes.`
      );
    }

    return {
      totalImported,
      backupFolder,
      collections: importedCollections,
    };
  } finally {
    isSyncInProgress = false;
  }
};

/**
 * Format comparison table for console output
 */
const printComparisonReport = (report) => {
  console.log('--------------------------------------------------------------------------------');
  console.log(`[DB-Sync] Database Inspection: "${report.databaseName}"`);
  console.log(`[DB-Sync] Status: ${report.status} | Local Docs: ${report.totalDbDocs} | Portable File Docs: ${report.totalDumpDocs}`);
  console.log('--------------------------------------------------------------------------------');
  console.log('Collection       | Local DB | File Dump | Match | Internal Record Diff');
  console.log('-----------------|----------|-----------|-------|-------------------------------');
  for (const c of report.collections) {
    const colName = c.collection.padEnd(16, ' ');
    const dbCnt = String(c.dbCount).padStart(8, ' ');
    const dumpCnt = String(c.dumpCount).padStart(9, ' ');
    const matchStr = (c.isIdentical ? 'YES' : 'NO ').padEnd(5, ' ');
    const diffDesc = c.isIdentical
      ? 'Identical (100% match)'
      : `+${c.diff.addedInDb} added, -${c.diff.removedInDb} removed, ~${c.diff.modifiedFieldsCount} modified`;
    console.log(`${colName} | ${dbCnt} | ${dumpCnt} | ${matchStr} | ${diffDesc}`);
  }
  console.log('--------------------------------------------------------------------------------');
};

/**
 * Automatically check local database and internal records when Backend starts up
 */
const autoCheckAndSyncOnBoot = async () => {
  try {
    const report = await inspectAndCompareDatabase();
    printComparisonReport(report);

    if (report.status === 'EMPTY_DB') {
      console.log(
        '[DB-Sync] Local database is empty. Auto-Importing internal data from master/database/mongodb-dump/...'
      );
      await importAllCollections({
        createBackupBeforeImport: false,
        reason: 'boot-auto-import-empty-db',
      });
    } else if (report.status === 'IDENTICAL') {
      console.log(
        '[DB-Sync] Local database and all internal records match portable dump 100%. Ready.'
      );
    } else if (report.status === 'DIFFERENT') {
      if (report.newerSide === 'DUMP') {
        console.log(
          '[DB-Sync] Portable dump files contain newer internal records than local DB. Backing up local DB and Auto-Importing...'
        );
        const res = await importAllCollections({
          createBackupBeforeImport: true,
          reason: 'boot-auto-sync-newer-dump',
        });
        if (res && res.backupFolder) {
          console.log(`[DB-Sync] Previous local database backed up at: ${res.backupFolder}`);
        }
      } else {
        console.log(
          '[DB-Sync] Local DB contains newer or updated internal records. Auto-Exporting to portable dump...'
        );
        await exportAllCollections({ reason: 'boot-auto-export-newer-local' });
      }
    } else if (report.status === 'NO_DUMP') {
      console.log(
        '[DB-Sync] Portable dump not found on disk. Creating initial portable dump from local DB...'
      );
      await exportAllCollections({ reason: 'boot-initial-export' });
    }
  } catch (error) {
    console.error('[DB-Sync] Error during startup database check:', error.message);
  }
};

/**
 * Schedule a debounced background Auto-Export whenever internal data changes via API
 */
const scheduleAutoExport = (reason = 'api-mutation') => {
  if (process.env.DISABLE_DB_AUTO_EXPORT === 'true') {
    return;
  }
  if (autoExportTimer) {
    clearTimeout(autoExportTimer);
  }
  autoExportTimer = setTimeout(async () => {
    autoExportTimer = null;
    try {
      if (mongoose.connection.readyState === 1) {
        await exportAllCollections({ reason, silent: false });
      }
    } catch (err) {
      console.error('[DB-Sync] Auto-export failed:', err.message);
    }
  }, 1500);
};

module.exports = {
  COLLECTIONS,
  DB_ROOT_DIR,
  DUMP_DIR,
  COMPASS_DIR,
  BACKUPS_DIR,
  cleanJunkDataFromDatabase,
  inspectAndCompareDatabase,
  printComparisonReport,
  backupCurrentDatabase,
  exportAllCollections,
  importAllCollections,
  autoCheckAndSyncOnBoot,
  scheduleAutoExport,
};

