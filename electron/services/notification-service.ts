// @ts-nocheck
import { Notification } from 'electron'

class NotificationService {
  constructor() {
    this.lastNotificationTime = {}
    this.NOTIFICATION_COOLDOWN = 60000 // 1分钟冷却时间

    // 检查系统是否支持通知
    if (!Notification.isSupported()) {
      console.warn('System notifications are not supported')
    }
  }

  // 发送通知
  sendNotification(options) {
    if (!Notification.isSupported()) {
      console.warn('Notifications not supported, skipping')
      return
    }

    const projectKey = `${options.project.id}-${options.project.status}`
    const now = Date.now()
    
    // 检查冷却时间，避免频繁通知
    if (this.lastNotificationTime[projectKey] && 
        now - this.lastNotificationTime[projectKey] < this.NOTIFICATION_COOLDOWN) {
      return
    }

    try {
      const notification = new Notification({
        title: options.title,
        body: options.body,
        icon: this.getIconForStatus(options.project.status),
        silent: false
      })

      notification.on('click', () => {
        // 点击通知时打开项目页面
        import('electron').then(({ shell }) => {
          shell.openExternal(options.project.web_url)
        })
      })

      notification.show()
      this.lastNotificationTime[projectKey] = now

      console.log(`Notification sent for project ${options.project.name}: ${options.project.status}`)
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }

  // 根据状态获取图标路径
  getIconForStatus(status) {
    // 实际项目中应该使用不同的图标文件
    switch (status) {
      case 'success':
        return 'icon-green.png'
      case 'failed':
        return 'icon-red.png'
      case 'running':
        return 'icon-blue.png'
      default:
        return 'icon.png'
    }
  }

  // 根据状态获取通知紧急程度
  getUrgencyForStatus(status) {
    switch (status) {
      case 'failed':
        return 'critical'
      case 'success':
        return 'normal'
      default:
        return 'low'
    }
  }

  // 清理通知历史
  clearNotificationHistory() {
    this.lastNotificationTime = {}
  }
}

export { NotificationService }