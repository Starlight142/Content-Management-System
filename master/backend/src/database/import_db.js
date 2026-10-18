const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();
const {
  inspectAndCompareDatabase,
  printComparisonReport,
  importAllCollections,
  DUMP_DIR,
} = require('../services/dbSync.service');

const askPrompt = (question) => {
  if (!process.stdin.isTTY) {
    return Promise.resolve('');
  }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve((answer || '').trim());
    });
  });
};

const runImport = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/content_management';
  const args = new Set(process.argv.slice(2));
  const isCheckOnly = args.has('--check-only');
  const isAuto = args.has('--auto');
  const isForce = args.has('--force');

  try {
    console.log(`[Import-DB] Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('[Import-DB] Connected successfully.\n');

    const report = await inspectAndCompareDatabase();
    printComparisonReport(report);

    if (isCheckOnly) {
      await mongoose.disconnect();
      process.exit(0);
    }

    if (report.status === 'NO_DUMP' || report.status === 'BOTH_EMPTY') {
      console.error(`[Import-DB] No portable database files found in: ${DUMP_DIR}`);
      await mongoose.disconnect();
      process.exit(1);
    }

    // Case 1: Local database is empty -> Auto-Import immediately
    if (report.status === 'EMPTY_DB') {
      console.log('\n[Import-DB] ไม่พบข้อมูลในฐานข้อมูลของเครื่องนี้ (EMPTY_DB)');
      console.log('[Import-DB] กำลังนำเข้าข้อมูลทั้ง 6 ตารางและสร้าง Index อัตโนมัติ...');
      const res = await importAllCollections({
        createBackupBeforeImport: false,
        reason: 'cli-import-empty-db',
      });
      console.log(`\n[Import-DB] นำเข้าฐานข้อมูลสำเร็จ (${res.totalImported} รายการ)`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Case 2: Local database has 100% identical internal records
    if (report.status === 'IDENTICAL') {
      console.log('\n[Import-DB] ตรวจพบฐานข้อมูล "content_management" ในเครื่องนี้ และข้อมูลภายในทุกตารางตรงกับไฟล์ 100% แล้ว');
      if (isForce) {
        console.log('[Import-DB] (--force) กำลังนำเข้าข้อมูลทับอีกครั้ง...');
        const res = await importAllCollections({
          createBackupBeforeImport: false,
          reason: 'cli-import-force-identical',
        });
        console.log(`[Import-DB] นำเข้าฐานข้อมูลสำเร็จ (${res.totalImported} รายการ)`);
      } else if (!isAuto && process.stdin.isTTY) {
        const ans = await askPrompt(
          '\nต้องการนำเข้าข้อมูลทับซ้ำอีกครั้งหรือไม่? (พิมพ์ Y เพื่อลงทับ / กด Enter หรือ N เพื่อข้าม): '
        );
        if (ans.toUpperCase() === 'Y') {
          const res = await importAllCollections({
            createBackupBeforeImport: false,
            reason: 'cli-import-manual-reimport',
          });
          console.log(`\n[Import-DB] นำเข้าฐานข้อมูลทับสำเร็จ (${res.totalImported} รายการ)`);
        } else {
          console.log('[Import-DB] ข้ามการนำเข้าซ้ำ (ฐานข้อมูลในเครื่องพร้อมใช้งานอยู่แล้ว)');
        }
      } else {
        console.log('[Import-DB] ข้ามการนำเข้าซ้ำอัตโนมัติ (ข้อมูลตรงกัน 100% อยู่แล้ว)');
      }
      await mongoose.disconnect();
      process.exit(0);
    }

    // Case 3: Local database exists, but internal records differ
    if (report.status === 'DIFFERENT') {
      console.log('\n[Import-DB] ตรวจพบฐานข้อมูล "content_management" ในเครื่องนี้ แต่ข้อมูลภายในแตกต่างจากไฟล์พกพา:');
      console.log(`  - เวลาอัปเดตล่าสุดในเครื่อง : ${report.latestDbTimestamp || '-'}`);
      console.log(`  - เวลาอัปเดตล่าสุดในไฟล์   : ${report.latestDumpTimestamp || '-'}`);

      if (isForce) {
        const res = await importAllCollections({
          createBackupBeforeImport: true,
          reason: 'cli-import-force-different',
        });
        console.log(`\n[Import-DB] สำรองข้อมูลเดิมไว้ที่: ${res.backupFolder}`);
        console.log(`[Import-DB] นำเข้าฐานข้อมูลชุดใหม่สำเร็จ (${res.totalImported} รายการ)`);
      } else if (isAuto || !process.stdin.isTTY) {
        const res = await importAllCollections({
          createBackupBeforeImport: true,
          reason: 'cli-import-auto-backup-and-import',
        });
        console.log(`\n[Import-DB] สำรองข้อมูลเดิมไว้ที่: ${res.backupFolder}`);
        console.log(`[Import-DB] นำเข้าฐานข้อมูลชุดใหม่สำเร็จ (${res.totalImported} รายการ)`);
      } else {
        console.log('\nตัวเลือกการจัดการฐานข้อมูลที่มีอยู่:');
        console.log('  [B] สำรองฐานข้อมูลเดิมในเครื่องไว้ที่ master/database/backups/ แล้วนำเข้าไฟล์ใหม่ (แนะนำ)');
        console.log('  [Y] นำเข้าไฟล์ใหม่ทับทันทีโดยไม่สำรอง');
        console.log('  [N] ยกเลิกการนำเข้า (คงข้อมูลเดิมในเครื่องไว้)');
        const choice = (
          await askPrompt('\nกรุณาเลือก [B/Y/N] (กด Enter เพื่อเลือก B): ')
        ).toUpperCase() || 'B';

        if (choice === 'N') {
          console.log('[Import-DB] ยกเลิกการนำเข้า (คงข้อมูลเดิมในเครื่องไว้)');
        } else {
          const shouldBackup = choice !== 'Y';
          const res = await importAllCollections({
            createBackupBeforeImport: shouldBackup,
            reason: 'cli-import-interactive-different',
          });
          if (res.backupFolder) {
            console.log(`\n[Import-DB] สำรองข้อมูลเดิมไว้ที่: ${res.backupFolder}`);
          }
          console.log(`[Import-DB] นำเข้าฐานข้อมูลชุดใหม่สำเร็จ (${res.totalImported} รายการ)`);
        }
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Import-DB] Error importing database:', error.message);
    process.exit(1);
  }
};

runImport();
