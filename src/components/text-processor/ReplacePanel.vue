<template>
  <div class="replace-panel">
    <!-- 查找输入 -->
    <van-field
      v-model="findText"
      label="查找内容"
      placeholder="请输入要查找的内容"
      clearable
    />

    <!-- 替换输入 -->
    <van-field
      v-model="replaceText"
      label="替换内容"
      placeholder="请输入替换后的内容"
      clearable
    />

    <!-- 替换选项 -->
    <div class="replace-options">
      <van-checkbox v-model="options.caseSensitive">大小写敏感</van-checkbox>
      <van-checkbox v-model="options.useRegex">正则表达式</van-checkbox>
      <van-checkbox v-model="options.useCaptureGroups" :disabled="!options.useRegex">
        使用捕获组
      </van-checkbox>
    </div>

    <!-- 操作按钮 -->
    <div class="replace-actions">
      <van-button
        type="primary"
        size="small"
        @click="handleReplace"
        :disabled="!findText.trim()"
      >
        替换
      </van-button>
      <van-button
        type="primary"
        size="small"
        @click="handleReplaceAll"
        :disabled="!findText.trim()"
      >
        全部替换
      </van-button>
      <van-button
        size="small"
        @click="handleUndo"
        :disabled="history.length === 0"
      >
        撤销
      </van-button>
    </div>

    <!-- 替换结果 -->
    <div v-if="replaceCount > 0" class="replace-result">
      <span class="result-count">已替换 {{ replaceCount }} 处</span>
    </div>

    <!-- 替换历史 -->
    <div v-if="history.length > 0" class="replace-history">
      <div class="history-header">
        <span>替换历史（最近 {{ history.length }} 次）</span>
      </div>
      <div class="history-list">
        <div v-for="(item, index) in history" :key="item.id" class="history-item">
          <span class="history-index">#{{ index + 1 }}</span>
          <span class="history-time">{{ formatTime(item.timestamp) }}</span>
          <span class="history-count">{{ item.data.replaceCount }} 处</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import { replaceText as doReplaceText, generateId } from '@/utils/textProcessor'
import type { ReplaceOptions, HistoryItem } from '@/types/textProcessor'

// Props
interface Props {
  text: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'replace', newText: string): void
}>()

// 查找文本
const findText = ref('')

// 替换文本
const replaceText = ref('')

// 替换选项
const options = ref<ReplaceOptions>({
  caseSensitive: false,
  useRegex: false,
  useCaptureGroups: false
})

// 替换次数
const replaceCount = ref(0)

// 替换历史
const history = ref<HistoryItem[]>([])

// 执行单个替换
const handleReplace = () => {
  if (!props.text.trim()) {
    showToast('请先输入文本')
    return
  }

  if (!findText.value.trim()) {
    showToast('请输入查找内容')
    return
  }

  try {
    const result = doReplaceText(props.text, {
      findText: findText.value,
      replaceText: replaceText.value,
      caseSensitive: options.value.caseSensitive,
      useRegex: options.value.useRegex,
      replaceAll: false
    })

    if (result.replaceCount > 0) {
      // 记录历史
      history.value.unshift({
        id: generateId(),
        type: 'replace',
        timestamp: Date.now(),
        data: {
          originalText: props.text,
          newText: result.newText,
          replaceCount: result.replaceCount
        }
      })

      // 限制历史记录数量
      if (history.value.length > 10) {
        history.value = history.value.slice(0, 10)
      }

      replaceCount.value = result.replaceCount
      emit('replace', result.newText)
      showSuccessToast(`已替换 ${result.replaceCount} 处`)
    } else {
      showToast('未找到匹配项')
    }
  } catch (error) {
    showToast('替换失败，请检查输入')
  }
}

// 执行全部替换
const handleReplaceAll = () => {
  if (!props.text.trim()) {
    showToast('请先输入文本')
    return
  }

  if (!findText.value.trim()) {
    showToast('请输入查找内容')
    return
  }

  try {
    const result = doReplaceText(props.text, {
      findText: findText.value,
      replaceText: replaceText.value,
      caseSensitive: options.value.caseSensitive,
      useRegex: options.value.useRegex,
      replaceAll: true
    })

    if (result.replaceCount > 0) {
      // 记录历史
      history.value.unshift({
        id: generateId(),
        type: 'replace',
        timestamp: Date.now(),
        data: {
          originalText: props.text,
          newText: result.newText,
          replaceCount: result.replaceCount
        }
      })

      // 限制历史记录数量
      if (history.value.length > 10) {
        history.value = history.value.slice(0, 10)
      }

      replaceCount.value = result.replaceCount
      emit('replace', result.newText)
      showSuccessToast(`已替换 ${result.replaceCount} 处`)
    } else {
      showToast('未找到匹配项')
    }
  } catch (error) {
    showToast('替换失败，请检查输入')
  }
}

// 撤销操作
const handleUndo = () => {
  if (history.value.length === 0) {
    showToast('没有可撤销的操作')
    return
  }

  const lastItem = history.value[0]
  emit('replace', lastItem.data.originalText)
  history.value.shift()
  replaceCount.value = 0
  showSuccessToast('已撤销')
}

// 格式化时间
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}
</script>

<style scoped>
.replace-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.replace-options {
  display: flex;
  gap: 12px;
  padding: 8px 0;
}

.replace-actions {
  display: flex;
  gap: 8px;
}

.replace-result {
  padding: 8px 0;
}

.result-count {
  font-size: 14px;
  font-weight: 500;
  color: #07c160;
}

.replace-history {
  margin-top: 12px;
}

.history-header {
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 500;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.history-index {
  font-size: 12px;
  color: #6b7280;
}

.history-time {
  font-size: 12px;
  color: #9ca3af;
}

.history-count {
  font-size: 12px;
  color: #1989fa;
}
</style>