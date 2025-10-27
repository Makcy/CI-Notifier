# GitLab CI/CD Notifier

一款兼容 macOS 和 Windows 的桌面应用，用于监控私有化部署的 GitLab 项目的 CI/CD 流水线状态。当检测到流水线状态变化时，会自动发送桌面通知。

## ✨ 功能特性

- 🔐 **安全登录**: 支持 GitLab Access Token 认证
- 📊 **实时监控**: 自动轮询监控选定项目的 CI/CD 状态
- 🔔 **桌面通知**: 流水线状态变化时发送系统通知
- 🎯 **系统托盘**: 最小化到托盘，快速查看项目状态
- 🎨 **现代界面**: 基于 Element Plus 的美观用户界面
- 🌐 **跨平台**: 支持 macOS 和 Windows 系统
- ⚡ **高性能**: 基于 Electron + Vue 3 + TypeScript

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn
- GitLab 实例（支持 API v4）

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/your-username/gitlab-ci-notifier.git
cd gitlab-ci-notifier

# 安装依赖
npm install
```

### 开发模式

```bash
# 启动开发服务器
npm run electron:serve
```

### 构建应用

```bash
# 构建 Web 资源
npm run build:web

# 构建 Electron 应用
npm run build:electron

# 一键构建（推荐）
npm run build
```

## 📖 使用指南

### 1. 首次配置

1. **启动应用**: 双击应用图标或从命令行启动
2. **GitLab 登录**: 
   - 输入您的 GitLab 实例地址（如：`https://gitlab.example.com`）
   - 输入 Personal Access Token
3. **获取 Access Token**:
   - 登录 GitLab → User Settings → Access Tokens
   - 创建新 Token，选择 `api` 和 `read_user` 权限
   - 复制生成的 Token

### 2. 项目选择

1. **浏览项目**: 登录成功后会显示您有权限访问的项目列表
2. **选择监控项目**: 勾选希望监控的项目
3. **开始监控**: 点击"开始监控"按钮

### 3. 监控面板

- **状态概览**: 查看成功/失败/运行中的项目数量
- **项目列表**: 显示每个项目的详细状态信息
- **实时更新**: 状态会自动刷新（默认30秒间隔）

### 4. 系统托盘

- **图标状态**:
  - 🟢 绿色：所有项目成功
  - 🔴 红色：存在失败项目
  - 🔵 蓝色：有项目正在运行
- **右键菜单**: 快速访问项目状态和应用功能
- **点击托盘**: 显示/隐藏主窗口

## 🛠️ 技术架构

### 技术栈

- **桌面框架**: Electron 28+
- **前端框架**: Vue 3.4+ + Vite 5+
- **UI 组件库**: Element Plus 2.4+
- **状态管理**: Pinia 2.1+
- **开发语言**: TypeScript 5+
- **HTTP 客户端**: Axios 1.6+
- **本地存储**: electron-store 8+
- **打包工具**: electron-builder 24+

### 项目结构

```
gitlab-ci-notifier/
├── src/                    # Vue 前端源码
│   ├── components/         # Vue 组件
│   ├── views/             # 页面视图
│   ├── stores/            # Pinia 状态管理
│   ├── services/          # 前端服务层
│   ├── utils/             # 工具函数
│   └── types/             # TypeScript 类型定义
├── electron/              # Electron 主进程
│   ├── main.ts            # 主进程入口
│   ├── preload.ts         # 预加载脚本
│   └── services/          # 后端服务
├── public/                # 静态资源
├── build/                 # 构建资源
└── release/               # 打包输出
```

### 核心模块

1. **主进程 (Main Process)**
   - 窗口管理
   - 系统托盘
   - IPC 通信
   - 系统通知

2. **渲染进程 (Renderer Process)**
   - Vue 3 应用
   - 用户界面
   - 状态管理

3. **GitLab 服务**
   - API 调用
   - 数据轮询
   - 状态监控

4. **通知服务**
   - 桌面通知
   - 托盘更新
   - 状态变化检测

## 🔧 配置选项

### 应用设置

可以通过修改 `src/utils/constants.ts` 调整以下配置：

```typescript
export const DEFAULT_SETTINGS = {
  pollingInterval: 30000,    // 轮询间隔（毫秒）
  enableNotifications: true, // 启用通知
  enableSound: false,        // 启用声音
  minimizeToTray: true,      // 最小化到托盘
  startMinimized: false      // 启动时最小化
}
```

### 构建配置

修改 `electron-builder.config.js` 可以自定义：

- 应用图标和名称
- 安装程序配置
- 代码签名设置
- 自动更新配置

## 📦 打包分发

### macOS

```bash
# 构建 DMG 安装包
npm run build

# 输出文件
release/GitLab CI Notifier-1.0.0.dmg
release/GitLab CI Notifier-1.0.0-mac.zip
```

### Windows

```bash
# 构建 Windows 安装包
npm run build

# 输出文件
release/GitLab CI Notifier Setup 1.0.0.exe
release/GitLab CI Notifier 1.0.0.exe (便携版)
```

### 代码签名

为了避免系统安全警告，建议对应用进行代码签名：

**macOS**:
```bash
# 设置开发者证书
export CSC_NAME="Developer ID Application: Your Name"
npm run build
```

**Windows**:
```bash
# 设置代码签名证书
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="certificate_password"
npm run build
```

## 🐛 故障排除

### 常见问题

1. **无法连接 GitLab**
   - 检查网络连接
   - 验证 GitLab 地址是否正确
   - 确认 Access Token 权限

2. **通知不显示**
   - 检查系统通知权限
   - 确认应用未被静音

3. **托盘图标不显示**
   - 确保图标文件存在于 `public/` 目录
   - 检查系统托盘设置

4. **应用启动失败**
   - 查看控制台错误信息
   - 确认 Node.js 版本兼容性

### 日志调试

开发模式下可以查看详细日志：

```bash
# 启动开发模式
npm run electron:serve

# 查看主进程日志
# 在终端中显示

# 查看渲染进程日志
# 在应用中按 F12 打开开发者工具
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Electron](https://electronjs.org/) - 跨平台桌面应用框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [GitLab](https://gitlab.com/) - DevOps 平台

## 📞 支持

如果您在使用过程中遇到问题，可以通过以下方式获取帮助：

- 📧 邮箱: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/gitlab-ci-notifier/issues)
- 📖 文档: [项目文档](https://github.com/your-username/gitlab-ci-notifier/wiki)

---

⭐ 如果这个项目对您有帮助，请给我们一个 Star！