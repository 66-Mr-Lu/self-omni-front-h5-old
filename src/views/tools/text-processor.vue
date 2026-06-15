<template>
  <div class="text-processor-page">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-gradient-to-r from-primary to-info z-50">
      <div class="flex items-center px-5 h-12">
        <div class="back-btn w-8 h-8 flex items-center justify-center cursor-pointer" @click="goBack">
          <span class="text-white text-2xl">‹</span>
        </div>
        <h1 class="text-white text-lg font-semibold mx-3">文本处理</h1>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content pt-16">
      <!-- 文本编辑器 -->
      <TextEditor ref="editorRef" v-model="text">
        <template #match-count>
          <span v-if="matchCount > 0" class="match-count">
            {{ currentMatchIndex + 1 }} / {{ matchCount }}
          </span>
        </template>
      </TextEditor>

      <!-- 标签栏 -->
      <van-tabs v-model:active="activeTab" sticky>
        <van-tab title="查找">
          <FindPanel
            :text="text"
            :get-cursor-position="handleGetCursorPosition"
            @highlight="handleHighlight"
            @jump-to="handleJumpTo"
            @replace="handleReplace"
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import TextEditor from '@/components/text-processor/TextEditor.vue'
import FindPanel from '@/components/text-processor/FindPanel.vue'
import ToolsPanel from '@/components/text-processor/ToolsPanel.vue'
import type { MatchItem } from '@/types/textProcessor'

// 路由
const router = useRouter()

// 编辑器引用
const editorRef = ref<InstanceType<typeof TextEditor> | null>(null)

// 文本内容
const text = ref('')

// 当前标签
const activeTab = ref<number>(0)

// 匹配计数
const matchCount = ref(0)
const currentMatchIndex = ref(0)

// 返回上一页
const goBack = () => {
  router.back()
}

// 处理高亮
const handleHighlight = (matches: MatchItem[]) => {
  // 更新匹配计数
  matchCount.value = matches.length
  // 将匹配项转换为高亮范围
  const highlights = matches.map(match => ({
    from: match.index,
    to: match.index + match.text.length
  }))
  // 在编辑器中高亮显示
  editorRef.value?.setHighlights(highlights)
}

// 处理替换
const handleReplace = (newText: string) => {
  text.value = newText
  // 清除高亮
  editorRef.value?.clearHighlights()
  // 重置匹配计数
  matchCount.value = 0
  currentMatchIndex.value = 0
  showToast('文本已更新')
}

// 处理清理
const handleClean = (newText: string) => {
  text.value = newText
  // 清除高亮
  editorRef.value?.clearHighlights()
  // 重置匹配计数
  matchCount.value = 0
  currentMatchIndex.value = 0
  showToast('文本已清理')
}

// 处理跳转
const handleJumpTo = (match: MatchItem, index: number) => {
  currentMatchIndex.value = index
  editorRef.value?.setCursorPosition(match.index, match.index + match.text.length)
}

// 获取光标位置
const handleGetCursorPosition = (): number => {
  return editorRef.value?.getCursorPosition() ?? -1
}
</script>

<style scoped>
.text-processor-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding: 16px;
}

.van-tabs {
  margin-top: 16px;
}

.van-tab {
  padding: 12px;
}

.match-count {
  font-size: 12px;
  color: #1989fa;
  font-weight: 500;
}
</style>