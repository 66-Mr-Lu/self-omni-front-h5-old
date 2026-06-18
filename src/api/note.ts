/**
 * 笔记数据类型
 */
export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

/**
 * 创建笔记请求参数
 */
export interface CreateNoteRequest {
  title: string
  content: string
}

/**
 * 更新笔记请求参数
 */
export interface UpdateNoteRequest {
  id: string
  title: string
  content: string
}

/**
 * 分页请求参数
 */
export interface PageRequest {
  pageNum: number
  pageSize: number
}

/**
 * 分页响应结果
 */
export interface PageResponse<T> {
  items: T[]
  total: number
  pageNum: number
  pageSize: number
}

// 导入 axios 请求工具
import request from '@/utils/axios'

/**
 * 获取笔记列表（分页）
 * @param params 分页参数
 * @returns 分页笔记列表
 */
export const getAllNotes = async (params: PageRequest): Promise<PageResponse<Note>> => {
  const response = await request.post<PageResponse<Note>>('/note/list', {
    params: {
      pageNum: params.pageNum,
      pageSize: params.pageSize
    }
  })
  return response.data || { items: [], total: 0, pageNum: 1, pageSize: 10 }
}

/**
 * 获取单条笔记
 * @param id 笔记ID
 * @returns 笔记详情
 */
export const getNoteById = async (id: string): Promise<Note> => {
  const response = await request.get<Note>(`/note/${id}`)
  return response.data as Note
}

/**
 * 创建新笔记
 * @param params 创建参数
 * @returns 创建的笔记
 */
export const createNote = async (params: CreateNoteRequest): Promise<Note> => {
  const response = await request.post<Note>('/note/add', params)
  return response.data as Note
}

/**
 * 更新笔记
 * @param params 更新参数
 * @returns 更新后的笔记
 */
export const updateNote = async (params: UpdateNoteRequest): Promise<Note> => {
  const response = await request.put<Note>(`/note/update`, params)
  return response.data as Note
}

/**
 * 删除笔记
 * @param id 笔记ID
 */
export const deleteNote = async (id: string): Promise<void> => {
  await request.delete(`/note/delete/${id}`)
}