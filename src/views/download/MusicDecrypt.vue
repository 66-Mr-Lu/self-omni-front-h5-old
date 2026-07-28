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
              <p class="text-gray-400 text-[10px] mt-1">原文件: {{ result.rawFilename }}.{{ result.rawExt }}</p>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              class="flex-1 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1 active:bg-purple-100 transition-colors"
              @click="previewMusic(result)"
            >
              <span>▶</span>
              <span>预览</span>
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
    >
      <div v-if="previewResult" class="preview-content">
        <div class="preview-cover w-full aspect-square rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 overflow-hidden">
          <img v-if="previewResult.picture" :src="previewResult.picture" class="w-full h-full object-cover" />
          <span v-else class="text-4xl">🎵</span>
        </div>
        <audio
          :src="previewUrl"
          controls
          class="w-full h-10"
        />
        <p class="text-gray-500 text-xs text-center mt-2">{{ previewResult.artist }} - {{ previewResult.album }}</p>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, Dialog } from 'vant'
import { Decrypt } from '@/decrypt/index'
import type { DecryptResult, FileInfo } from '@/decrypt/entity'

const [vanDialog] = [Dialog]

const router = useRouter()

const filesToDecrypt = ref<File[]>([])
const decryptResults = ref<DecryptResult[]>([])
const decrypting = ref(false)
const decryptingIndex = ref(0)
const errorMessage = ref('')

const showPreview = ref(false)
const previewResult = ref<DecryptResult | null>(null)
const previewUrl = ref('')

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
</style>