<template>
  <div class="dashboard">
    <div class="header">
      <div class="title-section">
        <h1>CI/CD 监控仪表板</h1>
        <p>实时监控您选择的项目流水线状态</p>
      </div>
      <div class="actions">
        <el-button @click="goToProjectSelection" type="text">
          <el-icon><Setting /></el-icon>
          项目设置
        </el-button>
        <el-button @click="handleLogout" type="text">
          <el-icon><SwitchButton /></el-icon>
          切换账户
        </el-button>
      </div>
    </div>

    <div class="content">
      <!-- 状态概览 -->
      <div class="overview-cards">
        <div class="overview-card success">
          <div class="card-icon">
            <el-icon><SuccessFilled /></el-icon>
          </div>
          <div class="card-content">
            <h3>{{ successfulProjects.length }}</h3>
            <p>成功项目</p>
          </div>
        </div>
        
        <div class="overview-card failed">
          <div class="card-icon">
            <el-icon><CircleCloseFilled /></el-icon>
          </div>
          <div class="card-content">
            <h3>{{ failedProjects.length }}</h3>
            <p>失败项目</p>
          </div>
        </div>
        
        <div class="overview-card total">
          <div class="card-icon">
            <el-icon><DataBoard /></el-icon>
          </div>
          <div class="card-content">
            <h3>{{ projectStatus.length }}</h3>
            <p>监控项目</p>
          </div>
        </div>
        
        <div class="overview-card monitoring" :class="{ active: isMonitoring }">
          <div class="card-icon">
            <el-icon><View /></el-icon>
          </div>
          <div class="card-content">
            <h3>{{ isMonitoring ? '运行中' : '已停止' }}</h3>
            <p>监控状态</p>
          </div>
        </div>
      </div>

      <!-- 项目列表 -->
      <div class="projects-section">
        <div class="section-header">
          <h2>项目状态</h2>
          <div class="controls">
            <el-button
              v-if="!isMonitoring"
              type="primary"
              @click="startMonitoring"
              :loading="loading"
            >
              开始监控
            </el-button>
            <el-button
              v-else
              type="danger"
              @click="stopMonitoring"
              :loading="loading"
            >
              停止监控
            </el-button>
            <el-button @click="refreshStatus" :loading="loading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>

        <div v-if="projectStatus.length === 0" class="empty-state">
          <el-empty description="暂无监控项目">
            <el-button type="primary" @click="goToProjectSelection">
              选择项目
            </el-button>
          </el-empty>
        </div>

        <div v-else class="projects-list">
          <div
            v-for="project in projectStatus"
            :key="project.id"
            class="project-item"
            :class="project.status"
          >
            <div class="project-info">
              <div class="project-header">
                <h3>{{ project.name }}</h3>
                <el-tag
                  :type="getStatusTagType(project.status)"
                  size="small"
                >
                  {{ getStatusText(project.status) }}
                </el-tag>
              </div>
              
              <div v-if="project.pipeline" class="pipeline-info">
                <p>
                  <span class="label">分支:</span>
                  <span>{{ project.pipeline.ref }}</span>
                </p>
                <p>
                  <span class="label">触发人:</span>
                  <span>{{ project.pipeline.user?.name || '未知' }}</span>
                </p>
                <p>
                  <span class="label">更新时间:</span>
                  <span>{{ formatTime(project.pipeline.updated_at) }}</span>
                </p>
              </div>
            </div>
            
            <div class="project-actions">
              <el-button
                type="text"
                @click="openProject(project.web_url)"
              >
                <el-icon><ExternalLink /></el-icon>
                查看详情
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting,
  SwitchButton,
  SuccessFilled,
  CircleCloseFilled,
  DataBoard,
  View,
  Refresh,
  ExternalLink
} from '@element-plus/icons-vue'
import { useAppStore } from '../stores/app'

const router = useRouter()
const appStore = useAppStore()

// 计算属性
const projectStatus = computed(() => appStore.projectStatus)
const isMonitoring = computed(() => appStore.isMonitoring)
const loading = computed(() => appStore.loading)
const successfulProjects = computed(() => appStore.successfulProjects)
const failedProjects = computed(() => appStore.failedProjects)

// 方法
const getStatusTagType = (status: string) => {
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

const getStatusText = (status: string) => {
  switch (status) {
    case 'success':
      return '成功'
    case 'failed':
      return '失败'
    case 'running':
      return '运行中'
    case 'pending':
      return '等待中'
    case 'canceled':
      return '已取消'
    case 'skipped':
      return '已跳过'
    default:
      return '未知'
  }
}

const formatTime = (timeString: string) => {
  try {
    const date = new Date(timeString)
    return date.toLocaleString('zh-CN')
  } catch {
    return '未知时间'
  }
}

const startMonitoring = async () => {
  const result = await appStore.startMonitoring()
  if (result.success) {
    ElMessage.success('开始监控')
  } else {
    ElMessage.error(result.error || '启动监控失败')
  }
}

const stopMonitoring = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要停止监控吗？',
      '确认停止',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await appStore.stopMonitoring()
    ElMessage.success('已停止监控')
  } catch {
    // 用户取消
  }
}

const refreshStatus = async () => {
  if (isMonitoring.value) {
    ElMessage.info('监控运行中，状态会自动更新')
  } else {
    ElMessage.info('请先开始监控以获取最新状态')
  }
}

const goToProjectSelection = () => {
  router.push('/projects')
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要切换账户吗？这将停止当前的监控。',
      '确认切换',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await appStore.logout()
    router.push('/login')
  } catch {
    // 用户取消
  }
}

const openProject = async (url: string) => {
  await appStore.openProjectUrl(url)
}

onMounted(() => {
  // 如果没有选择项目，跳转到项目选择页面
  if (appStore.selectedProjects.length === 0) {
    router.push('/projects')
  }
})
</script>

<style scoped>
.dashboard {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.header {
  background: white;
  padding: 20px 30px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section h1 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.title-section p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.content {
  flex: 1;
  padding: 20px 30px;
  overflow: auto;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.overview-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.overview-card.success {
  border-left: 4px solid #67c23a;
}

.overview-card.failed {
  border-left: 4px solid #f56c6c;
}

.overview-card.total {
  border-left: 4px solid #409eff;
}

.overview-card.monitoring {
  border-left: 4px solid #909399;
}

.overview-card.monitoring.active {
  border-left-color: #67c23a;
}

.card-icon {
  font-size: 32px;
  margin-right: 16px;
  color: #909399;
}

.overview-card.success .card-icon {
  color: #67c23a;
}

.overview-card.failed .card-icon {
  color: #f56c6c;
}

.overview-card.total .card-icon {
  color: #409eff;
}

.overview-card.monitoring.active .card-icon {
  color: #67c23a;
}

.card-content h3 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.card-content p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.projects-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.section-header h2 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.2s;
}

.project-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.project-item.success {
  border-left: 4px solid #67c23a;
}

.project-item.failed {
  border-left: 4px solid #f56c6c;
}

.project-item.running {
  border-left: 4px solid #e6a23c;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.project-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.pipeline-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.pipeline-info p {
  margin: 0;
  font-size: 13px;
  color: #606266;
}

.pipeline-info .label {
  font-weight: 500;
  margin-right: 4px;
}
</style>