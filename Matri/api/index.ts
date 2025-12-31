import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getConfig } from './config';

const config = getConfig();

const api = axios.create({
  baseURL: config.baseURL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add authentication token
// Note: Using a promise-based approach to properly handle async token retrieval
api.interceptors.request.use((config: any) => {
  // Ensure headers object exists
  if (!config.headers) {
    config.headers = {};
  }
  
  // Return a promise that resolves with the config after token is retrieved
  return SecureStore.getItemAsync('token').then((token) => {
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Token injected for request:', config.url);
    } else {
      console.log('⚠️ No token found for request:', config.url);
    }
    return config;
  }).catch((error) => {
    console.warn('⚠️ Failed to retrieve token from SecureStore:', error);
    return config;
  });
});

export default api;
