#!/usr/bin/env node

/**
 * Comprehensive script to remove ALL console.log statements from the codebase
 * for professional production deployment while preserving critical error logging
 */

const fs = require("fs");
const path = require("path");

// Only preserve critical error logging
const PRESERVE_PATTERNS = [
  // Critical error logging - always keep
  /console\.error\(/,
];

// Remove ALL other console statements for production
const REMOVE_PATTERNS = [
  // Remove all console.log statements
  /console\.log\(/,
  // Remove console.warn statements
  /console\.warn\(/,
  // Remove console.info statements
  /console\.info\(/,
  // Remove console.debug statements
  /console\.debug\(/,
  // Remove console.trace statements
  /console\.trace\(/,
];

// Process the entire src directory for comprehensive cleanup
const DIRECTORIES_TO_PROCESS = ["src"];

// File extensions to process
const FILE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

function shouldPreserveLine(line) {
  return PRESERVE_PATTERNS.some((pattern) => pattern.test(line));
}

function shouldRemoveLine(line) {
  // Don't remove if it should be preserved
  if (shouldPreserveLine(line)) {
    return false;
  }

  // Remove if it matches removal patterns
  return REMOVE_PATTERNS.some((pattern) => pattern.test(line));
}

function cleanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    let modified = false;

    const cleanedLines = lines.filter((line, index) => {
      const trimmedLine = line.trim();

      // Skip empty lines and lines without console statements
      if (!trimmedLine.includes("console.")) {
        return true;
      }

      // Check if this line should be removed
      if (shouldRemoveLine(line)) {
        console.log(
          `Removing from ${filePath}:${index + 1}: ${trimmedLine.substring(
            0,
            80
          )}...`
        );
        modified = true;
        return false;
      }

      return true;
    });

    if (modified) {
      const cleanedContent = cleanedLines.join("\n");
      fs.writeFileSync(filePath, cleanedContent, "utf8");
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
  console.log("🧹 Starting console.log cleanup...\n");

  let totalProcessed = 0;
  let totalModified = 0;

  for (const dir of DIRECTORIES_TO_PROCESS) {
    console.log(`📁 Processing directory: ${dir}`);
    const result = processDirectory(dir);
    totalProcessed += result.processed;
    totalModified += result.modified;
    console.log(
      `   Files processed: ${result.processed}, Modified: ${result.modified}\n`
    );
  }

  console.log("🎉 Cleanup completed!");
  console.log(`📊 Summary: ${totalModified}/${totalProcessed} files modified`);

  if (totalModified > 0) {
    console.log(
      "\n💡 Tip: Run your build to ensure everything still works correctly."
    );
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { cleanFile, processDirectory };
