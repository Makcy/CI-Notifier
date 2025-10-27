export interface ElectronAPI {
  // 存储相关
  store: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<boolean>
  }
  
  // GitLab 相关
  gitlab: {
    login: (config: { url: string; token: string }) => Promise<{ success: boolean; user?: any; error?: string }>
    getProjects: () => Promise<{ success: boolean; projects?: any[]; error?: string }>
    startMonitoring: (projectIds: number[]) => Promise<{ success: boolean; error?: string }>
    stopMonitoring: () => Promise<{ success: boolean }>
  }
  
  // 系统相关
  shell: {
    openExternal: (url: string) => Promise<void>
  }
  
  // 窗口控制
  window: {
    minimize: () => Promise<void>
    hide: () => Promise<void>
    close: () => Promise<void>
  }
  
  // 事件监听
  on: (channel: string, callback: (...args: any[]) => void) => void
  off: (channel: string, callback: (...args: any[]) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}