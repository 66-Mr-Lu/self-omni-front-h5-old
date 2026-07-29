<template>
  <div class="music-decrypt-page min-h-screen bg-gray-100 pb-24">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-500 z-50">
      <div class="flex items-center px-4 h-10">
        <div class="back-btn w-7 h-7 flex items-center justify-center cursor-pointer" @click="goBack">
          <span class="text-white text-lg">‹</span>
        </div>
        <h1 class="text-white text-base font-semibold mx-2">音乐解密</h1>
        <div class="ml-auto flex items-center gap-2">
          <span class="text-white/70 text-xs">{{ decryptResults.length }} 个文件</span>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content pt-12 px-3">
      <!-- 文件上传区域 -->
      <div class="upload-area bg-white rounded-xl p-4 mb-4 shadow-sm">
        <div class="upload-btn border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer" @click="triggerUpload">
          <span class="text-4xl mb-2">📁</span>
          <p class="text-gray-500 text-sm">点击或拖拽文件到此处</p>
          <p class="text-gray-400 text-xs mt-1">支持 ncm、qmc、kgm、kwm、xm 等加密格式</p>
        </div>
        <input
          id="music-decrypt-file-input"
          type="file"
          multiple
          class="hidden"
          accept=".ncm,.qmc0,.qmc3,.qmc2,.qmc4,.qmc6,.qmc8,.qmcflac,.qmcogg,.tkm,.mggl,.mflac,.mflac0,.mflach,.mgg,.mgg1,.mgg0,.mmp4,.666c6163,.6d7033,.6f6767,.6d3461,.776176,.cache,.tm0,.tm3,.tm2,.tm6,.vpr,.kgm,.kgma,.kwm,.mg3d,.xm,.x2m,.x3m,.wav,.mp3,.flac,.m4a,.ogg"
          @change="handleFileSelect"
        />
      </div>

      <!-- 解密中状态 -->
      <div v-if="decrypting" class="decrypting-state bg-white rounded-xl p-6 mb-4 shadow-sm">
        <div class="flex items-center justify-center">
          <div class="w-8 h-8 border-3 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
          <span class="text-gray-500 text-sm ml-3">正在解密第 {{ decryptingIndex + 1 }} / {{ filesToDecrypt.length }} 个文件...</span>
        </div>
        <div class="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            :style="{ width: `${((decryptingIndex + 1) / filesToDecrypt.length) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- 解密结果列表 -->
      <div v-if="decryptResults.length > 0" class="results-list">
        <div 
          v-for="(result, index) in decryptResults" 
          :key="index"
          class="result-item bg-white rounded-xl p-3 mb-3 shadow-sm"
        >
          <div class="flex items-start gap-3">
            <!-- 封面/图标 -->
            <div class="cover w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img v-if="result.picture" :src="result.picture" class="w-full h-full object-cover" />
              <span v-else class="text-xl">🎵</span>
            </div>
            
            <!-- 歌曲信息 -->
            <div class="flex-1 min-w-0">
              <h3 class="text-gray-800 font-medium text-sm truncate">{{ result.title }}</h3>
              <p class="text-gray-500 text-xs mt-0.5 truncate">{{ result.artist }} - {{ result.album }}</p>
              <p class="text-gray-400 text-[10px] mt-1">原文件: {{ result.originalFilename || result.rawFilename }}.{{ result.rawExt || result.ext }}</p>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              class="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1 active:bg-red-100 transition-colors"
              @click="deleteResult(index)"
            >
              <span>🗑</span>
              <span>删除</span>
            </button>
            <button
              class="flex-1 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1 active:bg-purple-100 transition-colors"
              @click="previewMusic(result)"
            >
              <span>▶</span>
              <span>预览</span>
            </button>
            <button
              class="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1 active:bg-blue-100 transition-colors"
              @click="handleUpload(result)"
            >
              <span>☁</span>
              <span>上传</span>
            </button>
            <button
              class="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1 active:opacity-80 transition-opacity"
              @click="downloadMusic(result)"
            >
              <span>⬇</span>
              <span>下载</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!decrypting && decryptResults.length === 0 && !filesToDecrypt.length" class="empty-state flex flex-col items-center justify-center py-16">
        <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <span class="text-3xl">🔐</span>
        </div>
        <p class="text-gray-400 text-sm">选择加密音乐文件进行解密</p>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="error-message bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
        <p class="text-red-500 text-sm">{{ errorMessage }}</p>
      </div>
    </div>

    <!-- 音频预览弹窗 -->
    <van-dialog
      v-model:show="showPreview"
      :title="previewResult?.title || '音乐预览'"
      confirm-button-text="关闭"
      class="preview-dialog"
      @update:show="handlePreviewClose"
    >
      <div v-if="previewResult" class="preview-content">
        <div class="preview-cover w-full aspect-square rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 overflow-hidden">
          <img v-if="previewResult.picture" :src="previewResult.picture" class="w-full h-full object-cover" />
          <span v-else class="text-4xl">🎵</span>
        </div>
        <audio
          ref="audioRef"
          :src="previewUrl"
          controls
          class="w-full h-10"
        />
        <p class="text-gray-500 text-xs text-center mt-2">{{ previewResult.artist }} - {{ previewResult.album }}</p>
      </div>
    </van-dialog>

    <!-- 歌手匹配弹窗 -->
    <van-dialog
      v-model:show="showSingerMatch"
      title="匹配音乐"
      show-cancel-button
      cancel-button-text="取消"
      confirm-button-text="新增"
      class="singer-match-dialog"
      :style="{ width: '90%', maxWidth: '480px' }"
      @confirm="handleAddNew"
      @cancel="closeSingerMatch"
    >
      <!-- 搜索区域 -->
      <div class="search-area mb-4">
        <div class="flex flex-col gap-2">
          <input
            v-model="searchTitle"
            type="text"
            placeholder="歌名"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
          />
          <div class="flex gap-2">
            <input
              v-model="searchArtist"
              type="text"
              placeholder="歌手"
              class="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
            />
            <button
              class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium active:opacity-80 transition-opacity"
              @click="handleSearch"
              :disabled="singerMatchLoading"
            >
              搜索
            </button>
          </div>
        </div>
      </div>

      <!-- 当前上传音乐信息（固定在第一行） -->
      <div v-if="currentUploadResult" class="current-music bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3 mb-3">
        <!-- 原始文件名（最上方） -->
        <div class="raw-filename mb-2 px-3 py-1.5 bg-white/60 rounded-md">
          <span class="text-gray-500 text-[10px]">原始文件：</span>
          <span class="text-gray-700 text-[11px] font-medium">{{ currentUploadResult.originalFilename || currentUploadResult.rawFilename || '-' }}</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <span class="text-lg">🎵</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="text-gray-800 text-sm font-medium truncate">{{ currentUploadResult.title }}</h4>
              <span class="px-2 py-0.5 bg-purple-100 text-purple-600 text-[10px] rounded-full">待上传</span>
            </div>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-gray-500 text-xs">{{ currentUploadResult.artist || '-' }}</span>
              <span class="text-gray-300">|</span>
              <span class="text-gray-400 text-xs truncate">{{ currentUploadResult.album || '-' }}</span>
            </div>
            <div v-if="currentUploadResult.duration || currentUploadResult.bitrate" class="flex items-center gap-2 mt-0.5">
              <span v-if="currentUploadResult.duration" class="text-gray-400 text-[10px]">时长: {{ formatDuration(currentUploadResult.duration) }}</span>
              <span v-if="currentUploadResult.duration && currentUploadResult.bitrate" class="text-gray-300">|</span>
              <span v-if="currentUploadResult.bitrate" class="text-gray-400 text-[10px]">码率: {{ formatBitrate(currentUploadResult.bitrate) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="singerMatchLoading" class="flex items-center justify-center py-6">
        <div class="w-6 h-6 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
        <span class="text-gray-500 text-sm ml-2">正在搜索...</span>
      </div>

      <!-- 无结果状态 -->
      <div v-else-if="singerMatchList.length === 0" class="text-center py-6">
        <p class="text-gray-400 text-sm">未找到匹配的音乐</p>
        <p class="text-gray-400 text-xs mt-1">点击「新增」上传为新音乐</p>
      </div>

      <!-- 匹配列表 -->
      <div v-else class="match-list max-h-[50vh] overflow-y-auto">
        <div 
          v-for="(item) in singerMatchList"
          :key="item.id"
          class="match-item flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
          :class="{ 'bg-purple-50 border border-purple-200': selectedMatchId === item.id }"
          @click="selectMatch(item)"
        >
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <span class="text-lg">🎵</span>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-gray-800 text-sm font-medium truncate">{{ item.title }}</h4>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-gray-500 text-xs">{{ item.artist }}</span>
              <span class="text-gray-300">|</span>
              <span class="text-gray-400 text-xs truncate">{{ item.album }}</span>
            </div>
            <div v-if="item.duration || item.bitrate" class="flex items-center gap-2 mt-0.5">
              <span v-if="item.duration" class="text-gray-400 text-[10px]">时长: {{ formatDuration(item.duration) }}</span>
              <span v-if="item.duration && item.bitrate" class="text-gray-300">|</span>
              <span v-if="item.bitrate" class="text-gray-400 text-[10px]">码率: {{ formatBitrate(item.bitrate) }} kbps</span>
            </div>
          </div>
          <div 
            class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
            :class="selectedMatchId === item.id ? 'border-purple-500 bg-purple-500' : 'border-gray-300'"
          >
            <span v-if="selectedMatchId === item.id" class="text-white text-xs">✓</span>
          </div>
        </div>
      </div>

      <!-- 更新按钮 -->
      <div v-if="singerMatchList.length > 0" class="mt-4 text-center">
        <button
          class="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium active:opacity-80 transition-opacity"
          @click="handleUpdate"
          :disabled="!selectedMatchId"
          :class="{ 'opacity-50 cursor-not-allowed': !selectedMatchId }"
        >
          更新选中音乐
        </button>
      </div>
    </van-dialog>

    <!-- 上传确认弹窗 -->
    <van-dialog
      v-model:show="showConfirmDialog"
      :title="confirmMode === 'update' ? '确认更新音乐' : '确认新增音乐'"
      show-cancel-button
      cancel-button-text="取消"
      confirm-button-text="确认"
      class="confirm-dialog"
      :style="{ width: '90%', maxWidth: '480px' }"
      @confirm="confirmUpload"
      @cancel="closeConfirmDialog"
    >
      <div v-if="currentUploadResult" class="confirm-content">
        <!-- 模式提示 -->
        <div 
          class="mode-tip mb-3 p-2 rounded-lg text-center text-sm"
          :class="confirmMode === 'update' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'"
        >
          {{ confirmMode === 'update' ? '即将更新已有音乐，元数据将被保留' : '即将新增一首音乐' }}
        </div>

        <!-- 原始文件名 -->
        <div class="raw-filename mb-3 px-3 py-2 bg-gray-100 rounded-lg">
          <span class="text-gray-500 text-xs">原始文件名：</span>
          <span class="text-gray-800 text-xs font-medium">{{ currentUploadResult.originalFilename || currentUploadResult.rawFilename || '-' }}</span>
        </div>

        <!-- 可编辑字段 -->
        <div class="editable-fields mb-4">
          <div class="field-item mb-3">
            <div class="flex items-center justify-between mb-1">
              <label class="field-label text-gray-600 text-xs">歌名</label>
              <button
                v-if="confirmMode === 'update'"
                class="switch-btn px-2 py-0.5 rounded-full text-xs font-medium transition-colors"
                :class="[
                  fieldSource.title === 'backend' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white',
                  { 'opacity-40 cursor-not-allowed': isFieldSame.title }
                ]"
                :disabled="isFieldSame.title"
                @click="switchFieldSource('title')"
              >
                {{ fieldSource.title === 'backend' ? '后台' : '解析' }} ⇄
              </button>
            </div>
            <input
              v-model="editForm.title"
              type="text"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
              placeholder="请输入歌名"
            />
          </div>
          <div class="field-item mb-3">
            <div class="flex items-center justify-between mb-1">
              <label class="field-label text-gray-600 text-xs">歌手</label>
              <button
                v-if="confirmMode === 'update'"
                class="switch-btn px-2 py-0.5 rounded-full text-xs font-medium transition-colors"
                :class="[
                  fieldSource.artist === 'backend' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white',
                  { 'opacity-40 cursor-not-allowed': isFieldSame.artist }
                ]"
                :disabled="isFieldSame.artist"
                @click="switchFieldSource('artist')"
              >
                {{ fieldSource.artist === 'backend' ? '后台' : '解析' }} ⇄
              </button>
            </div>
            <input
              v-model="editForm.artist"
              type="text"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
              placeholder="请输入歌手"
            />
          </div>
          <div class="field-item mb-3">
            <div class="flex items-center justify-between mb-1">
              <label class="field-label text-gray-600 text-xs">专辑</label>
              <button
                v-if="confirmMode === 'update'"
                class="switch-btn px-2 py-0.5 rounded-full text-xs font-medium transition-colors"
                :class="[
                  fieldSource.album === 'backend' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white',
                  { 'opacity-40 cursor-not-allowed': isFieldSame.album }
                ]"
                :disabled="isFieldSame.album"
                @click="switchFieldSource('album')"
              >
                {{ fieldSource.album === 'backend' ? '后台' : '解析' }} ⇄
              </button>
            </div>
            <input
              v-model="editForm.album"
              type="text"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
              placeholder="请输入专辑"
            />
          </div>
        </div>

        <!-- 来源选择 -->
        <div class="source-field mb-4">
          <label class="field-label text-gray-600 text-xs mb-1 block">来源</label>
          <div
            class="source-display w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm flex items-center justify-between cursor-pointer"
            @click="showSourcePicker = true"
          >
            <span class="text-gray-800">{{ editForm.source === 'other' ? '其他（手动输入）' : getSourceLabel(editForm.source) }}</span>
            <span class="text-gray-400">›</span>
          </div>
          <input
            v-if="editForm.source === 'other'"
            v-model="editForm.customSource"
            type="text"
            class="w-full mt-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
            placeholder="请输入来源名称"
          />
        </div>

        <!-- 只读信息字段 -->
        <div class="readonly-fields bg-gray-50 rounded-lg p-3">
          <div class="section-title text-gray-500 text-xs mb-2">文件信息（不可修改）</div>
          <div class="info-grid grid grid-cols-2 gap-2 text-xs">
            <div class="info-item">
              <span class="text-gray-400">时长：</span>
              <span class="text-gray-700">{{ currentUploadResult.duration ? formatDuration(currentUploadResult.duration) : '-' }}</span>
            </div>
            <div class="info-item">
              <span class="text-gray-400">码率：</span>
              <span class="text-gray-700">{{ currentUploadResult.bitrate ? formatBitrate(currentUploadResult.bitrate) : '-' }}</span>
            </div>
            <div class="info-item">
              <span class="text-gray-400">编码：</span>
              <span class="text-gray-700">{{ currentUploadResult.codec || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="text-gray-400">采样率：</span>
              <span class="text-gray-700">{{ currentUploadResult.sampleRate ? `${currentUploadResult.sampleRate} Hz` : '-' }}</span>
            </div>
            <div class="info-item">
              <span class="text-gray-400">位深度：</span>
              <span class="text-gray-700">{{ currentUploadResult.bitDepth ? `${currentUploadResult.bitDepth} bit` : '-' }}</span>
            </div>
            <div class="info-item">
              <span class="text-gray-400">格式：</span>
              <span class="text-gray-700">{{ currentUploadResult.mime || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 更新模式额外提示 -->
        <div v-if="confirmMode === 'update' && selectedMatchId" class="update-tip mt-3 p-2 bg-yellow-50 rounded-lg">
          <span class="text-yellow-600 text-xs">更新将替换原有音乐文件</span>
        </div>
      </div>
    </van-dialog>

    <!-- 来源选择 ActionSheet -->
    <van-action-sheet
      v-model:show="showSourcePicker"
      :actions="sourceActions"
      cancel-text="取消"
      close-on-click-action
      @select="onSourceSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { formatDuration, formatBitrate } from '@/utils/temp'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog, ActionSheet } from 'vant'
import { Decrypt } from '@/decrypt/index'
import type { DecryptResult, FileInfo } from '@/decrypt/entity'
import { 
  listMusicInfoBySinger, 
  uploadMusic, 
  updateMusic, 
  type MusicInfoResp 
} from '@/api/music'



const router = useRouter()

const filesToDecrypt = ref<File[]>([])
const decryptResults = ref<DecryptResult[]>([])
const decrypting = ref(false)
const decryptingIndex = ref(0)
const errorMessage = ref('')

const showPreview = ref(false)
const previewResult = ref<DecryptResult | null>(null)
const previewUrl = ref('')
const audioRef = ref<HTMLAudioElement | null>(null)

const showSingerMatch = ref(false)
const singerMatchLoading = ref(false)
const singerMatchList = ref<MusicInfoResp[]>([])
const selectedMatchId = ref<number | null>(null)
const currentUploadResult = ref<DecryptResult | null>(null)
const searchTitle = ref('')
const searchArtist = ref('')

// 上传确认弹框相关
const showConfirmDialog = ref(false)
const confirmMode = ref<'add' | 'update'>('add')
// 来源选项映射：key -> 展示名
const sourceOptions = [
  { key: 'KuGouLite', label: '酷狗概念版' },
  { key: 'QQ', label: 'QQ音乐' },
  { key: 'Netease', label: '网易云音乐' },
  { key: 'KuGou', label: '酷狗音乐' },
  { key: 'Bodian', label: '波点音乐' },
  { key: 'Kuwo', label: '酷我音乐' },
  { key: 'Migu', label: '咪咕音乐' },
  { key: 'other', label: '其他（手动输入）' }
]

// 获取来源展示名
const getSourceLabel = (key: string) => {
  const item = sourceOptions.find(o => o.key === key)
  return item ? item.label : key
}

// 来源选择 ActionSheet
const [vanActionSheet] = [ActionSheet]
const showSourcePicker = ref(false)
// 转换为 ActionSheet 需要的格式
const sourceActions = computed(() => 
  sourceOptions.map(opt => ({
    name: opt.label,
    value: opt.key
  }))
)
// 选择来源
const onSourceSelect = (action: { value: string }) => {
  editForm.value.source = action.value
  showSourcePicker.value = false
}

// 编辑表单：绑定输入框，用户编辑直接修改此对象
const editForm = ref({
  title: '',
  artist: '',
  album: '',
  source: 'QQ',
  customSource: ''
})
// 更新模式下每个字段的数据源切换：backend=后台返回的值，parsed=前台解析的值
const fieldSource = ref({
  title: 'backend' as 'backend' | 'parsed',
  artist: 'backend' as 'backend' | 'parsed',
  album: 'backend' as 'backend' | 'parsed'
})
// 后台选中条目的原始数据（不可被编辑覆盖）
const backendFormData = ref({ title: '', artist: '', album: '' })
// 前台文件解析的原始数据（不可被编辑覆盖）
const parsedFormData = ref({ title: '', artist: '', album: '' })

// 判断每个字段的后台值和解析值是否相同（相同则禁用切换按钮）
const isFieldSame = computed(() => ({
  title: backendFormData.value.title === parsedFormData.value.title,
  artist: backendFormData.value.artist === parsedFormData.value.artist,
  album: backendFormData.value.album === parsedFormData.value.album
}))

const goBack = () => {
  router.back()
}

const triggerUpload = () => {
  const fileInput = document.getElementById('music-decrypt-file-input') as HTMLInputElement
  fileInput?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    filesToDecrypt.value = Array.from(target.files)
    decryptMusic()
  }
}

const decryptMusic = async () => {
  if (filesToDecrypt.value.length === 0) return
  
  decrypting.value = true
  decryptingIndex.value = 0
  errorMessage.value = ''
  
  for (let i = 0; i < filesToDecrypt.value.length; i++) {
    decryptingIndex.value = i
    const file = filesToDecrypt.value[i]
    
    try {
      const fileInfo: FileInfo = {
        status: 'pending',
        name: file.name,
        size: file.size,
        percentage: 0,
        uid: Date.now() + i,
        raw: file
      }
      
      const result = await Decrypt(fileInfo, {})
      result.originalFilename = file.name
      decryptResults.value.push(result)
      
    } catch (error) {
      console.error('解密失败:', error)
      showToast({
        message: `${file.name} 解密失败: ${error instanceof Error ? error.message : String(error)}`,
        position: 'top'
      })
    }
  }
  
  decrypting.value = false
  
  if (decryptResults.value.length > 0) {
    showToast({
      message: `成功解密 ${decryptResults.value.length} 个文件`,
      position: 'top'
    })
  }
}

const deleteResult = (index: number) => {
  const result = decryptResults.value[index]
  showDialog({
    title: '确认删除',
    message: `确定要删除 "${result.title}" 吗？`,
    showCancelButton: true,
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    confirmButtonColor: '#ef4444'
  }).then(() => {
    decryptResults.value.splice(index, 1)
    showToast({
      message: '删除成功',
      position: 'top'
    })
  }).catch(() => {
    // 用户取消
  })
}

const downloadMusic = (result: DecryptResult) => {
  const url = URL.createObjectURL(result.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${result.title}.${result.ext}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const previewMusic = (result: DecryptResult) => {
  previewResult.value = result
  previewUrl.value = URL.createObjectURL(result.blob)
  showPreview.value = true
}

const handlePreviewClose = (visible: boolean) => {
  if (!visible) {
    if (audioRef.value) {
      audioRef.value.pause()
      audioRef.value.currentTime = 0
    }
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = ''
    }
    previewResult.value = null
  }
}

const handleUpload = async (result: DecryptResult) => {
  currentUploadResult.value = result
  searchTitle.value = result.title
  searchArtist.value = result.artist || ''
  singerMatchList.value = []
  selectedMatchId.value = null
  showSingerMatch.value = true
  
  if (result.artist) {
    await handleSearch()
  }
}

const handleSearch = async () => {
  const title = searchTitle.value.trim()
  const artist = searchArtist.value.trim()
  
  if (!title && !artist) {
    showToast({
      message: '请输入歌名或歌手',
      position: 'top'
    })
    return
  }
  
  singerMatchLoading.value = true
  singerMatchList.value = []
  selectedMatchId.value = null
  
  try {
    singerMatchList.value = await listMusicInfoBySinger(title, artist)
  } catch (error) {
    console.error('搜索失败:', error)
    showToast({
      message: '搜索失败',
      position: 'top'
    })
  } finally {
    singerMatchLoading.value = false
  }
}

// const formatDuration = (duration: number): string => {
//   const seconds = duration > 20000 ? Math.floor(duration / 1000) : duration
//   const mins = Math.floor(seconds / 60)
//   const secs = Math.floor(seconds % 60)
//   return `${mins}:${secs.toString().padStart(2, '0')}`
// }
//
// const formatBitrate = (bitrate: number): string => {
//   const kbps = bitrate > 50000 ? Math.floor(bitrate / 1000) : bitrate
//   return `${kbps} kbps`
// }

const selectMatch = (item: MusicInfoResp) => {
  selectedMatchId.value = selectedMatchId.value === item.id ? null : item.id
}

const closeSingerMatch = () => {
  showSingerMatch.value = false
  singerMatchList.value = []
  selectedMatchId.value = null
  currentUploadResult.value = null
}

const handleUpdate = () => {
  if (!selectedMatchId.value || !currentUploadResult.value) return
  
  // 从匹配列表中获取选中条目（后台返回的数据）
  const selectedItem = singerMatchList.value.find(item => item.id === selectedMatchId.value)
  if (!selectedItem) return
  
  const result = currentUploadResult.value
  
  // 保存后台选中条目的数据
  backendFormData.value = {
    title: selectedItem.title,
    artist: selectedItem.artist || '',
    album: selectedItem.album || ''
  }
  // 保存前台文件解析的数据
  parsedFormData.value = {
    title: result.title,
    artist: result.artist || '',
    album: result.album || ''
  }
  // 默认使用后台数据
  fieldSource.value = { title: 'backend', artist: 'backend', album: 'backend' }
  editForm.value = {
    ...backendFormData.value,
    source: (selectedItem as any).source || 'KuGouLite',
    customSource: ''
  }
  
  confirmMode.value = 'update'
  showSingerMatch.value = false
  showConfirmDialog.value = true
}

const handleAddNew = () => {
  if (!currentUploadResult.value) return
  
  const result = currentUploadResult.value
  
  // 填充确认表单数据（新增模式：title、artist、album可编辑）
  confirmMode.value = 'add'
  editForm.value = {
    title: result.title,
    artist: result.artist || '',
    album: result.album || '',
    source: 'QQ',
    customSource: ''
  }
  
  showSingerMatch.value = false
  showConfirmDialog.value = true
}

// 关闭确认弹框
const closeConfirmDialog = () => {
  showConfirmDialog.value = false
}

// 切换单个字段的数据源（后台值/解析值），原始数据不会被编辑覆盖
const switchFieldSource = (field: 'title' | 'artist' | 'album') => {
  // 切换数据源
  fieldSource.value[field] = fieldSource.value[field] === 'backend' ? 'parsed' : 'backend'
  // 从原始数据加载（原始数据保持不变，不会被编辑覆盖）
  editForm.value[field] = fieldSource.value[field] === 'backend'
    ? backendFormData.value[field]
    : parsedFormData.value[field]
}

// 获取最终的来源值（如果选"其他"则使用自定义输入）
const getFinalSource = () => {
  return editForm.value.source === 'other' ? editForm.value.customSource : editForm.value.source
}

// 确认后提交
const confirmUpload = async () => {
  if (!currentUploadResult.value) return
  
  const result = currentUploadResult.value
  showConfirmDialog.value = false
  
  if (confirmMode.value === 'update') {
    await performUpdate(result)
  } else {
    await performAddNew(result)
  }
}

// 执行更新
const performUpdate = async (result: DecryptResult) => {
  const matchId = selectedMatchId.value
  if (!matchId) return
  
  try {
    showToast({
      message: '正在更新...',
      position: 'top',
      duration: 0,
      icon: 'loading'
    })
    
    const file = blobToFile(result.blob, `${editForm.value.title}.${result.ext}`)
    await updateMusic({
      id: matchId,
      title: editForm.value.title,
      artist: editForm.value.artist,
      album: editForm.value.album,
      duration: result.duration || 0,
      codec: result.codec,
      bitrate: result.bitrate,
      sampleRate: result.sampleRate,
      bitDepth: result.bitDepth,
      mime: result.mime,
      source: getFinalSource()
    }, file)
    
    showToast({
      message: '更新成功',
      position: 'top'
    })
    
    const index = decryptResults.value.findIndex(r => r === result)
    if (index !== -1) {
      decryptResults.value.splice(index, 1)
    }
  } catch (error) {
    showToast({
      message: error instanceof Error ? error.message : '更新失败',
      position: 'top'
    })
  } finally {
    singerMatchList.value = []
    selectedMatchId.value = null
    currentUploadResult.value = null
  }
}

const performAddNew = async (result: DecryptResult) => {
  try {
    showToast({
      message: '正在上传...',
      position: 'top',
      duration: 0,
      icon: 'loading'
    })
    
    const file = blobToFile(result.blob, `${editForm.value.title}.${result.ext}`)
    await uploadMusic({
      title: editForm.value.title,
      artist: editForm.value.artist,
      album: editForm.value.album,
      duration: result.duration || 0,
      codec: result.codec,
      bitrate: result.bitrate,
      sampleRate: result.sampleRate,
      bitDepth: result.bitDepth,
      mime: result.mime,
      source: getFinalSource()
    }, file)
    
    showToast({
      message: '上传成功',
      position: 'top'
    })
    
    const index = decryptResults.value.findIndex(r => r === result)
    if (index !== -1) {
      decryptResults.value.splice(index, 1)
    }
  } catch (error) {
    showToast({
      message: error instanceof Error ? error.message : '上传失败',
      position: 'top'
    })
  } finally {
    closeSingerMatch()
  }
}

const blobToFile = (blob: Blob, filename: string): File => {
  const file = blob as unknown as File
  if (file.name) return file
  
  const fileWithName = new File([blob], filename, {
    type: blob.type || 'audio/mpeg'
  })
  return fileWithName
}
</script>

<style scoped>
.back-btn:active {
  opacity: 0.7;
}

.upload-btn:active {
  opacity: 0.8;
}

.result-item:active {
  opacity: 0.9;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.preview-dialog :deep(.van-dialog__content) {
  padding: 0;
}

.preview-content {
  padding: 16px;
}

.singer-match-dialog :deep(.van-dialog__content) {
  padding: 12px;
}

.match-item:active {
  opacity: 0.8;
}

.confirm-dialog :deep(.van-dialog__content) {
  padding: 16px;
}

.confirm-content {
  max-height: 60vh;
  overflow-y: auto;
}

.field-label {
  font-weight: 500;
}

.readonly-fields .info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.update-tip {
  border: 1px solid #fef3c7;
}

.switch-btn {
  border: none;
  cursor: pointer;
}

.switch-btn:active {
  opacity: 0.8;
}

.raw-filename {
  word-break: break-all;
}
</style>