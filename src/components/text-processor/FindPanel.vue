<template>
  <div class="find-panel">
    <!-- 查找输入 -->
    <van-field
      v-model="keyword"
      label="查找内容"
      placeholder="请输入要查找的内容"
      clearable
    />

    <!-- 查找选项 -->
    <div class="find-options">
      <van-checkbox v-model="options.caseSensitive">大小写敏感</van-checkbox>
      <van-checkbox v-model="options.wholeWord">全词匹配</van-checkbox>
      <van-checkbox v-model="options.useRegex">正则表达式</van-checkbox>
    </div>

    <!-- 查找按钮 -->
    <van-button type="primary" block @click="handleFind" :disabled="!keyword.trim()">
      查找
    </van-button>

    <!-- 查找结果 -->
    <div v-if="result" class="find-result">
      <div class="result-header">
        <span class="result-count">找到 {{ result.count }} 个匹配项</span>
      </div>

      <!-- 匹配项列表 -->
      <div v-if="result.matches.length > 0" class="matches-list">
        <div
          v-for="(match, index) in result.matches"
          :key="index"
          class="match-item"
          @click="handleMatchClick(match)"
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
import { ref, watch } from 'vue'
import { showToast } from 'vant'
import { findText } from '@/utils/textProcessor'
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
}>()

// 查找关键字
const keyword = ref('')

// 查找选项
const options = ref<FindOptions>({
  caseSensitive: false,
  wholeWord: false,
  useRegex: false
})

// 监听 keyword 变化，当清空时清除结果和高亮
watch(keyword, (newKeyword) => {
  if (!newKeyword.trim()) {
    result.value = null
    emit('highlight', [])
  }
})

// 查找结果
const result = ref<FindResult | null>(null)

// 执行查找
const handleFind = () => {
  if (!props.text.trim()) {
    showToast('请先输入文本')
    return
  }

  if (!keyword.value.trim()) {
    showToast('请输入查找内容')
    return
  }

  try {
    result.value = findText(props.text, keyword.value, options.value)

    if (result.value.count > 0) {
      showToast(`找到 ${result.value.count} 个匹配项`)
      emit('highlight', result.value.matches)
    } else {
      showToast('未找到匹配项')
      emit('highlight', [])
    }
  } catch (error) {
    showToast('查找失败，请检查输入')
    result.value = null
  }
}

// 点击匹配项
const handleMatchClick = (match: MatchItem) => {
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
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.result-count {
  font-size: 14px;
  font-weight: 500;
  color: #1989fa;
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