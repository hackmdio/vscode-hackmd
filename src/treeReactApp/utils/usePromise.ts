import { useState, useEffect, useCallback, useMemo } from 'react';

const usePromiseCache = new Map<FunctionReturningPromise, Map<string, any>>();

// These typings are borrowed from @raycast/utils package
type PromiseType<P extends Promise<any>> = P extends Promise<infer T> ? T : never;
type FunctionReturningPromise<T extends any[] = any[]> = (...args: T) => Promise<any>;
type PromiseReturnType<T extends FunctionReturningPromise> = PromiseType<ReturnType<T>>;

type UsePromiseOptions = {
  execute?: boolean;
};

// Thank you Copilot
export const usePromise = <T extends FunctionReturningPromise>(
  promise: T,
  deps: any[] = [],
  { execute = true }: UsePromiseOptions = {}
): {
  data: PromiseReturnType<T> | undefined;
  error: Error | undefined;
  isValidating: boolean;
  mutate: () => void;
} => {
  const [data, setData] = useState<PromiseReturnType<T>>();
  const [error, setError] = useState<Error>();
  const [isValidating, setIsValidating] = useState(false);

  const cachedKey = useMemo(() => {
    return deps.map((dep) => dep.toString()).join('');
  }, [deps]);

  const mutate = useCallback(() => {
    const currentData = usePromiseCache.get(promise)?.get(cachedKey);

    if (currentData) {
      setData(currentData);
    }

    setIsValidating(true);
    promise()
      .then((data) => {
        setData(data);
        setIsValidating(false);

        if (!usePromiseCache.has(promise)) {
          usePromiseCache.set(promise, new Map());
        }

        usePromiseCache.get(promise)?.set(cachedKey, data);
      })
      .catch((error) => {
        setError(error);
        setIsValidating(false);
      });
  }, [cachedKey, promise]);

  useEffect(() => {
    if (execute) {
      mutate();
    }
  }, [execute, mutate]);

  return {
    data,
    error,
    isValidating,
    mutate,
  };
};
