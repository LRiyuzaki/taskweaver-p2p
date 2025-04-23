
import React, { useRef, useEffect } from 'react';

/**
 * Higher-order component that measures render performance
 * @param Component The React component to measure
 * @param componentName Optional name for the component
 * @returns The wrapped component with performance measurement
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string = Component.displayName || Component.name || 'Component'
) {
  return function PerformanceTrackedComponent(props: P) {
    const renderStartTime = useRef(0);
    
    useEffect(() => {
      const renderTime = performance.now() - renderStartTime.current;
      if (renderTime > 16) { // If render takes more than 16ms (60fps)
        console.warn(`Slow render: ${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
    });
    
    renderStartTime.current = performance.now();
    return <Component {...props} />;
  };
}

/**
 * Custom hook to measure time spent in a component's render
 * @param componentName Component name for logging
 */
export function useRenderPerformance(componentName: string) {
  const renderStartTime = useRef(performance.now());
  
  // Log on mount
  useEffect(() => {
    const mountTime = performance.now() - renderStartTime.current;
    console.log(`${componentName} mounted in ${mountTime.toFixed(2)}ms`);
    
    // Track re-renders
    let renderCount = 0;
    
    return () => {
      console.log(`${componentName} re-rendered ${renderCount} times before unmount`);
    };
  }, [componentName]);
  
  // Log on each render
  const renderTime = performance.now() - renderStartTime.current;
  if (renderTime > 16) { // 60fps threshold
    console.warn(`Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
  }
  
  // Reset for next render
  renderStartTime.current = performance.now();
}

/**
 * HOC for React.memo with custom props comparison
 * @param Component Component to memoize
 * @param propsAreEqual Function to compare props
 * @returns Memoized component
 */
export function memoWithCustomComparison<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
  return React.memo(Component, propsAreEqual);
}
