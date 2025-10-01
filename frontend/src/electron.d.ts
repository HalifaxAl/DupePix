/**
 * This file augments the global Window object with the custom APIs
 * exposed from your Electron preload script.
 */

// 1. Define the interface of your API. This describes what functions
//    are available and what they return.
export interface IElectronAPI {
  selectDirectory: () => Promise<string | null>;
  // If you add more functions to preload.ts, you will add their types here.
}

// 2. Add the 'electronAPI' property to the global Window interface.
declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}