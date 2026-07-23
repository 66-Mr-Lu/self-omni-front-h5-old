/**
 * 设备信息数据类型
 */
export interface DeviceInfo {
  id: string
  name: string
  ip: string
  port: string
  mac: string
  isPinned: string // 置顶状态：Y-已置顶，N-未置顶
  createAt: string
}

/**
 * 创建设备请求参数
 */
export interface CreateDeviceRequest {
  name?: string
  ip: string
  port: string
  mac: string
}

/**
 * 更新设备请求参数
 */
export interface UpdateDeviceRequest {
  id: string
  name?: string
  ip?: string
  port?: string
  mac?: string
}

import request from "@/utils/axios.ts";

/**
 * 获取设备列表
 * @returns 设备列表
 */
export const getAllDevices = async (): Promise<DeviceInfo[]> => {
  const response = await request.post<DeviceInfo[]>('/ops/device-info/list')
  return response.data || []
}

/**
 * 获取单条设备信息
 * @param id 设备ID
 * @returns 设备详情
 */
export const getDeviceById = async (id: string): Promise<DeviceInfo> => {
  const response = await request.get<DeviceInfo>(`/ops/device-info/${id}`)
  return response.data as DeviceInfo
}

/**
 * 创建新设备
 * @param params 创建参数
 * @returns 创建的设备
 */
export const createDevice = async (params: CreateDeviceRequest): Promise<DeviceInfo> => {
  const response = await request.post<DeviceInfo>('/ops/device-info/add', params)
  return response.data as DeviceInfo
}

/**
 * 更新设备信息
 * @param params 更新参数
 * @returns 更新后的设备
 */
export const updateDevice = async (params: UpdateDeviceRequest): Promise<DeviceInfo> => {
  const response = await request.post<DeviceInfo>('/ops/device-info/update', params)
  return response.data as DeviceInfo
}

/**
 * 删除设备（支持批量删除）
 * @param ids 设备ID数组
 */
export const deleteDevice = async (ids: number[]): Promise<void> => {
  await request.post('/ops/device-info/deleteByIds', ids)
}

/**
 * 置顶设备（支持批量置顶）
 * @param ids 设备ID数组
 */
export const pinDevice = async (ids: number[]): Promise<void> => {
  await request.post('/ops/device-info/pin', ids)
}

/**
 * 取消置顶设备（支持批量取消置顶）
 * @param ids 设备ID数组
 */
export const unpinDevice = async (ids: number[]): Promise<void> => {
  await request.post('/ops/device-info/unpin', ids)
}

/**
 * 远程唤醒设备
 * @param ip 设备IP地址
 * @param port 端口号
 * @param mac MAC地址
 */
export const wakeDevice = async (ip: string, port: string, mac: string): Promise<void> => {
  await request.post('/ops/device-info/wake', { ip, port, mac })
}