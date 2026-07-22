/**
 * 笔记数据类型
 */
export interface Note {
  id: string
  title: string
  content: string
  createAt: string
  updateAt: string
  isPinned: string // 置顶状态：Y-已置顶，N-未置顶
  isEncrypted: string // 加密状态：Y-已加密，N-未加密
  iv?: string // 加密IV（Hex字符串）
  signature?: string // 加密签名（Hex字符串）
}

/**
 * 创建笔记请求参数
 */
export interface CreateNoteRequest {
  title: string
  content: string
  isEncrypted?: string // 加密状态：Y-加密，N-不加密
  iv?: string // 加密IV（Hex字符串）
  signature?: string // 加密签名（Hex字符串）
}

/**
 * 更新笔记请求参数
 */
export interface UpdateNoteRequest {
  id: string
  title: string
  content: string
  isEncrypted?: string // 加密状态：Y-加密，N-不加密
  iv?: string // 加密IV（Hex字符串）
  signature?: string // 加密签名（Hex字符串）
}

/**
 * 分页请求参数（适配 MyBatis Plus 分页）
 */
export interface PageRequest {
  pageNum: number  // 当前页码（从1开始）
  pageSize: number // 每页条数
}

/**
 * MyBatis Plus 分页响应结果
 * @template T - 数据类型
 */
export interface PageResponse<T> {
  records: T[]   // 当前页数据列表（MyBatis Plus 默认字段）
  total: number  // 总记录数
  size: number   // 每页条数（MyBatis Plus 默认字段）
  current: number // 当前页码（MyBatis Plus 默认字段）
}

// 导入 axios 请求工具
import request from '@/utils/axios'

/**
 * 获取笔记列表（分页）
 * 使用 GET 请求传递分页参数，适配 MyBatis Plus 分页响应格式
 * @param params 分页参数
 * @returns 分页笔记列表
 */
export const getAllNotes = async (params: PageRequest): Promise<PageResponse<Note>> => {
  const response = await request.post<PageResponse<Note>>('/note/list', {
      pageNum: params.pageNum,
      pageSize: params.pageSize
  })
  // 转换 MyBatis Plus 分页响应格式，确保数据安全
  const data = response.data || { records: [], total: 0, size: 10, current: 1 }
  return {
    records: data.records || [],
    total: data.total || 0,
    size: data.size || params.pageSize,
    current: data.current || params.pageNum
  }
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
  const response = await request.post<Note>(`/note/update`, params)
  return response.data as Note
}

/**
 * 删除笔记（支持批量删除）
 * @param ids 笔记ID数组
 */
export const deleteNote = async (ids: number[]): Promise<void> => {
  await request.post('/note/deleteByIds', ids)
}

/**
 * 置顶笔记（支持批量置顶）
 * @param ids 笔记ID数组
 */
export const pinNote = async (ids: number[]): Promise<void> => {
    await request.post('/note/pin', ids)
}

/**
 * 取消置顶笔记（支持批量取消置顶）
 * @param ids 笔记ID数组
 */
export const unpinNote = async (ids: number[]): Promise<void> => {
    await request.post('/note/unpin', ids)
}