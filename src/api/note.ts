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

// localStorage 存储键
const STORAGE_KEY = 'omni_notes'

// Mock 数据
const mockNotes: Note[] = [
  {
    id: '1',
    title: '欢迎使用记事本',
    content: '这是您的第一篇笔记。\n\n您可以：\n• 创建新笔记\n• 编辑现有笔记\n• 删除不需要的笔记\n• 所有数据会自动保存到本地',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: '功能说明',
    content: '记事本功能特点：\n\n📝 支持创建和编辑笔记\n\n📱 移动端友好的界面设计\n\n💾 数据自动保存到本地缓存\n\n🔄 无需网络即可使用',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

/**
 * 获取存储的笔记列表
 */
const getStoredNotes = (): Note[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
    // 首次使用，返回mock数据并保存
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockNotes))
    return mockNotes
  } catch {
    return mockNotes
  }
}

/**
 * 保存笔记列表到存储
 */
const saveNotes = (notes: Note[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

/**
 * 生成唯一ID
 */
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 获取所有笔记列表
 * @returns 笔记列表
 */
export const getAllNotes = async (): Promise<Note[]> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 200))
  return getStoredNotes()
}

/**
 * 获取单条笔记
 * @param id 笔记ID
 * @returns 笔记详情
 */
export const getNoteById = async (id: string): Promise<Note> => {
  await new Promise(resolve => setTimeout(resolve, 100))
  const notes = getStoredNotes()
  const note = notes.find(n => n.id === id)
  if (!note) {
    throw new Error('笔记不存在')
  }
  return note
}

/**
 * 创建新笔记
 * @param params 创建参数
 * @returns 创建的笔记
 */
export const createNote = async (params: CreateNoteRequest): Promise<Note> => {
  await new Promise(resolve => setTimeout(resolve, 200))
  const notes = getStoredNotes()
  const now = new Date().toISOString()
  const newNote: Note = {
    id: generateId(),
    title: params.title || '无标题',
    content: params.content || '',
    createdAt: now,
    updatedAt: now
  }
  notes.unshift(newNote)
  saveNotes(notes)
  return newNote
}

/**
 * 更新笔记
 * @param params 更新参数
 * @returns 更新后的笔记
 */
export const updateNote = async (params: UpdateNoteRequest): Promise<Note> => {
  await new Promise(resolve => setTimeout(resolve, 200))
  const notes = getStoredNotes()
  const index = notes.findIndex(n => n.id === params.id)
  if (index === -1) {
    throw new Error('笔记不存在')
  }
  const updatedNote: Note = {
    ...notes[index],
    title: params.title || '无标题',
    content: params.content || '',
    updatedAt: new Date().toISOString()
  }
  notes[index] = updatedNote
  saveNotes(notes)
  return updatedNote
}

/**
 * 删除笔记
 * @param id 笔记ID
 */
export const deleteNote = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200))
  const notes = getStoredNotes()
  const filtered = notes.filter(n => n.id !== id)
  saveNotes(filtered)
}