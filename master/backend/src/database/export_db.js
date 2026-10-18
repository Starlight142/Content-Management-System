const mongoose = require('mongoose');
require('dotenv').config();
const {
  cleanJunkDataFromDatabase,
  exportAllCollections,
  inspectAndCompareDatabase,
  printComparisonReport,
  DUMP_DIR,
  COMPASS_DIR,
} = require('../services/dbSync.service');

const runExport = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/content_management';
  const shouldCleanJunk = process.argv.includes('--clean-junk');

  try {
    console.log(`[Export-DB] Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('[Export-DB] Connected successfully.\n');

    if (shouldCleanJunk) {
      console.log('[Export-DB] Cleaning automated test junk records before export...');
      const cleanResult = await cleanJunkDataFromDatabase();
      console.log('[Export-DB] Cleanup summary:', JSON.stringify(cleanResult.details));
    }

    const summary = await exportAllCollections({
      reason: shouldCleanJunk ? 'cli-clean-and-export' : 'cli-manual-export',
      silent: false,
    });

    const report = await inspectAndCompareDatabase();
    printComparisonReport(report);

    console.log('\n[Export-DB] Portable database files updated:');
    console.log(`  1. Standard Dump  : ${DUMP_DIR}`);
    console.log(`  2. Compass Import : ${COMPASS_DIR}`);
    console.log(`  3. Total Records  : ${summary ? summary.totalDocuments : 0}`);
    console.log(`  4. SHA-256 Digest : ${summary ? summary.overallSha256 : '-'}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Export-DB] Error exporting database:', error.message);
    process.exit(1);
  }
};

runExport();
