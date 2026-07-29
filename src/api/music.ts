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

export function getMusicResource(id: number, resourceType: string, params?: Record<string, string>): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/omni/api/v1'
  const token = localStorage.getItem('omni_token') || sessionStorage.getItem('omni_token')

  // 后端接口是 POST，返回文件流
  // video 标签无法发送 POST 请求，需要后端支持 GET 方式访问资源
  // 构造 GET 请求 URL，token 通过查询参数传递
  let url = `${baseUrl}/music/resource/fetch?id=${id}&resourceType=${resourceType}`

  // 添加额外查询参数
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url += `&${key}=${encodeURIComponent(value)}`
    }
  }

  if (token) {
    return  `${url}&token=${encodeURIComponent(token)}`
  }

  return url
}

/**
 * 根据歌手名查询音乐列表
 * @param singer 歌手名称
 * @returns 音乐列表
 */
export async function listMusicInfoBySinger(title: string, singer: string): Promise<MusicInfoResp[]> {
  try {
    const response = await request.post<MusicInfoResp[]>('/music/listByMetainfo', {
      title,
      artist: singer
    })

    if (response.code === 200 && response.data) {
      return response.data
    } else {
      throw new Error(response.message || '查询音乐列表失败')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络请求失败，请检查网络连接')
  }
}

// 上传音乐请求参数
export interface UploadMusicRequest {
  title: string
  artist: string
  album: string
  duration: number
  desc?: string
  codec?: string
  bitrate?: number
  sampleRate?: number
  bitDepth?: number
}

/**
 * 新增上传音乐
 * @param data 音乐信息
 * @param file 音频文件
 * @returns 上传结果
 */
export async function uploadMusic(data: UploadMusicRequest, file: File): Promise<MusicInfoResp> {
  try {
    const response = await request.upload<MusicInfoResp>('/music/upload', data, file)

    if (response.code === 200 && response.data) {
      return response.data
    } else {
      throw new Error(response.message || '上传失败')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络请求失败，请检查网络连接')
  }
}

// 更新音乐请求参数
export interface UpdateMusicRequest {
  id: number
  title?: string
  artist?: string
  album?: string
  desc?: string
}

/**
 * 更新音乐信息
 * @param data 更新数据
 * @param file 音频文件（可选）
 * @returns 更新结果
 */
export async function updateMusic(data: UpdateMusicRequest, file?: File): Promise<MusicInfoResp> {
  try {
    let response
    if (file) {
      response = await request.upload<MusicInfoResp>('/music/update', data, file)
    } else {
      response = await request.post<MusicInfoResp>('/music/update', data)
    }

    if (response.code === 200 && response.data) {
      return response.data
    } else {
      throw new Error(response.message || '更新失败')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络请求失败，请检查网络连接')
  }
}