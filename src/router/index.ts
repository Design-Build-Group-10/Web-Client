import DashBoard from '@/pages/DashBoard.vue'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
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
        },
        {
          path: '/register',
          component: RegisterPage,
        },
      ],
    },
    {
      path: '/dashboard',
      component: DashBoard,
    },
  ],
})

export default router
