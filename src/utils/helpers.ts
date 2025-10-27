// 工具函数

import { PIPELINE_STATUS_TEXT, PIPELINE_STATUS_COLORS } from './constants'

/**
 * 格式化时间
 */
export function formatTime(timeString: string): string {
  try {
    const date = new Date(timeString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return '未知时间'
  }
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(timeString: string): string {
  try {
    const date = new Date(timeString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) {
      return `${days}天前`
    } else if (hours > 0) {
      return `${hours}小时前`
    } else if (minutes > 0) {
      return `${minutes}分钟前`
    } else {
      return `${seconds}秒前`
    }
  } catch {
    return '未知时间'
  }
}

/**
 * 获取流水线状态文本
 */
export function getStatusText(status: string): string {
  return PIPELINE_STATUS_TEXT[status as keyof typeof PIPELINE_STATUS_TEXT] || '未知'
}

/**
 * 获取流水线状态颜色
 */
export function getStatusColor(status: string): string {
  return PIPELINE_STATUS_COLORS[status as keyof typeof PIPELINE_STATUS_COLORS] || '#909399'
}

/**
 * 获取 Element Plus 标签类型
 */
export function getStatusTagType(status: string): 'success' | 'warning' | 'danger' | 'info' | '' {
  switch (status) {
    case 'success':
      return 'success'
    case 'failed':
      return 'danger'
    case 'running':
      return 'warning'
    case 'pending':
      return 'info'
    default:
      return ''
  }
}

/**
 * 验证 URL 格式
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证 GitLab Token 格式
 */
export function isValidGitLabToken(token: string): boolean {
  // GitLab Personal Access Token 通常以 glpat- 开头，长度为 20+ 字符
  return token.length >= 20 && (token.startsWith('glpat-') || token.startsWith('gldt-'))
}

/**
 * 清理 URL，移除末尾斜杠
 */
export function cleanUrl(url: string): string {
  return url.replace(/\/$/, '')
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait) as any
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastTime >= wait) {
      lastTime = now
      func(...args)
    }
  }
}

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  
  return obj
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * 安全的 JSON 解析
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return defaultValue
  }
}