import ProductManagementPage from '@/pages/admin/ProductManagementPage.vue'
import RobotViewer from '@/pages/admin/RobotViewer.vue'
import ShopRegisterPage from '@/pages/admin/ShopRegisterPage.vue'
import CartPage from '@/pages/CartPage.vue'
import HistoryPage from '@/pages/HistoryPage.vue'
import HomePage from '@/pages/HomePage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import MessagePage from '@/pages/MessagePage.vue'
import ProfilePage from '@/pages/ProfilePage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import SettingPage from '@/pages/SettingPage.vue'
import ProductsPage from '@/pages/user/ProductsPage.vue'
import RewardsPage from '@/pages/user/RewardsPage.vue'
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
          path: '/home',
          component: HomePage,
          meta: { requiresAuth: true },
        },
        {
          path: '/cart',
          component: CartPage,
          meta: { requiresAuth: true },
        },
        {
          path: '/setting',
          component: SettingPage,
          meta: { requiresAuth: true },
        },
        {
          path: '/profile',
          component: ProfilePage,
          meta: { requiresAuth: true },
        },
        {
          path: '/history',
          component: HistoryPage,
          meta: { requiresAuth: true },
        },
        {
          path: '/messages',
          component: MessagePage,
          meta: { requiresAuth: true },
        },
        {
          path: '/rewards',
          component: RewardsPage,
          meta: { requiresAuth: true, role: 'user' },
        },
        {
          path: '/productList',
          component: ProductsPage,
          meta: { requiresAuth: true, role: 'user' },
        },
        {
          path: '/product-management',
          component: ProductManagementPage,
          meta: { requiresAuth: true, role: 'admin' },
        },
        {
          path: '/shop-register',
          component: ShopRegisterPage,
          meta: { requiresAuth: true, role: 'admin' },
        },
        {
          path: '/robot-management',
          component: RobotViewer,
          meta: { requiresAuth: true, role: 'admin' },
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
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
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
