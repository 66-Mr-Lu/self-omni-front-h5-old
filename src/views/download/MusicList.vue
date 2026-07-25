<template>
  <div class="music-list-page min-h-screen bg-gray-100 pb-24">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-500 z-50">
      <!-- 搜索状态 -->
      <div v-if="showSearchBar" class="flex items-center px-3 h-10">
        <div class="flex-1 relative">
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索音乐..."
            class="w-full h-7 pl-9 pr-3 rounded-full bg-white/20 text-white text-xs placeholder-white/60 outline-none focus:bg-white/30 transition-colors"
            @keyup.enter="handleSearch"
          />
          <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/60 text-xs">🔍</span>
        </div>
        <div class="close-search-btn w-7 h-7 flex items-center justify-center cursor-pointer ml-2" @click="closeSearch">
          <span class="text-white text-base">✕</span>
        </div>
      </div>
      <!-- 正常状态 -->
      <div v-else class="flex items-center px-4 h-10">
        <div class="back-btn w-7 h-7 flex items-center justify-center cursor-pointer" @click="goBack">
          <span class="text-white text-lg">‹</span>
        </div>
        <h1 class="text-white text-base font-semibold mx-2">音乐列表</h1>
        <div class="ml-auto flex items-center gap-2">
          <span class="text-white/70 text-xs">{{ total }} 首音乐</span>
          <div class="search-btn w-7 h-7 flex items-center justify-center cursor-pointer" @click="openSearch">
            <span class="text-white text-base">🔍</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content pt-1 px-2">
      <!-- 加载中状态 -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 border-3 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
        <p class="text-gray-400 text-sm mt-4">加载中...</p>
      </div>

      <!-- 音乐列表 -->
      <div v-else-if="musicList.length > 0" class="music-list bg-white rounded-xl overflow-hidden">
        <div
          v-for="(music, index) in musicList"
          :key="music.id"
          class="music-item flex items-center gap-2.5 cursor-pointer"
          :class="index !== musicList.length - 1 ? 'border-b border-gray-100' : ''"
          @click="handleMusicClick(music)"
        >
          <!-- 封面/图标 -->
          <div class="w-10 h-10 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mx-2">
            <span class="text-lg">🎵</span>
          </div>
          
          <!-- 歌曲详情 -->
          <div class="flex-1 min-w-0 py-2.5">
            <h3 class="text-gray-800 font-medium text-sm truncate">{{ music.title }}</h3>
            <p class="text-gray-500 text-[11px] mt-0.5 truncate">{{ music.artist }} - {{ music.album }}</p>
          </div>

          <!-- 右侧操作按钮 -->
          <div class="flex items-center gap-1 flex-shrink-0 mr-2">
            <!-- MV播放按钮（isDownloadMv为Y时显示） -->
            <div 
              v-if="music.isDownloadMv === 'Y'"
              class="mv-play-btn w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 text-orange-500 cursor-pointer"
              @click.stop="handleMvPlay(music)"
            >
              <span class="text-xs">🎬</span>
            </div>
            <!-- 更多按钮 -->
            <div 
              class="more-btn w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 cursor-pointer"
              @click.stop="handleMore(music)"
            >
              <span class="text-xs">⋮</span>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="loadingMore" class="flex justify-center py-4">
          <div class="flex items-center">
            <div class="w-5 h-5 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
            <span class="text-gray-400 text-sm ml-2">加载中...</span>
          </div>
        </div>

        <!-- 加载更多按钮 -->
        <div v-else-if="hasMore && musicList.length > 0" class="flex justify-center py-4">
          <button
            class="px-6 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium transition-all active:opacity-80"
            @click="loadMore"
          >
            加载更多
          </button>
        </div>

        <!-- 没有更多 -->
        <div v-else-if="!hasMore && musicList.length > 0" class="text-center py-4 text-gray-400 text-sm">
          —— 已显示全部音乐 ——
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading" class="empty-state flex flex-col items-center justify-center py-20">
        <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <span class="text-3xl">🎵</span>
        </div>
        <p class="text-gray-400 text-sm">暂无音乐</p>
      </div>
    </div>

    <!-- 更多操作弹窗 -->
    <van-action-sheet
      v-model:show="showMoreActionSheet"
      :actions="moreActions"
      cancel-text="取消"
      close-on-click-action
      @select="onMoreActionSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, ActionSheet } from 'vant'
import { getMusicList, type MusicInfoResp } from '@/api/music'
import { useMusicStore } from '@/stores/music'

// 注册 Vant 组件
const [vanActionSheet] = [ActionSheet]

// 路由
const router = useRouter()

// 使用音乐 store
const musicStore = useMusicStore()

// 音乐列表
const musicList = ref<MusicInfoResp[]>([])

// 加载状态
const loading = ref(false)
const loadingMore = ref(false)

// 分页信息
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const hasMore = ref(true)

// 搜索相关
const showSearchBar = ref(false)
const keyword = ref('')

// 更多操作弹窗
const showMoreActionSheet = ref(false)
const currentMusic = ref<MusicInfoResp | null>(null)
const moreActions = [
  { name: '收藏', icon: '⭐' },
  { name: '下载', icon: '⬇️' }
]

// 返回上一页
const goBack = () => {
  router.back()
}

// 打开搜索
const openSearch = () => {
  showSearchBar.value = true
}

// 关闭搜索
const closeSearch = () => {
  showSearchBar.value = false
  keyword.value = ''
  currentPage.value = 1
  fetchMusicList()
}

// 执行搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchMusicList()
}

// 点击音乐项，跳转到播放页面
const handleMusicClick = (music: MusicInfoResp) => {
  // 添加到播放列表
  musicStore.addToPlaylist(music)
  musicStore.setCurrentIndex(musicStore.playlist.length - 1)
  musicStore.setCurrentSong(music)
  
  // 跳转到播放页面，带上autoPlay参数表示需要自动播放
  router.push({
    path: `/resource/music-player/${music.id}`,
    query: { autoPlay: 'true' }
  })
}

// 点击MV播放按钮
const handleMvPlay = (music: MusicInfoResp) => {
  showToast({
    message: `${music.title} MV播放功能开发中`,
    position: 'top'
  })
}

// 点击更多按钮
const handleMore = (music: MusicInfoResp) => {
  currentMusic.value = music
  showMoreActionSheet.value = true
}

// 更多操作选择
const onMoreActionSelect = (action: { name: string }) => {
  if (!currentMusic.value) return
  
  if (action.name === '收藏') {
    showToast({
      message: `收藏功能开发中`,
      position: 'top'
    })
  } else if (action.name === '下载') {
    showToast({
      message: `下载功能开发中`,
      position: 'top'
    })
  }
}

// 获取音乐列表
const fetchMusicList = async (append: boolean = false) => {
  if (loading.value || (append && loadingMore.value)) {
    return
  }

  try {
    if (append) {
      loadingMore.value = true
    } else {
      loading.value = true
    }

    const result = await getMusicList(currentPage.value, pageSize.value, keyword.value)
    
    if (!result) {
      throw new Error('获取数据失败')
    }
    
    if (append) {
      musicList.value = [...musicList.value, ...result.records]
    } else {
      musicList.value = result.records
    }
    total.value = result.total
    
    // 更新分页状态
    hasMore.value = currentPage.value < result.pages
    
    if (result.records.length === 0 && !append) {
      hasMore.value = false
    }
  } catch (error) {
    showToast({
      message: error instanceof Error ? error.message : '获取音乐列表失败',
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
    currentPage.value++
    fetchMusicList(true)
  }
}

// 页面加载时获取音乐列表
onMounted(() => {
  fetchMusicList()
})

// 页面卸载
onUnmounted(() => {
  // 保持播放状态，不清理
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

.music-item:active {
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