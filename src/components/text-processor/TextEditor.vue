<template>
  <div class="text-editor">
    <!-- 文本输入区 -->
    <div class="editor-wrapper">
      <textarea
        v-model="localText"
        class="editor-textarea"
        placeholder="请输入或粘贴文本..."
        @input="handleInput"
      ></textarea>
    </div>

    <!-- 统计信息 -->
    <div class="editor-stats">
      <span>字符数: {{ stats.totalChars }}</span>
      <span>行数: {{ stats.lineCount }}</span>
    </div>

    <!-- 操作按钮 -->
    <div class="editor-actions">
      <van-button size="small" @click="handleClear">清空</van-button>
      <van-button size="small" @click="handleLoadExample">加载示例</van-button>
      <van-button size="small" @click="handleCopy">复制</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import { getTextStatistics } from '@/utils/textProcessor'
import type { TextStatistics } from '@/types/textProcessor'

// Props
interface Props {
  modelValue: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// 本地文本
const localText = ref(props.modelValue)

// 统计信息
const stats = computed<TextStatistics>(() => {
  return getTextStatistics(localText.value)
})

// 监听外部变化
watch(
  () => props.modelValue,
  (newValue) => {
    localText.value = newValue
  }
)

// 处理输入
const handleInput = () => {
  emit('update:modelValue', localText.value)
}

// 清空文本
const handleClear = () => {
  localText.value = ''
  emit('update:modelValue', '')
  showToast('已清空')
}

// 加载示例
const handleLoadExample = () => {
  const example = `这是一个示例文本。
你可以在这里进行查找、替换、计数等操作。

Hello World! This is a test.
你好，世界！这是一个测试。

12345
67890

测试文本处理功能：
- 查找功能：支持普通文本和正则表达式
- 替换功能：支持单个替换和全部替换
- 计数功能：统计关键字出现次数
- 文本清理：删除空行、多余空格等
- 文本统计：字符数、单词数、行数等`

  localText.value = example
  emit('update:modelValue', example)
  showSuccessToast('已加载示例')
}

// 复制文本
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(localText.value)
    showSuccessToast('已复制到剪贴板')
  } catch (error) {
    showToast('复制失败')
  }
}
</script>

<style scoped>
.text-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.editor-wrapper {
  position: relative;
  width: 100%;
}

.editor-textarea {
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.editor-textarea:focus {
  border-color: #1989fa;
}

.editor-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #6b7280;
}

.editor-actions {
  display: flex;
  gap: 8px;
}
</style>