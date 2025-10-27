// @ts-nocheck
const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, Notification, shell } = require('electron')
const { join } = require('path')
const Store = require('electron-store')

// 简化的 GitLab 服务类
class GitLabService {
  constructor(url, token) {
    this.baseUrl = url
    this.token = token
    this.monitoringInterval = null
    this.isMonitoring = false
  }

  async getCurrentUser() {
    return { name: 'Test User', username: 'testuser' }
  }

  async getProjects() {
    return []
  }

  async getLatestPipeline(projectId) {
    return null
  }

  async getProjectsStatus(projectIds) {
    return []
  }

  startMonitoring(projectIds, callback, intervalMs = 30000) {
    this.isMonitoring = true
    this.monitoringInterval = setInterval(() => {
      this.getProjectsStatus(projectIds).then(callback).catch(console.error)
    }, intervalMs)
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    this.isMonitoring = false
  }
}

// 简化的通知服务类
class NotificationService {
  constructor() {
    this.lastNotificationTime = {}
  }

  sendNotification(options) {
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: options.title,
        body: options.body
      })
      notification.show()
    }
  }
}

// 应用配置
const isDev = process.env.NODE_ENV === 'development'
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

// 全局变量
let mainWindow = null
let tray = null
let gitlabService = null
let notificationService = null

// 数据存储
const store = new Store({
  defaults: {
    windowBounds: { width: 1000, height: 700 },
    gitlabConfig: null,
    selectedProjects: [],
    lastPipelineStates: {}
  }
})

// 创建主窗口
function createMainWindow() {
  const bounds = store.get('windowBounds') || { width: 1000, height: 700 }
  
  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // 加载页面
  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    if (isDev) {
      mainWindow.webContents.openDevTools()
    }
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  // 窗口事件
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) mainWindow.show()
  })

  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault()
      if (mainWindow) mainWindow.hide()
    }
  })

  mainWindow.on('resize', () => {
    const bounds = mainWindow && mainWindow.getBounds()
    if (bounds) {
      store.set('windowBounds', bounds)
    }
  })
}

// 创建系统托盘
function createTray() {
  // 创建托盘图标 (使用默认图标，实际项目中应该使用自定义图标)
  const icon = nativeImage.createFromPath(join(__dirname, '../public/icon.png')).resize({ width: 16, height: 16 })
  tray = new Tray(icon)

  // 设置托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        mainWindow?.show()
      }
    },
    {
      label: '项目状态',
      submenu: [
        {
          label: '暂无监控项目',
          enabled: false
        }
      ]
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.isQuiting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
  tray.setToolTip('GitLab CI/CD Notifier')

  // 点击托盘图标显示窗口
  tray.on('click', () => {
    mainWindow?.show()
  })
}

// 更新托盘状态
function updateTrayStatus(projects: any[]) {
  if (!tray) return

  const hasFailure = projects.some(p => p.status === 'failed')
  const allSuccess = projects.length > 0 && projects.every(p => p.status === 'success')

  // 更新托盘图标颜色 (实际项目中应该使用不同颜色的图标)
  let iconPath = join(__dirname, '../public/icon.png')
  if (hasFailure) {
    iconPath = join(__dirname, '../public/icon-red.png')
  } else if (allSuccess) {
    iconPath = join(__dirname, '../public/icon-green.png')
  }

  try {
    const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
    tray.setImage(icon)
  } catch (error) {
    console.warn('Failed to update tray icon:', error)
  }

  // 更新托盘菜单
  const projectMenuItems = projects.map(project => ({
    label: `${project.name} - ${project.status}`,
    click: () => {
      shell.openExternal(project.web_url)
    }
  }))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        mainWindow?.show()
      }
    },
    {
      label: '项目状态',
      submenu: projectMenuItems.length > 0 ? projectMenuItems : [
        {
          label: '暂无监控项目',
          enabled: false
        }
      ]
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.isQuiting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
}

// IPC 事件处理
function setupIpcHandlers() {
  // 获取存储的配置
  ipcMain.handle('store:get', (_, key: string) => {
    return store.get(key)
  })

  // 设置存储配置
  ipcMain.handle('store:set', (_, key: string, value: any) => {
    store.set(key, value)
    return true
  })

  // GitLab 登录
  ipcMain.handle('gitlab:login', async (_, config: { url: string; token: string }) => {
    try {
      gitlabService = new GitLabService(config.url, config.token)
      const user = await gitlabService.getCurrentUser()
      store.set('gitlabConfig', config)
      return { success: true, user }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  // 获取项目列表
  ipcMain.handle('gitlab:getProjects', async () => {
    if (!gitlabService) {
      return { success: false, error: 'GitLab service not initialized' }
    }
    try {
      const projects = await gitlabService.getProjects()
      return { success: true, projects }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  // 开始监控项目
  ipcMain.handle('gitlab:startMonitoring', async (_, projectIds: number[]) => {
    if (!gitlabService) {
      return { success: false, error: 'GitLab service not initialized' }
    }

    store.set('selectedProjects', projectIds)
    
    // 初始化通知服务
    if (!notificationService) {
      notificationService = new NotificationService()
    }

    // 开始轮询监控
    gitlabService.startMonitoring(projectIds, (projectStatus) => {
      // 发送状态更新到渲染进程
      mainWindow?.webContents.send('pipeline:statusUpdate', projectStatus)
      
      // 更新托盘状态
      updateTrayStatus(projectStatus)
      
      // 检查是否需要发送通知
      const lastStates = store.get('lastPipelineStates') as Record<string, any>
      
      projectStatus.forEach(project => {
        const lastState = lastStates[project.id]
        if (lastState && lastState.status !== project.status) {
          // 状态发生变化，发送通知
          notificationService?.sendNotification({
            title: 'GitLab CI/CD 状态更新',
            body: `项目 ${project.name} 的流水线状态变为: ${project.status}`,
            project: project
          })
        }
        lastStates[project.id] = project
      })
      
      store.set('lastPipelineStates', lastStates)
    })

    return { success: true }
  })

  // 停止监控
  ipcMain.handle('gitlab:stopMonitoring', () => {
    gitlabService?.stopMonitoring()
    return { success: true }
  })

  // 打开外部链接
  ipcMain.handle('shell:openExternal', (_, url: string) => {
    shell.openExternal(url)
  })

  // 窗口控制
  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.handle('window:hide', () => {
    mainWindow?.hide()
  })

  ipcMain.handle('window:close', () => {
    app.quit()
  })
}

// 应用启动
app.whenReady().then(() => {
  createMainWindow()
  createTray()
  setupIpcHandlers()

  // 恢复之前的监控状态
  const gitlabConfig = store.get('gitlabConfig') as any
  const selectedProjects = store.get('selectedProjects') as number[]
  
  if (gitlabConfig && selectedProjects.length > 0) {
    gitlabService = new GitLabService(gitlabConfig.url, gitlabConfig.token)
    // 延迟启动监控，等待渲染进程准备就绪
    setTimeout(() => {
      gitlabService?.startMonitoring(selectedProjects, (projectStatus) => {
        mainWindow?.webContents.send('pipeline:statusUpdate', projectStatus)
        updateTrayStatus(projectStatus)
      })
    }, 3000)
  }
})

// 应用退出处理
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

app.on('before-quit', () => {
  app.isQuiting = true
  gitlabService?.stopMonitoring()
})