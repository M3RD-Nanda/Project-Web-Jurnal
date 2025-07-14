#!/usr/bin/env node

/**
 * Performance Testing Script
 * Tests website performance and generates reports
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Performance test configuration
const config = {
  urls: [
    'http://localhost:3000',
    'http://localhost:3000/articles',
    'http://localhost:3000/announcements',
    'http://localhost:3000/statistics',
    'http://localhost:3000/wallet'
  ],
  lighthouse: {
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    output: 'json',
    outputPath: './performance-reports/'
  }
};

// Ensure reports directory exists
const reportsDir = path.join(process.cwd(), 'performance-reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

/**
 * Run Lighthouse audit for a URL
 */
async function runLighthouseAudit(url) {
  console.log(`🔍 Running Lighthouse audit for: ${url}`);
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const urlSlug = url.replace(/[^a-zA-Z0-9]/g, '_');
    const outputFile = path.join(reportsDir, `lighthouse-${urlSlug}-${timestamp}.json`);
    
    const command = `npx lighthouse "${url}" --output=json --output-path="${outputFile}" --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage" --only-categories=performance,accessibility,best-practices,seo --quiet`;
    
    execSync(command, { stdio: 'inherit' });
    
    // Read and parse the report
    const reportData = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    
    return {
      url,
      timestamp,
      scores: {
        performance: Math.round(reportData.categories.performance.score * 100),
        accessibility: Math.round(reportData.categories.accessibility.score * 100),
        bestPractices: Math.round(reportData.categories['best-practices'].score * 100),
        seo: Math.round(reportData.categories.seo.score * 100)
      },
      metrics: {
        firstContentfulPaint: reportData.audits['first-contentful-paint']?.numericValue,
        largestContentfulPaint: reportData.audits['largest-contentful-paint']?.numericValue,
        cumulativeLayoutShift: reportData.audits['cumulative-layout-shift']?.numericValue,
        totalBlockingTime: reportData.audits['total-blocking-time']?.numericValue,
        speedIndex: reportData.audits['speed-index']?.numericValue
      },
      reportFile: outputFile
    };
  } catch (error) {
    console.error(`❌ Error running Lighthouse for ${url}:`, error.message);
    return null;
  }
}

/**
 * Generate performance summary report
 */
function generateSummaryReport(results) {
  const summary = {
    timestamp: new Date().toISOString(),
    totalUrls: results.length,
    averageScores: {
      performance: 0,
      accessibility: 0,
      bestPractices: 0,
      seo: 0
    },
    results: results.filter(r => r !== null)
  };

  // Calculate averages
  const validResults = summary.results;
  if (validResults.length > 0) {
    summary.averageScores.performance = Math.round(
      validResults.reduce((sum, r) => sum + r.scores.performance, 0) / validResults.length
    );
    summary.averageScores.accessibility = Math.round(
      validResults.reduce((sum, r) => sum + r.scores.accessibility, 0) / validResults.length
    );
    summary.averageScores.bestPractices = Math.round(
      validResults.reduce((sum, r) => sum + r.scores.bestPractices, 0) / validResults.length
    );
    summary.averageScores.seo = Math.round(
      validResults.reduce((sum, r) => sum + r.scores.seo, 0) / validResults.length
    );
  }

  // Save summary report
  const summaryFile = path.join(reportsDir, `performance-summary-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

  return { summary, summaryFile };
}

/**
 * Generate HTML report
 */
function generateHTMLReport(summary) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .scores { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .score-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .score-value { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .score-good { color: #28a745; }
        .score-average { color: #ffc107; }
        .score-poor { color: #dc3545; }
        .results-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .results-table th, .results-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .results-table th { background-color: #f8f9fa; font-weight: bold; }
        .url-cell { max-width: 300px; word-break: break-all; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Website Performance Report</h1>
            <p>Generated on: ${new Date(summary.timestamp).toLocaleString()}</p>
            <p>Total URLs tested: ${summary.totalUrls}</p>
        </div>

        <div class="scores">
            <div class="score-card">
                <h3>Performance</h3>
                <div class="score-value ${getScoreClass(summary.averageScores.performance)}">${summary.averageScores.performance}</div>
            </div>
            <div class="score-card">
                <h3>Accessibility</h3>
                <div class="score-value ${getScoreClass(summary.averageScores.accessibility)}">${summary.averageScores.accessibility}</div>
            </div>
            <div class="score-card">
                <h3>Best Practices</h3>
                <div class="score-value ${getScoreClass(summary.averageScores.bestPractices)}">${summary.averageScores.bestPractices}</div>
            </div>
            <div class="score-card">
                <h3>SEO</h3>
                <div class="score-value ${getScoreClass(summary.averageScores.seo)}">${summary.averageScores.seo}</div>
            </div>
        </div>

        <h2>Detailed Results</h2>
        <table class="results-table">
            <thead>
                <tr>
                    <th>URL</th>
                    <th>Performance</th>
                    <th>Accessibility</th>
                    <th>Best Practices</th>
                    <th>SEO</th>
                    <th>FCP (ms)</th>
                    <th>LCP (ms)</th>
                </tr>
            </thead>
            <tbody>
                ${summary.results.map(result => `
                    <tr>
                        <td class="url-cell">${result.url}</td>
                        <td class="${getScoreClass(result.scores.performance)}">${result.scores.performance}</td>
                        <td class="${getScoreClass(result.scores.accessibility)}">${result.scores.accessibility}</td>
                        <td class="${getScoreClass(result.scores.bestPractices)}">${result.scores.bestPractices}</td>
                        <td class="${getScoreClass(result.scores.seo)}">${result.scores.seo}</td>
                        <td>${Math.round(result.metrics.firstContentfulPaint || 0)}</td>
                        <td>${Math.round(result.metrics.largestContentfulPaint || 0)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>
  `;

  function getScoreClass(score) {
    if (score >= 90) return 'score-good';
    if (score >= 50) return 'score-average';
    return 'score-poor';
  }

  const htmlFile = path.join(reportsDir, `performance-report-${new Date().toISOString().replace(/[:.]/g, '-')}.html`);
  fs.writeFileSync(htmlFile, html);

  return htmlFile;
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Performance Testing...\n');

  // Check if server is running
  try {
    execSync('curl -f http://localhost:3000 > /dev/null 2>&1');
  } catch (error) {
    console.error('❌ Server is not running on localhost:3000');
    console.log('💡 Please start the development server with: npm run dev');
    process.exit(1);
  }

  const results = [];

  // Run Lighthouse audits for each URL
  for (const url of config.urls) {
    const result = await runLighthouseAudit(url);
    if (result) {
      results.push(result);
      console.log(`✅ Completed audit for ${url}`);
      console.log(`   Performance: ${result.scores.performance}, Accessibility: ${result.scores.accessibility}, Best Practices: ${result.scores.bestPractices}, SEO: ${result.scores.seo}\n`);
    }
  }

  // Generate reports
  console.log('📊 Generating summary report...');
  const { summary, summaryFile } = generateSummaryReport(results);
  
  console.log('📄 Generating HTML report...');
  const htmlFile = generateHTMLReport(summary);

  // Display summary
  console.log('\n🎉 Performance Testing Complete!');
  console.log('📈 Average Scores:');
  console.log(`   Performance: ${summary.averageScores.performance}/100`);
  console.log(`   Accessibility: ${summary.averageScores.accessibility}/100`);
  console.log(`   Best Practices: ${summary.averageScores.bestPractices}/100`);
  console.log(`   SEO: ${summary.averageScores.seo}/100`);
  console.log(`\n📁 Reports saved to: ${reportsDir}`);
  console.log(`📊 Summary: ${summaryFile}`);
  console.log(`🌐 HTML Report: ${htmlFile}`);
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runLighthouseAudit, generateSummaryReport, generateHTMLReport };
