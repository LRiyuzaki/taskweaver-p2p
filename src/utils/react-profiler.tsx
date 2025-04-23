
import React, { ProfilerOnRenderCallback, Profiler, useRef, useEffect } from 'react';

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
 */
export const PerformanceProfiler: React.FC<ProfilerProps> = ({
  id,
  children,
  onRender,
  logToConsole = true,
  warnThreshold = 16 // 16ms = 60fps
}) => {
  const renderCount = useRef(0);

  const handleRender: ProfilerOnRenderCallback = (
    id, phase, actualDuration, baseDuration, startTime, commitTime
  ) => {
    renderCount.current += 1;
    
    if (logToConsole) {
      if (actualDuration > warnThreshold) {
        console.warn(`⚠️ Slow render: Component "${id}" took ${actualDuration.toFixed(2)}ms to render (render #${renderCount.current})`);
      } else {
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
 * Hook to create a component render tracker
 */
export const useRenderTracker = (componentName: string) => {
  const renderCount = useRef(0);
  
  renderCount.current += 1;
  
  useEffect(() => {
    console.log(`Component "${componentName}" rendered (count: ${renderCount.current})`);
    
    return () => {
      console.log(`Component "${componentName}" unmounted after ${renderCount.current} renders`);
    };
  }, [componentName]);
  
  return renderCount.current;
};
