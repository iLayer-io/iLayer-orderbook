"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Config } from "@/types";

type ConfigContextType = {
  config: Config | null;
  loading: boolean;
  error: string | null;
};

const ConfigContext = createContext<ConfigContextType | null>(null);

type ConfigProviderProps = {
  configPath: string;
  children: ReactNode;
};

export const ConfigProvider: React.FC<ConfigProviderProps> = ({
  configPath,
  children,
}) => {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch(configPath);
        if (!response.ok) {
          throw new Error(`Failed to load config file: ${response.statusText}`);
        }
        const data: Config = await response.json();
        setConfig(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [configPath]);

  return (
    <ConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};
