import DashBoard from '@/pages/DashBoard.vue'
import LoginPage from '@/pages/LoginPage.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      component: LoginPage,
    },
    {
      path: '/dashboard',
      component: DashBoard,
    },
  ],
})

export default router
