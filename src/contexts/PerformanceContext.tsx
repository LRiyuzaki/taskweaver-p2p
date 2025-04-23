
import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';

interface PerformanceContextType {
  metrics: ReturnType<typeof usePerformanceMonitor>;
  isLowPerformanceMode: boolean;
  setLowPerformanceMode: (value: boolean) => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  
  return context;
};

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const metrics = usePerformanceMonitor();
  const [isLowPerformanceMode, setLowPerformanceMode] = useState(() => {
    // Check if the user has manually set performance mode
    const savedMode = localStorage.getItem('low_performance_mode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    
    // Default to low performance mode on mobile or older devices
    return window.innerWidth < 768 || !('requestIdleCallback' in window);
  });
  
  // Persist performance mode in localStorage
  useEffect(() => {
    localStorage.setItem('low_performance_mode', isLowPerformanceMode.toString());
  }, [isLowPerformanceMode]);
  
  // Auto-detect if we should go into low performance mode based on FPS
  useEffect(() => {
    if (metrics.fps > 0 && metrics.fps < 30) {
      // If we're running below 30fps, suggest low performance mode
      console.log('Low FPS detected, considering enabling low performance mode');
    }
  }, [metrics.fps]);
  
  const value = React.useMemo(() => ({
    metrics,
    isLowPerformanceMode,
    setLowPerformanceMode
  }), [metrics, isLowPerformanceMode]);
  
  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};
