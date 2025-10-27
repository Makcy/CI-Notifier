/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 模块声明
declare module 'vue' {
  export * from '@vue/runtime-dom'
}

declare module 'vue-router' {
  export * from 'vue-router/dist/vue-router'
}

declare module 'pinia' {
  export * from 'pinia/dist/pinia'
}

declare module 'element-plus' {
  export * from 'element-plus/dist/index'
}

declare module '@element-plus/icons-vue' {
  export * from '@element-plus/icons-vue/dist/index'
}

declare module 'axios' {
  export * from 'axios/index'
}

declare module 'electron' {
  export * from 'electron/main'
}

declare module 'electron-store' {
  export default class Store {
    constructor(options?: any)
    get(key: string): any
    set(key: string, value: any): void
  }
}

declare module 'path' {
  export function join(...paths: string[]): string
  export function resolve(...paths: string[]): string
}

// Electron API 类型定义
interface ElectronAPI {
  store: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<boolean>
  }
  gitlab: {
    login: (config: { url: string; token: string }) => Promise<{ success: boolean; user?: any; error?: string }>
    getProjects: () => Promise<{ success: boolean; projects?: any[]; error?: string }>
    startMonitoring: (projectIds: number[]) => Promise<{ success: boolean; error?: string }>
    stopMonitoring: () => Promise<{ success: boolean }>
  }
  shell: {
    openExternal: (url: string) => Promise<void>
  }
  window: {
    minimize: () => Promise<void>
    hide: () => Promise<void>
    close: () => Promise<void>
  }
  on: (channel: string, callback: (...args: any[]) => void) => void
  off: (channel: string, callback: (...args: any[]) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
  
  // Node.js 全局变量
  const process: any
  const __dirname: string
  const require: any
  
  // 数组方法
  interface Array<T> {
    includes(searchElement: T, fromIndex?: number): boolean
  }
}

export {}