// src/react-app-env-d.ts
/// <reference types="react-scripts" />


interface Window {
  electronAPI: {
    selectDirectory: () => Promise<string | null>;
  };
}