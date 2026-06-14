 /**
 * 文本处理工具函数
 */

import type {
  FindResult,
  MatchItem,
  ReplaceOperation,
  CountResult,
  TextStatistics,
  FindOptions,
  CleanOptions
} from '@/types/textProcessor'

/**
 * 转义正则表达式特殊字符
 * @param string 要转义的字符串
 * @returns 转义后的字符串
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 获取指定索引位置的行号
 * @param text 文本
 * @param index 索引位置
 * @returns 行号（从1开始）
 */
export function getLineNumber(text: string, index: number): number {
  const lines = text.substring(0, index).split('\n')
  return lines.length
}

/**
 * 获取指定索引位置的列号
 * @param text 文本
 * @param index 索引位置
 * @returns 列号（从1开始）
 */
export function getColumnNumber(text: string, index: number): number {
  const lines = text.substring(0, index).split('\n')
  return lines[lines.length - 1].length + 1
}

/**
 * 获取匹配项的上下文
 * @param text 文本
 * @param index 匹配开始位置
 * @param length 匹配长度
 * @param contextLength 上下文长度（默认10）
 * @returns 上下文字符串
 */
export function getContext(
  text: string,
  index: number,
  length: number,
  contextLength: number = 10
): string {
  const start = Math.max(0, index - contextLength)
  const end = Math.min(text.length, index + length + contextLength)
  let context = text.substring(start, end)

  // 添加省略号
  if (start > 0) {
    context = '...' + context
  }
  if (end < text.length) {
    context = context + '...'
  }

  return context
}

/**
 * 查找文本
 * @param text 要查找的文本
 * @param keyword 关键字
 * @param options 查找选项
 * @returns 查找结果
 */
export function findText(
  text: string,
  keyword: string,
  options: FindOptions
): FindResult {
  if (!keyword.trim()) {
    return { count: 0, matches: [] }
  }

  let regex: RegExp

  try {
    if (options.useRegex) {
      // 正则表达式模式
      const flags = options.caseSensitive ? 'g' : 'gi'
      regex = new RegExp(keyword, flags)
    } else {
      // 普通文本模式
      const escaped = escapeRegExp(keyword)
      const pattern = options.wholeWord ? `\\b${escaped}\\b` : escaped
      const flags = options.caseSensitive ? 'g' : 'gi'
      regex = new RegExp(pattern, flags)
    }
  } catch (error) {
    // 正则表达式错误
    return { count: 0, matches: [] }
  }

  const matches: MatchItem[] = []
  let match

  while ((match = regex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      line: getLineNumber(text, match.index),
      column: getColumnNumber(text, match.index),
      text: match[0],
      context: getContext(text, match.index, match[0].length)
    })

    // 防止零宽度匹配导致的无限循环
    if (match[0].length === 0) {
      regex.lastIndex++
    }
  }

  return {
    count: matches.length,
    matches
  }
}

/**
 * 替换文本
 * @param text 原始文本
 * @param operation 替换操作
 * @returns 替换后的文本和替换次数
 */
export function replaceText(
  text: string,
  operation: ReplaceOperation
): { newText: string; replaceCount: number } {
  if (!operation.findText.trim()) {
    return { newText: text, replaceCount: 0 }
  }

  let regex: RegExp

  try {
    if (operation.useRegex) {
      const flags = operation.caseSensitive ? 'g' : 'gi'
      regex = new RegExp(operation.findText, flags)
    } else {
      const escaped = escapeRegExp(operation.findText)
      const flags = operation.caseSensitive ? 'g' : 'gi'
      regex = new RegExp(escaped, flags)
    }
  } catch (error) {
    // 正则表达式错误
    return { newText: text, replaceCount: 0 }
  }

  if (operation.replaceAll) {
    const matches = text.match(regex)
    const count = matches ? matches.length : 0
    const newText = text.replace(regex, operation.replaceText)
    return { newText, replaceCount: count }
  } else {
    // 只替换第一个匹配项
    const newText = text.replace(regex, operation.replaceText)
    const matches = text.match(regex)
    const count = matches ? 1 : 0
    return { newText, replaceCount: count }
  }
}

/**
 * 计数关键字
 * @param text 文本
 * @param keyword 关键字
 * @param options 计数选项
 * @returns 计数结果
 */
export function countKeyword(
  text: string,
  keyword: string,
  options: { caseSensitive: boolean; useRegex: boolean }
): CountResult {
  const findResult = findText(text, keyword, {
    caseSensitive: options.caseSensitive,
    wholeWord: false,
    useRegex: options.useRegex
  })

  return {
    keyword,
    count: findResult.count,
    positions: findResult.matches
  }
}

/**
 * 清理文本
 * @param text 原始文本
 * @param options 清理选项
 * @returns 清理后的文本
 */
export function cleanText(text: string, options: CleanOptions): string {
  let result = text

  // 删除空行
  if (options.removeEmptyLines) {
    result = result.replace(/^\s*[\r\n]/gm, '')
  }

  // 删除行首空格
  if (options.trimLineStart) {
    result = result.replace(/^ +/gm, '')
  }

  // 删除行尾空格
  if (options.trimLineEnd) {
    result = result.replace(/ +$/gm, '')
  }

  // 删除多余空格
  if (options.removeExtraSpaces) {
    result = result.replace(/ {2,}/g, ' ')
  }

  // 删除所有空格
  if (options.removeAllSpaces) {
    result = result.replace(/ /g, '')
  }

  // 删除制表符
  if (options.removeTabs) {
    result = result.replace(/\t/g, '')
  }

  return result
}

/**
 * 统计文本
 * @param text 文本
 * @returns 文本统计结果
 */
export function getTextStatistics(text: string): TextStatistics {
  // 总字符数
  const totalChars = text.length

  // 不含空格字符数
  const charsNoSpace = text.replace(/\s/g, '').length

  // 单词数（英文）
  const wordCount = (text.match(/\b\w+\b/g) || []).length

  // 汉字数
  const chineseCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length

  // 行数
  const lineCount = text.split('\n').length

  // 段落数（空行分隔）
  const paragraphCount = text.split(/\n\s*\n/).filter(p => p.trim()).length

  // 句子数（句号、问号、感叹号分隔）
  const sentenceCount = (text.match(/[。！？.!?]/g) || []).length

  return {
    totalChars,
    charsNoSpace,
    wordCount,
    chineseCount,
    lineCount,
    paragraphCount,
    sentenceCount
  }
}

/**
 * 高亮文本中的匹配项
 * @param text 原始文本
 * @param matches 匹配项列表
 * @param highlightClass 高亮CSS类名
 * @returns 高亮后的HTML字符串
 */
export function highlightMatches(
  text: string,
  matches: MatchItem[],
  highlightClass: string = 'bg-yellow-200'
): string {
  if (matches.length === 0) {
    return escapeHtml(text)
  }

  // 按索引排序
  const sortedMatches = [...matches].sort((a, b) => a.index - b.index)

  let result = ''
  let lastIndex = 0

  for (const match of sortedMatches) {
    // 添加匹配前的文本
    result += escapeHtml(text.substring(lastIndex, match.index))

    // 添加高亮的匹配文本
    result += `<span class="${highlightClass}">${escapeHtml(match.text)}</span>`

    lastIndex = match.index + match.text.length
  }

  // 添加最后的文本
  result += escapeHtml(text.substring(lastIndex))

  return result
}

/**
 * 转义HTML特殊字符
 * @param text 文本
 * @returns 转义后的文本
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}