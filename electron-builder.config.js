/**
 * @type {import('electron-builder').Configuration}
 */
export default {
  appId: 'com.yourcompany.gitlab-ci-notifier',
  productName: 'GitLab CI Notifier',
  copyright: 'Copyright © 2024 Your Company',
  
  directories: {
    output: 'release',
    buildResources: 'build'
  },
  
  files: [
    'dist/**/*',
    'dist-electron/**/*',
    'node_modules/**/*',
    'package.json'
  ],
  
  extraResources: [
    {
      from: 'public/icons',
      to: 'icons',
      filter: ['**/*']
    }
  ],
  
  // macOS 配置
  mac: {
    category: 'public.app-category.developer-tools',
    icon: 'build/icon.icns',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64']
      }
    ],
    darkModeSupport: true,
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist'
  },
  
  // Windows 配置
  win: {
    icon: 'build/icon.ico',
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      },
      {
        target: 'portable',
        arch: ['x64']
      }
    ],
    publisherName: 'Your Company',
    verifyUpdateCodeSignature: false
  },
  
  // Linux 配置
  linux: {
    icon: 'build/icon.png',
    category: 'Development',
    target: [
      {
        target: 'AppImage',
        arch: ['x64']
      },
      {
        target: 'deb',
        arch: ['x64']
      }
    ]
  },
  
  // NSIS 安装程序配置 (Windows)
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    allowElevation: true,
    installerIcon: 'build/icon.ico',
    uninstallerIcon: 'build/icon.ico',
    installerHeaderIcon: 'build/icon.ico',
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'GitLab CI Notifier'
  },
  
  // DMG 配置 (macOS)
  dmg: {
    title: 'GitLab CI Notifier',
    icon: 'build/icon.icns',
    background: 'build/dmg-background.png',
    contents: [
      {
        x: 130,
        y: 220
      },
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications'
      }
    ],
    window: {
      width: 540,
      height: 380
    }
  },
  
  // 发布配置
  publish: {
    provider: 'github',
    owner: 'your-username',
    repo: 'gitlab-ci-notifier',
    private: false
  },
  
  // 自动更新配置
  autoUpdater: {
    provider: 'github',
    owner: 'your-username',
    repo: 'gitlab-ci-notifier'
  },
  
  // 压缩配置
  compression: 'maximum',
  
  // 构建前脚本
  beforeBuild: async (context) => {
    console.log('Building application...')
  },
  
  // 构建后脚本
  afterSign: async (context) => {
    console.log('Application signed successfully')
  }
}