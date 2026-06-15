<template>
  <div class="unicode-convert-page">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-gradient-to-r from-primary to-info z-50">
      <div class="flex items-center px-5 h-12">
        <div class="back-btn w-8 h-8 flex items-center justify-center cursor-pointer" @click="goBack">
          <span class="text-white text-2xl">‹</span>
        </div>
        <h1 class="text-white text-lg font-semibold mx-3">Unicode 编解码</h1>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content pt-14 pb-4 px-4">
      <!-- 编码格式选择 -->
      <div class="format-section">
        <div class="section-title">编码格式</div>
        <van-radio-group v-model="format" direction="horizontal" class="format-group">
          <van-radio name="escape">\uXXXX 格式</van-radio>
          <van-radio name="codePoint">U+XXXX 格式</van-radio>
          <van-radio name="htmlEntity">&#XXXX; 格式</van-radio>
        </van-radio-group>
      </div>

      <!-- 输入区域 -->
      <div class="input-section">
        <div class="section-title">输入文本</div>
        <van-field
          v-model="inputText"
          type="textarea"
          placeholder="请输入要编解码的文本"
          rows="4"
          autosize
          show-word-limit
          maxlength="5000"
          class="input-field"
        />
        <div class="input-actions">
          <van-button size="small" @click="handleClear">清空</van-button>
          <van-button size="small" @click="handlePaste">粘贴</van-button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <van-button type="primary" size="large" @click="handleEncode">
          <span class="action-icon">⬇</span> 编码
        </van-button>
        <van-button type="success" size="large" @click="handleDecode">
          <span class="action-icon">⬆</span> 解码
        </van-button>
      </div>

      <!-- 输出区域 -->
      <div class="output-section">
        <div class="section-header">
          <span class="section-title">输出结果</span>
          <div class="output-actions">
            <van-button size="small" @click="handleCopy">复制</van-button>
            <van-button size="small" @click="handleSwap">交换</van-button>
          </div>
        </div>
        <van-field
          v-model="outputText"
          type="textarea"
          placeholder="结果将显示在这里"
          rows="4"
          autosize
          readonly
          class="output-field"
        />
      </div>

      <!-- 常用字符参考 -->
      <div class="reference-section">
        <div class="section-title">常用字符参考</div>
        <div class="reference-grid">
          <div 
            v-for="item in referenceChars" 
            :key="item.char" 
            class="reference-item"
            @click="handleReferenceClick(item)"
          >
            <span class="reference-char">{{ item.char }}</span>
            <span class="reference-code">{{ item.code }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'

// 路由
const router = useRouter()

// 编码格式
const format = ref<'escape' | 'codePoint' | 'htmlEntity'>('escape')

// 输入输出文本
const inputText = ref('')
const outputText = ref('')

// 常用字符参考
const referenceChars = [
  { char: '空格', code: 'U+0020' },
  { char: '换行', code: 'U+000A' },
  { char: '制表', code: 'U+0009' },
  { char: '中', code: 'U+4E2D' },
  { char: '文', code: 'U+6587' },
  { char: '😀', code: 'U+1F600' },
  { char: '♥', code: 'U+2665' },
  { char: '©', code: 'U+00A9' }
]

// 返回上一页
const goBack = () => {
  router.back()
}

// 清空输入
const handleClear = () => {
  inputText.value = ''
  outputText.value = ''
  showToast('已清空')
}

// 粘贴
const handlePaste = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputText.value = text
    showSuccessToast('已粘贴')
  } catch {
    showToast('粘贴失败，请手动粘贴')
  }
}

// Unicode 编码
const handleEncode = () => {
  if (!inputText.value.trim()) {
    showToast('请输入要编码的文本')
    return
  }

  let result = ''
  switch (format.value) {
    case 'escape':
      // \uXXXX 格式编码，ASCII 可见字符保持原样
      result = inputText.value
        .split('')
        .map(char => {
          const code = char.charCodeAt(0)
          // ASCII 可见字符（32-126）保持原样
          if (code >= 32 && code <= 126) {
            return char
          }
          // 其他字符转换为 \uXXXX 格式
          return `\\u${code.toString(16).padStart(4, '0')}`
        })
        .join('')
      break

    case 'codePoint':
      // U+XXXX 格式编码，所有字符都转换
      result = inputText.value
        .split('')
        .map(char => {
          const code = char.charCodeAt(0)
          return `U+${code.toString(16).toUpperCase().padStart(4, '0')}`
        })
        .join(' ')
      break

    case 'htmlEntity':
      // &#XXXX; 格式编码，ASCII 可见字符保持原样
      result = inputText.value
        .split('')
        .map(char => {
          const code = char.charCodeAt(0)
          // ASCII 可见字符（32-126）保持原样
          if (code >= 32 && code <= 126) {
            return char
          }
          // 其他字符转换为 &#XXXX; 格式
          return `&#${code};`
        })
        .join('')
      break
  }

  outputText.value = result
  showSuccessToast('编码完成')
}

// Unicode 解码
const handleDecode = () => {
  if (!inputText.value.trim()) {
    showToast('请输入要解码的文本')
    return
  }

  let result = ''
  try {
    switch (format.value) {
      case 'escape':
        // 解码 \uXXXX 格式
        result = inputText.value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
          return String.fromCharCode(parseInt(hex, 16))
        })
        break

      case 'codePoint':
        // 解码 U+XXXX 格式
        result = inputText.value.replace(/U\+([0-9a-fA-F]{4,6})/gi, (_, hex) => {
          return String.fromCharCode(parseInt(hex, 16))
        })
        break

      case 'htmlEntity':
        // 解码 &#XXXX; 格式
        result = inputText.value.replace(/&#(\d+);/g, (_, code) => {
          return String.fromCharCode(parseInt(code, 10))
        })
        break
    }

    outputText.value = result
    showSuccessToast('解码完成')
  } catch (error) {
    showToast('解码失败，请检查格式')
  }
}

// 复制结果
const handleCopy = async () => {
  if (!outputText.value) {
    showToast('没有可复制的内容')
    return
  }

  try {
    await navigator.clipboard.writeText(outputText.value)
    showSuccessToast('已复制到剪贴板')
  } catch {
    showToast('复制失败')
  }
}

// 交换输入输出
const handleSwap = () => {
  if (!outputText.value) {
    showToast('没有可交换的内容')
    return
  }

  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp
  showSuccessToast('已交换')
}

// 点击参考字符
const handleReferenceClick = (item: { char: string; code: string }) => {
  inputText.value = item.code
  showToast(`已填入 ${item.code}`)
}
</script>

<style scoped>
.unicode-convert-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.format-section,
.input-section,
.output-section,
.reference-section {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #fff;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #323233;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header .section-title {
  margin-bottom: 0;
}

.format-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.input-field,
.output-field {
  background-color: #f7f8fa;
  border-radius: 8px;
}

.input-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  justify-content: flex-end;
}

.output-actions {
  display: flex;
  gap: 8px;
}

.action-section {
  display: flex;
  gap: 12px;
}

.action-section .van-button {
  flex: 1;
}

.action-icon {
  margin-right: 4px;
}

.reference-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.reference-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.reference-item:active {
  background-color: #f0f0f0;
  transform: scale(0.98);
}

.reference-char {
  font-size: 16px;
  font-weight: 500;
  color: #323233;
}

.reference-code {
  font-size: 10px;
  color: #969799;
  margin-top: 4px;
}
</style>