import { useState, useCallback } from 'react';
import { getStorage, setStorage } from '@/lib/storage';

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => getStorage(key, defaultValue));

  const update = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const resolved = typeof newValue === 'function'
        ? (newValue as (prev: T) => T)(prev)
        : newValue;
      setStorage(key, resolved);
      return resolved;
    });
  }, [key]);

  return [value, update] as const;
}
