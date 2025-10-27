// 前端 API 服务层，通过 Electron IPC 与主进程通信

export interface GitLabConfig {
  url: string
  token: string
}

export interface GitLabProject {
  id: number
  name: string
  path_with_namespace: string
  web_url: string
  default_branch: string
}

export interface ProjectStatus {
  id: number
  name: string
  status: string
  web_url: string
  pipeline?: any
  lastUpdated: string
}

export class ApiService {
  // GitLab 登录
  static async login(config: GitLabConfig) {
    return await window.electronAPI.gitlab.login(config)
  }

  // 获取项目列表
  static async getProjects(): Promise<{ success: boolean; projects?: GitLabProject[]; error?: string }> {
    return await window.electronAPI.gitlab.getProjects()
  }

  // 开始监控项目
  static async startMonitoring(projectIds: number[]) {
    return await window.electronAPI.gitlab.startMonitoring(projectIds)
  }

  // 停止监控
  static async stopMonitoring() {
    return await window.electronAPI.gitlab.stopMonitoring()
  }

  // 存储相关
  static async getStoredData(key: string) {
    return await window.electronAPI.store.get(key)
  }

  static async setStoredData(key: string, value: any) {
    return await window.electronAPI.store.set(key, value)
  }

  // 打开外部链接
  static async openExternal(url: string) {
    return await window.electronAPI.shell.openExternal(url)
  }

  // 窗口控制
  static async minimizeWindow() {
    return await window.electronAPI.window.minimize()
  }

  static async hideWindow() {
    return await window.electronAPI.window.hide()
  }

  static async closeWindow() {
    return await window.electronAPI.window.close()
  }

  // 事件监听
  static onPipelineStatusUpdate(callback: (status: ProjectStatus[]) => void) {
    window.electronAPI.on('pipeline:statusUpdate', callback)
  }

  static offPipelineStatusUpdate(callback: (status: ProjectStatus[]) => void) {
    window.electronAPI.off('pipeline:statusUpdate', callback)
  }
}