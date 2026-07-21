import { encrypt, decrypt } from './crypto'

/**
 * 二级密码本地存储工具模块
 * 二级密码仅存储在前端本地，不传给后台
 * 存储 key 格式: omni_sub_passwd_${userId}
 */

/**
 * 获取二级密码的存储 key
 * @param userId 用户ID
 * @returns 存储 key
 */
const getStorageKey = (userId: string): string => {
  return `omni_sub_passwd_${userId}`
}

/**
 * 设置二级密码（加密后存储）
 * @param userId 用户ID
 * @param password 二级密码明文
 */
export const setSubPasswd = (userId: string, password: string): void => {
  const encryptedPassword = encrypt(password)
  localStorage.setItem(getStorageKey(userId), encryptedPassword)
}

/**
 * 获取二级密码（解密后返回）
 * @param userId 用户ID
 * @returns 二级密码明文，如果未设置返回 null
 */
export const getSubPasswd = (userId: string): string | null => {
  const encryptedPassword = localStorage.getItem(getStorageKey(userId))
  if (!encryptedPassword) {
    return null
  }
  try {
    return decrypt(encryptedPassword)
  } catch {
    return null
  }
}



/**
 * 检查本地是否已存储二级密码
 * @param userId 用户ID
 * @returns 是否存在本地二级密码
 */
export const hasLocalSubPasswd = (userId: string): boolean => {
  return localStorage.getItem(getStorageKey(userId)) !== null
}

/**
 * 清除本地二级密码
 * @param userId 用户ID
 */
export const clearSubPasswd = (userId: string): void => {
  localStorage.removeItem(getStorageKey(userId))
}

/**
 * 验证输入的二级密码是否正确
 * @param userId 用户ID
 * @param inputPassword 输入的密码
 * @returns 是否验证通过
 */
export const verifySubPasswd = (userId: string, inputPassword: string): boolean => {
  const storedPassword = getSubPasswd(userId)
  return storedPassword === inputPassword
}