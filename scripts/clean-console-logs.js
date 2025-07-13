#!/usr/bin/env node

/**
 * Script to clean excessive console.log statements from the codebase
 * while preserving important error logging and debugging utilities
 */

const fs = require('fs');
const path = require('path');

// Patterns to preserve (these console statements should NOT be removed)
const PRESERVE_PATTERNS = [
  // Error logging - always keep
  /console\.error\(/,
  // Warning logging - keep for important warnings
  /console\.warn\(/,
  // Debug utilities and environment checks
  /console\.log\(['"`]🔍 Environment Variables Check/,
  /console\.log\(['"`]NODE_ENV:/,
  /console\.log\(['"`]Client Environment:/,
  // Production warning suppression scripts
  /console\.log\(['"`]🔧 Suppressing production warnings/,
  /console\.log\(['"`]✅ Production warning suppression configured/,
  // Chart and analytics debugging (keep for troubleshooting)
  /console\.log\(\`\[.*\] Rendering with data:/,
  /console\.log\(\`\[Supabase\] Query to/,
  // Script execution logs
  /console\.log\(['"`]🔧 Starting/,
  /console\.log\(['"`]🗑️ Deleting/,
  /console\.log\(['"`]✅/,
  /console\.log\(['"`]❌/,
];

// Patterns to remove (these are debug console.log statements)
const REMOVE_PATTERNS = [
  // Wallet debugging
  /console\.log\(['"`]Getting icon for connector:/,
  /console\.log\(['"`]FORCED: Using centralized icon/,
  /console\.log\(['"`]Using EIP-6963 icon for/,
  /console\.log\(['"`]Using connector icon for/,
  /console\.log\(['"`]Using default icon for/,
  /console\.log\(['"`]Building wallet list with:/,
  /console\.log\(\`Skipping duplicate wallet:/,
  /console\.log\(\`Skipping duplicate Brave wallet:/,
  /console\.log\(\`Wallet mapped:/,
  /console\.log\(\`Attempting to reconnect to/,
  /console\.log\(['"`]Wallet connection saved successfully/,
  /console\.log\(['"`]Wallet disconnected and cleared/,
  /console\.log\(['"`]User cancelled wallet connection/,
  /console\.log\(['"`]Wallet not installed/,
  /console\.log\(['"`]Wallet not selected, retrying/,
  // General debugging
  /console\.log\(['"`].*debug.*['"`]/i,
  /console\.log\(['"`].*test.*['"`]/i,
];

// Directories to process
const DIRECTORIES_TO_PROCESS = [
  'src/hooks',
  'src/components/wallet',
  'src/lib',
];

// File extensions to process
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

function shouldPreserveLine(line) {
  return PRESERVE_PATTERNS.some(pattern => pattern.test(line));
}

function shouldRemoveLine(line) {
  // Don't remove if it should be preserved
  if (shouldPreserveLine(line)) {
    return false;
  }
  
  // Remove if it matches removal patterns
  return REMOVE_PATTERNS.some(pattern => pattern.test(line));
}

function cleanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    
    const cleanedLines = lines.filter((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines and non-console lines
      if (!trimmedLine.includes('console.log(')) {
        return true;
      }
      
      // Check if this line should be removed
      if (shouldRemoveLine(line)) {
        console.log(`Removing from ${filePath}:${index + 1}: ${trimmedLine.substring(0, 80)}...`);
        modified = true;
        return false;
      }
      
      return true;
    });
    
    if (modified) {
      const cleanedContent = cleanedLines.join('\n');
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      console.log(`✅ Cleaned: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️ Directory not found: ${dirPath}`);
    return { processed: 0, modified: 0 };
  }
  
  let processed = 0;
  let modified = 0;
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      const result = processDirectory(itemPath);
      processed += result.processed;
      modified += result.modified;
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (FILE_EXTENSIONS.includes(ext)) {
        processed++;
        if (cleanFile(itemPath)) {
          modified++;
        }
      }
    }
  }
  
  return { processed, modified };
}

function main() {
  console.log('🧹 Starting console.log cleanup...\n');
  
  let totalProcessed = 0;
  let totalModified = 0;
  
  for (const dir of DIRECTORIES_TO_PROCESS) {
    console.log(`📁 Processing directory: ${dir}`);
    const result = processDirectory(dir);
    totalProcessed += result.processed;
    totalModified += result.modified;
    console.log(`   Files processed: ${result.processed}, Modified: ${result.modified}\n`);
  }
  
  console.log('🎉 Cleanup completed!');
  console.log(`📊 Summary: ${totalModified}/${totalProcessed} files modified`);
  
  if (totalModified > 0) {
    console.log('\n💡 Tip: Run your build to ensure everything still works correctly.');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { cleanFile, processDirectory };
