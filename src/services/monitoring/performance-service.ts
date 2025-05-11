
/**
 * Performance monitoring service
 * 
 * This service provides utilities for tracking and reporting 
 * performance metrics throughout the application.
 */

import { env } from '@/config/env';

// Interface for tracking component render times
export interface RenderTiming {
  componentName: string;
  renderTime: number;
  renderCount: number;
}

class PerformanceService {
  private renderTimings: Map<string, RenderTiming> = new Map();
  private navigationTimings: any[] = [];
  private errorCount: number = 0;
  
  // Initialize performance monitoring
  public init(): void {
    if (!env.isProduction) {
      console.log('Performance monitoring initialized in development mode');
    }
    
    // Track page navigation performance
    if (window.performance && window.performance.getEntriesByType) {
      this.captureNavigationTiming();
    }
    
    // Listen for errors
    window.addEventListener('error', this.handleError);
  }
  
  // Record component render time
  public recordRender(componentName: string, renderTimeMs: number): void {
    const existing = this.renderTimings.get(componentName);
    
    if (existing) {
      existing.renderCount += 1;
      existing.renderTime = (existing.renderTime + renderTimeMs) / 2; // Running average
    } else {
      this.renderTimings.set(componentName, {
        componentName,
        renderTime: renderTimeMs,
        renderCount: 1
      });
    }
    
    // Log slow renders in development
    if (!env.isProduction && renderTimeMs > 16) {
      console.warn(`Slow render detected: ${componentName} took ${renderTimeMs.toFixed(2)}ms`);
    }
  }
  
  // Handle JavaScript errors
  private handleError = (event: ErrorEvent): void => {
    this.errorCount++;
    
    if (!env.isProduction) {
      console.error('Application error:', event.error);
    }
    
    // In production, you would send this to your error tracking service
    if (env.isProduction) {
      // Example: sendToErrorTracking(event.error);
    }
  }
  
  // Capture navigation timing metrics
  private captureNavigationTiming(): void {
    try {
      const navEntries = window.performance.getEntriesByType('navigation');
      if (navEntries && navEntries.length > 0) {
        this.navigationTimings.push(navEntries[0]);
      }
    } catch (err) {
      console.error('Failed to capture navigation timing:', err);
    }
  }
  
  // Get performance report
  public getPerformanceReport(): any {
    return {
      componentRenders: Array.from(this.renderTimings.values()),
      navigationTimings: this.navigationTimings,
      errorCount: this.errorCount,
      memory: (performance as any).memory ? {
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize
      } : undefined
    };
  }
  
  // Clean up event listeners
  public dispose(): void {
    window.removeEventListener('error', this.handleError);
  }
}

// Export as singleton
export const performanceService = new PerformanceService();
