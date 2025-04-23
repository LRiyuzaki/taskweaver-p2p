
import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  fps: number;
  memory?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
  networkLatency: number | null;
}

/**
 * Hook for monitoring application performance
 * @returns Performance metrics object
 */
export function usePerformanceMonitor(): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: undefined,
    networkLatency: null
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;
    
    // Measure FPS
    const measureFps = () => {
      frameCount++;
      const now = performance.now();
      
      if (now - lastTime >= 1000) {
        // Update FPS once per second
        setMetrics(prev => ({
          ...prev,
          fps: Math.round(frameCount * 1000 / (now - lastTime)),
          // Get memory info if available (Chrome only)
          memory: (performance as any).memory ? {
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize
          } : undefined
        }));
        
        frameCount = 0;
        lastTime = now;
      }
      
      animationFrameId = requestAnimationFrame(measureFps);
    };
    
    // Start measuring FPS
    animationFrameId = requestAnimationFrame(measureFps);
    
    // Measure network latency occasionally
    const measureNetworkLatency = () => {
      const start = performance.now();
      
      fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-store'
      })
      .then(() => {
        const latency = performance.now() - start;
        setMetrics(prev => ({ ...prev, networkLatency: latency }));
      })
      .catch(() => {
        console.log('Failed to measure network latency');
      });
    };
    
    // Check network latency every 10 seconds
    const latencyInterval = setInterval(measureNetworkLatency, 10000);
    
    // Initial measurement
    measureNetworkLatency();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(latencyInterval);
    };
  }, []);
  
  return metrics;
}
