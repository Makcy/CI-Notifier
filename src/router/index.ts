import { createRouter, createWebHashHistory } from 'vue-router'
import { useAppStore } from '../stores/app'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/projects',
      name: 'Projects',
      component: () => import('../views/ProjectSelectionView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫
router.beforeEach(async (to: any, from: any, next: any) => {
  const appStore = useAppStore()
  
  // 检查是否需要认证
  if (to.meta && to.meta.requiresAuth) {
    const isAuthenticated = await appStore.checkAuthentication()
    if (!isAuthenticated) {
      next('/login')
      return
    }
  }
  
  next()
})

export default router