import request from '@/utils/axios'

/**
 * 登录请求参数
 */
export interface LoginRequest {
  username: string
  password: string
}

/**
 * 登录响应数据（后端实际返回结构）
 */
export interface LoginResponse {
  userId: string
  username: string
  nickname: string
  token: string
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string
  username: string
  nickname?: string
  avatar?: string
}

/**
 * 登录接口
 * @param params 登录参数
 * @returns 登录响应
 */
export const login = async (params: LoginRequest): Promise<LoginResponse> => {
  const response = await request.post('/sys/user/login', {
      username: params.username,
      passwd: params.password
  })
  return response.data
}

/**
 * 退出登录接口
 */
export const logout = async (): Promise<void> => {
  await request.post('/sys/user/logout')
}

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export const getUserInfo = async (): Promise<UserInfo> => {
  const response = await request.get('/sys/user/me')
  return response.data
}