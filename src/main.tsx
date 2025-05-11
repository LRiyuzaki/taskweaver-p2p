
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { env } from './config/env';
import { 
  initProductionApp, 
  validateEnvironment, 
  checkRequiredCapabilities 
} from './utils/build-utils';
import { checkBrowserCompatibility } from './utils/browser-compatibility';

// Initialize production optimizations
if (env.isProduction) {
  initProductionApp();
}

// Check browser compatibility
if (env.isBrowser) {
  checkBrowserCompatibility();
}

// Make sure the app has all required capabilities
if (!checkRequiredCapabilities()) {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1>Browser Not Supported</h1>
        <p>Your browser doesn't support the features required to run this application.</p>
        <p>Please use a modern browser like Chrome, Firefox, or Edge.</p>
      </div>
    `;
  }
} else {
  // Verify environment is correctly configured
  validateEnvironment();
  
  // Render the app
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(<App />);
  }
}
