#!/usr/bin/env node

/**
 * Script to reduce debug console logs for production
 * This script removes or reduces excessive debug logging while keeping essential error logs
 */

const fs = require('fs');
const path = require('path');

// Files to process
const filesToProcess = [
  'src/lib/phantom-provider.ts',
  'src/components/wallet/SolanaWalletBalance.tsx',
  'src/hooks/usePhantomWallet.ts',
  'src/hooks/useSolanaSafe.ts',
];

// Patterns to reduce or remove
const logPatterns = [
  // Remove excessive debug logs but keep important ones
  {
    pattern: /console\.log\("🔍 Checking for Phantom.*?\);/g,
    replacement: '// Debug log removed for production',
    description: 'Remove phantom provider checking logs'
  },
  {
    pattern: /console\.log\("window\.phantom.*?\);/g,
    replacement: '// Debug log removed for production',
    description: 'Remove window.phantom existence logs'
  },
  {
    pattern: /console\.log\("SolanaWalletBalance Debug:"[\s\S]*?\}\);/g,
    replacement: '// Debug object log removed for production',
    description: 'Remove SolanaWalletBalance debug object logs'
  },
  {
    pattern: /console\.log\("✅ Phantom.*?provider found"\);/g,
    replacement: '// Success log reduced for production',
    description: 'Reduce phantom provider found logs'
  },
  {
    pattern: /console\.log\("🔄 Auto-connected.*?\);/g,
    replacement: '// Auto-connect log reduced for production',
    description: 'Reduce auto-connect logs'
  },
];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  logPatterns.forEach(({ pattern, replacement, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`📝 ${description} in ${filePath} (${matches.length} matches)`);
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  if (modified) {
    // Create backup
    const backupPath = `${filePath}.backup-${Date.now()}`;
    fs.writeFileSync(backupPath, fs.readFileSync(filePath));
    console.log(`💾 Backup created: ${backupPath}`);

    // Write modified content
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`ℹ️ No changes needed: ${filePath}`);
  }
}

function main() {
  console.log('🧹 Reducing debug logs for production...\n');

  filesToProcess.forEach(processFile);

  console.log('\n✨ Debug log reduction completed!');
  console.log('\n📋 Summary:');
  console.log('- Excessive debug logs have been reduced');
  console.log('- Important error and warning logs are preserved');
  console.log('- Backups created for all modified files');
  console.log('- This improves production performance and reduces console noise');
}

if (require.main === module) {
  main();
}

module.exports = { processFile, logPatterns };
