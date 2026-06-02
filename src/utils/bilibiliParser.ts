/**
 * Bilibili 链接解析工具
 * 负责验证链接格式、提取 BV 号、将短链接转换为完整链接
 */

// BV 号正则表达式
const BV_PATTERN = /^BV[a-zA-Z0-9]{10,}$/

// 完整链接正则表达式
const FULL_URL_PATTERN = /^https?:\/\/(www\.)?bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/

// 短链接正则表达式
const SHORT_URL_PATTERN = /^https?:\/\/b23\.tv\/([a-zA-Z0-9]+)/

/**
 * 解析 Bilibili 链接，返回完整的视频链接
 * @param input 用户输入的链接（支持完整链接、短链接、BV号）
 * @returns 完整的视频链接
 * @throws Error 当输入格式无效时抛出异常
 */
export async function parseBilibiliUrl(input: string): Promise<string> {
  const trimmedInput = input.trim()

  // 1. 检查是否为 BV 号
  if (BV_PATTERN.test(trimmedInput)) {
    return `https://www.bilibili.com/video/${trimmedInput}`
  }

  // 2. 检查是否为完整链接
  const fullUrlMatch = trimmedInput.match(FULL_URL_PATTERN)
  if (fullUrlMatch) {
    const bvId = fullUrlMatch[2]
    return `https://www.bilibili.com/video/${bvId}`
  }

  // 3. 检查是否为短链）
  return trimmedInput   // 短链接直接返回（短链服务器没有配置跨域，浏览器会拦截）
  // const shortUrlMatch = trimmedInput.match(SHORT_URL_PATTERN)
  // if (shortUrlMatch) {
  //   // 短链接需要通过 HTTP 请求获取真实链接
  //   try {
  //     const fullUrl = await resolveShortUrl(trimmedInput)
  //     return fullUrl
  //   } catch (error) {
  //     throw new Error('短链接解析失败，请检查链接是否正确')
  //   }
  // }
  //
  // // 4. 格式无效
  // throw new Error('请输入有效的Bilibili视频链接')
}

/**
 * 解析短链接，获取真实链接
 * @param shortUrl 短链接
 * @returns 完整的视频链接
 */
async function resolveShortUrl(shortUrl: string): Promise<string> {
  try {
    // 使用 fetch 请求短链接，跟随重定向
    const response = await fetch(shortUrl, {
      method: 'GET',
      redirect: 'follow'
    })
      console.log(response)
    if (!response.ok) {
      throw new Error('短链接请求失败')
    }

    // 获取最终的重定向 URL
    const finalUrl = response.url

    // 验证最终 URL 是否为有效的 Bilibili 视频链接
    const match = finalUrl.match(FULL_URL_PATTERN)
    if (!match) {
      throw new Error('短链接解析结果无效')
    }

    const bvId = match[2]
    return `https://www.bilibili.com/video/${bvId}`
  } catch (error) {
    throw new Error('短链接解析失败')
  }
}

/**
 * 验证 Bilibili 链接格式是否有效
 * @param input 用户输入的链接
 * @returns 是否有效
 */
export function isValidBilibiliUrl(input: string): boolean {
  const trimmedInput = input.trim()

  return (
    BV_PATTERN.test(trimmedInput) ||
    FULL_URL_PATTERN.test(trimmedInput) ||
    SHORT_URL_PATTERN.test(trimmedInput)
  )
}

/**
 * 从完整链接中提取 BV 号
 * @param url 完整的视频链接
 * @returns BV 号
 * @throws Error 当链接格式无效时抛出异常
 */
export function extractBvId(url: string): string {
  const match = url.match(FULL_URL_PATTERN)
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
  return SHORT_URL_PATTERN.test(input.trim())
}

/**
 * 判断输入是否为 BV 号
 * @param input 用户输入的链接
 * @returns 是否为 BV 号
 */
export function isBvId(input: string): boolean {
  return BV_PATTERN.test(input.trim())
}

/**
 * 判断输入是否为完整链接
 * @param input 用户输入的链接
 * @returns 是否为完整链接
 */
export function isFullUrl(input: string): boolean {
  return FULL_URL_PATTERN.test(input.trim())
}