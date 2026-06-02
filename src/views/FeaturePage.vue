<template>
  <div class="feature-page min-h-screen bg-gray-100">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-gradient-to-r from-primary to-info z-50">
      <div class="flex items-center px-5 h-12">
        <div class="back-btn w-8 h-8 flex items-center justify-center cursor-pointer" @click="goBack">
          <span class="text-white">‹</span>
        </div>
        <h1 class="text-white text-lg font-semibold mx-3">{{ featureName }}</h1>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content pt-16 px-4 pb-6">
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="feature-icon w-16 h-16 mx-auto mb-4 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
          <span class="text-3xl">{{ featureIcon }}</span>
        </div>
        <h2 class="text-xl font-semibold text-center text-gray-800 mb-2">{{ featureName }}</h2>
        <p class="text-gray-500 text-center text-sm mb-6">此功能即将上线...</p>
        
        <!-- 功能描述卡片 -->
        <div class="feature-info bg-gray-50 rounded-xl p-4 mb-4">
          <h3 class="text-gray-700 font-medium mb-2">功能说明</h3>
          <p class="text-gray-500 text-sm">{{ featureDescription }}</p>
        </div>

        <!-- 操作按钮 -->
        <button class="w-full bg-primary text-white py-3 rounded-xl font-medium" @click="handleAction">
          立即体验
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { menuData } from '@/data/menuData'

// 路由
const router = useRouter()
const route = useRoute()

// 获取当前功能action
const action = computed(() => route.params.action as string)

// 查找功能信息
const featureInfo = computed(() => {
  // 遍历所有分类查找功能
  for (const category of menuData) {
    // 检查直接叶子菜单
    if (category.items) {
      for (const item of category.items) {
        if (item.action === action.value) {
          return { ...item, name: item.name, icon: item.icon }
        }
      }
    }
    // 检查二级菜单组的子菜单
    for (const group of category.groups) {
      for (const child of group.children) {
        if (child.action === action.value) {
          return { ...child, name: child.name, icon: child.icon }
        }
      }
    }
  }
  return { name: '未知功能', icon: '❓', action: action.value }
})

// 功能名称
const featureName = computed(() => featureInfo.value.name)

// 功能图标
const featureIcon = computed(() => featureInfo.value.icon)

// 功能描述
const featureDescription = computed(() => {
  const descriptions: Record<string, string> = {
    shutdown: '安全关闭计算机系统，保存所有未完成的工作。',
    remotePower: '通过网络远程唤醒计算机，支持WOL协议。',
    cpuMonitor: '实时查看CPU使用率、温度等状态信息。',
    memoryMonitor: '监控内存使用情况，包括已用、可用和缓存。',
    diskMonitor: '检测硬盘健康状态，显示SMART信息。',
    networkInfo: '查看当前网络配置，包括IP地址、网关等。',
    jsonConvert: '将JSON字符串转换为格式化的JSON对象。',
    rsaKeygen: '生成RSA公钥私钥对，支持多种密钥长度。',
    encryptDecrypt: '使用RSA算法加密或解密文本内容。',
    bilibiliDownload: '下载B站视频，支持多种分辨率选择。',
    douyinDownload: '下载抖音视频，去除水印。',
    airConditioner: '远程控制空调，支持开关机和温度调节。'
  }
  return descriptions[action.value] || '暂无详细说明'
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 处理功能操作
const handleAction = () => {
  alert(`${featureName.value}功能开发中，敬请期待！`)
}
</script>

<style scoped>
.back-btn {
  font-size: 24px;
}

.back-btn:active {
  opacity: 0.7;
}
</style>
