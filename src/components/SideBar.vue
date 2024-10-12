<script setup lang="ts">
import type { ItemType } from 'ant-design-vue'
import type { MenuItemType } from 'ant-design-vue/es/menu/src/hooks/useItems'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'
import {
  AppstoreOutlined,
  BarChartOutlined,
  HistoryOutlined,
  HomeOutlined,
  IdcardOutlined,
  LogoutOutlined,
  MessageOutlined,
  RobotOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingOutlined,
  TagsOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import { Avatar, Flex, Menu, Modal } from 'ant-design-vue'
import { h, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()

// 引入角色判断逻辑
const userRole = ref('user') // 'user' 或 'admin'

const route = useRoute()
const router = useRouter()

const selectedKeys = ref<string[]>(['/home'])
const openKeys = ref<string[]>(['/home'])

// 定义获取菜单项的函数
function getItem(
  label: string,
  key: string,
  icon?: any,
  children?: ItemType[],
  type?: 'group',
): ItemType {
  return {
    key,
    icon,
    children,
    label,
    type,
  }
}

// 用户端菜单
const userItems: ItemType[] = reactive([
  getItem(t('首页'), '/home', () => h(HomeOutlined)),
  // getItem(t('我的奖励'), '/rewards', () => h(GiftOutlined)),
  // getItem(t('推荐商品'), '/productList', () => h(ShopOutlined)),
  // getItem(t('购物任务'), '/tasks', () => h(BarChartOutlined)),
  getItem(t('浏览历史'), '/history', () => h(HistoryOutlined)),
  getItem(t('消息中心'), '/messages', () => h(MessageOutlined)),
  getItem(t('个人信息'), '/profile', () => h(IdcardOutlined)),
  getItem(t('设置'), '/setting', () => h(SettingOutlined)),
  getItem(t('安全退出'), '/exit', () => h(LogoutOutlined)),
])

// 管理员端菜单
const adminItems: ItemType[] = reactive([
  getItem(t('首页'), '/home', () => h(HomeOutlined)),
  getItem(t('购物车'), '/cart', () => h(ShopOutlined)),
  // getItem(t('用户管理'), '/user-management', () => h(UserOutlined)),
  // getItem(t('奖励系统'), '/reward-system', () => h(GiftOutlined)),
  // getItem(t('数据统计'), '/data-stats', () => h(BarChartOutlined)),
  // getItem(t('消息推送'), '/message-push', () => h(MessageOutlined)),
  // getItem(t('系统日志'), '/system-logs', () => h(HistoryOutlined)),
  getItem(t('管理'), '/', () => h(AppstoreOutlined), [
    getItem(t('仪表盘'), '/dashboard', () => h(BarChartOutlined)),
    getItem(t('机器人管理'), '/robot-management', () => h(RobotOutlined)),
    getItem(t('商品管理'), '/product-management', () => h(TagsOutlined)),
    getItem(t('商铺注册'), '/shop-register', () => h(ShoppingOutlined)),
  ]),

  getItem(t('个人信息'), '/profile', () => h(IdcardOutlined)),
  getItem(t('设置'), '/setting', () => h(SettingOutlined)),
  getItem(t('安全退出'), '/exit', () => h(LogoutOutlined)),
])

// 动态选择菜单项
const items = ref<ItemType[]>(userRole.value === 'user' ? userItems : adminItems)

watch(userRole, (newRole) => {
  items.value = newRole === 'user' ? userItems : adminItems
})

// 路由变化时更新 selectedKeys 和 openKeys
watch(route, () => {
  const path = route.path
  selectedKeys.value = [path]

  // 查找并展开对应的父菜单
  openKeys.value = items.value
    .filter((item) => {
      return item && 'children' in item && Array.isArray(item.children)
        && item.children.some(child => child?.key === path)
    })
    .map(item => item?.key) as string[]
})

const exitModel = ref(false)

// 点击菜单项时的导航处理
async function handleClick(item: MenuItemType) {
  const { key } = item
  if (key === '/exit') {
    exitModel.value = true
    return
  }
  await router.push(key as string)
}

async function exit() {
  await router.push('/login')
}

onMounted(() => {
  // 初始化 selectedKeys 和 openKeys
  const path = route.path
  selectedKeys.value = [path]
  openKeys.value = items.value
    .filter((item) => {
      return item && 'children' in item && Array.isArray(item.children)
        && item.children.some(child => child?.key === path)
    })
    .map(item => item?.key) as string[]

  // 获取用户角色
  userRole.value = useAuthStore().user?.role || 'user'
})
</script>

<template>
  <Flex vertical class="w-full h-full justify-between">
    <Flex vertical class="justify-between">
      <!-- 渲染动态菜单 -->
      <Menu
        v-model:selected-keys="selectedKeys"
        v-model:open-keys="openKeys"
        mode="inline"
        :items="items"
        :style="{ height: '100%', borderRight: 0 }"
        @click="handleClick"
      />
    </Flex>
    <!-- 底部用户信息 -->
    <Flex gap="middle" class="justify-center items-center transition-all">
      <Avatar :size="useConfigStore().collapsed ? 32 : 64" :src="useAuthStore().user?.avatar">
        <template v-if="!useAuthStore().user?.avatar" #icon>
          <UserOutlined />
        </template>
      </Avatar>
      <span v-if="!useConfigStore().collapsed" class="text-xl font-bold whitespace-nowrap">{{ useAuthStore().user?.username }}</span>
    </Flex>

    <Modal
      v-model:open="exitModel"
      centered
      :title="t('确认退出登录吗？')"
      :ok-text="t('确认')"
      :cancel-text="t('取消')"
      @ok="exit"
    />
  </Flex>
</template>

<style scoped lang="less">

</style>
