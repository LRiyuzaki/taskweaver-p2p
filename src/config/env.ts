
/**
 * Centralized environment configuration
 * 
 * This file centralizes all environment variable access to ensure
 * consistent validation and access throughout the application.
 */

// Check if we're in a browser environment
const isBrowserEnv = typeof window !== 'undefined';

// Define base environment configuration type
interface EnvironmentConfig {
  apiUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  logLevel: string;
  isBrowser: boolean;
}

// Default environment values when not in production
const defaultConfig: EnvironmentConfig = {
  apiUrl: 'https://wweihgiklnxetpqcpyyf.supabase.co',
  isDevelopment: true,
  isProduction: false,
  isTest: false,
  logLevel: 'debug',
  isBrowser: isBrowserEnv,
};

// Production environment configuration
const productionConfig: EnvironmentConfig = {
  ...defaultConfig,
  isDevelopment: false,
  isProduction: true,
  logLevel: 'error',
};

// Test environment configuration
const testConfig: EnvironmentConfig = {
  ...defaultConfig,
  isDevelopment: false,
  isTest: true,
  logLevel: 'warn',
};

// Determine which environment we're in
const getEnvironment = (): EnvironmentConfig => {
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

// Helper function to check if we're in a browser environment - Exported for backwards compatibility
export const isBrowser = isBrowserEnv;
