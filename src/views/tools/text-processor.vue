<template>
  <div class="text-processor-page">
    <!-- 文本编辑器 -->
    <TextEditor v-model="text" />

    <!-- 标签栏 -->
    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="查找">
        <FindPanel
          :text="text"
          @highlight="handleHighlight"
          @jump-to="handleJumpTo"
        />
      </van-tab>

      <van-tab title="替换">
        <ReplacePanel
          :text="text"
          @replace="handleReplace"
        />
      </van-tab>

      <van-tab title="计数">
        <CountPanel
          :text="text"
          @jump-to="handleJumpTo"
        />
      </van-tab>

      <van-tab title="工具">
        <ToolsPanel
          :text="text"
          @clean="handleClean"
        />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'
import TextEditor from '@/components/text-processor/TextEditor.vue'
import FindPanel from '@/components/text-processor/FindPanel.vue'
import ReplacePanel from '@/components/text-processor/ReplacePanel.vue'
import CountPanel from '@/components/text-processor/CountPanel.vue'
import ToolsPanel from '@/components/text-processor/ToolsPanel.vue'
import type { MatchItem, TabType } from '@/types/textProcessor'

// 文本内容
const text = ref('')

// 当前标签
const activeTab = ref<number>(0)

// 处理高亮
const handleHighlight = (matches: MatchItem[]) => {
  // 这里可以添加高亮显示逻辑
  // 例如：在编辑器中高亮显示匹配项
  console.log('高亮匹配项:', matches)
}

// 处理替换
const handleReplace = (newText: string) => {
  text.value = newText
  showToast('文本已更新')
}

// 处理清理
const handleClean = (newText: string) => {
  text.value = newText
  showToast('文本已清理')
}

// 处理跳转
const handleJumpTo = (match: MatchItem) => {
  // 这里可以添加跳转到指定位置的逻辑
  // 例如：滚动到编辑器的指定行和列
  console.log('跳转到:', match)
  showToast(`跳转到 行${match.line} 列${match.column}`)
}
</script>

<style scoped>
.text-processor-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 16px;
}

.van-tabs {
  margin-top: 16px;
}

.van-tab {
  padding: 12px;
}
</style>