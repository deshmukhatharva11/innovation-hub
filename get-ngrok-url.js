const http = require('http');

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
            console.log('🌐 Your shareable ngrok URL:');
            console.log('================================');
            console.log(`Backend API: ${httpsTunnel.public_url}/api`);
            console.log(`Health Check: ${httpsTunnel.public_url}/health`);
            console.log('================================');
            console.log('📱 Use this URL in your mobile browser!');
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
    console.log('❌ Cannot connect to ngrok. Make sure ngrok is running on port 4040');
    console.log('💡 Try running: ngrok http 3001');
  });

  req.end();
}

console.log('🔍 Checking for ngrok tunnel...');
getNgrokUrl();
