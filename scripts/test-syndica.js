// Simple test script for Syndica API
const https = require('https');

const SYNDICA_ENDPOINT = "https://solana-mainnet.api.syndica.io/api-key/YpXDWwMbnm6aw9m62PW8DT66yqW4bJLwzzqwsJGEmK7wnkH3ZU5BwuL6Qh61yYJFX1G5etrHjAdkEFWCd1MEbxWvVKQ6sZpnwe";

// Test health check
function testSyndicaHealth() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      "jsonrpc": "2.0",
      "id": "1",
      "method": "getHealth"
    });

    const url = new URL(SYNDICA_ENDPOINT);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Syndica API Health Check Response:', response);
          resolve(response);
        } catch (error) {
          console.error('❌ Failed to parse response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test get version
function testSyndicaVersion() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      "jsonrpc": "2.0",
      "id": "1",
      "method": "getVersion"
    });

    const url = new URL(SYNDICA_ENDPOINT);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Syndica API Version Response:', response);
          resolve(response);
        } catch (error) {
          console.error('❌ Failed to parse response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Testing Syndica API connection...\n');
  
  try {
    await testSyndicaHealth();
    console.log('');
    await testSyndicaVersion();
    console.log('\n✅ All tests passed! Syndica API is working correctly.');
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  }
}

runTests();
