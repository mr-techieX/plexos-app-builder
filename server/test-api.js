const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test the health endpoint
async function testHealth() {
  try {
    console.log('Testing health endpoint...');
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

// Test getting configurations list
async function testGetConfigurations() {
  try {
    console.log('Testing get configurations...');
    const response = await axios.get(`${BASE_URL}/configurations`);
    console.log('✅ Get configurations passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Get configurations failed:', error.message);
    return false;
  }
}

// Test getting object classes (requires a database file)
async function testGetObjectClasses() {
  try {
    console.log('Testing get object classes...');
    const response = await axios.post(`${BASE_URL}/getObjectClasses`, {
      dbPath: './uploads/references.db'
    });
    console.log('✅ Get object classes passed:', response.data);
    return true;
  } catch (error) {
    console.log('⚠️ Get object classes failed (expected if no database):', error.response?.data?.error || error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting API tests...\n');
  
  const tests = [
    testHealth,
    testGetConfigurations,
    testGetObjectClasses
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await test();
    if (result) passed++;
    console.log('');
  }
  
  console.log(`📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Check the output above for details.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests }; 