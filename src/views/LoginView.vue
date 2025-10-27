<template>
  <div class="login-container">
    <div class="login-card">
      <div class="header">
        <h1>GitLab CI/CD Notifier</h1>
        <p>连接到您的 GitLab 实例以开始监控 CI/CD 流水线</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="GitLab 地址" prop="url">
          <el-input
            v-model="form.url"
            placeholder="https://gitlab.example.com"
            :disabled="loading"
          >
            <template #prefix>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="Access Token" prop="token">
          <el-input
            v-model="form.token"
            type="password"
            placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
            show-password
            :disabled="loading"
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%"
          >
            {{ loading ? '连接中...' : '连接 GitLab' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="help-text">
        <el-alert
          title="如何获取 Access Token"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <ol>
              <li>登录您的 GitLab 实例</li>
              <li>进入 User Settings → Access Tokens</li>
              <li>创建一个新的 Personal Access Token</li>
              <li>选择 <code>api</code> 和 <code>read_user</code> 权限</li>
              <li>复制生成的 token 并粘贴到上方</li>
            </ol>
          </template>
        </el-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { Link, Key } from '@element-plus/icons-vue'
import { useAppStore } from '../stores/app'

const router = useRouter()
const appStore = useAppStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  url: '',
  token: ''
})

const rules = {
  url: [
    { required: true, message: '请输入 GitLab 地址', trigger: 'blur' },
    { 
      pattern: /^https?:\/\/.+/, 
      message: '请输入有效的 URL (以 http:// 或 https:// 开头)', 
      trigger: 'blur' 
    }
  ],
  token: [
    { required: true, message: '请输入 Access Token', trigger: 'blur' },
    { min: 20, message: 'Token 长度至少为 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true

    // 清理 URL，移除末尾的斜杠
    const cleanUrl = form.url.replace(/\/$/, '')

    const result = await appStore.login({
      url: cleanUrl,
      token: form.token
    })

    if (result.success) {
      ElMessage.success('连接成功！')
      router.push('/projects')
    } else {
      ElMessage.error(result.error || '连接失败，请检查您的配置')
    }
  } catch (error) {
    ElMessage.error('连接失败，请检查网络连接和配置')
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 500px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #303133;
  margin-bottom: 10px;
  font-size: 28px;
  font-weight: 600;
}

.header p {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.help-text {
  margin-top: 20px;
}

.help-text ol {
  margin: 10px 0 0 20px;
  font-size: 13px;
  line-height: 1.6;
}

.help-text code {
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 12px;
}
</style>