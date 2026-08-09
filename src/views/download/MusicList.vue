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
          <!-- 新增歌曲按钮 -->
          <div class="add-btn w-7 h-7 flex items-center justify-center cursor-pointer" @click="openAddMusicPopup">
            <span class="text-white text-base">➕</span>
          </div>
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

    <!-- 新增歌曲弹窗 -->
    <van-popup
      v-model:show="showAddMusicPopup"
      position="bottom"
      round
      style="border-radius: 16px;"
      :close-on-click-overlay="false"
      :lock-scroll="true"
    >
      <div class="add-music-popup p-5 pb-4 w-full flex flex-col" style="height: 85vh; max-height: 600px;">
        <!-- 弹窗头部 -->
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-base font-semibold text-gray-800">新增歌曲</h3>
          <div class="close-btn w-6 h-6 flex items-center justify-center cursor-pointer" @click="closeAddMusicPopup">
            <span class="text-gray-400 text-lg">✕</span>
          </div>
        </div>

        <!-- 表单内容 -->
        <div class="space-y-4 flex-1 overflow-y-auto pr-1">
          <!-- 分享链接输入 -->
          <div class="form-item">
            <label class="text-sm text-gray-600 mb-2 block">分享链接</label>
            <textarea
              v-model="addMusicForm.shareText"
              placeholder="粘贴音乐分享文本或链接，支持QQ音乐、酷狗、网易云等"
              rows="2"
              class="w-full p-3 bg-gray-50 rounded-lg text-sm text-gray-800 outline-none focus:bg-gray-100 transition-colors resize-none"
              @input="parseShareText"
            ></textarea>
            <p class="text-xs text-gray-400 mt-1" v-if="parsedPlatform">已识别：{{ parsedPlatform }}</p>
          </div>

          <!-- 歌曲名称输入 -->
          <div class="form-item">
            <label class="text-sm text-gray-600 mb-0 block">歌曲名称</label>
            <input
              v-model="addMusicForm.title"
              type="text"
              placeholder="请输入歌曲名称"
              class="w-full p-3 bg-gray-50 rounded-lg text-sm text-gray-800 outline-none focus:bg-gray-100 transition-colors"
            />
          </div>
          <!-- 歌手输入 -->
          <div class="form-item">
            <label class="text-sm text-gray-600 mb-0 block">歌手</label>
            <input
              v-model="addMusicForm.artist"
              type="text"
              placeholder="请输入歌手名称"
              class="w-full p-3 bg-gray-50 rounded-lg text-sm text-gray-800 outline-none focus:bg-gray-100 transition-colors"
            />
          </div>
          <!-- 专辑输入 -->
          <div class="form-item">
            <label class="text-sm text-gray-600 mb-0 block">专辑</label>
            <input
                v-model="addMusicForm.album"
                type="text"
                placeholder="请输入歌手名称"
                class="w-full p-3 bg-gray-50 rounded-lg text-sm text-gray-800 outline-none focus:bg-gray-100 transition-colors"
            />
          </div>

          <!-- 文件上传区域 -->
          <div class="form-item">
            <label class="text-sm text-gray-600 mb-0 block">上传文件</label>
            <!-- 未选择文件时的选择区域 -->
            <div
              v-if="uploadStep === 'select'"
              class="upload-area border-2 border-dashed border-purple-300 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-purple-50/30 active:opacity-80 transition-opacity"
              @click="triggerFileInput"
            >
              <span class="text-3xl mb-1">📁</span>
              <p class="text-gray-700 text-sm font-medium">点击选择音乐文件</p>
              <p class="text-gray-400 text-xs mt-1 text-center">支持 ncm、qmc、kgm、kwm、xm、mp3、flac、wav、m4a 等格式</p>
            </div>
            <input
              ref="uploadFileInputRef"
              type="file"
              class="hidden"
              accept=".ncm,.qmc0,.qmc3,.qmc2,.qmc4,.qmc6,.qmc8,.qmcflac,.qmcogg,.tkm,.mggl,.mflac,.mflac0,.mgg,.mgg1,.mgg0,.mmp4,.cache,.tm0,.tm3,.tm2,.tm6,.vpr,.kgm,.kgma,.kwm,.mg3d,.xm,.x2m,.x3m,.wav,.mp3,.flac,.m4a,.ogg"
              @change="handleFileSelected"
            />

            <!-- 解密中 -->
            <div v-if="uploadStep === 'decrypting'" class="py-4 flex flex-col items-center">
              <div class="w-7 h-7 border-2 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
              <p class="text-gray-600 text-sm mt-2">正在解密文件...</p>
              <p class="text-gray-400 text-xs mt-0.5">{{ uploadFileName }}</p>
            </div>

            <!-- 解密完成：展示文件名 + 元数据 + 重新选择 -->
            <div v-if="uploadStep === 'confirm'" class="space-y-2">
              <div class="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg">
                <span class="text-gray-500 text-xs truncate flex-1">{{ uploadFileName }}</span>
                <button
                  class="text-purple-500 text-xs ml-2 flex-shrink-0"
                  @click="resetUploadStep"
                >重新选择</button>
              </div>

              <!-- 解密后展示的元数据（只读） -->
              <div class="metadata-section bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                <div class="section-title text-purple-600 text-xs font-medium mb-2 flex items-center gap-1">
                  <span>🔍</span>
                  <span>音频元数据（解密后解析）</span>
                </div>
                <div class="meta-grid grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  <div class="meta-item flex justify-between">
                    <span class="text-gray-400">比特率</span>
                    <span class="text-gray-700 font-medium">
                      {{ displayMeta.bitrate != null ? `${normalizeBitrate(displayMeta.bitrate)} kbps` : '-' }}
                    </span>
                  </div>
                  <div class="meta-item flex justify-between">
                    <span class="text-gray-400">采样率</span>
                    <span class="text-gray-700 font-medium">
                      {{ displayMeta.sampleRate != null ? `${displayMeta.sampleRate} Hz` : '-' }}
                    </span>
                  </div>
                  <div class="meta-item flex justify-between">
                    <span class="text-gray-400">位深度</span>
                    <span class="text-gray-700 font-medium">
                      {{ displayMeta.bitDepth != null ? `${displayMeta.bitDepth} 位` : '-' }}
                    </span>
                  </div>
                  <div class="meta-item flex justify-between">
                    <span class="text-gray-400">编码格式</span>
                    <span class="text-gray-700 font-medium">{{ displayMeta.codec || '-' }}</span>
                  </div>
                  <div class="meta-item flex justify-between">
                    <span class="text-gray-400">时长</span>
                    <span class="text-gray-700 font-medium">
                      {{ displayMeta.duration != null ? formatMetaDuration(displayMeta.duration) : '-' }}
                    </span>
                  </div>
                  <div class="meta-item flex justify-between">
                    <span class="text-gray-400">MIME</span>
                    <span class="text-gray-700 font-medium truncate max-w-[120px]" :title="displayMeta.mime">
                      {{ displayMeta.mime || '-' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 检索结果区域 -->
        <div v-if="searchResults.length > 0" class="mt-4">
          <div class="text-xs text-gray-500 mb-2">检索结果（共{{ searchResults.length }}条）</div>
          <div class="space-y-2">
            <div
                v-for="(music, index) in searchResults"
                :key="index"
                class="search-result-item p-3 rounded-lg border cursor-pointer transition-all relative overflow-hidden"
                :class="selectedMusic?.id === music.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'"
                @click="selectMusic(music)"
            >
              <div class="flex items-start gap-3">
                <!-- 专辑封面占位 -->
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <span class="text-lg">🎵</span>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start">
                    <div class="flex-1 min-w-0">
                      <div class="font-medium text-sm text-gray-800 truncate">{{ music.title }}</div>
                      <div class="text-xs text-gray-500 mt-0.5">{{ music.artist }} - {{ music.album }}</div>
                    </div>
                    <div class="flex items-center gap-2 ml-2 flex-shrink-0">
                      <div class="text-xs text-gray-400">{{ music.duration ? formatDuration(music.duration) : music.duration }}</div>
                      <div class="text-xs text-gray-400">{{ music.bitrate }} kbps</div>
                    </div>
                  </div>

                  <!-- 已下载角标 -->
                  <div
                      v-if="music.isDownload === 'Y'"
                      class="download-badge mt-1"
                  >已下载</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3 mt-2 flex-shrink-0">
        <button
          class="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium transition-all active:opacity-80 disabled:opacity-50"
          :disabled="!addMusicForm.artist.trim() || searchMusicLoading"
          @click="handleSearchMusic"
        >
          {{ searchMusicLoading ? '检索中...' : '检索' }}
        </button>
        <button
          class="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg text-sm font-medium transition-all active:opacity-80 disabled:opacity-50"
          :disabled="addMusicSubmitting"
          @click="handleSubmit"
        >
          {{ addMusicSubmitting ? (selectedMusic ? '更新中...' : '添加中...') : (selectedMusic ? '更新音源' : '添加') }}
        </button>
      </div>

    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, ActionSheet, Popup } from 'vant'
import { parseBlob as metaParseBlob } from 'music-metadata-browser'
import {
  getMusicList,
  addMusicByShareLink,
  type MusicInfoResp, listMusicInfoBySinger, updateMusic,
} from '@/api/music'
import { useMusicStore } from '@/stores/music'
import { Decrypt } from '@/decrypt/index'
import type { DecryptResult, FileInfo } from '@/decrypt/entity'
import {formatDuration} from "@/utils/temp.ts";
import {normalizeBitrate} from "@/api/music.ts";

// 注册 Vant 组件
const [vanActionSheet, vanPopup] = [ActionSheet, Popup]

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

// 新增歌曲弹窗
const showAddMusicPopup = ref(false)
const addMusicSubmitting = ref(false)
const parsedPlatform = ref('')

// 检索相关
const searchMusicLoading = ref(false)
const searchResults = ref<MusicInfoResp[]>([])
const selectedMusic = ref<MusicInfoResp | null>(null)

// 新增歌曲表单数据
const addMusicForm = ref({
  shareText: '',  // 分享文本（可能包含链接、歌名、歌手等信息）
  title: '',      // 歌曲名称
  artist: '',      // 歌手
  album: ''
})

// ==================== 文件上传相关 ====================
const uploadFileInputRef = ref<HTMLInputElement | null>(null)
// 上传步骤：select=选择文件, decrypting=解密中, confirm=解密完成
type UploadStep = 'select' | 'decrypting' | 'confirm'
const uploadStep = ref<UploadStep>('select')
// 待处理的文件名称（展示用）
const uploadFileName = ref('')
// 解密后的结果
let decryptResult: DecryptResult | null = null
// 展示用的元数据（解密后解析，已标准化单位）
const displayMeta = ref({
  bitrate: null as number | null,   // kbps
  sampleRate: null as number | null, // Hz
  bitDepth: null as number | null,   // 位
  codec: '' as string,               // 编码格式
  duration: null as number | null,   // 秒
  mime: '' as string                 // MIME
})

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

// 打开新增歌曲弹窗
const openAddMusicPopup = () => {
  addMusicForm.value = { shareText: '', title: '', artist: '', album: '' }
  parsedPlatform.value = ''
  resetUploadState()
  showAddMusicPopup.value = true
}

// 关闭新增歌曲弹窗
const closeAddMusicPopup = () => {
  showAddMusicPopup.value = false
  // 延迟重置，避免关闭动画期间表单闪烁
  setTimeout(() => {
    addMusicForm.value = { shareText: '', title: '', artist: '', album: '' }
    parsedPlatform.value = ''
    resetUploadState()
    searchResults.value = []
    selectedMusic.value = null
  }, 200)
}

// ==================== 文件上传：解密 + 元数据解析 ====================

// 重置上传状态
const resetUploadState = () => {
  uploadStep.value = 'select'
  uploadFileName.value = ''
  decryptResult = null
  displayMeta.value = {
    bitrate: null,
    sampleRate: null,
    bitDepth: null,
    codec: '',
    duration: null,
    mime: ''
  }
  if (uploadFileInputRef.value) {
    uploadFileInputRef.value.value = ''
  }
}

// 仅重置到文件选择步骤（保留弹窗打开）
const resetUploadStep = () => {
  uploadStep.value = 'select'
  uploadFileName.value = ''
  decryptResult = null
  if (uploadFileInputRef.value) {
    uploadFileInputRef.value.value = ''
  }
}

// 触发文件选择
const triggerFileInput = () => {
  uploadFileInputRef.value?.click()
}

// 文件选择后的处理：解密 + 解析元数据
const handleFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadFileName.value = file.name
  uploadStep.value = 'decrypting'

  try {
    // 1. 解密文件
    const fileInfo: FileInfo = {
      status: 'pending',
      name: file.name,
      size: file.size,
      percentage: 0,
      uid: Date.now(),
      raw: file
    }
    const result = await Decrypt(fileInfo, {})
    result.originalFilename = file.name
    decryptResult = result

    // 2. 填充元数据（优先用解密库返回的）
    let bitrate = result.bitrate
    let sampleRate = result.sampleRate
    let bitDepth = result.bitDepth
    let codec = result.codec || ''
    let duration = result.duration
    const mime = result.mime || ''

    // 3. 关键字段缺失时，用 music-metadata-browser 从解密后的 blob 补充解析
    const needSupplement = (!duration || !bitrate || !sampleRate) && result.blob
    if (needSupplement) {
      try {
        const musicMeta = await metaParseBlob(result.blob)
        if (!duration && musicMeta.format.duration) {
          duration = musicMeta.format.duration
        }
        if (!bitrate && musicMeta.format.bitrate) {
          bitrate = musicMeta.format.bitrate
        }
        if (!sampleRate && musicMeta.format.sampleRate) {
          sampleRate = musicMeta.format.sampleRate
        }
        if (!bitDepth && musicMeta.format.bitsPerSample) {
          bitDepth = musicMeta.format.bitsPerSample
        }
        if (!codec && musicMeta.format.codec) {
          codec = musicMeta.format.codec
        }
      } catch (e) {
        console.warn('补充解析音频元数据失败，使用现有数据:', e)
      }
    }

    // 4. 标准化单位并赋值给展示对象
    displayMeta.value = {
      bitrate: bitrate ? bitrate : null,
      sampleRate: sampleRate ?? null,
      bitDepth: bitDepth ?? null,
      codec: codec || '',
      duration: duration ? duration : null,
      mime: mime || ''
    }

    // 5. 自动填充歌名/歌手（如果解密结果有且表单为空）
    if (result.title) {
      addMusicForm.value.title = result.title
    }
    if (result.artist) {
      addMusicForm.value.artist = result.artist
    }
    if (result.album) {
      addMusicForm.value.album = result.album
    }

    // 6. 进入确认步骤
    uploadStep.value = 'confirm'
  } catch (error) {
    console.error('解密失败:', error)
    showToast({
      message: `${file.name} 解密失败: ${error instanceof Error ? error.message : String(error)}`,
      position: 'top'
    })
    uploadStep.value = 'select'
    uploadFileName.value = ''
  } finally {
    if (uploadFileInputRef.value) {
      uploadFileInputRef.value.value = ''
    }
  }
}

// 格式化元数据中的时长（秒 → 分:秒）
const formatMetaDuration = (duration: number): string => {
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

// Blob 转 File
const uploadBlobToFile = (blob: Blob, filename: string): File => {
  const file = blob as unknown as File
  if (file.name) return file
  return new File([blob], filename, { type: blob.type || 'audio/mpeg' })
}

// 检索音乐
const handleSearchMusic = async () => {
  const { title, artist, shareText } = addMusicForm.value
  if (!artist.trim()) {
    showToast({ message: '请输入歌手名称', position: 'top' })
    return
  }

  try {
    searchMusicLoading.value = true
    searchResults.value = []
    selectedMusic.value = null

    const shareUrl = extractUrl(shareText) || shareText.trim()
    // 调用API检索音乐
    const results = await listMusicInfoBySinger(title || '', artist, shareUrl)
    searchResults.value = results || []

    if (results.length === 0) {
      showToast({ message: '未找到相关音乐', position: 'top' })
    } else {
      showToast({ message: `共找到${results.length}条相关的记录`, position: 'top' })
    }
  } catch (error) {
    showToast({
      message: error instanceof Error ? error.message : '检索失败',
      position: 'top'
    })
  } finally {
    searchMusicLoading.value = false
  }
}

// 选择音乐
const selectMusic = (music: MusicInfoResp) => {
  // 如果点击的是已选中的音乐，则取消选中
  if (selectedMusic.value?.id === music.id) {
    selectedMusic.value = null
    return
  }

  selectedMusic.value = music
  // 自动填充表单
  if (!addMusicForm.value.title) {
    addMusicForm.value.title = music.title
  }
  if (!addMusicForm.value.artist) {
    addMusicForm.value.artist = music.artist
  }
  if (!addMusicForm.value.album) {
    addMusicForm.value.album = music.album
  }
}

// 统一提交：有文件走上传接口，无文件走分享链接接口
const handleSubmit = async () => {
  const { shareText, title, artist, album } = addMusicForm.value

  // 如果选择了音乐，则更新音源
  if (!selectedMusic.value) {
    try {
      addMusicSubmitting.value = true

      // if (!shareText.trim()) {
      //   showToast({ message: '请输入分享链接或上传文件', position: 'top' })
      //   return
      // }

      let file;
      if (decryptResult !== null) {
        file = uploadBlobToFile(
          decryptResult.blob,
          `${title.trim()}.${decryptResult.ext}`
        )
      }

      if (!file) {
        showToast({ message: '请上传文件', position: 'top' })
        return
      }

      // 使用更新接口（假设有，这里用addMusicByShareLink代替）
      await addMusicByShareLink({
        shareUrl: extractUrl(shareText) || shareText.trim(),
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim(),
        duration: displayMeta.value.duration ?? 0,
        bitrate: displayMeta.value.bitrate ?? undefined,
        sampleRate: displayMeta.value.sampleRate ?? undefined,
        bitDepth: displayMeta.value.bitDepth ?? undefined,
        codec: displayMeta.value.codec || undefined,
        mime: displayMeta.value.mime || undefined
      }, file)

      showToast({ message: '新增成功', position: 'top' })
      closeAddMusicPopup()
      currentPage.value = 1
      fetchMusicList()
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : '新增成功',
        position: 'top'
      })
    } finally {
      addMusicSubmitting.value = false
    }
    return
  }
  else {
    try {
      addMusicSubmitting.value = true

      let file;
      if (decryptResult !== null) {
        file = uploadBlobToFile(
            decryptResult.blob,
            `${title.trim()}.${decryptResult.ext}`
        )
      }

      if (!file) {
        showToast({ message: '请上传文件', position: 'top' })
        return
      }

      await updateMusic({
        id: selectedMusic.value.id,
        title: title.trim(),
        artist: artist.trim(),
        duration: displayMeta.value.duration ?? 0,
        bitrate: displayMeta.value.bitrate ?? undefined,
        sampleRate: displayMeta.value.sampleRate ?? undefined,
        bitDepth: displayMeta.value.bitDepth ?? undefined,
        codec: displayMeta.value.codec || undefined,
        mime: displayMeta.value.mime || undefined,
        shareUrl: extractUrl(shareText) || shareText.trim(),
      }, file)
      showToast({ message: '更新成功', position: 'top' })
      closeAddMusicPopup()
      currentPage.value = 1
      fetchMusicList()
    }catch (error) {
      showToast({
        message: error instanceof Error ? error.message : '更新失败',
        position: 'top'
      })
    } finally {
      addMusicSubmitting.value = false
    }
  }

  // 无文件 → 走分享链接
  if (!shareText.trim()) {
    showToast({ message: '请输入分享链接或上传文件', position: 'top' })
    return
  } else {
    if (!title.trim()) {
      showToast({ message: '请输入歌曲名称', position: 'top' })
      return
    }
    if (!artist.trim()) {
      showToast({ message: '请输入歌手名称', position: 'top' })
      return
    }
  }

  try {
    addMusicSubmitting.value = true

    let file;
    if (decryptResult !== null) {
       file = uploadBlobToFile(
          decryptResult.blob,
          `${title.trim()}.${decryptResult.ext}`
      )
    }

    await addMusicByShareLink({
      shareUrl: extractUrl(shareText) || shareText.trim(),
      title: title.trim(),
      artist: artist.trim(),
      duration: displayMeta.value.duration ?? 0,
      bitrate: displayMeta.value.bitrate ?? undefined,
      sampleRate: displayMeta.value.sampleRate ?? undefined,
      bitDepth: displayMeta.value.bitDepth ?? undefined,
      codec: displayMeta.value.codec || undefined,
      mime: displayMeta.value.mime || undefined
    }, file)

    showToast({ message: '添加成功', position: 'top' })
    closeAddMusicPopup()
    currentPage.value = 1
    fetchMusicList()
  } catch (error) {
    showToast({
      message: error instanceof Error ? error.message : '添加失败',
      position: 'top'
    })
  } finally {
    addMusicSubmitting.value = false
  }
}

/**
 * 音乐平台类型定义
 */
type MusicPlatform = 'qq' | 'kugou' | 'netease' | 'unknown'

/**
 * 平台显示名称映射
 */
const platformLabelMap: Record<MusicPlatform, string> = {
  qq: 'QQ音乐',
  kugou: '酷狗音乐',
  netease: '网易云音乐',
  unknown: '未知平台'
}

/**
 * 从文本中提取URL
 * @param text 分享文本
 * @returns 提取到的URL，未找到则返回空字符串
 */
const extractUrl = (text: string): string => {
  const urlPattern = /https?:\/\/[^\s@)）]+/
  const match = text.match(urlPattern)
  return match ? match[0] : ''
}

/**
 * 根据URL检测音乐平台
 * @param url 音乐链接URL
 * @returns 平台类型标识
 */
const detectPlatform = (url: string): MusicPlatform => {
  if (!url) return 'unknown'
  
  if (url.includes('y.qq.com')) {
    return 'qq'
  } else if (url.includes('kugou.com')) {
    return 'kugou'
  } else if (url.includes('163cn.tv') || url.includes('music.163.com')) {
    return 'netease'
  }
  return 'unknown'
}

/**
 * QQ音乐解析器
 * 格式：歌手《歌名》 https://... @QQ音乐
 */
const parseQQMusic = (text: string): { title?: string; artist?: string } => {
  // 匹配《》前的任意内容作为歌手，匹配最后一个》作为标题结束
  const pattern = /(.+?)《(.+)》/;
  const match = text.match(pattern);

  if (match) {
    return {
      artist: match[1].trim(),   // 歌手：匹配到第一个《之前的所有字符
      title: match[2].trim()     // 歌曲：匹配到最后一个》之间的所有字符
    };
  }
  return {};
}

/**
 * 酷狗音乐解析器
 * 格式：仅包含URL，无额外元数据
 */
const parseKugou = (_text: string): { title?: string; artist?: string } => {
  // 酷狗分享格式仅包含URL，需要用户手动填写或后端解析
  return {}
}

/**
 * 网易云音乐解析器
 * 格式：分享歌手的单曲《歌名》: https://... (来自@网易云音乐)
 */
const parseNetease = (text: string): { title?: string; artist?: string } => {
  const result: { title?: string; artist?: string } = {}
  // 将 (.+?) 改为 (.+)
  const pattern = /分享(.+?)的单曲《(.+)》/
  const match = text.match(pattern)

  if (match) {
    result.artist = match[1].trim()
    result.title = match[2].trim()
  }
  return result
}

/**
 * 解析分享文本 - 三步流程：提取URL → 检测平台 → 分发解析
 * @param text 分享文本
 */
const parseShareText = () => {
  const text = addMusicForm.value.shareText.trim()
  if (!text) {
    parsedPlatform.value = ''
    return
  }

  // 第一步：提取URL
  const url = extractUrl(text)
  
  // 第二步：检测平台
  const platform = detectPlatform(url)
  parsedPlatform.value = platformLabelMap[platform]

  // 第三步：根据平台分发到对应解析器
  let parsedResult: { title?: string; artist?: string } = {}
  
  switch (platform) {
    case 'qq':
      parsedResult = parseQQMusic(text)
      break
    case 'netease':
      parsedResult = parseNetease(text)
      break
    case 'kugou':
      parsedResult = parseKugou(text)
      break
    case 'unknown':
    default:
      // 未知平台，保持用户手动输入
      break
  }

  // 自动填充（每次解析都覆盖，确保粘贴新链接时能正确更新）
  if (parsedResult.title) {
    addMusicForm.value.title = parsedResult.title
  }
  if (parsedResult.artist) {
    addMusicForm.value.artist = parsedResult.artist
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

/* ================== 文件上传相关样式 ================== */
.tab-btn {
  border: none;
  cursor: pointer;
}

.upload-area:active {
  opacity: 0.8;
}

.metadata-section .meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px 12px;
}

.metadata-section .meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 已下载角标 */
.download-badge {
  position: absolute;
  top: 6px;
  left: -28px;
  transform: rotate(-45deg);
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  font-size: 10px;
  font-weight: 500;
  padding: 2px 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  z-index: 10;
  pointer-events: none;
  white-space: nowrap;
}
</style>