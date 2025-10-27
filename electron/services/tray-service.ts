// @ts-nocheck
import { Tray, Menu, nativeImage, shell } from 'electron'
import { join } from 'path'

class TrayService {
  constructor(iconBasePath) {
    this.iconBasePath = iconBasePath
    this.tray = null
  }

  // 创建系统托盘
  createTray(onShowWindow, onQuit) {
    try {
      // 创建托盘图标
      const iconPath = join(this.iconBasePath, 'icon.png')
      const icon = nativeImage.createFromPath(iconPath)
      
      if (icon.isEmpty()) {
        console.warn('Tray icon not found, using default icon')
        // 如果图标文件不存在，创建一个简单的默认图标
        const defaultIcon = nativeImage.createEmpty()
        this.tray = new Tray(defaultIcon)
      } else {
        this.tray = new Tray(icon.resize({ width: 16, height: 16 }))
      }

      // 设置初始菜单
      this.updateTrayMenu([], onShowWindow, onQuit)
      
      // 设置工具提示
      this.tray.setToolTip('GitLab CI/CD Notifier')

      // 点击托盘图标显示窗口
      this.tray.on('click', () => {
        onShowWindow()
      })

      // 双击托盘图标显示窗口
      this.tray.on('double-click', () => {
        onShowWindow()
      })

      console.log('Tray created successfully')
      return this.tray
    } catch (error) {
      console.error('Failed to create tray:', error)
      return null
    }
  }

  // 更新托盘图标状态
  updateTrayIcon(projects) {
    if (!this.tray) return

    try {
      let iconName = 'icon.png'
      
      if (projects.length === 0) {
        iconName = 'icon.png' // 默认状态
      } else {
        const hasFailure = projects.some(p => p.status === 'failed')
        const hasRunning = projects.some(p => p.status === 'running')
        const allSuccess = projects.every(p => p.status === 'success')

        if (hasFailure) {
          iconName = 'icon-red.png' // 失败状态
        } else if (hasRunning) {
          iconName = 'icon-blue.png' // 运行中状态
        } else if (allSuccess) {
          iconName = 'icon-green.png' // 成功状态
        }
      }

      const iconPath = join(this.iconBasePath, iconName)
      const icon = nativeImage.createFromPath(iconPath)
      
      if (!icon.isEmpty()) {
        this.tray.setImage(icon.resize({ width: 16, height: 16 }))
      }
    } catch (error) {
      console.warn('Failed to update tray icon:', error)
    }
  }

  // 更新托盘菜单
  updateTrayMenu(projects, onShowWindow, onQuit) {
    if (!this.tray) return

    try {
      const projectMenuItems = projects.length > 0 
        ? projects.map(project => ({
            label: `${project.name} - ${this.getStatusText(project.status)}`,
            click: () => {
              shell.openExternal(project.web_url)
            }
          }))
        : [{
            label: '暂无监控项目',
            enabled: false
          }]

      const menuTemplate = [
        {
          label: '显示主窗口',
          click: onShowWindow
        },
        {
          type: 'separator'
        },
        {
          label: '项目状态',
          submenu: projectMenuItems
        },
        {
          type: 'separator'
        },
        {
          label: '退出',
          click: onQuit
        }
      ]

      const contextMenu = Menu.buildFromTemplate(menuTemplate)
      this.tray.setContextMenu(contextMenu)
    } catch (error) {
      console.error('Failed to update tray menu:', error)
    }
  }

  // 更新托盘状态（图标和菜单）
  updateTrayStatus(projects, onShowWindow, onQuit) {
    this.updateTrayIcon(projects)
    this.updateTrayMenu(projects, onShowWindow, onQuit)
    
    // 更新工具提示
    if (this.tray) {
      const statusSummary = this.getStatusSummary(projects)
      this.tray.setToolTip(`GitLab CI/CD Notifier\n${statusSummary}`)
    }
  }

  // 销毁托盘
  destroyTray() {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
      console.log('Tray destroyed')
    }
  }

  // 获取状态文本
  getStatusText(status) {
    switch (status) {
      case 'success':
        return '✅ 成功'
      case 'failed':
        return '❌ 失败'
      case 'running':
        return '🔄 运行中'
      case 'pending':
        return '⏳ 等待中'
      case 'canceled':
        return '🚫 已取消'
      case 'skipped':
        return '⏭️ 已跳过'
      default:
        return '❓ 未知'
    }
  }

  // 获取状态摘要
  getStatusSummary(projects) {
    if (projects.length === 0) {
      return '暂无监控项目'
    }

    const successCount = projects.filter(p => p.status === 'success').length
    const failedCount = projects.filter(p => p.status === 'failed').length
    const runningCount = projects.filter(p => p.status === 'running').length
    const totalCount = projects.length

    const parts = []
    if (successCount > 0) parts.push(`✅ ${successCount}`)
    if (failedCount > 0) parts.push(`❌ ${failedCount}`)
    if (runningCount > 0) parts.push(`🔄 ${runningCount}`)

    return `监控 ${totalCount} 个项目: ${parts.join(' ')}`
  }

  // 获取托盘实例
  getTray() {
    return this.tray
  }

  // 检查托盘是否已创建
  isCreated() {
    return this.tray !== null
  }
}

export { TrayService }