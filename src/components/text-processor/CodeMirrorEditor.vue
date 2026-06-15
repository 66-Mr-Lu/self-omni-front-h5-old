<template>
  <div ref="editorContainer" class="cm-editor-wrapper"></div>
</template>

<script setup lang="ts">
/**
 * CodeMirror 6 编辑器组件
 * 轻量级、高性能的代码编辑器，支持查找、替换、语法高亮等功能
 */
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, highlightActiveLine } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { searchKeymap, highlightSelectionMatches, search } from '@codemirror/search'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter } from '@codemirror/language'
import { Decoration, DecorationSet } from '@codemirror/view'
import { StateField, StateEffect } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'

// Props 定义
interface Props {
  modelValue?: string           // 编辑器内容
  placeholder?: string          // 占位符文本
  readOnly?: boolean            // 是否只读
  lineNumbers?: boolean          // 是否显示行号
  highlightActiveLine?: boolean // 是否高亮当前行
  darkMode?: boolean            // 是否使用暗色主题
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  readOnly: false,
  lineNumbers: true,
  highlightActiveLine: true,
  darkMode: true
})

// Emits 定义
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
  'cursorActivity': [selection: any]
}>()

// DOM 引用
const editorContainer = ref<HTMLElement | null>(null)

// 编辑器实例
let editorView: EditorView | null = null

// 高亮效果：用于添加高亮
const setHighlightsEffect = StateEffect.define<{ from: number; to: number }[]>()

// 高亮状态字段：存储当前高亮列表
const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(highlights, tr) {
    // 应用高亮效果
    highlights = highlights.map(tr.changes)
    for (let e of tr.effects) {
      if (e.is(setHighlightsEffect)) {
        const decorations = e.value.map(({ from, to }) =>
          Decoration.mark({ class: 'cm-highlight' }).range(from, to)
        )
        highlights = Decoration.set(decorations, true)
      }
    }
    return highlights
  },
  provide: f => EditorView.decorations.from(f)
})

/**
 * 设置高亮文本
 * @param matches 高亮匹配列表
 */
const setHighlights = (matches: Array<{ from: number; to: number }>) => {
  if (!editorView) return
  editorView.dispatch({
    effects: setHighlightsEffect.of(matches)
  })
}

/**
 * 清除高亮
 */
const clearHighlights = () => {
  if (!editorView) return
  editorView.dispatch({
    effects: setHighlightsEffect.of([])
  })
}

/**
 * 创建编辑器扩展
 */
const createExtensions = () => {
  const extensions = [
    // 高亮字段
    highlightField,
    
    // 历史记录
    history(),
    
    // 搜索功能
    search({ top: true }),
    highlightSelectionMatches(),
    
    // 语法高亮
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    
    // 折叠功能
    foldGutter(),
    
    // 特殊字符高亮
    highlightSpecialChars(),
    
    // 软换行
    EditorView.lineWrapping,
    
    // 主题
    props.darkMode ? oneDark : EditorView.theme({}),
    
    // 更新监听
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        // 内容变化时清除高亮
        clearHighlights()
      }
      if (update.selectionSet) {
        emit('cursorActivity', update.state.selection)
      }
    })
  ]

  // 可选扩展
  if (props.lineNumbers) {
    extensions.unshift(lineNumbers())
    extensions.push(highlightActiveLineGutter())
  }
  
  if (props.highlightActiveLine) {
    extensions.push(highlightActiveLine())
  }
  
  if (props.readOnly) {
    extensions.push(EditorState.readOnly.of(true))
  }

  // 按键映射
  extensions.push(
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...searchKeymap
    ])
  )

  return extensions
}

/**
 * 初始化编辑器
 */
const initEditor = () => {
  if (!editorContainer.value) return

  const state = EditorState.create({
    doc: props.modelValue,
    extensions: createExtensions()
  })

  editorView = new EditorView({
    state,
    parent: editorContainer.value
  })
}

/**
 * 获取编辑器内容
 */
const getValue = (): string => {
  return editorView?.state.doc.toString() || ''
}

/**
 * 设置编辑器内容
 */
const setValue = (value: string) => {
  if (!editorView) return
  
  editorView.dispatch({
    changes: {
      from: 0,
      to: editorView.state.doc.length,
      insert: value
    }
  })
}

/**
 * 获取编辑器视图
 */
const getEditorView = (): EditorView | null => {
  return editorView
}

// 暴露方法给父组件
defineExpose({
  getValue,
  setValue,
  getEditorView,
  setHighlights,
  clearHighlights
})

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  if (editorView && newValue !== getValue()) {
    setValue(newValue)
  }
})

// 生命周期
onMounted(() => {
  initEditor()
})

onUnmounted(() => {
  editorView?.destroy()
  editorView = null
})
</script>

<style scoped>
/* 编辑器容器样式 */
.cm-editor-wrapper {
  width: 100%;
  height: 300px; /* 固定高度 */
  border: 1px solid #dcdee0;
  border-radius: 4px;
  overflow: hidden;
}

/* CodeMirror 主题覆盖 */
:deep(.cm-editor) {
  height: 100%;
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

:deep(.cm-scroller) {
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  height: 100%;
}

:deep(.cm-content) {
  padding: 12px 0;
}

:deep(.cm-line) {
  padding: 0 12px;
}

:deep(.cm-gutters) {
  background-color: #f7f8fa;
  border-right: 1px solid #dcdee0;
}

:deep(.cm-activeLineGutter) {
  background-color: #e6f7ff;
}

/* 高亮样式 */
:deep(.cm-highlight) {
  background-color: rgba(255, 235, 59, 0.5); /* 黄色高亮 */
  border-radius: 2px;
  padding: 1px 0;
}

/* 暗色主题下的高亮 */
:deep(.cm-editor.cm-focused .cm-highlight) {
  background-color: rgba(255, 235, 59, 0.4);
}

/* 暗色主题覆盖 */
:deep(.cm-editor.cm-focused) {
  outline: none;
}
</style>
