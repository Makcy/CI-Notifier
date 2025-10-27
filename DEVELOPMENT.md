# 开发指南

本文档为 GitLab CI/CD Notifier 的开发者提供详细的开发指南。

## 🏗️ 开发环境搭建

### 前置要求

- Node.js 18.0.0 或更高版本
- npm 9.0.0 或更高版本
- Git
- 代码编辑器（推荐 VS Code）

### 推荐的 VS Code 扩展

```json
{
  "recommendations": [
    "vue.volar",
    "vue.typescript-vue-plugin",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### 环境配置

1. **克隆仓库**
```bash
git clone https://github.com/your-username/gitlab-ci-notifier.git
cd gitlab-ci-notifier
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run electron:serve
```

## 📁 项目结构详解

```
gitlab-ci-notifier/
├── src/                          # Vue 3 前端源码
│   ├── components/               # 可复用组件
│   │   ├── common/              # 通用组件
│   │   └── business/            # 业务组件
│   ├── views/                   # 页面视图
│   │   ├── LoginView.vue        # 登录页面
│   │   ├── ProjectSelectionView.vue  # 项目选择页面
│   │   └── DashboardView.vue    # 主仪表板
│   ├── stores/                  # Pinia 状态管理
│   │   └── app.ts              # 应用主状态
│   ├── services/               # 前端服务层
│   │   └── api.ts              # API 服务
│   ├── utils/                  # 工具函数
│   │   ├── constants.ts        # 常量定义
│   │   └── helpers.ts          # 辅助函数
│   ├── types/                  # TypeScript 类型定义
│   │   └── electron.d.ts       # Electron API 类型
│   ├── assets/                 # 静态资源
│   ├── router/                 # Vue Router 配置
│   ├── App.vue                 # 根组件
│   └── main.ts                 # 应用入口
├── electron/                   # Electron 主进程
│   ├── main.ts                 # 主进程入口
│   ├── preload.ts              # 预加载脚本
│   └── services/               # 后端服务
│       ├── gitlab-service.ts   # GitLab API 服务
│       ├── notification-service.ts  # 通知服务
│       └── tray-service.ts     # 托盘服务
├── public/                     # 公共静态资源
├── build/                      # 构建配置和资源
├── release/                    # 打包输出目录
├── package.json                # 项目配置
├── vite.config.ts             # Vite 配置
├── tsconfig.json              # TypeScript 配置
└── electron-builder.config.js # 打包配置
```

## 🔧 开发工作流

### 1. 代码规范

项目使用 TypeScript + ESLint + Prettier 确保代码质量：

```bash
# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run type-check
```

### 2. 开发模式

```bash
# 启动完整开发环境（推荐）
npm run electron:serve

# 仅启动 Web 开发服务器
npm run dev

# 仅启动 Electron（需要先启动 Web 服务器）
npm run electron
```

### 3. 构建流程

```bash
# 构建 Web 资源
npm run build:web

# 构建 Electron 应用
npm run build:electron

# 完整构建
npm run build
```

## 🏛️ 架构设计

### 进程通信架构

```
┌─────────────────┐    IPC     ┌─────────────────┐
│   Renderer      │◄──────────►│   Main Process  │
│   Process       │            │                 │
│                 │            │                 │
│ ┌─────────────┐ │            │ ┌─────────────┐ │
│ │ Vue 3 App   │ │            │ │ Window Mgmt │ │
│ │             │ │            │ │             │ │
│ │ ┌─────────┐ │ │            │ │ ┌─────────┐ │ │
│ │ │ Stores  │ │ │            │ │ │ Tray    │ │ │
│ │ └─────────┘ │ │            │ │ └─────────┘ │ │
│ │             │ │            │ │             │ │
│ │ ┌─────────┐ │ │            │ │ ┌─────────┐ │ │
│ │ │ Views   │ │ │            │ │ │Services │ │ │
│ │ └─────────┘ │ │            │ │ └─────────┘ │ │
│ └─────────────┘ │            │ └─────────────┘ │
└─────────────────┘            └─────────────────┘
```

### 数据流架构

```
GitLab API ──► GitLab Service ──► Main Process ──► IPC ──► Renderer Process ──► Pinia Store ──► Vue Components
     ▲                                                                                │
     │                                                                                │
     └────────────────── Polling Timer ◄─────────────────────────────────────────────┘
```

## 🔌 API 设计

### IPC 通信接口

主进程暴露的 API 接口：

```typescript
interface ElectronAPI {
  // 存储相关
  store: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<boolean>
  }
  
  // GitLab 相关
  gitlab: {
    login: (config: GitLabConfig) => Promise<LoginResult>
    getProjects: () => Promise<ProjectsResult>
    startMonitoring: (projectIds: number[]) => Promise<MonitoringResult>
    stopMonitoring: () => Promise<MonitoringResult>
  }
  
  // 系统相关
  shell: {
    openExternal: (url: string) => Promise<void>
  }
  
  // 窗口控制
  window: {
    minimize: () => Promise<void>
    hide: () => Promise<void>
    close: () => Promise<void>
  }
  
  // 事件监听
  on: (channel: string, callback: Function) => void
  off: (channel: string, callback: Function) => void
}
```

### GitLab API 集成

```typescript
class GitLabService {
  // 用户认证
  async getCurrentUser(): Promise<GitLabUser>
  
  // 项目管理
  async getProjects(): Promise<GitLabProject[]>
  
  // 流水线监控
  async getLatestPipeline(projectId: number): Promise<GitLabPipeline>
  async getProjectsStatus(projectIds: number[]): Promise<ProjectStatus[]>
  
  // 监控控制
  startMonitoring(projectIds: number[], callback: Function, interval?: number): void
  stopMonitoring(): void
}
```

## 🎨 UI 组件开发

### 组件规范

1. **文件命名**: 使用 PascalCase，如 `ProjectCard.vue`
2. **组件结构**:
```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 组合式 API
</script>

<style scoped>
/* 样式 */
</style>
```

3. **Props 定义**:
```typescript
interface Props {
  title: string
  status?: 'success' | 'failed' | 'running'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  status: 'success',
  disabled: false
})
```

### 状态管理

使用 Pinia 进行状态管理：

```typescript
export const useAppStore = defineStore('app', () => {
  // 状态
  const state = ref(initialState)
  
  // 计算属性
  const computed = computed(() => derivedState)
  
  // 动作
  const actions = {
    async fetchData() {
      // 异步操作
    }
  }
  
  return {
    state,
    computed,
    ...actions
  }
})
```

## 🧪 测试策略

### 单元测试

```bash
# 运行单元测试
npm run test:unit

# 测试覆盖率
npm run test:coverage
```

### E2E 测试

```bash
# 运行端到端测试
npm run test:e2e
```

### 测试文件结构

```
tests/
├── unit/                 # 单元测试
│   ├── components/       # 组件测试
│   ├── stores/          # 状态管理测试
│   └── utils/           # 工具函数测试
├── e2e/                 # 端到端测试
│   ├── specs/           # 测试规范
│   └── fixtures/        # 测试数据
└── helpers/             # 测试辅助函数
```

## 🚀 部署和发布

### 版本管理

使用语义化版本控制：

```bash
# 补丁版本（bug 修复）
npm version patch

# 次要版本（新功能）
npm version minor

# 主要版本（破坏性更改）
npm version major
```

### 构建流水线

```bash
# 1. 代码检查
npm run lint

# 2. 类型检查
npm run type-check

# 3. 单元测试
npm run test:unit

# 4. 构建应用
npm run build

# 5. E2E 测试
npm run test:e2e

# 6. 打包分发
npm run dist
```

### 发布检查清单

- [ ] 代码通过所有测试
- [ ] 版本号已更新
- [ ] CHANGELOG 已更新
- [ ] 构建成功无错误
- [ ] 在目标平台测试通过
- [ ] 代码签名配置正确

## 🐛 调试技巧

### 主进程调试

```bash
# 启动调试模式
npm run electron:debug
```

### 渲染进程调试

在应用中按 `F12` 打开开发者工具。

### 日志记录

```typescript
// 主进程日志
console.log('Main process log')

// 渲染进程日志
console.log('Renderer process log')

// 生产环境日志
import log from 'electron-log'
log.info('Production log')
```

## 📚 学习资源

- [Electron 官方文档](https://electronjs.org/docs)
- [Vue 3 官方文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Vite 文档](https://vitejs.dev/)

## 🤝 贡献规范

### 提交信息格式

```
type(scope): description

[optional body]

[optional footer]
```

类型说明：
- `feat`: 新功能
- `fix`: bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### Pull Request 流程

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request
5. 代码审查
6. 合并到主分支

---

如有任何开发相关问题，请查阅文档或提交 Issue。