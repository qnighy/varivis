import React, { useEffect } from "react";

export type UsePageSizeResult = {
  isLoading: boolean;
  width: number;
  height: number;
};

export function usePageSize(): UsePageSizeResult {
  const [cachedSize, setCachedSize] = React.useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    setCachedSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);
  useEffect(() => {
    const handleResize = () => {
      setCachedSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (cachedSize) {
    return { isLoading: false, width: cachedSize.width, height: cachedSize.height };
  } else {
    return { isLoading: true, width: 0, height: 0 };
  }
}
