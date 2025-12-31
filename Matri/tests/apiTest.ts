import axios from 'axios';

const API_URL = 'http://10.216.2.139:8000/api/login';

async function testLogin() {
    try {
        console.log('🔄 Testing login API at:', API_URL);
        
        // Create form data with both username and email
        const formData = new URLSearchParams();
        formData.append('username', 'nandhu382003@gmail.com');
        formData.append('email', 'nandhu382003@gmail.com');
        formData.append('password', 'Nandhu@2003');
        
        const response = await axios.post(API_URL, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
        });

        console.log('✅ API Response:', {
            status: response.status,
            statusText: response.statusText,
            data: JSON.stringify(response.data, null, 2)
        });

        if (response.data?.message?.error) {
            console.log('❌ Validation errors:', response.data.message.error);
        }

        return response.data;
    } catch (error: any) {
        console.error('❌ API Test Failed:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
}

// Run the test
console.log('🚀 Starting API tests...');
testLogin()
    .then(() => console.log('✨ Tests completed'))
    .catch(error => {
        console.error('💥 Tests failed:', error.message);
        process.exit(1);
    });
