<template>
  <div class="base64-convert-page min-h-screen bg-gray-100">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-gradient-to-r from-primary to-info z-50">
      <div class="flex items-center px-5 h-12">
        <div class="back-btn w-8 h-8 flex items-center justify-center cursor-pointer" @click="goBack">
          <span class="text-white text-2xl">‹</span>
        </div>
        <h1 class="text-white text-lg font-semibold mx-3">Base64编解码</h1>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content pt-4 px-4 pb-4">
      <!-- 模式切换 -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-4">
        <van-radio-group v-model="mode" direction="horizontal" class="w-full">
          <van-radio name="encode" shape="button">编码 (Encode)</van-radio>
          <van-radio name="decode" shape="button">解码 (Decode)</van-radio>
        </van-radio-group>
      </div>

      <!-- 输入区域 -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div class="flex items-center justify-between mb-2">
          <label class="text-gray-700 font-medium text-sm">{{ mode === 'encode' ? '原始文本' : 'Base64编码' }}</label>
          <div class="flex gap-2">
            <button 
              class="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs transition-all active:opacity-80"
              @click="clearInput"
            >
              清空
            </button>
            <button 
              class="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs transition-all active:opacity-80"
              @click="pasteFromClipboard"
            >
              粘贴
            </button>
          </div>
        </div>
        <textarea
          v-model="inputText"
          :placeholder="mode === 'encode' ? '请输入要编码的文本...' : '请输入Base64编码...'"
          class="w-full h-40 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none font-mono"
          @input="autoConvert"
        ></textarea>
        <div class="mt-2 text-xs text-gray-400 text-right">
          {{ inputText.length }} 字符
        </div>
      </div>

      <!-- 转换按钮 -->
      <div class="mb-4">
        <button 
          class="w-full py-3 bg-gradient-to-r from-primary to-info text-white rounded-xl text-base font-medium transition-all active:opacity-80 shadow-md"
          @click="convert"
        >
          {{ mode === 'encode' ? '🔒 编码' : '🔓 解码' }}
        </button>
      </div>

      <!-- 输出区域 -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div class="flex items-center justify-between mb-2">
          <label class="text-gray-700 font-medium text-sm">{{ mode === 'encode' ? 'Base64编码' : '解码结果' }}</label>
          <button 
            class="px-3 py-1 bg-primary text-white rounded-lg text-xs transition-all active:opacity-80"
            @click="copyResult"
          >
            {{ copied ? '已复制' : '复制' }}
          </button>
        </div>
        <textarea
          v-model="outputText"
          readonly
          :placeholder="mode === 'encode' ? 'Base64编码结果将显示在这里...' : '解码结果将显示在这里...'"
          class="w-full h-40 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 resize-none font-mono"
        ></textarea>
        <div class="mt-2 text-xs text-gray-400 text-right">
          {{ outputText.length }} 字符
        </div>
      </div>

      <!-- 提示信息 -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
        <div class="flex items-start gap-2">
          <span class="text-red-500 text-lg">⚠️</span>
          <div>
            <div class="text-red-700 font-medium text-sm mb-1">错误提示</div>
            <div class="text-red-600 text-xs">{{ errorMessage }}</div>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <h3 class="text-gray-800 font-semibold text-base mb-3">使用说明</h3>
        <div class="space-y-2 text-sm text-gray-600">
          <div class="flex items-start gap-2">
            <span class="text-primary">•</span>
            <span><strong>编码模式：</strong>将普通文本转换为Base64编码格式</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-primary">•</span>
            <span><strong>解码模式：</strong>将Base64编码还原为原始文本</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-primary">•</span>
            <span><strong>自动转换：</strong>输入时会自动进行转换（可选）</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-primary">•</span>
            <span><strong>支持中文：</strong>完美支持UTF-8编码的中文字符</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

// 路由
const router = useRouter()

// 模式：encode(编码) / decode(解码)
const mode = ref<'encode' | 'decode'>('encode')

// 输入文本
const inputText = ref('')

// 输出文本
const outputText = ref('')

// 是否已复制
const copied = ref(false)

// 错误信息
const errorMessage = ref('')

// 返回上一页
const goBack = () => {
  router.back()
}

// 执行转换
const convert = () => {
  errorMessage.value = ''
  
  if (!inputText.value.trim()) {
    showToast('请输入内容')
    return
  }

  try {
    if (mode.value === 'encode') {
      // 编码：支持中文
      outputText.value = btoa(unescape(encodeURIComponent(inputText.value)))
      showToast('编码成功')
    } else {
      // 解码：支持中文
      const decoded = atob(inputText.value.trim())
      outputText.value = decodeURIComponent(escape(decoded))
      showToast('解码成功')
    }
  } catch (error) {
    errorMessage.value = mode.value === 'encode' 
      ? '编码失败，请检查输入内容' 
      : '解码失败，请确保输入的是有效的Base64编码'
    outputText.value = ''
    showToast(errorMessage.value)
  }
}

// 自动转换（输入时触发）
const autoConvert = () => {
  if (inputText.value.trim()) {
    convert()
  } else {
    outputText.value = ''
  }
}

// 清空输入
const clearInput = () => {
  inputText.value = ''
  outputText.value = ''
  errorMessage.value = ''
  showToast('已清空')
}

// 从剪贴板粘贴
const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputText.value = text
    showToast('已粘贴')
    // 自动转换
    setTimeout(() => {
      if (text.trim()) {
        convert()
      }
    }, 100)
  } catch (e) {
    showToast('无法访问剪贴板')
  }
}

// 复制结果
const copyResult = async () => {
  if (!outputText.value) {
    showToast('没有可复制的内容')
    return
  }

  try {
    await navigator.clipboard.writeText(outputText.value)
    copied.value = true
    showToast('复制成功')
    
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (e) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = outputText.value
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()
    
    try {
      document.execCommand('copy')
      copied.value = true
      showToast('复制成功')
      
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (err) {
      showToast('复制失败')
    } finally {
      document.body.removeChild(textArea)
    }
  }
}
</script>

<style scoped>
.back-btn {
  font-size: 24px;
}

.back-btn:active {
  opacity: 0.7;
}

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

:deep(.van-radio-group--horizontal) {
  display: flex;
  gap: 12px;
}

:deep(.van-radio--button) {
  flex: 1;
}

:deep(.van-radio__label) {
  font-size: 14px;
}
</style>
