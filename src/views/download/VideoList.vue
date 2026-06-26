<template>
  <div class="video-list-page min-h-screen bg-gray-100">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-gradient-to-r from-primary to-info z-50">
      <div class="flex items-center px-5 h-12">
        <div class="back-btn w-8 h-8 flex items-center justify-center cursor-pointer" @click="goBack">
          <span class="text-white text-xl">‹</span>
        </div>
        <h1 class="text-white text-lg font-semibold mx-3">视频列表</h1>
        <div class="ml-auto flex items-center">
          <span class="text-white/70 text-sm">{{ total }} 个视频</span>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content pt-6 px-3 pb-6">
      <!-- 加载中状态 -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 border-3 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        <p class="text-gray-400 text-sm mt-4">加载中...</p>
      </div>

      <!-- 视频列表 -->
      <div v-else-if="videoList.length > 0" class="video-list">
        <div
          v-for="video in videoList"
          :key="video.id"
          class="video-item bg-white rounded-xl shadow-sm mb-3 overflow-hidden cursor-pointer"
          @click="handleVideoClick(video)"
        >
          <!-- 视频封面 -->
          <div class="relative">
            <img
              :src="video.coverUrl ?? ''"
              :alt="video.title"
              class="w-full aspect-video object-cover"
              referrerpolicy="no-referrer"
              onerror="this.src='data:image/svg+xml,%3Csvg xmlns=&quot;http://www.w3.org/2000/svg&quot; viewBox=&quot;0 0 1280 720&quot;%3E%3Crect fill=&quot;%232d3748&quot; width=&quot;1280&quot; height=&quot;720&quot;/%3E%3Ctext x=&quot;640&quot; y=&quot;380&quot; text-anchor=&quot;middle&quot; fill=&quot;%234a5568&quot; font-size=&quot;48&quot;%3E%E8%A7%86%E9%A2%91%E5%B0%81%E9%9D%A2%3C/text%3E%3C/svg%3E'"
            />
            <!-- 播放按钮 -->
            <div class="absolute inset-0 flex items-center justify-center bg-black/30">
              <div class="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                <span class="text-primary ml-1">▶</span>
              </div>
            </div>
          </div>

          <!-- 视频信息 -->
          <div class="p-3">
            <h3 class="text-gray-800 font-medium text-sm line-clamp-2 mb-2">{{ video.title }}</h3>
            <div class="flex items-center justify-between">
              <div class="flex items-center" @click.stop="openUpSpace(video)">
                <img
                  :src="video.upAvatarUrl ?? ''"
                  :alt="video.upName ?? 'UP主'"
                  class="w-6 h-6 rounded-full bg-gray-200"
                  referrerpolicy="no-referrer"
                  onerror="this.src='data:image/svg+xml,%3Csvg xmlns=&quot;http://www.w3.org/2000/svg&quot; viewBox=&quot;0 0 100 100&quot;%3E%3Ccircle cx=&quot;50&quot; cy=&quot;50&quot; r=&quot;45&quot; fill=&quot;%234a5568&quot;/%3E%3Ctext x=&quot;50&quot; y=&quot;55&quot; text-anchor=&quot;middle&quot; fill=&quot;%23718096&quot; font-size=&quot;36&quot;%3E%E4%BA%BA%3C/text%3E%3C/svg%3E'"
                />
                <span class="text-gray-500 text-xs ml-2">{{ video.upName ?? '未知UP主' }}</span>
              </div>
              <div class="text-gray-400 text-xs">{{ formatDate(video.publishAt) }}</div>
            </div>
          </div>
        </div>

        <!-- 加载中 -->
        <div v-if="loadingMore" class="flex justify-center py-4">
          <div class="flex items-center">
            <div class="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
            <span class="text-gray-400 text-sm ml-2">加载中...</span>
          </div>
        </div>

        <!-- 加载更多按钮 -->
        <div v-else-if="hasMore && videoList.length > 0" class="flex justify-center py-4">
          <button
            class="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium transition-all active:opacity-80"
            @click="loadMore"
          >
            加载更多
          </button>
        </div>

        <!-- 没有更多 -->
        <div v-else-if="!hasMore && videoList.length > 0" class="text-center py-4 text-gray-400 text-sm">
          —— 已显示全部视频 ——
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading" class="empty-state flex flex-col items-center justify-center py-20">
        <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <span class="text-3xl">📺</span>
        </div>
        <p class="text-gray-400 text-sm">暂无视频</p>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <div
      v-if="showBackTop"
      class="back-top-btn fixed bottom-6 right-6 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer z-50 transition-opacity active:opacity-80"
      @click="scrollToTop"
    >
      <span class="text-primary text-lg">↑</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getRandomVideoList, type ListBilibiliVideoInfoResp } from '@/api/download'

// 节流函数
const throttle = <T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T => {
  let lastTime = 0
  return ((...args: unknown[]) => {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn(...args)
    }
  }) as T
}

// 路由
const router = useRouter()

// 视频列表
const videoList = ref<ListBilibiliVideoInfoResp[]>([])

// 加载状态
const loading = ref(false)
const loadingMore = ref(false)

// 分页信息（暂时注释）
// const currentPage = ref(1)
// const pageSize = ref(20)
const total = ref(0)

// 是否有更多数据
const hasMore = ref(true)

// 是否显示回到顶部按钮
const showBackTop = ref(false)

// 返回上一页
const goBack = () => {
  router.back()
}

// 回到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 格式化日期
const formatDate = (timestamp: number): string => {
  if (!timestamp) return '--'
  const date = new Date(timestamp * 1000)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

// 点击视频项，跳转到播放页面
const handleVideoClick = (video: ListBilibiliVideoInfoResp) => {
  router.push({
    path: `/download/video/${video.id}`,
    query: {
      videoData: JSON.stringify(video)
    }
  })
}

// 点击UP主，跳转到B站UP主主页
const openUpSpace = (video: ListBilibiliVideoInfoResp) => {
  const upUid = video.upUid
  if (!upUid) {
    showToast({
      message: 'UP主信息不存在',
      position: 'top'
    })
    return
  }
  
  // 优先尝试B站APP打开
  const appUrl = `bilibili://space/${upUid}`
  const webUrl = `https://space.bilibili.com/${upUid}`
  
  const startTime = Date.now()
  window.location.href = appUrl
  
  // 设置超时检查，如果短时间内没有跳转成功，改用浏览器打开
  setTimeout(() => {
    const endTime = Date.now()
    if (endTime - startTime < 2000) {
      window.location.href = webUrl
    }
  }, 1500)
}

// 获取视频列表（使用随机列表接口，无分页）
const fetchVideoList = async (append: boolean = false) => {
  if (loading.value || (append && loadingMore.value)) {
    return
  }

  try {
    if (append) {
      loadingMore.value = true
    } else {
      loading.value = true
    }

    const result = await getRandomVideoList()
    
    if (!result) {
      throw new Error('获取数据失败')
    }
    
    if (append) {
      const existingIds = new Set(videoList.value.map(v => v.id))
      const newVideos = result.filter(v => !existingIds.has(v.id))
      
      videoList.value = [...videoList.value, ...newVideos]
      
      if (newVideos.length === 0) {
        hasMore.value = false
      }
    } else {
      videoList.value = result
    }
    total.value = videoList.value.length
    
    if (result.length === 0) {
      hasMore.value = false
    }
  } catch (error) {
    showToast({
      message: error instanceof Error ? error.message : '获取视频列表失败',
      position: 'top'
    })
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (hasMore.value && !loadingMore.value) {
    fetchVideoList(true)
  }
}

// 滚动监听处理函数（控制回到顶部按钮显隐）
const handleScroll = throttle(() => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  showBackTop.value = scrollTop > 300
}, 200)

// 页面加载时获取视频列表
onMounted(() => {
  fetchVideoList()
  window.addEventListener('scroll', handleScroll)
})

// 页面卸载时移除滚动监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.back-btn:active {
  opacity: 0.7;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-item:active {
  opacity: 0.8;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>