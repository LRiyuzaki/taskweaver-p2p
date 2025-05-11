
import React, { ProfilerOnRenderCallback, Profiler, useRef, useEffect, useState } from 'react';
import { performanceService } from '@/services/monitoring/performance-service';
import { env } from '@/config/env';

interface ProfilerProps {
  id: string;
  children: React.ReactNode;
  onRender?: ProfilerOnRenderCallback;
  logToConsole?: boolean;
  warnThreshold?: number; // ms
}

const defaultOnRender: ProfilerOnRenderCallback = (
  id, phase, actualDuration, baseDuration, startTime, commitTime
) => {
  console.log({
    id, 
    phase,
    actualDuration: `${actualDuration.toFixed(2)}ms`,
    baseDuration: `${baseDuration.toFixed(2)}ms`,
    startTime,
    commitTime
  });
};

/**
 * Profiler component that wraps React's Profiler with additional functionality
 * and integration with performance monitoring service
 */
export const PerformanceProfiler: React.FC<ProfilerProps> = ({
  id,
  children,
  onRender,
  logToConsole = !env.isProduction,
  warnThreshold = 16 // 16ms = 60fps
}) => {
  const renderCount = useRef(0);

  const handleRender: ProfilerOnRenderCallback = (
    id, phase, actualDuration, baseDuration, startTime, commitTime
  ) => {
    renderCount.current += 1;
    
    // Record performance metrics
    performanceService.recordRender(id, actualDuration);
    
    if (logToConsole) {
      if (actualDuration > warnThreshold) {
        console.warn(`⚠️ Slow render: Component "${id}" took ${actualDuration.toFixed(2)}ms to render (render #${renderCount.current})`);
      } else if (env.isDevelopment) {
        console.log(`✓ Component "${id}" rendered in ${actualDuration.toFixed(2)}ms (render #${renderCount.current})`);
      }
    }
    
    if (onRender) {
      onRender(id, phase, actualDuration, baseDuration, startTime, commitTime);
    }
  };
  
  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
};

/**
 * Hook to create a component render tracker with improved performance monitoring
 */
export const useRenderTracker = (componentName: string) => {
  const renderCount = useRef(0);
  const renderStart = useRef(performance.now());
  
  renderCount.current += 1;
  
  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    performanceService.recordRender(componentName, renderTime);
    
    if (env.isDevelopment) {
      console.log(`Component "${componentName}" rendered (count: ${renderCount.current}) in ${renderTime.toFixed(2)}ms`);
    }
    
    return () => {
      if (env.isDevelopment) {
        console.log(`Component "${componentName}" unmounted after ${renderCount.current} renders`);
      }
    };
  }, [componentName]);
  
  return renderCount.current;
};

/**
 * Enhanced useEffect that logs performance metrics
 */
export const useTrackedEffect = (
  effect: React.EffectCallback,
  deps: React.DependencyList | undefined,
  name: string
) => {
  useEffect(() => {
    const startTime = performance.now();
    
    // Execute the effect
    const cleanup = effect();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (env.isDevelopment && duration > 1) {
      console.log(`Effect "${name}" ran in ${duration.toFixed(2)}ms`);
    }
    
    // Return the original cleanup function
    return cleanup;
  }, deps);
};

/**
 * Hook for optimized component updates
 */
export const useOptimizedUpdate = (callback: () => void, delay = 200) => {
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  const triggerUpdate = useEffect(() => {
    if (!isPending) return;
    
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      callback();
      setIsPending(false);
      timeoutRef.current = null;
    }, delay);
    
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [isPending, callback, delay]);
  
  return () => setIsPending(true);
};
