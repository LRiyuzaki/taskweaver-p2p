import { useCallback, useMemo, useRef } from "react";
import { usePerformance } from "@/contexts/PerformanceContext";
import { isEqual } from "lodash";

/**
 * A hook that provides memoized selectors for complex state
 * @param selector Function that extracts a part of the state
 * @param dependencies Array of dependencies to trigger recalculation
 * @returns Memoized selected state
 */
export function useMemoizedSelector<T, U>(
  selector: (input: T) => U,
  input: T,
  dependencies: React.DependencyList = []
): U {
  const { isLowPerformanceMode } = usePerformance();
  
  // In low performance mode, we're less strict about memoization
  const equalityFn = isLowPerformanceMode 
    ? (a: any, b: any) => a === b 
    : isEqual;
  
  // Keep the previous value to compare
  const prevValueRef = useRef<U>();
  
  // Define the selector function
  const memoizedSelector = useCallback(selector, dependencies);
  
  // Calculate the next value
  const nextValue = memoizedSelector(input);
  
  // Decide if we should update the reference
  const shouldUpdate = prevValueRef.current === undefined || 
    !equalityFn(prevValueRef.current, nextValue);
  
  // Use memo to cache the value
  const result = useMemo(() => {
    if (shouldUpdate) {
      prevValueRef.current = nextValue;
      return nextValue;
    }
    return prevValueRef.current;
  }, [nextValue, shouldUpdate]);

  return result;
}

/**
 * Hook that prevents unnecessary renders by memoizing the previous props
 * and only re-rendering if they change
 * @param props The component props to check
 * @returns Boolean indicating if render should be skipped
 */
export function useSkipRender<T extends Record<string, any>>(props: T): boolean {
  const prevPropsRef = useRef<T>();
  
  // Skip the first render
  if (!prevPropsRef.current) {
    prevPropsRef.current = props;
    return false;
  }
  
  // Compare current props with previous props
  const propKeys = Object.keys(props);
  const prevProps = prevPropsRef.current;
  
  // Return true if we should skip rendering (props haven't changed)
  const shouldSkip = propKeys.every(key => {
    return props[key] === prevProps[key];
  });
  
  // Update the ref if props changed
  if (!shouldSkip) {
    prevPropsRef.current = props;
  }
  
  return shouldSkip;
}
