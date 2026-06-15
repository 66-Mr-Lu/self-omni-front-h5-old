<template>
  <div class="find-panel">
    <!-- 查找输入 -->
    <van-field
      v-model="keyword"
      label="查找内容"
      placeholder="请输入要查找的内容"
      clearable
    />

    <!-- 替换输入 -->
    <van-field
      v-model="replaceTextValue"
      label="替换为"
      placeholder="请输入替换内容"
      clearable
    />

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <van-button size="mini" @click="handlePrev" :disabled="!canNavigate">上一个</van-button>
      <van-button size="mini" type="primary" @click="handleNext" :disabled="!canNavigate">下一个</van-button>
      <van-button size="mini" type="warning" @click="handleReplace">替换</van-button>
      <van-button size="mini" type="danger" @click="handleReplaceAll">替换全部</van-button>
    </div>

    <!-- 查找选项 -->
    <div class="find-options">
      <van-checkbox v-model="options.caseSensitive">大小写敏感</van-checkbox>
      <van-checkbox v-model="options.wholeWord">全词匹配</van-checkbox>
      <van-checkbox v-model="options.useRegex">正则表达式</van-checkbox>
    </div>

    <!-- 替换历史 -->
    <div v-if="replaceHistory.length > 0" class="replace-history">
      <div class="history-header">
        <span class="history-title">替换历史（最近 {{ replaceHistory.length }} 次）</span>
        <van-button size="mini" @click="handleUndo" :disabled="replaceHistory.length === 0">撤销</van-button>
      </div>
      <div class="history-list">
        <div
          v-for="(item, index) in replaceHistory"
          :key="item.id"
          class="history-item"
        >
          <span class="history-index">#{{ index + 1 }}</span>
          <span class="history-time">{{ formatTime(item.timestamp) }}</span>
          <div class="history-detail">
            <span class="history-from">{{ truncateText(item.findText, 15) }}</span>
            <span class="history-arrow">→</span>
            <span class="history-to">{{ truncateText(item.replaceText, 15) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue'
import { showToast } from 'vant'
import { findText, replaceText } from '@/utils/textProcessor'
import type { FindResult, MatchItem, FindOptions, ReplaceHistoryItem } from '@/types/textProcessor'

// Props
interface Props {
  text: string
  getCursorPosition?: () => number  // 获取光标位置的回调函数
}

const props = withDefaults(defineProps<Props>(), {
  getCursorPosition: () => -1
})

// Emits
const emit = defineEmits<{
  (e: 'highlight', matches: MatchItem[]): void
  (e: 'jump-to', match: MatchItem, index: number): void
  (e: 'replace', newText: string): void
}>()

// 查找关键字
const keyword = ref('')

// 替换文本
const replaceTextValue = ref('')

// 查找选项
const options = ref<FindOptions>({
  caseSensitive: false,
  wholeWord: false,
  useRegex: false
})

// 修改记录
const replaceHistory = ref<ReplaceHistoryItem[]>([])

// 是否可以导航
const canNavigate = computed(() => {
  return showResult.value && result.value && result.value.count > 0
})

// 是否可以替换
const canReplace = computed(() => {
  return canNavigate.value && replaceTextValue.value.trim() !== ''
})

// 查找结果
const result = ref<FindResult | null>(null)

// 是否显示结果
const showResult = ref(false)

// 当前匹配项索引
const currentIndex = ref(0)

// 防抖定时器
let debounceTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 防抖执行查找
 */
const debounceFind = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    executeFind()
  }, 300)
}

/**
 * 执行查找逻辑
 */
const executeFind = () => {
  // 如果没有关键字，隐藏结果并清除高亮
  if (!keyword.value.trim()) {
    showResult.value = false
    result.value = null
    emit('highlight', [])
    return
  }

  try {
    result.value = findText(props.text, keyword.value, options.value)
    showResult.value = true
    emit('highlight', result.value.matches)

    // 聚焦到最近的匹配项
    if (result.value.count > 0) {
      // 获取当前光标位置
      const cursorPosition = props.getCursorPosition()

      if (cursorPosition > 0 && result.value.matches.length > 0) {
        // 找到离当前光标最近的匹配项
        let nearestIndex = 0
        let nearestDistance = Math.abs(result.value.matches[0].index - cursorPosition)

        for (let i = 1; i < result.value.matches.length; i++) {
          const distance = Math.abs(result.value.matches[i].index - cursorPosition)
          if (distance < nearestDistance) {
            nearestDistance = distance
            nearestIndex = i
          }
        }

        currentIndex.value = nearestIndex
      } else {
        // 没有光标位置，默认聚焦第一个
        currentIndex.value = 0
      }

      // 自动跳转到当前匹配的匹配项
      const match = result.value.matches[currentIndex.value]
      if (match) {
        emit('jump-to', match, currentIndex.value)
      }
    }
  } catch (error) {
    result.value = null
    showResult.value = false
    emit('highlight', [])
  }
}

// 监听关键字变化，自动触发查找（带防抖）
watch(keyword, debounceFind)

// 监听选项变化，自动触发查找（带防抖）
watch(options, debounceFind, { deep: true })

// 监听文本变化，自动触发查找（带防抖）
watch(() => props.text, debounceFind)

// 组件卸载时清除定时器
onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})

// 上一个匹配项（支持循环）
const handlePrev = () => {
  if (!result.value || result.value.count === 0) {
    return
  }

  // 循环逻辑：如果在第一个，跳转到最后一个
  if (currentIndex.value <= 0) {
    currentIndex.value = result.value.count - 1
  } else {
    currentIndex.value--
  }

  const match = result.value.matches[currentIndex.value]
  if (match) {
    emit('jump-to', match, currentIndex.value)
  }
}

// 下一个匹配项（支持循环）
const handleNext = () => {
  if (!result.value || result.value.count === 0) {
    return
  }

  // 循环逻辑：如果在最后一个，跳转到第一个
  if (currentIndex.value >= result.value.count - 1) {
    currentIndex.value = 0
  } else {
    currentIndex.value++
  }

  const match = result.value.matches[currentIndex.value]
  if (match) {
    emit('jump-to', match, currentIndex.value)
  }
}

// 替换当前匹配项
const handleReplace = () => {
  // 检查查找内容是否为空
  if (!keyword.value.trim()) {
    showToast('请输入查找内容')
    return
  }

  // 检查是否有匹配项
  if (!result.value || result.value.count === 0) {
    showToast('未找到匹配项')
    return
  }

  // 获取当前选中的匹配项
  const currentMatch = result.value.matches[currentIndex.value]
  if (!currentMatch) {
    return
  }

  // 执行替换（替换当前选中的匹配项）
  const resultObj = replaceText(props.text, {
    findText: keyword.value,
    replaceText: replaceTextValue.value,
    caseSensitive: options.value.caseSensitive,
    useRegex: options.value.useRegex,
    replaceAll: false,
    startIndex: currentMatch.index
  })

  if (resultObj.newText !== props.text) {
    // 添加修改记录
    addReplaceHistory(props.text, keyword.value, replaceTextValue.value)
    emit('replace', resultObj.newText)
    // 重新查找并保持当前位置
    debounceFind()
  }
}

// 替换全部匹配项
const handleReplaceAll = () => {
  // 检查查找内容是否为空
  if (!keyword.value.trim()) {
    showToast('请输入查找内容')
    return
  }

  // 检查是否有匹配项
  if (!result.value || result.value.count === 0) {
    showToast('未找到匹配项')
    return
  }

  // 执行替换全部
  const resultObj = replaceText(props.text, {
    findText: keyword.value,
    replaceText: replaceTextValue.value,
    caseSensitive: options.value.caseSensitive,
    useRegex: options.value.useRegex,
    replaceAll: true
  })

  if (resultObj.newText !== props.text) {
    // 添加修改记录
    addReplaceHistory(props.text, keyword.value, replaceTextValue.value)
    emit('replace', resultObj.newText)
    // 重新查找
    debounceFind()
  }
}

// 添加修改记录
const addReplaceHistory = (originalText: string, findText: string, replaceText: string) => {
  const item: ReplaceHistoryItem = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    originalText,
    findText,
    replaceText,
    timestamp: Date.now()
  }
  // 插入到最前面
  replaceHistory.value.unshift(item)
  // 最多保留10条记录
  if (replaceHistory.value.length > 10) {
    replaceHistory.value.pop()
  }
}

// 撤销操作
const handleUndo = () => {
  if (replaceHistory.value.length === 0) {
    return
  }
  
  // 获取最后一次操作的原始文本
  const lastItem = replaceHistory.value[0]
  emit('replace', lastItem.originalText)
  
  // 移除该记录
  replaceHistory.value.shift()
}

// 截断文本
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
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
.find-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.find-options {
  display: flex;
  gap: 12px;
  padding: 8px 0;
}

.find-result {
  margin-top: 12px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.result-count {
  font-size: 14px;
  font-weight: 500;
  color: #1989fa;
}

.current-index {
  font-size: 12px;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 6px;
  padding: 8px 0;
}

.action-buttons :deep(.van-button) {
  flex: 1;
  min-width: 60px;
}

.matches-list {
  max-height: 300px;
  overflow-y: auto;
}

.match-item {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background-color 0.2s;
}

.match-item:hover {
  background-color: #f9fafb;
}

.match-item.active {
  background-color: #e0f2fe;
  border-left: 3px solid #1989fa;
}

.match-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.match-position {
  font-size: 12px;
  color: #6b7280;
}

.match-text {
  font-size: 14px;
  font-weight: 500;
  color: #1989fa;
}

.match-context {
  font-size: 12px;
  color: #9ca3af;
  word-break: break-all;
}

.no-matches {
  padding: 20px 0;
}

/* 替换历史样式 */
.replace-history {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  margin-bottom: 8px;
  background-color: #f9fafb;
  border-radius: 6px;
}

.history-item:last-child {
  margin-bottom: 0;
}

.history-index {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}

.history-time {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 6px;
}

.history-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.history-from {
  font-size: 13px;
  color: #ef4444;
  font-family: monospace;
  background-color: #fef2f2;
  padding: 2px 6px;
  border-radius: 3px;
}

.history-arrow {
  font-size: 14px;
  color: #9ca3af;
}

.history-to {
  font-size: 13px;
  color: #10b981;
  font-family: monospace;
  background-color: #f0fdf4;
  padding: 2px 6px;
  border-radius: 3px;
}
</style>