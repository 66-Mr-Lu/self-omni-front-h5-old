<template>
  <div class="tools-panel">
    <!-- 文本清理 -->
    <div class="clean-section">
      <div class="section-title">文本清理</div>

      <!-- 清理选项 -->
      <van-checkbox-group v-model="cleanOptions">
        <van-checkbox name="removeEmptyLines" shape="square">删除空行</van-checkbox>
        <van-checkbox name="removeExtraSpaces" shape="square">删除多余空格</van-checkbox>
        <van-checkbox name="trimLineStart" shape="square">删除行首空格</van-checkbox>
        <van-checkbox name="trimLineEnd" shape="square">删除行尾空格</van-checkbox>
        <van-checkbox name="removeAllSpaces" shape="square">删除所有空格</van-checkbox>
        <van-checkbox name="removeTabs" shape="square">删除制表符</van-checkbox>
      </van-checkbox-group>

      <!-- 清理按钮 -->
      <div class="clean-actions">
        <van-button size="small" @click="handlePreview">预览</van-button>
        <van-button type="primary" size="small" @click="handleClean" :disabled="cleanOptions.length === 0">
          清理
        </van-button>
      </div>

      <!-- 预览结果 -->
      <div v-if="previewText" class="preview-result">
        <div class="preview-header">
          <span>预览结果</span>
          <van-button size="small" @click="previewText = ''">关闭</van-button>
        </div>
        <div class="preview-content">{{ previewText }}</div>
      </div>
    </div>

    <!-- 文本统计 -->
    <div class="statistics-section">
      <div class="section-title">文本统计</div>

      <!-- 统计结果 -->
      <div class="statistics-grid">
        <div class="stat-item">
          <span class="stat-label">总字符数</span>
          <span class="stat-value">{{ statistics.totalChars }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">不含空格字符数</span>
          <span class="stat-value">{{ statistics.charsNoSpace }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">单词数</span>
          <span class="stat-value">{{ statistics.wordCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">汉字数</span>
          <span class="stat-value">{{ statistics.chineseCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">行数</span>
          <span class="stat-value">{{ statistics.lineCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">段落数</span>
          <span class="stat-value">{{ statistics.paragraphCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">句子数</span>
          <span class="stat-value">{{ statistics.sentenceCount }}</span>
        </div>
      </div>

      <!-- 刷新按钮 -->
      <van-button size="small" block @click="handleRefresh">刷新统计</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import { cleanText, getTextStatistics } from '@/utils/textProcessor'
import type { TextStatistics, CleanOptions } from '@/types/textProcessor'

// Props
interface Props {
  text: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'clean', newText: string): void
}>()

// 清理选项
const cleanOptions = ref<string[]>([])

// 预览文本
const previewText = ref('')

// 统计结果
const statistics = computed<TextStatistics>(() => {
  return getTextStatistics(props.text)
})

// 预览清理效果
const handlePreview = () => {
  if (!props.text.trim()) {
    showToast('请先输入文本')
    return
  }

  if (cleanOptions.value.length === 0) {
    showToast('请选择清理选项')
    return
  }

  // 构建清理选项对象
  const options: CleanOptions = {
    removeEmptyLines: cleanOptions.value.includes('removeEmptyLines'),
    removeExtraSpaces: cleanOptions.value.includes('removeExtraSpaces'),
    trimLineStart: cleanOptions.value.includes('trimLineStart'),
    trimLineEnd: cleanOptions.value.includes('trimLineEnd'),
    removeAllSpaces: cleanOptions.value.includes('removeAllSpaces'),
    removeTabs: cleanOptions.value.includes('removeTabs')
  }

  previewText.value = cleanText(props.text, options)
  showSuccessToast('预览已生成')
}

// 执行清理
const handleClean = () => {
  if (!props.text.trim()) {
    showToast('请先输入文本')
    return
  }

  if (cleanOptions.value.length === 0) {
    showToast('请选择清理选项')
    return
  }

  // 构建清理选项对象
  const options: CleanOptions = {
    removeEmptyLines: cleanOptions.value.includes('removeEmptyLines'),
    removeExtraSpaces: cleanOptions.value.includes('removeExtraSpaces'),
    trimLineStart: cleanOptions.value.includes('trimLineStart'),
    trimLineEnd: cleanOptions.value.includes('trimLineEnd'),
    removeAllSpaces: cleanOptions.value.includes('removeAllSpaces'),
    removeTabs: cleanOptions.value.includes('removeTabs')
  }

  const newText = cleanText(props.text, options)
  emit('clean', newText)
  previewText.value = ''
  showSuccessToast('清理完成')
}

// 刷新统计
const handleRefresh = () => {
  showSuccessToast('统计已刷新')
}
</script>

<style scoped>
.tools-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.clean-section,
.statistics-section {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.van-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.clean-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.preview-result {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
}

.preview-content {
  font-size: 12px;
  color: #6b7280;
  word-break: break-all;
  max-height: 150px;
  overflow-y: auto;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.stat-value {
  font-size: 16px;
  font-weight: 500;
  color: #1989fa;
}
</style>