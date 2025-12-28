/**
 * API Configuration
 * Switch between development and production environments
 */

// Environment: 'development' | 'production'
const ENVIRONMENT = 'development';

// Development Configuration
const DEV_CONFIG = {
  baseURL: 'http://172.16.200.139:8000/api',
  webURL: 'http://172.16.200.139:8000',
  description: 'Local Development (Your Machine IP - Laravel Server)',
};

// Production Configuration
const PROD_CONFIG = {
  baseURL: 'https://90skalyanam.com/api',
  webURL: 'https://90skalyanam.com',
  description: 'Production Server',
};

// Get current configuration
export const getConfig = () => {
  if (ENVIRONMENT === 'development') {
    console.log('🔧 Using Development Configuration:', DEV_CONFIG.description);
    return DEV_CONFIG;
  } else {
    console.log('🚀 Using Production Configuration:', PROD_CONFIG.description);
    return PROD_CONFIG;
  }
};

// Export both configs for reference
export const CONFIG = {
  ENVIRONMENT,
  DEVELOPMENT: DEV_CONFIG,
  PRODUCTION: PROD_CONFIG,
  CURRENT: getConfig(),
};

export default CONFIG;
