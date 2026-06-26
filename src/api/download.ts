/**
 * 下载相关 API 接口
 */

import request from '@/utils/axios'

// Bilibili视频信息响应实体（支持null值）
export interface ListBilibiliVideoInfoResp {
  id: number
  aid: number | null
  bvid: string
  url: string
  title: string
  coverUrl: string | null        // 封面图片URL
  publishAt: number
  isDownload: string      // 是否已下载: Y/N
  codecs: string | null          // 编码格式
  videoQuality: number | null    // 视频质量
  isMaxVideoQuality: string | null
  audioQuality: number | null
  upUid: number | null           // UP主用户ID
  upName: string | null          // UP主昵称
  upAvatarUrl: string | null     // UP主头像URL
  videoResourceName: string | null   // 视频资源名称（已下载时返回）
  audioResourceName: string | null   // 音频资源名称（已下载时返回）
}

// 分页响应（匹配实际API返回格式）
export interface PageResponse<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/**
 * 获取视频列表（分页）
 * @param page 页码（从1开始）
 * @param size 每页数量
 * @returns 视频列表分页结果
 */
export async function getVideoList(page: number = 1, size: number = 20): Promise<PageResponse<ListBilibiliVideoInfoResp>> {
  try {
    const response = await request.post<PageResponse<ListBilibiliVideoInfoResp>>('/bilibili/video/list', {
        pageNum: page,
        pageSize: size
    })

    if (response.code === 200 && response.data) {
      return response.data
    } else {
      throw new Error(response.message || '获取视频列表失败')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络请求失败，请检查网络连接')
  }
}

/**
 * 获取随机视频列表(无分页)
 * 暂时没有入参,没有分页
 * @param isDownload 是否已下载: Y-已下载, null-全部
 * @returns 视频列表数组
 */
export async function getRandomVideoList(isDownload: string | null = null): Promise<ListBilibiliVideoInfoResp[]> {
  try {
    const response = await request.post<ListBilibiliVideoInfoResp[]>('/bilibili/video/random-list', {
        isDownload: isDownload ?? undefined
    }, {
      params: {
        _t: Date.now()
      }
    })

    if (response.code === 200 && response.data) {
      return response.data
    } else {
      throw new Error(response.message || '获取视频列表失败')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络请求失败，请检查网络连接')
  }
}

/**
 * 获取单个视频详情
 * @param id 视频ID
 * @returns 视频详情
 */
export async function getVideoDetail(id: number): Promise<ListBilibiliVideoInfoResp> {
  try {
    const response = await request.post<ListBilibiliVideoInfoResp>('/bilibili/video/detail', {
      id
    })

    if (response.code === 200 && response.data) {
      return response.data
    } else {
      throw new Error(response.message || '获取视频详情失败')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络请求失败，请检查网络连接')
  }
}

// 加入队列响应数据
export interface AddToQueueData {
  taskId: string
  position: number
  estimatedTime?: string
  videoTitle?: string
}

// 下载队列任务状态
export type QueueTaskStatus = 'pending' | 'downloading' | 'completed' | 'failed'

// 下载队列任务
export interface QueueTask {
  id: string
  videoTitle: string
  status: QueueTaskStatus
  progress: number
  position: number
  estimatedTime?: string
  errorMessage?: string
}

/**
 * 加入下载队列
 * @param url 完整的视频链接
 * @returns 加入队列结果
 */
export async function addToDownloadQueue(url: string): Promise<AddToQueueData> {
  try {
    const response = await request.get<AddToQueueData>('/bilibili/save-media-info', {
      params: {
        videoUrl: url
      }
    })

    if (response.code === 200 && response.data) {
      return response.data
    } else {
      throw new Error(response.message || '加入队列失败')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络请求失败，请检查网络连接')
  }
}

/**
 * 查询队列任务状态
 * @param taskId 任务ID
 * @returns 任务状态
 */
export async function getQueueTaskStatus(taskId: string): Promise<QueueTask> {
  try {
    const response = await request.get<QueueTask>('/download/bilibili/queue/status', {
      params: { taskId }
    })

    if (response.code === 200 && response.data) {
      return response.data
    } else {
      throw new Error(response.message || '查询失败')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络请求失败，请检查网络连接')
  }
}

/**
 * 获取下载队列列表
 * @returns 队列任务列表
 */
export async function getQueueList(): Promise<QueueTask[]> {
  try {
    const response = await request.get<QueueTask[]>('/download/bilibili/queue/list')

    if (response.code === 200 && response.data) {
      return response.data
    } else {
      throw new Error(response.message || '查询失败')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络请求失败，请检查网络连接')
  }
}

// 视频资源响应数据
export interface VideoResourceData {
  resourceUrl: string   // 资源访问地址
}

/**
 * 获取视频资源访问地址（支持 Range 请求）
 * @param aid 视频aid
 * @param resourceName 资源名称
 * @param resourceType 资源类型：video/audio
 * @returns 资源访问地址，video标签直接使用，浏览器自动发送Range请求
 */
export async function getVideoResource(aid: number, resourceName: string, resourceType: string): Promise<VideoResourceData> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/omni/api/v1'
  const token = localStorage.getItem('omni_token') || sessionStorage.getItem('omni_token')
  
  // 后端接口是 POST，返回文件流
  // video 标签无法发送 POST 请求，需要后端支持 GET 方式访问资源
  // 构造 GET 请求 URL，token 通过查询参数传递
  const url = `${baseUrl}/bilibili/video/resource/fetch?aid=${aid}&resourceName=${encodeURIComponent(resourceName)}&resourceType=${resourceType}`
  
  if (token) {
    return { resourceUrl: `${url}&token=${encodeURIComponent(token)}` }
  }
  
  return { resourceUrl: url }
}