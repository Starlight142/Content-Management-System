const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');

function getCommitCount() {
  try {
    const out = execSync('git rev-list --count HEAD', { cwd: rootDir, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    const parsed = parseInt(out, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  } catch {
    return 1;
  }
}

const isPreCommit = process.argv.includes('--pre-commit');
const commitCount = getCommitCount();
const buildNumber = isPreCommit ? commitCount + 1 : commitCount;
const nextVersion = `1.5.${buildNumber}`;

const pkgPaths = [
  path.join(rootDir, 'master/mobile-app/package.json'),
  path.join(rootDir, 'master/backend/package.json'),
  path.join(rootDir, 'master/admin-web/package.json'),
];

for (const pkgPath of pkgPaths) {
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.version = nextVersion;
    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
  }
}

const gradlePath = path.join(rootDir, 'master/mobile-app/android/app/build.gradle');
if (fs.existsSync(gradlePath)) {
  let gradleContent = fs.readFileSync(gradlePath, 'utf8');
  gradleContent = gradleContent
    .replace(/versionCode\s+\d+/, `versionCode ${buildNumber}`)
    .replace(/versionName\s+"[^"]+"/, `versionName "${nextVersion}"`);
  fs.writeFileSync(gradlePath, gradleContent, 'utf8');
}

if (isPreCommit) {
  try {
    execSync(
      'git add master/mobile-app/package.json master/backend/package.json master/admin-web/package.json master/mobile-app/android/app/build.gradle',
      { cwd: rootDir, stdio: 'ignore' }
    );
  } catch {
    // Ignore git add error outside commit context
  }
}

console.log(`Updated Draftly version to v${nextVersion} (commit count: ${buildNumber})`);
