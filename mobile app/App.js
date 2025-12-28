import React from 'react';
import Config from './config';

// Example of updating an API call to use Config.API_BASE_URL
fetch(`${Config.API_BASE_URL}/endpoint`)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// Add a test function to check if API is accessible
const testApiConnection = async () => {
  try {
    const response = await fetch(`${Config.API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'test@test.com', password: 'test' })
    });
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', response.headers);
    const data = await response.json();
    console.log('API Response Data:', data);
  } catch (error) {
    console.error('API Test Error:', error);
  }
};

// Call this function on app start or in a button
testApiConnection();

// ...existing code...