
import React, { useState, useEffect } from 'react';

interface ResourceLoaderProps<T> {
  resourceFn: () => Promise<T>;
  renderLoading: () => React.ReactNode;
  renderSuccess: (data: T) => React.ReactNode;
  renderError: (error: Error) => React.ReactNode;
  loadingDelay?: number;
  retries?: number;
  retryDelay?: number;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

function ResourceLoader<T>({
  resourceFn,
  renderLoading,
  renderSuccess,
  renderError,
  loadingDelay = 200,
  retries = 2,
  retryDelay = 1000,
  onLoadStart,
  onLoadEnd
}: ResourceLoaderProps<T>): JSX.Element {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let loaderTimeout: NodeJS.Timeout | null = null;
    
    const loadResource = async () => {
      if (onLoadStart) onLoadStart();
      setIsLoading(true);
      setError(null);
      
      // Only show loading indicator after a delay to avoid flash
      loaderTimeout = setTimeout(() => {
        if (isMounted) setShowLoader(true);
      }, loadingDelay);
      
      try {
        const result = await resourceFn();
        
        if (isMounted) {
          setData(result);
          setIsLoading(false);
          setShowLoader(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Resource loading error:', err);
          
          if (retryCount < retries) {
            // Retry after delay
            setTimeout(() => {
              if (isMounted) {
                setRetryCount(prev => prev + 1);
                loadResource();
              }
            }, retryDelay);
          } else {
            setError(err as Error);
            setIsLoading(false);
            setShowLoader(false);
          }
        }
      } finally {
        if (loaderTimeout) clearTimeout(loaderTimeout);
        if (onLoadEnd) onLoadEnd();
      }
    };
    
    loadResource();
    
    return () => {
      isMounted = false;
      if (loaderTimeout) clearTimeout(loaderTimeout);
    };
  }, [resourceFn, loadingDelay, retries, retryDelay, retryCount, onLoadStart, onLoadEnd]);

  if (isLoading && showLoader) {
    return <>{renderLoading()}</>;
  }

  if (error) {
    return <>{renderError(error)}</>;
  }

  if (data) {
    return <>{renderSuccess(data)}</>;
  }

  // Initial state before showing loader
  return <></>;
}

export default ResourceLoader;
