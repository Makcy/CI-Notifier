// @ts-nocheck
import { contextBridge, ipcRenderer } from 'electron'

// 暴露 API 到渲染进程
const electronAPI = {
  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value)
  },
  
  gitlab: {
    login: (config) => ipcRenderer.invoke('gitlab:login', config),
    getProjects: () => ipcRenderer.invoke('gitlab:getProjects'),
    startMonitoring: (projectIds) => ipcRenderer.invoke('gitlab:startMonitoring', projectIds),
    stopMonitoring: () => ipcRenderer.invoke('gitlab:stopMonitoring')
  },
  
  shell: {
    openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url)
  },
  
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    hide: () => ipcRenderer.invoke('window:hide'),
    close: () => ipcRenderer.invoke('window:close')
  },
  
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args))
  },
  
  off: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)