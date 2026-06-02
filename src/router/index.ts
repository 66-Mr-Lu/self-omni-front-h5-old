import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'

// 导入功能页面（懒加载）
const OpsPage = () => import('@/views/OpsPage.vue')
const ToolsPage = () => import('@/views/ToolsPage.vue')
const DownloadPage = () => import('@/views/DownloadPage.vue')
const ControlPage = () => import('@/views/ControlPage.vue')

// 功能详情页面（懒加载）
const FeaturePage = () => import('@/views/FeaturePage.vue')

// 静态路由
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        path: '',
        redirect: 'ops'
      },
      {
        path: 'ops',
        name: 'Ops',
        component: OpsPage,
        meta: { categoryId: 'ops' }
      },
      {
        path: 'tools',
        name: 'Tools',
        component: ToolsPage,
        meta: { categoryId: 'tools' }
      },
      {
        path: 'download',
        name: 'Download',
        component: DownloadPage,
        meta: { categoryId: 'download' }
      },
      {
        path: 'control',
        name: 'Control',
        component: ControlPage,
        meta: { categoryId: 'control' }
      },
      // 功能详情页路由
      {
        path: 'feature/:action',
        name: 'Feature',
        component: FeaturePage,
        meta: { requiresAuth: false }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 导航守卫 - 处理动态路由（预留）
router.beforeEach((_to, _from, next) => {
  next()
})

export default router

/**
 * 动态添加路由方法（用于后续扩展）
 * @param routes 路由配置数组
 */
export const addDynamicRoutes = (routes: RouteRecordRaw[]) => {
  routes.forEach(route => {
    router.addRoute(route)
  })
}

/**
 * 根据分类ID获取路由路径
 * @param categoryId 分类ID
 */
export const getRouteByCategoryId = (categoryId: string): string => {
  const routeMap: Record<string, string> = {
    ops: '/ops',
    tools: '/tools',
    download: '/download',
    control: '/control'
  }
  return routeMap[categoryId] || '/ops'
}
