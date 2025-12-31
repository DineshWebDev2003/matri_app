// Network connectivity test utility for physical device debugging

export const NetworkTest = {
  /**
   * Test if the Laravel server is reachable
   */
  async testServerConnection(ip: string = '10.159.1.139', port: number = 8000): Promise<boolean> {
    const testUrl = `http://${ip}:${port}`;
    
    try {
      console.log(`🔍 Testing connection to ${testUrl}...`);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        timeout: 5000
      });
      
      console.log(`✅ Server reachable: ${response.status}`);
      return response.status < 400;
      
    } catch (error: any) {
      console.error(`❌ Server unreachable: ${error.message}`);
      return false;
    }
  },

  /**
   * Test API endpoint specifically
   */
  async testApiEndpoint(ip: string = '10.159.1.139', port: number = 8000): Promise<boolean> {
    const apiUrl = `http://${ip}:${port}/api`;
    
    try {
      console.log(`🔍 Testing API endpoint ${apiUrl}...`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      console.log(`✅ API endpoint reachable: ${response.status}`);
      return true;
      
    } catch (error: any) {
      console.error(`❌ API endpoint unreachable: ${error.message}`);
      return false;
    }
  },

  /**
   * Test login endpoint with credentials
   */
  async testLogin(email: string, password: string, ip: string = '10.159.1.139', port: number = 8000): Promise<any> {
    const loginUrl = `http://${ip}:${port}/api/login`;
    
    try {
      console.log(`🔍 Testing login at ${loginUrl}...`);
      console.log(`📧 Email: ${email}`);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: email,
          password: password
        }),
        timeout: 10000
      });
      
      const data = await response.json();
      
      console.log(`📡 Login response status: ${response.status}`);
      console.log(`📦 Login response data:`, data);
      
      return {
        success: response.status === 200,
        status: response.status,
        data: data
      };
      
    } catch (error: any) {
      console.error(`❌ Login test failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Run comprehensive network diagnostics
   */
  async runDiagnostics(ip: string = '10.159.1.139', port: number = 8000): Promise<void> {
    console.log('🚀 Starting network diagnostics...');
    console.log(`🎯 Target server: ${ip}:${port}`);
    
    // Test 1: Basic server connection
    const serverReachable = await this.testServerConnection(ip, port);
    
    // Test 2: API endpoint
    const apiReachable = await this.testApiEndpoint(ip, port);
    
    // Test 3: Login endpoint (without credentials)
    console.log('🔍 Testing login endpoint structure...');
    try {
      const response = await fetch(`http://${ip}:${port}/api/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}),
        timeout: 5000
      });
      
      console.log(`📡 Login endpoint response: ${response.status}`);
    } catch (error: any) {
      console.error(`❌ Login endpoint test failed: ${error.message}`);
    }
    
    // Summary
    console.log('📊 Diagnostics Summary:');
    console.log(`  - Server reachable: ${serverReachable ? '✅' : '❌'}`);
    console.log(`  - API reachable: ${apiReachable ? '✅' : '❌'}`);
    
    if (!serverReachable) {
      console.log('💡 Suggestions:');
      console.log('  1. Check if Laravel server is running: php artisan serve --host=0.0.0.0 --port=8000');
      console.log('  2. Verify IP address is correct');
      console.log('  3. Check firewall settings');
      console.log('  4. Ensure device and server are on same network');
    }
  }
};
