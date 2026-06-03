/**
 * Bilibili 链接解析工具
 * 负责验证链接格式、提取 BV 号、将短链接转换为完整链接、从文本中提取链接
 */

// BV 号正则表达式
const BV_PATTERN = /BV[a-zA-Z0-9]{10,}/g

// 完整链接正则表达式
const FULL_URL_PATTERN = /https?:\/\/(www\.)?bilibili\.com\/video\/BV[a-zA-Z0-9]+/gi

// 短链接正则表达式
const SHORT_URL_PATTERN = /https?:\/\/b23\.tv\/[a-zA-Z0-9]+/gi

// 完整链接匹配（用于验证单个链接）
const FULL_URL_MATCH = /^https?:\/\/(www\.)?bilibili\.com\/video\/(BV[a-zA-Z0-9]+)$/

// 短链接匹配（用于验证单个链接）
const SHORT_URL_MATCH = /^https?:\/\/b23\.tv\/([a-zA-Z0-9]+)$/

// BV号匹配（用于验证单个BV号）
const BV_MATCH = /^BV[a-zA-Z0-9]{10,}$/

/**
 * 从文本中提取所有 Bilibili 相关链接
 * @param text 输入的文本
 * @returns 提取到的链接数组
 */
export function extractUrlsFromText(text: string): string[] {
  const urls: string[] = []
  
  // 提取完整链接
  const fullUrls = text.match(FULL_URL_PATTERN) || []
  urls.push(...fullUrls)
  
  // 提取短链接
  const shortUrls = text.match(SHORT_URL_PATTERN) || []
  urls.push(...shortUrls)
  
  // 提取 BV 号
  const bvIds = text.match(BV_PATTERN) || []
  urls.push(...bvIds)
  
  // 去重
  return [...new Set(urls)]
}

/**
 * 从文本中提取第一个有效的 Bilibili 链接
 * @param text 输入的文本
 * @returns 提取到的第一个链接，如果没有找到则返回 null
 */
export function extractFirstUrl(text: string): string | null {
  const urls = extractUrlsFromText(text)
  return urls.length > 0 ? urls[0] : null
}

/**
 * 校验并解析 Bilibili 链接，返回完整的视频链接
 * @param input 用户输入的链接（支持完整链接、短链接、BV号）
 * @returns 完整的视频链接
 * @throws Error 当输入格式无效时抛出异常
 */
export async function parseBilibiliUrl(input: string): Promise<string> {
  const trimmedInput = input.trim()

  // 1. 检查是否为 BV 号
  if (BV_MATCH.test(trimmedInput)) {
    return `https://www.bilibili.com/video/${trimmedInput}`
  }

  // 2. 检查是否为完整链接
  const fullUrlMatch = trimmedInput.match(FULL_URL_MATCH)
  if (fullUrlMatch) {
    const bvId = fullUrlMatch[2]
    return `https://www.bilibili.com/video/${bvId}`
  }

  // 3. 检查是否为短链接（短链服务器没有配置跨域，浏览器会拦截，直接返回）
  if (SHORT_URL_MATCH.test(trimmedInput)) {
    return trimmedInput
  }

  // 4. 格式无效
  throw new Error('请输入有效的Bilibili视频链接')
}

/**
 * 验证 Bilibili 链接格式是否有效
 * @param input 用户输入的链接
 * @returns 是否有效
 */
export function isValidBilibiliUrl(input: string): boolean {
  const trimmedInput = input.trim()

  return (
    BV_MATCH.test(trimmedInput) ||
    FULL_URL_MATCH.test(trimmedInput) ||
    SHORT_URL_MATCH.test(trimmedInput)
  )
}

/**
 * 从完整链接中提取 BV 号
 * @param url 完整的视频链接
 * @returns BV 号
 * @throws Error 当链接格式无效时抛出异常
 */
export function extractBvId(url: string): string {
  const match = url.match(FULL_URL_MATCH)
  if (!match) {
    throw new Error('无效的视频链接格式')
  }
  return match[2]
}

/**
 * 判断输入是否为短链接
 * @param input 用户输入的链接
 * @returns 是否为短链接
 */
export function isShortUrl(input: string): boolean {
  return SHORT_URL_MATCH.test(input.trim())
}

/**
 * 判断输入是否为 BV 号
 * @param input 用户输入的链接
 * @returns 是否为 BV 号
 */
export function isBvId(input: string): boolean {
  return BV_MATCH.test(input.trim())
}

/**
 * 判断输入是否为完整链接
 * @param input 用户输入的链接
 * @returns 是否为完整链接
 */
export function isFullUrl(input: string): boolean {
  return FULL_URL_MATCH.test(input.trim())
}

/**
 * 完整流程：从文本提取URL → 校验 → 解析为完整链接
 * @param text 输入的文本
 * @returns 完整的视频链接
 * @throws Error 当没有找到有效链接或格式无效时抛出异常
 */
export async function processUrl(text: string): Promise<string> {
  // 1. 从文本中提取第一个链接
  const extractedUrl = extractFirstUrl(text)
  if (!extractedUrl) {
    throw new Error('未找到有效的Bilibili链接')
  }

  // 2. 校验链接格式
  if (!isValidBilibiliUrl(extractedUrl)) {
    throw new Error('无效的Bilibili视频链接格式')
  }

  // 3. 解析为完整链接
  return await parseBilibiliUrl(extractedUrl)
}