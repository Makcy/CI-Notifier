import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface GitLabConfig {
  url: string
  token: string
  user?: any
}

export interface ProjectStatus {
  id: number
  name: string
  status: string
  web_url: string
  pipeline?: any
  lastUpdated: string
}

export const useAppStore = defineStore('app', () => {
  // 状态
  const gitlabConfig = ref<GitLabConfig | null>(null)
  const selectedProjects = ref<number[]>([])
  const projectStatus = ref<ProjectStatus[]>([])
  const isMonitoring = ref(false)
  const loading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => {
    return gitlabConfig.value !== null && gitlabConfig.value.token !== ''
  })

  const hasFailedProjects = computed(() => {
    return projectStatus.value.some((p: any) => p.status === 'failed')
  })

  const successfulProjects = computed(() => {
    return projectStatus.value.filter((p: any) => p.status === 'success')
  })

  const failedProjects = computed(() => {
    return projectStatus.value.filter((p: any) => p.status === 'failed')
  })

  // 动作
  const initializeApp = async () => {
    try {
      loading.value = true
      
      // 从本地存储恢复配置
      const savedConfig = await window.electronAPI.store.get('gitlabConfig')
      const savedProjects = await window.electronAPI.store.get('selectedProjects')
      
      if (savedConfig) {
        gitlabConfig.value = savedConfig
      }
      
      if (savedProjects) {
        selectedProjects.value = savedProjects
      }
    } catch (error) {
      console.error('Failed to initialize app:', error)
    } finally {
      loading.value = false
    }
  }

  const login = async (config: { url: string; token: string }) => {
    try {
      loading.value = true
      
      const result = await window.electronAPI.gitlab.login(config)
      
      if (result.success) {
        gitlabConfig.value = {
          ...config,
          user: result.user
        }
        
        // 保存到本地存储
        await window.electronAPI.store.set('gitlabConfig', gitlabConfig.value)
        
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      // 停止监控
      if (isMonitoring.value) {
        await stopMonitoring()
      }
      
      // 清除状态
      gitlabConfig.value = null
      selectedProjects.value = []
      projectStatus.value = []
      
      // 清除本地存储
      await window.electronAPI.store.set('gitlabConfig', null)
      await window.electronAPI.store.set('selectedProjects', [])
      
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  const setSelectedProjects = async (projectIds: number[]) => {
    selectedProjects.value = projectIds
    await window.electronAPI.store.set('selectedProjects', projectIds)
  }

  const startMonitoring = async () => {
    try {
      if (selectedProjects.value.length === 0) {
        throw new Error('No projects selected for monitoring')
      }
      
      const result = await window.electronAPI.gitlab.startMonitoring(selectedProjects.value)
      
      if (result.success) {
        isMonitoring.value = true
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  const stopMonitoring = async () => {
    try {
      await window.electronAPI.gitlab.stopMonitoring()
      isMonitoring.value = false
      projectStatus.value = []
    } catch (error) {
      console.error('Failed to stop monitoring:', error)
    }
  }

  const updateProjectStatus = (status: ProjectStatus[]) => {
    projectStatus.value = status
  }

  const checkAuthentication = async (): Promise<boolean> => {
    if (!gitlabConfig.value) {
      return false
    }
    
    try {
      // 可以在这里添加 token 验证逻辑
      return true
    } catch {
      return false
    }
  }

  const openProjectUrl = async (url: string) => {
    await window.electronAPI.shell.openExternal(url)
  }

  return {
    // 状态
    gitlabConfig,
    selectedProjects,
    projectStatus,
    isMonitoring,
    loading,
    
    // 计算属性
    isAuthenticated,
    hasFailedProjects,
    successfulProjects,
    failedProjects,
    
    // 动作
    initializeApp,
    login,
    logout,
    setSelectedProjects,
    startMonitoring,
    stopMonitoring,
    updateProjectStatus,
    checkAuthentication,
    openProjectUrl
  }
})