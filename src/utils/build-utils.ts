/**
 * Build utilities for production deployment
 * 
 * This file provides utilities for checking build integrity
 * and optimizing the production deployment
 */

import { env } from '@/config/env';

/**
 * Validate that required environment variables are present
 */
export const validateEnvironment = (): boolean => {
  const requiredVars = [
    'MODE',
    'BASE_URL',
  ];
  
  const missing = requiredVars.filter(varName => {
    // Check if the variable exists in import.meta.env
    return typeof (import.meta.env as any)[varName] === 'undefined';
  });
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
};

/**
 * Log build information
 */
export const logBuildInfo = (): void => {
  if (!env.isProduction) return; // Only log in production
  
  const buildInfo = {
    buildDate: import.meta.env.BUILD_DATE || new Date().toISOString(),
    buildVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.MODE,
    supabaseProject: import.meta.env.VITE_SUPABASE_URL || 'Not configured'
  };
  
  console.log(
    `%c Application Build Info %c\n` +
    `Version: ${buildInfo.buildVersion}\n` +
    `Environment: ${buildInfo.environment}\n` +
    `Built on: ${buildInfo.buildDate}`,
    'background: #333; color: #fff; padding: 3px; border-radius: 3px;',
    'background: transparent'
  );
};

/**
 * Check browser capabilities required for the app
 */
export const checkRequiredCapabilities = (): boolean => {
  // Add checks for features required by your app
  const required = [
    typeof fetch !== 'undefined', // Fetch API
    typeof localStorage !== 'undefined', // Local Storage
    typeof Promise !== 'undefined', // Promises
    typeof window.addEventListener !== 'undefined', // Event listeners
  ];
  
  return required.every(Boolean);
};

/**
 * Initialize the application for production use
 */
export const initProductionApp = (): void => {
  if (!env.isProduction) return;
  
  // Remove console.log in production for better performance
  if (env.isProduction) {
    const noop = () => {}; 
    
    // Keep error and warn methods but replace others
    const preserveMethods = ['error', 'warn', 'info'];
    
    Object.keys(console).forEach(method => {
      if (!preserveMethods.includes(method)) {
        (console as any)[method] = noop;
      }
    });
  }
  
  // Log build info
  logBuildInfo();
  
  // Validate environment
  validateEnvironment();
};
