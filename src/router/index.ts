import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/home/index.vue'

// 导入功能页面（懒加载）
const OpsPage = () => import('@/views/ops/index.vue')
const ToolsPage = () => import('@/views/tools/index.vue')
const DownloadPage = () => import('@/views/download/index.vue')
const ControlPage = () => import('@/views/control/index.vue')

// 功能详情页面（懒加载）
const FeaturePage = () => import('@/views/feature/index.vue')
const JsonEscapeConvertPage = () => import('@/views/tools/json-escape-convert.vue')
const BilibiliDownloadPage = () => import('@/views/download/bilibili.vue')

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
      // 功能详情页路由（包含分类路径）
      {
        path: 'ops/:action',
        name: 'OpsFeature',
        component: FeaturePage,
        meta: { categoryId: 'ops', requiresAuth: false }
      },
      {
        path: 'tools/:action',
        name: 'ToolsFeature',
        component: FeaturePage,
        meta: { categoryId: 'tools', requiresAuth: false }
      },
      {
        path: 'download/:action',
        name: 'DownloadFeature',
        component: FeaturePage,
        meta: { categoryId: 'download', requiresAuth: false }
      },
      {
        path: 'control/:action',
        name: 'ControlFeature',
        component: FeaturePage,
        meta: { categoryId: 'control', requiresAuth: false }
      },
      {
        path: 'tools/json-escape-convert',
        name: 'JsonEscapeConvert',
        component: JsonEscapeConvertPage,
        meta: { categoryId: 'tools', requiresAuth: false }
      },
      {
        path: 'download/bilibili',
        name: 'BilibiliDownload',
        component: BilibiliDownloadPage,
        meta: { categoryId: 'download', requiresAuth: false }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_BASE_PATH || '/omni/'),
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
