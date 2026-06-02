/**
 * 下载相关 API 接口
 */

// API 基础路径（根据实际环境配置）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// 视频清晰度选项
export interface VideoQuality {
  id: string
  name: string
  resolution: string
  size?: string
}

// 视频信息
export interface VideoInfo {
  title: string
  coverUrl: string
  duration: string
  upName: string
  viewCount: string
  danmakuCount: string
  qualityList: VideoQuality[]
}

// 解析视频信息请求参数
export interface ParseVideoRequest {
  url: string
}

// 解析视频信息响应
export interface ParseVideoResponse {
  code: number
  message: string
  data: VideoInfo
}

// 下载队列请求参数
export interface AddToQueueRequest {
  url: string
  quality: string
}

// 加入队列响应数据
export interface AddToQueueData {
  taskId: string
  position: number
  estimatedTime?: string
}

// 加入队列响应
export interface AddToQueueResponse {
  code: number
  message: string
  data?: AddToQueueData
}

// 下载队列任务状态
export type QueueTaskStatus = 'pending' | 'downloading' | 'completed' | 'failed'

// 下载队列任务
export interface QueueTask {
  id: string
  videoTitle: string
  quality: string
  status: QueueTaskStatus
  progress: number
  position: number
  estimatedTime?: string
  errorMessage?: string
}

// 查询队列状态响应
export interface QueueStatusResponse {
  code: number
  message: string
  data?: QueueTask
}

// 获取队列列表响应
export interface QueueListResponse {
  code: number
  message: string
  data?: QueueTask[]
}

// API 错误响应
export interface ApiErrorResponse {
  code: number
  message: string
}

/**
 * 解析 Bilibili 视频信息
 * @param url 完整的视频链接
 * @returns 视频信息
 */
export async function parseBilibiliVideo(url: string): Promise<VideoInfo> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/download/bilibili/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    })

    const result: ParseVideoResponse | ApiErrorResponse = await response.json()

    if (result.code === 200 && 'data' in result) {
      return result.data
    } else {
      throw new Error(result.message || '解析失败')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络请求失败，请检查网络连接')
  }
}

/**
 * 加入下载队列
 * @param url 完整的视频链接
 * @param quality 清晰度标识
 * @returns 加入队列结果
 */
export async function addToDownloadQueue(url: string, quality: string): Promise<AddToQueueData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/download/bilibili/queue/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url, quality })
    })

    const result: AddToQueueResponse | ApiErrorResponse = await response.json()

    if (result.code === 200 && result.data) {
      return result.data
    } else {
      throw new Error(result.message || '加入队列失败')
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
    const response = await fetch(`${API_BASE_URL}/api/download/bilibili/queue/status?taskId=${encodeURIComponent(taskId)}`, {
      method: 'GET'
    })

    const result: QueueStatusResponse | ApiErrorResponse = await response.json()

    if (result.code === 200 && result.data) {
      return result.data
    } else {
      throw new Error(result.message || '查询失败')
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
    const response = await fetch(`${API_BASE_URL}/api/download/bilibili/queue/list`, {
      method: 'GET'
    })

    const result: QueueListResponse | ApiErrorResponse = await response.json()

    if (result.code === 200 && result.data) {
      return result.data
    } else {
      throw new Error(result.message || '查询失败')
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络请求失败，请检查网络连接')
  }
}