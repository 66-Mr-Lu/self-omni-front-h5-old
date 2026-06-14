<template>
  <div class="count-panel">
    <!-- 关键字输入 -->
    <van-field
      v-model="keyword"
      label="关键字"
      placeholder="请输入要统计的关键字"
      clearable
    />

    <!-- 计数选项 -->
    <div class="count-options">
      <van-checkbox v-model="options.caseSensitive">大小写敏感</van-checkbox>
      <van-checkbox v-model="options.useRegex">正则表达式</van-checkbox>
    </div>

    <!-- 计数按钮 -->
    <van-button type="primary" block @click="handleCount" :disabled="!keyword.trim()">
      计数
    </van-button>

    <!-- 计数结果 -->
    <div v-if="result" class="count-result">
      <div class="result-header">
        <span class="result-count">找到 {{ result.count }} 个匹配项</span>
        <van-button size="small" @click="handleExport">导出结果</van-button>
      </div>

      <!-- 匹配位置列表 -->
      <div v-if="result.positions.length > 0" class="positions-list">
        <div
          v-for="(position, index) in result.positions"
          :key="index"
          class="position-item"
          @click="handlePositionClick(position)"
        >
          <div class="position-info">
            <span class="position-index">#{{ index + 1 }}</span>
            <span class="position-location">行 {{ position.line }}，列 {{ position.column }}</span>
          </div>
          <div class="position-text">{{ position.text }}</div>
          <div class="position-context">{{ position.context }}</div>
        </div>
      </div>

      <!-- 无匹配项 -->
      <div v-else class="no-positions">
        <van-empty description="未找到匹配项" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import { countKeyword } from '@/utils/textProcessor'
import type { CountResult, MatchItem, CountOptions } from '@/types/textProcessor'

// Props
interface Props {
  text: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'jump-to', match: MatchItem): void
}>()

// 关键字
const keyword = ref('')

// 计数选项
const options = ref<CountOptions>({
  caseSensitive: false,
  useRegex: false
})

// 计数结果
const result = ref<CountResult | null>(null)

// 执行计数
const handleCount = () => {
  if (!props.text.trim()) {
    showToast('请先输入文本')
    return
  }

  if (!keyword.value.trim()) {
    showToast('请输入关键字')
    return
  }

  try {
    result.value = countKeyword(props.text, keyword.value, options.value)

    if (result.value.count > 0) {
      showToast(`找到 ${result.value.count} 个匹配项`)
    } else {
      showToast('未找到匹配项')
    }
  } catch (error) {
    showToast('计数失败，请检查输入')
    result.value = null
  }
}

// 导出结果
const handleExport = () => {
  if (!result.value) {
    return
  }

  // 构建导出文本
  let exportText = `关键字: ${result.value.keyword}\n`
  exportText += `匹配数量: ${result.value.count}\n\n`
  exportText += `匹配位置:\n`

  result.value.positions.forEach((position, index) => {
    exportText += `#${index + 1} 行${position.line} 列${position.column}: ${position.text}\n`
    exportText += `  上下文: ${position.context}\n\n`
  })

  // 复制到剪贴板
  navigator.clipboard.writeText(exportText)
  showSuccessToast('已导出到剪贴板')
}

// 点击位置项
const handlePositionClick = (position: MatchItem) => {
  emit('jump-to', position)
}
</script>

<style scoped>
.count-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.count-options {
  display: flex;
  gap: 12px;
  padding: 8px 0;
}

.count-result {
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

.positions-list {
  max-height: 300px;
  overflow-y: auto;
}

.position-item {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background-color 0.2s;
}

.position-item:hover {
  background-color: #f9fafb;
}

.position-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.position-index {
  font-size: 12px;
  color: #6b7280;
}

.position-location {
  font-size: 12px;
  color: #9ca3af;
}

.position-text {
  font-size: 14px;
  font-weight: 500;
  color: #1989fa;
  margin-bottom: 4px;
}

.position-context {
  font-size: 12px;
  color: #9ca3af;
  word-break: break-all;
}

.no-positions {
  padding: 20px 0;
}
</style>