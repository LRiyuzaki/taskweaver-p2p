
/**
 * Centralized environment configuration
 * 
 * This file centralizes all environment variable access to ensure
 * consistent validation and access throughout the application.
 */

// Default environment values when not in production
const defaultConfig = {
  apiUrl: 'https://wweihgiklnxetpqcpyyf.supabase.co',
  isDevelopment: true,
  isProduction: false,
  isTest: false,
  logLevel: 'debug',
};

// Production environment configuration
const productionConfig = {
  ...defaultConfig,
  isDevelopment: false,
  isProduction: true,
  logLevel: 'error',
};

// Test environment configuration
const testConfig = {
  ...defaultConfig,
  isDevelopment: false,
  isTest: true,
  logLevel: 'warn',
};

// Determine which environment we're in
const getEnvironment = () => {
  const mode = import.meta.env.MODE || 'development';
  
  switch (mode) {
    case 'production':
      return productionConfig;
    case 'test':
      return testConfig;
    default:
      return defaultConfig;
  }
};

// Export the configuration based on current environment
export const env = getEnvironment();

// Helper function to check if we're in a browser environment
export const isBrowser = typeof window !== 'undefined';
