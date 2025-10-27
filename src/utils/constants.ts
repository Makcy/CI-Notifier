// 应用常量定义

export const APP_CONFIG = {
  name: 'GitLab CI/CD Notifier',
  version: '1.0.0',
  description: 'GitLab CI/CD 流水线状态监控桌面应用'
}

export const PIPELINE_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  RUNNING: 'running',
  PENDING: 'pending',
  CANCELED: 'canceled',
  SKIPPED: 'skipped',
  UNKNOWN: 'unknown'
} as const

export const PIPELINE_STATUS_TEXT = {
  [PIPELINE_STATUS.SUCCESS]: '成功',
  [PIPELINE_STATUS.FAILED]: '失败',
  [PIPELINE_STATUS.RUNNING]: '运行中',
  [PIPELINE_STATUS.PENDING]: '等待中',
  [PIPELINE_STATUS.CANCELED]: '已取消',
  [PIPELINE_STATUS.SKIPPED]: '已跳过',
  [PIPELINE_STATUS.UNKNOWN]: '未知'
} as const

export const PIPELINE_STATUS_COLORS = {
  [PIPELINE_STATUS.SUCCESS]: '#67c23a',
  [PIPELINE_STATUS.FAILED]: '#f56c6c',
  [PIPELINE_STATUS.RUNNING]: '#e6a23c',
  [PIPELINE_STATUS.PENDING]: '#909399',
  [PIPELINE_STATUS.CANCELED]: '#909399',
  [PIPELINE_STATUS.SKIPPED]: '#909399',
  [PIPELINE_STATUS.UNKNOWN]: '#909399'
} as const

export const STORAGE_KEYS = {
  GITLAB_CONFIG: 'gitlabConfig',
  SELECTED_PROJECTS: 'selectedProjects',
  WINDOW_BOUNDS: 'windowBounds',
  LAST_PIPELINE_STATES: 'lastPipelineStates',
  APP_SETTINGS: 'appSettings'
} as const

export const DEFAULT_SETTINGS = {
  pollingInterval: 30000, // 30秒
  enableNotifications: true,
  enableSound: false,
  minimizeToTray: true,
  startMinimized: false
} as const

export const API_ENDPOINTS = {
  USER: '/user',
  PROJECTS: '/projects',
  PIPELINES: (projectId: number) => `/projects/${projectId}/pipelines`,
  PIPELINE_DETAIL: (projectId: number, pipelineId: number) => 
    `/projects/${projectId}/pipelines/${pipelineId}`
} as const