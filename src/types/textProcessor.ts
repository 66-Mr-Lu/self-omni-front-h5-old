/**
 * 文本处理页面类型定义
 */

// 标签页类型
export type TabType = 'find' | 'replace' | 'count' | 'tools'

// 文本状态
export interface TextState {
  originalText: string          // 原始文本
  currentText: string           // 当前文本
  history: HistoryItem[]        // 操作历史
}

// 操作历史
export interface HistoryItem {
  id: string
  type: 'find' | 'replace' | 'clean' | 'count'
  timestamp: number
  data: any                     // 操作数据
}

// 修改记录
export interface ReplaceHistoryItem {
  id: string
  originalText: string          // 替换前的完整文本（用于撤销）
  findText: string              // 被替换的文本
  replaceText: string           // 替换后的文本
  timestamp: number             // 时间戳
}

// 查找结果
export interface FindResult {
  count: number                 // 匹配数量
  matches: MatchItem[]          // 匹配项列表
}

// 匹配项
export interface MatchItem {
  index: number                 // 位置索引
  line: number                  // 行号
  column: number                // 列号
  text: string                  // 匹配文本
  context: string               // 上下文
}

// 替换操作
export interface ReplaceOperation {
  findText: string              // 查找文本
  replaceText: string           // 替换文本
  caseSensitive: boolean       // 大小写敏感
  useRegex: boolean             // 使用正则
  replaceAll: boolean           // 全部替换
  startIndex?: number           // 开始替换的位置（用于替换单个匹配项）
}

// 计数结果
export interface CountResult {
  keyword: string               // 关键字
  count: number                 // 数量
  positions: MatchItem[]        // 位置列表
}

// 文本统计
export interface TextStatistics {
  totalChars: number            // 总字符数
  charsNoSpace: number          // 不含空格字符数
  wordCount: number             // 单词数
  chineseCount: number          // 汉字数
  lineCount: number              // 行数
  paragraphCount: number        // 段落数
  sentenceCount: number         // 句子数
}

// 查找选项
export interface FindOptions {
  caseSensitive: boolean       // 大小写敏感
  wholeWord: boolean           // 全词匹配
  useRegex: boolean            // 使用正则
}

// 替换选项
export interface ReplaceOptions {
  caseSensitive: boolean       // 大小写敏感
  useRegex: boolean            // 使用正则
  useCaptureGroups: boolean    // 使用捕获组
}

// 计数选项
export interface CountOptions {
  caseSensitive: boolean       // 大小写敏感
  useRegex: boolean            // 使用正则
}

// 清理选项
export interface CleanOptions {
  removeEmptyLines: boolean    // 删除空行
  removeExtraSpaces: boolean   // 删除多余空格
  trimLineStart: boolean       // 删除行首空格
  trimLineEnd: boolean         // 删除行尾空格
  removeAllSpaces: boolean     // 删除所有空格
  removeTabs: boolean          // 删除制表符
}