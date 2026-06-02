/**
 * 下载相关 API 接口
 */

import axios from '@/utils/axios'

// 加入队列响应数据
export interface AddToQueueData {
  taskId: string
  position: number
  estimatedTime?: string
  videoTitle?: string
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
 * 加入下载队列
 * @param url 完整的视频链接
 * @returns 加入队列结果
 */
export async function addToDownloadQueue(url: string): Promise<AddToQueueData> {
  try {
      // const response = await axios.get('/api/v1/bilibili/save-media-info', {
      const response = await axios.get('/bilibili/save-media-info', {
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
    const response = await axios.get('/api/download/bilibili/queue/status', {
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
    const response = await axios.get('/api/download/bilibili/queue/list')
    
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