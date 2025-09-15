// src/react-app-env-d.ts
/// <reference types="react-scripts" />


interface Window {
  electronAPI: {
    [x: string]: any;
    selectDirectory: () => Promise<string | null>;
  };
}