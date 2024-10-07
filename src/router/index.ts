import DataStatsPage from '@/pages/admin/DataStatsPage.vue'
import MessagePushPage from '@/pages/admin/MessagePushPage.vue'
import PermissionsPage from '@/pages/admin/PermissionsPage.vue'
import ProductManagementPage from '@/pages/admin/ProductManagementPage.vue'
import RewardSystemPage from '@/pages/admin/RewardSystemPage.vue'
import SystemLogsPage from '@/pages/admin/SystemLogsPage.vue'
import UserManagementPage from '@/pages/admin/UserManagementPage.vue'
import DashBoard from '@/pages/DashBoard.vue'
import LoginPage from '@/pages/LoginPage.vue'
import ProfilePage from '@/pages/ProfilePage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import HistoryPage from '@/pages/user/HistoryPage.vue'
import MessagePage from '@/pages/user/MessagePage.vue'
import ProductsPage from '@/pages/user/ProductsPage.vue'
import RewardsPage from '@/pages/user/RewardsPage.vue'
import TasksPage from '@/pages/user/TasksPage.vue'
import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
      children: [
        {
          path: '/login',
          component: LoginPage,
          meta: { requiresAuth: false, header: false, navbar: false },
        },
        {
          path: '/register',
          component: RegisterPage,
          meta: { requiresAuth: false, header: false, navbar: false },
        },
        {
          path: '/dashboard',
          component: DashBoard,
          meta: { requiresAuth: true },
        },
        {
          path: '/profile',
          component: ProfilePage,
          meta: { requiresAuth: true },
        },
        {
          path: '/rewards',
          component: RewardsPage,
          meta: { requiresAuth: true, role: 'user' },
        },
        {
          path: '/products',
          component: ProductsPage,
          meta: { requiresAuth: true, role: 'user' },
        },
        {
          path: '/tasks',
          component: TasksPage,
          meta: { requiresAuth: true, role: 'user' },
        },
        {
          path: '/history',
          component: HistoryPage,
          meta: { requiresAuth: true, role: 'user' },
        },
        {
          path: '/messages',
          component: MessagePage,
          meta: { requiresAuth: true, role: 'user' },
        },
        {
          path: '/admin',
          redirect: '/user-management',
          meta: { requiresAuth: true, role: 'admin' },
          children: [
            {
              path: '/user-management',
              component: UserManagementPage,
              meta: { requiresAuth: true, role: 'admin' },
            },
            {
              path: '/reward-system',
              component: RewardSystemPage,
              meta: { requiresAuth: true, role: 'admin' },
            },
            {
              path: '/product-management',
              component: ProductManagementPage,
              meta: { requiresAuth: true, role: 'admin' },
            },
            {
              path: '/data-stats',
              component: DataStatsPage,
              meta: { requiresAuth: true, role: 'admin' },
            },
            {
              path: '/message-push',
              component: MessagePushPage,
              meta: { requiresAuth: true, role: 'admin' },
            },
            {
              path: '/system-logs',
              component: SystemLogsPage,
              meta: { requiresAuth: true, role: 'admin' },
            },
            {
              path: '/permissions',
              component: PermissionsPage,
              meta: { requiresAuth: true, role: 'admin' },
            },
          ],
        },
      ],
    },
    {
      path: '/404',
      name: 'NotFound',
      component: {
        beforeRouteEnter(_to, _from, _next) {
          window.location.href = '/404.html'
        },
        render() {
          return null
        },
      },
      meta: { requiresAuth: false },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ],
})

// 修改路由守卫来判断用户的登录状态和角色
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore() // 获取 Pinia 中的认证状态
  const isAuthenticated = authStore.isAuthenticated
  const user = authStore.user

  // 判断路由是否需要登录
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  }
  else if (to.meta.role && user?.role !== to.meta.role) {
    next('/dashboard')
  }
  else {
    next()
  }
})

export default router
