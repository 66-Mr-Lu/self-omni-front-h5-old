/**
 * 音乐相关 API 接口
 */

import request from '@/utils/axios'

// 音乐信息响应实体
export interface MusicInfoResp {
  id: number
  title: string           // 音乐名称
  artist: string          // 歌手
  desc: string            // 描述
  qualityLevel: string    // 品质等级，如 标准, 高清, 无损, 母带等
  isDownload: string      // 音乐是否已下载
  isDownloadLyric: string // 歌词是否已下载
  isDownloadMv: string    // mv是否已下载
  bitrate: number         // 比特率（单位：kbps）
  sampleRate: number      // 采样率（单位：Hz）
  bitDepth: number        // 位深度（单位：位）
  codec: string           // 编码格式，如 MP3, FLAC, AAC, WAV
  album: string           // 专辑名称
  audioUrl?: string       // 音频文件URL（可选）
  duration?: number      // 时长（单位：秒）（可选）
}

// 分页响应（匹配Mybatis-plus分页格式）
export interface PageResponse<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/**
 * 获取音乐列表（分页）
 * @param page 页码（从1开始）
 * @param size 每页数量
 * @param keyword 搜索关键词（可选）
 * @returns 音乐列表分页结果
 */
export async function getMusicList(page: number = 1, size: number = 20, keyword?: string): Promise<PageResponse<MusicInfoResp>> {
  try {
    const response = await request.post<PageResponse<MusicInfoResp>>('/music/list', {
      pageNum: page,
      pageSize: size,
      keyword
    })

    if (response.code === 200 && response.data) {
      return response.data
    } else {
      throw new Error(response.message || '获取音乐列表失败')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络请求失败，请检查网络连接')
  }
}

/**
 * 获取单个音乐详情
 * @param id 音乐ID
 * @returns 音乐详情
 */
export async function getMusicDetail(id: number): Promise<MusicInfoResp> {
  try {
    const response = await request.post<MusicInfoResp>('/music/detail', {
      id
    })

    if (response.code === 200 && response.data) {
      return response.data
    } else {
      throw new Error(response.message || '获取音乐详情失败')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络请求失败，请检查网络连接')
  }
}

export function getMusicResource(id: number, resourceType: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/omni/api/v1'
  const token = localStorage.getItem('omni_token') || sessionStorage.getItem('omni_token')

  // 后端接口是 POST，返回文件流
  // video 标签无法发送 POST 请求，需要后端支持 GET 方式访问资源
  // 构造 GET 请求 URL，token 通过查询参数传递
  const url = `${baseUrl}/music/resource/fetch?id=${id}&resourceType=${resourceType}`

  if (token) {
    return  `${url}&token=${encodeURIComponent(token)}`
  }

  return url
}