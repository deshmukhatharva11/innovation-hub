// Mobile Setup Script - This will help you get your shareable link
const http = require('http');

console.log('🌐 Getting your mobile shareable link...\n');

// Function to get ngrok URL
function getNgrokUrl() {
  const options = {
    hostname: 'localhost',
    port: 4040,
    path: '/api/tunnels',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.tunnels && response.tunnels.length > 0) {
          const httpsTunnel = response.tunnels.find(tunnel => tunnel.proto === 'https');
          if (httpsTunnel) {
            console.log('🎉 SUCCESS! Your shareable links are ready:');
            console.log('==========================================');
            console.log(`📱 Mobile Backend API: ${httpsTunnel.public_url}/api`);
            console.log(`🔍 Health Check: ${httpsTunnel.public_url}/health`);
            console.log('==========================================');
            console.log('\n📋 Next Steps:');
            console.log('1. Copy the Mobile Backend API URL above');
            console.log('2. Update frontend/src/services/api.js');
            console.log('3. Start your React app');
            console.log('4. Test on mobile!');
            console.log('\n💡 Your localhost will continue working normally!');
          } else {
            console.log('❌ No HTTPS tunnel found');
          }
        } else {
          console.log('❌ No tunnels found. Make sure ngrok is running.');
        }
      } catch (error) {
        console.log('❌ Error parsing ngrok response:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Cannot connect to ngrok. Please make sure:');
    console.log('   1. ngrok is running (you should see an ngrok window)');
    console.log('   2. Backend server is running on port 3001');
    console.log('\n💡 If ngrok window is open, look for the URL there!');
  });

  req.end();
}

// Try to get the URL
getNgrokUrl();
