// This file makes the TypeScript compiler aware of the 'electronAPI' object.

export interface IElectronAPI {
  selectDirectory: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}