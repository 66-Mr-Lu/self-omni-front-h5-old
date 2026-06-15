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
      <van-button size="mini" type="warning" @click="handleReplace" :disabled="!canReplace">替换</van-button>
      <van-button size="mini" type="danger" @click="handleReplaceAll" :disabled="!canReplace">替换全部</van-button>
    </div>

    <!-- 查找选项 -->
    <div class="find-options">
      <van-checkbox v-model="options.caseSensitive">大小写敏感</van-checkbox>
      <van-checkbox v-model="options.wholeWord">全词匹配</van-checkbox>
      <van-checkbox v-model="options.useRegex">正则表达式</van-checkbox>
    </div>

    <!-- 查找结果 -->
    <div v-if="showResult" class="find-result">
      <div class="result-header">
        <span class="result-count">找到 {{ result?.count || 0 }} 个匹配项</span>
        <span v-if="result?.count && result.count > 0" class="current-index">
          {{ currentIndex + 1 }} / {{ result.count }}
        </span>
      </div>

      <!-- 匹配项列表 -->
      <div v-if="result?.matches.length > 0" class="matches-list">
        <div
          v-for="(match, index) in result.matches"
          :key="index"
          :class="['match-item', { active: index === currentIndex }]"
          @click="handleMatchClick(match, index)"
        >
          <div class="match-info">
            <span class="match-position">行 {{ match.line }}，列 {{ match.column }}</span>
            <span class="match-text">{{ match.text }}</span>
          </div>
          <div class="match-context">{{ match.context }}</div>
        </div>
      </div>

      <!-- 无匹配项 -->
      <div v-else class="no-matches">
        <van-empty description="未找到匹配项" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue'
import { findText, replaceText } from '@/utils/textProcessor'
import type { FindResult, MatchItem, FindOptions } from '@/types/textProcessor'

// Props
interface Props {
  text: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'highlight', matches: MatchItem[]): void
  (e: 'jump-to', match: MatchItem): void
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
    // 重置当前索引
    currentIndex.value = 0
    emit('highlight', result.value.matches)
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

// 上一个匹配项
const handlePrev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    const match = result.value?.matches[currentIndex.value]
    if (match) {
      emit('jump-to', match)
    }
  }
}

// 下一个匹配项
const handleNext = () => {
  if (result.value && currentIndex.value < result.value.count - 1) {
    currentIndex.value++
    const match = result.value.matches[currentIndex.value]
    if (match) {
      emit('jump-to', match)
    }
  }
}

// 替换当前匹配项
const handleReplace = () => {
  if (!result.value || !canReplace.value) {
    return
  }

  // 执行替换（只替换第一个匹配项）
  const resultObj = replaceText(props.text, {
    findText: keyword.value,
    replaceText: replaceTextValue.value,
    caseSensitive: options.value.caseSensitive,
    useRegex: options.value.useRegex,
    replaceAll: false
  })

  if (resultObj.newText !== props.text) {
    emit('replace', resultObj.newText)
    // 重新查找
    debounceFind()
  }
}

// 替换全部匹配项
const handleReplaceAll = () => {
  if (!result.value || !canReplace.value) {
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
    emit('replace', resultObj.newText)
    // 重新查找
    debounceFind()
  }
}

// 点击匹配项
const handleMatchClick = (match: MatchItem, index: number) => {
  currentIndex.value = index
  emit('jump-to', match)
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
</style>