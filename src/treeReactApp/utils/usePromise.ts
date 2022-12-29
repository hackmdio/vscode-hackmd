import { useState, useEffect, useCallback } from 'react';

const cache = new Set();

// These typings are borrowed from @raycast/utils package
type PromiseType<P extends Promise<any>> = P extends Promise<infer T> ? T : never;
type FunctionReturningPromise<T extends any[] = any[]> = (...args: T) => Promise<any>;
type PromiseReturnType<T extends FunctionReturningPromise> = PromiseType<ReturnType<T>>;

// Thank you Copilot
export const usePromise = <T extends FunctionReturningPromise>(
  promise: T,
  deps: any[] = []
): {
  data: PromiseReturnType<T> | undefined;
  error: Error | undefined;
  isValidating: boolean;
  mutate: () => void;
} => {
  const [data, setData] = useState<PromiseReturnType<T>>();
  const [error, setError] = useState<Error>();
  const [isValidating, setIsValidating] = useState(false);

  const mutate = useCallback(() => {
    setIsValidating(true);
    promise()
      .then((data) => {
        setData(data);
        setIsValidating(false);
      })
      .catch((error) => {
        setError(error);
        setIsValidating(false);
      });
  }, [promise]);

  useEffect(() => {
    if (!cache.has(promise)) {
      cache.add(promise);
      mutate();
    }
  }, deps);

  return {
    data,
    error,
    isValidating,
    mutate,
  };
};
