<template>
  <div class="json-convert-page min-h-screen bg-gray-100">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-gradient-to-r from-primary to-info z-50">
      <div class="flex items-center px-5 h-12">
        <div class="back-btn w-8 h-8 flex items-center justify-center cursor-pointer" @click="goBack">
          <span class="text-white">‹</span>
        </div>
        <h1 class="text-white text-lg font-semibold mx-3">JSON转义转换</h1>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content pt-0 px-3 pb-4">
      <!-- 操作按钮区域 -->
      <div class="bg-white rounded-xl shadow-sm p-3 mb-3">
        <div class="flex gap-2">
          <button 
            class="flex-1 py-2 rounded-lg font-medium text-sm transition-all"
            :class="convertMode === 'string-to-json' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'"
            @click="switchMode('string-to-json')"
          >
            转义字符串→JSON
          </button>
          <button 
            class="flex-1 py-2 rounded-lg font-medium text-sm transition-all"
            :class="convertMode === 'json-to-string' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'"
            @click="switchMode('json-to-string')"
          >
            JSON→转义字符串
          </button>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="bg-white rounded-xl shadow-sm p-3 mb-3">
        <div class="flex items-center justify-between mb-2">
          <label class="text-gray-700 font-medium text-sm">输入内容</label>
          <button 
            class="text-xs text-blue-500 hover:text-blue-600"
            @click="clearInput"
          >
            清空
          </button>
        </div>
        <textarea
          v-model="inputText"
          class="w-full h-36 p-2.5 border border-gray-200 rounded-lg resize-none text-sm text-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          :placeholder="inputPlaceholder"
        ></textarea>
        <div class="flex items-center justify-between mt-2">
          <span class="text-xs text-gray-400">{{ inputText.length }} 字符</span>
          <button 
            class="text-xs text-blue-500 hover:text-blue-600"
            @click="loadExample"
          >
            加载示例
          </button>
        </div>
      </div>

      <!-- 转换按钮 -->
      <button 
        class="w-full bg-primary text-white py-2.5 rounded-xl font-medium mb-3 transition-all active:opacity-80"
        @click="handleConvert"
        :disabled="!inputText.trim()"
        :class="{ 'opacity-50 cursor-not-allowed': !inputText.trim() }"
      >
        开始转换
      </button>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
        <div class="flex items-start">
          <span class="text-red-500 mr-2">⚠️</span>
          <p class="text-red-600 text-sm">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- 输出区域 -->
      <div v-if="outputText" class="bg-white rounded-xl shadow-sm p-3">
        <div class="flex items-center justify-between mb-2">
          <label class="text-gray-700 font-medium text-sm">转换结果</label>
          <div class="flex gap-2">
            <button 
              class="text-xs text-blue-500 hover:text-blue-600"
              @click="copyOutput"
            >
              {{ copied ? '已复制' : '复制' }}
            </button>
            <button 
              class="text-xs text-gray-500 hover:text-gray-600"
              @click="clearOutput"
            >
              清空
            </button>
          </div>
        </div>
        <textarea
          v-model="outputText"
          class="w-full h-36 p-2.5 border border-gray-200 rounded-lg resize-none text-sm text-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          readonly
        ></textarea>
        <div class="flex items-center justify-between mt-2">
          <span class="text-xs text-gray-400">{{ outputText.length }} 字符</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

// 路由
const router = useRouter()

// 转换模式
const convertMode = ref<'string-to-json' | 'json-to-string'>('string-to-json')

// 输入文本
const inputText = ref('')

// 输出文本
const outputText = ref('')

// 错误消息
const errorMessage = ref('')

// 是否已复制
const copied = ref(false)

// 输入占位符
const inputPlaceholder = computed(() => {
  if (convertMode.value === 'string-to-json') {
    return '请输入转义字符串，例如："{\\"name\\":\\"1\\"}"'
  }
  return '请输入有效的JSON对象'
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 切换模式
const switchMode = (mode: 'string-to-json' | 'json-to-string') => {
  convertMode.value = mode
  outputText.value = ''
  errorMessage.value = ''
}

// 清空输入
const clearInput = () => {
  inputText.value = ''
  outputText.value = ''
  errorMessage.value = ''
}

// 清空输出
const clearOutput = () => {
  outputText.value = ''
}

// 加载示例
const loadExample = () => {
  if (convertMode.value === 'string-to-json') {
    // 转义字符串示例：外层是字符串，内层JSON的引号被转义
    inputText.value = '"{\\"name\\":\\"张三\\",\\"age\\":25,\\"isActive\\":true,\\"hobbies\\":[\\"编程\\",\\"阅读\\",\\"跑步\\"],\\"address\\":{\\"city\\":\\"北京\\",\\"district\\":\\"朝阳区\\"}}"'
  } else {
    inputText.value = `{
  "name": "张三",
  "age": 25,
  "isActive": true,
  "hobbies": ["编程", "阅读", "跑步"],
  "address": {
    "city": "北京",
    "district": "朝阳区"
  }
}`
  }
  outputText.value = ''
  errorMessage.value = ''
}

// 尝试解析JSON，支持转义字符串
const tryParseJson = (input: string): unknown => {
  let result: unknown
  let currentInput = input.trim()
  
  // 尝试第一层解析
  try {
    result = JSON.parse(currentInput)
    // 如果解析结果是字符串，可能是转义的JSON字符串，继续解析
    if (typeof result === 'string') {
      try {
        result = JSON.parse(result)
      } catch {
        // 如果第二层解析失败，说明第一层解析结果就是最终字符串
      }
    }
    return result
  } catch {
    // 第一层解析失败，直接抛出错误
    throw new Error('JSON格式错误')
  }
}

// 处理转换
const handleConvert = () => {
  if (!inputText.value.trim()) {
    return
  }

  outputText.value = ''
  errorMessage.value = ''

  try {
    if (convertMode.value === 'string-to-json') {
      // 转义字符串转JSON（格式化）
      const parsed = tryParseJson(inputText.value)
      outputText.value = JSON.stringify(parsed, null, 2)
    } else {
      // JSON转转义字符串（外层加引号，内部引号转义）
      const parsed = tryParseJson(inputText.value)
      const jsonString = JSON.stringify(parsed)
      // 将JSON字符串转换为转义字符串（外层加引号，内部引号转义）
      const escapedString = '"' + jsonString.replace(/"/g, '\\"') + '"'
      outputText.value = escapedString
    }
  } catch (e) {
    errorMessage.value = '输入内容不是有效的JSON格式，请检查后重试。'
    if (e instanceof Error) {
      errorMessage.value += `\n错误详情: ${e.message}`
    }
  }
}

// 复制输出
const copyOutput = async () => {
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
    // 降级方案：创建临时文本区域
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

textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>