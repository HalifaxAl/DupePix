export interface IElectronAPI {
  openDirectory: () => Promise<string | null>,
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}