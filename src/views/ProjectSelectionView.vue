<template>
  <div class="project-selection">
    <div class="header">
      <div class="title-section">
        <h1>选择监控项目</h1>
        <p>选择您希望监控 CI/CD 流水线状态的项目</p>
      </div>
      <div class="actions">
        <el-button @click="handleLogout" type="text">
          <el-icon><SwitchButton /></el-icon>
          切换账户
        </el-button>
      </div>
    </div>

    <div class="content">
      <div class="search-section">
        <el-input
          v-model="searchText"
          placeholder="搜索项目..."
          :prefix-icon="Search"
          clearable
          style="width: 300px"
        />
        <el-button
          type="primary"
          :disabled="selectedProjectIds.length === 0"
          @click="handleStartMonitoring"
          :loading="startingMonitoring"
        >
          开始监控 ({{ selectedProjectIds.length }})
        </el-button>
      </div>

      <div class="projects-container">
        <el-loading v-if="loading" text="加载项目中...">
          <div style="height: 400px"></div>
        </el-loading>

        <div v-else-if="filteredProjects.length === 0" class="empty-state">
          <el-empty description="没有找到项目" />
        </div>

        <div v-else class="projects-grid">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="project-card"
            :class="{ selected: selectedProjectIds.includes(project.id) }"
            @click="toggleProject(project.id)"
          >
            <div class="project-header">
              <div class="project-info">
                <h3>{{ project.name }}</h3>
                <p>{{ project.path_with_namespace }}</p>
              </div>
              <el-checkbox
                :model-value="selectedProjectIds.includes(project.id)"
                @change="toggleProject(project.id)"
                @click.stop
              />
            </div>
            <div class="project-actions">
              <el-button
                type="text"
                size="small"
                @click.stop="openProject(project.web_url)"
              >
                <el-icon><ExternalLink /></el-icon>
                查看项目
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, SwitchButton, ExternalLink } from '@element-plus/icons-vue'
import { useAppStore } from '../stores/app'

interface GitLabProject {
  id: number
  name: string
  path_with_namespace: string
  web_url: string
  default_branch: string
}

const router = useRouter()
const appStore = useAppStore()

const loading = ref(false)
const startingMonitoring = ref(false)
const searchText = ref('')
const projects = ref<GitLabProject[]>([])
const selectedProjectIds = ref<number[]>([])

const filteredProjects = computed(() => {
  if (!searchText.value) return projects.value
  
  const search = searchText.value.toLowerCase()
  return projects.value.filter((project: any) =>
    project.name.toLowerCase().includes(search) ||
    project.path_with_namespace.toLowerCase().includes(search)
  )
})

const loadProjects = async () => {
  try {
    loading.value = true
    
    const result = await window.electronAPI.gitlab.getProjects()
    
    if (result.success) {
      projects.value = result.projects || []
      
      // 恢复之前选择的项目
      selectedProjectIds.value = [...appStore.selectedProjects]
    } else {
      ElMessage.error(result.error || '加载项目失败')
    }
  } catch (error) {
    ElMessage.error('加载项目失败，请检查网络连接')
    console.error('Load projects error:', error)
  } finally {
    loading.value = false
  }
}

const toggleProject = (projectId: number) => {
  const index = selectedProjectIds.value.indexOf(projectId)
  if (index > -1) {
    selectedProjectIds.value.splice(index, 1)
  } else {
    selectedProjectIds.value.push(projectId)
  }
}

const handleStartMonitoring = async () => {
  if (selectedProjectIds.value.length === 0) {
    ElMessage.warning('请至少选择一个项目')
    return
  }

  try {
    startingMonitoring.value = true
    
    // 保存选择的项目
    await appStore.setSelectedProjects(selectedProjectIds.value)
    
    // 开始监控
    const result = await appStore.startMonitoring()
    
    if (result.success) {
      ElMessage.success('开始监控项目')
      router.push('/dashboard')
    } else {
      ElMessage.error(result.error || '启动监控失败')
    }
  } catch (error) {
    ElMessage.error('启动监控失败')
    console.error('Start monitoring error:', error)
  } finally {
    startingMonitoring.value = false
  }
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
  loadProjects()
})
</script>

<style scoped>
.project-selection {
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
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.projects-container {
  flex: 1;
  overflow: auto;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.project-card {
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.project-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.project-card.selected {
  border-color: #409eff;
  background: #f0f9ff;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.project-info h3 {
  margin: 0 0 4px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.project-info p {
  margin: 0;
  color: #909399;
  font-size: 13px;
}

.project-actions {
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>