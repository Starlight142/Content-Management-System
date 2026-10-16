const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const exportDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/content_management';
  const outputDir = path.join(__dirname, '..', '..', 'dump', 'content_management');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected successfully.');

    const collections = await mongoose.connection.db.listCollections().toArray();
    const fullDump = {};

    for (const collInfo of collections) {
      const collName = collInfo.name;
      // Skip system collections if any
      if (collName.startsWith('system.')) continue;

      const coll = mongoose.connection.db.collection(collName);
      const docs = await coll.find({}).toArray();
      fullDump[collName] = docs;

      const filePath = path.join(outputDir, `${collName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf-8');
      console.log(`Exported collection [${collName}]: ${docs.length} documents -> ${filePath}`);
    }

    const fullDumpPath = path.join(outputDir, 'full_database_dump.json');
    fs.writeFileSync(fullDumpPath, JSON.stringify(fullDump, null, 2), 'utf-8');
    console.log(`Full database dump saved -> ${fullDumpPath}`);

    // Summary file
    const summary = {
      database: 'content_management',
      exportedAt: new Date().toISOString(),
      collections: Object.keys(fullDump).map(name => ({
        name,
        count: fullDump[name].length
      }))
    };
    const summaryPath = path.join(outputDir, 'export_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');

    console.log('Database export completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error exporting database:', error);
    process.exit(1);
  }
};

exportDatabase();
