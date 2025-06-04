
import { useState, useEffect } from 'react';

interface FormPersistenceOptions {
  key: string;
  defaultValues?: any;
  clearOnSubmit?: boolean;
  validateData?: (data: any) => boolean;
}

export const useFormPersistence = <T extends Record<string, any>>(
  options: FormPersistenceOptions
) => {
  const { key, defaultValues = {}, clearOnSubmit = true, validateData } = options;
  
  const [formData, setFormData] = useState<T>(defaultValues);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    const loadPersistedData = () => {
      try {
        const persistedData = localStorage.getItem(`form_${key}`);
        if (persistedData) {
          const parsed = JSON.parse(persistedData);
          
          // Validate data if validator provided
          if (validateData && !validateData(parsed)) {
            console.warn('Persisted form data failed validation, using defaults');
            setFormData(defaultValues);
          } else {
            setFormData({ ...defaultValues, ...parsed });
          }
        } else {
          setFormData(defaultValues);
        }
      } catch (error) {
        console.error('Failed to load persisted form data:', error);
        setFormData(defaultValues);
      } finally {
        setIsLoaded(true);
      }
    };

    loadPersistedData();
  }, [key, defaultValues, validateData]);

  // Persist data whenever it changes
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(`form_${key}`, JSON.stringify(formData));
    } catch (error) {
      console.error('Failed to persist form data:', error);
    }
  }, [formData, key, isLoaded]);

  const updateFormData = (updates: Partial<T> | ((prev: T) => T)) => {
    if (typeof updates === 'function') {
      setFormData(updates);
    } else {
      setFormData(prev => ({ ...prev, ...updates }));
    }
  };

  const resetForm = () => {
    setFormData(defaultValues);
    try {
      localStorage.removeItem(`form_${key}`);
    } catch (error) {
      console.error('Failed to clear persisted form data:', error);
    }
  };

  const handleSubmit = (submitFn: (data: T) => void | Promise<void>) => {
    return async () => {
      try {
        await submitFn(formData);
        
        if (clearOnSubmit) {
          resetForm();
        }
      } catch (error) {
        console.error('Form submission failed:', error);
        throw error;
      }
    };
  };

  return {
    formData,
    updateFormData,
    resetForm,
    handleSubmit,
    isLoaded
  };
};
