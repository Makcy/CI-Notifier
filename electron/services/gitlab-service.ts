// @ts-nocheck
import axios from 'axios'

class GitLabService {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl
    this.token = token
    this.monitoringInterval = null
    this.isMonitoring = false
    
    this.api = axios.create({
      baseURL: `${baseUrl}/api/v4`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    })
  }

  // 获取当前用户信息
  async getCurrentUser() {
    try {
      const response = await this.api.get('/user')
      return response.data
    } catch (error) {
      throw new Error(`Failed to get user info: ${error.message}`)
    }
  }

  // 获取用户可访问的项目列表
  async getProjects() {
    try {
      const response = await this.api.get('/projects', {
        params: {
          membership: true,
          per_page: 100,
          order_by: 'last_activity_at',
          sort: 'desc'
        }
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to get projects: ${error.message}`)
    }
  }

  // 获取项目的最新流水线
  async getLatestPipeline(projectId) {
    try {
      const response = await this.api.get(`/projects/${projectId}/pipelines`, {
        params: {
          per_page: 1,
          order_by: 'updated_at',
          sort: 'desc'
        }
      })
      
      if (response.data.length === 0) {
        return null
      }
      
      const pipeline = response.data[0]
      
      // 获取流水线详细信息
      const detailResponse = await this.api.get(`/projects/${projectId}/pipelines/${pipeline.id}`)
      return detailResponse.data
    } catch (error) {
      console.warn(`Failed to get pipeline for project ${projectId}:`, error.message)
      return null
    }
  }

  // 获取多个项目的状态
  async getProjectsStatus(projectIds) {
    const projects = await this.getProjects()
    const selectedProjects = projects.filter(p => projectIds.indexOf(p.id) !== -1)
    
    const statusPromises = selectedProjects.map(async (project) => {
      const pipeline = await this.getLatestPipeline(project.id)
      
      return {
        id: project.id,
        name: project.name,
        status: pipeline && pipeline.status || 'unknown',
        web_url: pipeline && pipeline.web_url || project.web_url,
        pipeline,
        lastUpdated: new Date().toISOString()
      }
    })
    
    const results = []
    for (const promise of statusPromises) {
      try {
        const result = await promise
        results.push(result)
      } catch (error) {
        console.error('Failed to get project status:', error)
      }
    }
    
    return results
  }

  // 开始监控项目
  startMonitoring(projectIds, onStatusUpdate, intervalMs = 30000) {
    if (this.isMonitoring) {
      this.stopMonitoring()
    }
    
    this.isMonitoring = true
    
    // 立即执行一次
    this.getProjectsStatus(projectIds)
      .then(onStatusUpdate)
      .catch(error => console.error('Failed to get initial status:', error))
    
    // 设置定时轮询
    this.monitoringInterval = setInterval(async () => {
      if (!this.isMonitoring) return
      
      try {
        const status = await this.getProjectsStatus(projectIds)
        onStatusUpdate(status)
      } catch (error) {
        console.error('Failed to get project status:', error)
      }
    }, intervalMs)
    
    console.log(`Started monitoring ${projectIds.length} projects with ${intervalMs}ms interval`)
  }

  // 停止监控
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    this.isMonitoring = false
    console.log('Stopped monitoring projects')
  }

  // 测试连接
  async testConnection() {
    try {
      await this.getCurrentUser()
      return true
    } catch {
      return false
    }
  }
}

export { GitLabService }