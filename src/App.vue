<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useAppStore } from './stores/app'

const appStore = useAppStore()

// 监听来自主进程的事件
const handlePipelineStatusUpdate = (status: any[]) => {
  appStore.updateProjectStatus(status)
}

onMounted(() => {
  // 注册事件监听器
  if (window.electronAPI) {
    window.electronAPI.on('pipeline:statusUpdate', handlePipelineStatusUpdate)
    
    // 初始化应用状态
    appStore.initializeApp()
  }
})

onUnmounted(() => {
  // 清理事件监听器
  if (window.electronAPI) {
    window.electronAPI.off('pipeline:statusUpdate', handlePipelineStatusUpdate)
  }
})
</script>

<style>
#app {
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #f5f5f5;
}
</style>