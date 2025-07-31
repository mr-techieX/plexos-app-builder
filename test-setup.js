const axios = require('axios');

async function testSetup() {
  console.log('🧪 Testing PLEXOS App Builder Setup...\n');
  
  try {
    // Test backend health
    console.log('1. Testing backend health...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend is running:', healthResponse.data.status);
    
    // Test frontend (basic connectivity)
    console.log('\n2. Testing frontend...');
    const frontendResponse = await axios.get('http://localhost:3000');
    console.log('✅ Frontend is running (status:', frontendResponse.status, ')');
    
    console.log('\n🎉 Setup is working correctly!');
    console.log('\n📱 Access your application:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend API: http://localhost:5000');
    
  } catch (error) {
    console.log('\n❌ Setup test failed:');
    if (error.code === 'ECONNREFUSED') {
      console.log('   - Backend not running on port 5000');
      console.log('   - Frontend not running on port 3000');
      console.log('\n💡 Try running: npm start');
    } else {
      console.log('   - Error:', error.message);
    }
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testSetup();
}

module.exports = { testSetup }; 