import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

const LOCAL_STORAGE_KEY = "varivis_config";

export type UseConfigResult = {
  isConfigLoading: boolean;
  config: Config;
  setConfig: SetConfig;
};
export type Config = {
  autoStart: boolean;
};
export type SetConfig = (updateConfig: (oldConfig: Config) => Config) => void;

const defaultConfig: Config = {
  autoStart: false,
};

export function useConfig(): UseConfigResult {
  const {
    isLoading,
    value: itemValue,
    set: setItem,
  } = useLocalStorage(LOCAL_STORAGE_KEY);

  const config = useMemo(() => parseConfig(itemValue), [itemValue]);

  const setConfig = useCallback((updateConfig: (oldConfig: Config) => Config) => {
    const newConfig = updateConfig(config);
    setItem(JSON.stringify(newConfig));
  }, [setItem, config]);

  return {
    isConfigLoading: isLoading,
    config,
    setConfig,
  };
}

function parseConfig(value: string | null): Config {
  let obj: unknown;
  try {
    obj = JSON.parse(value ?? "");
  } catch (e) {
    if (e instanceof SyntaxError) {
      return defaultConfig;
    }
    throw e;
  }

  if (obj == null || typeof obj !== "object") {
    return defaultConfig;
  }

  const obj_ = obj as Record<string, unknown>;
  const autoStart: boolean = typeof obj_.autoStart === "boolean" ? obj_.autoStart : defaultConfig.autoStart;

  return { autoStart };
}
