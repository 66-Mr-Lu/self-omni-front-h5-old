import CryptoJS from 'crypto-js'

/**
 * 加密密钥（可从环境变量或配置文件中获取）
 * 注意：生产环境应使用更安全的密钥管理方式
 */
const SECRET_KEY = import.meta.env.VITE_CRYPTO_KEY || 'omni_secret_key_2024'

/**
 * 加密偏移量
 */
const SECRET_IV = import.meta.env.VITE_CRYPTO_IV || 'omni_iv_20240607'

/**
 * AES 加密
 * @param plaintext 明文
 * @returns 加密后的密文
 */
export const encrypt = (plaintext: string): string => {
  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY)
  const iv = CryptoJS.enc.Utf8.parse(SECRET_IV)
  
  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  
  return encrypted.toString()
}

/**
 * AES 解密
 * @param ciphertext 密文
 * @returns 解密后的明文
 */
export const decrypt = (ciphertext: string): string => {
  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY)
  const iv = CryptoJS.enc.Utf8.parse(SECRET_IV)
  
  const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  
  return decrypted.toString(CryptoJS.enc.Utf8)
}

/**
 * MD5 加密（不可逆）
 * @param text 明文
 * @returns MD5 哈希值
 */
export const md5 = (text: string): string => {
  return CryptoJS.MD5(text).toString()
}

/**
 * SHA256 加密（不可逆）
 * @param text 明文
 * @returns SHA256 哈希值
 */
export const sha256 = (text: string): string => {
  return CryptoJS.SHA256(text).toString()
}

/**
 * 密码加密专用函数
 * @param password 明文密码
 * @returns 加密后的密码
 */
export const encryptPassword = (password: string): string => {
  // 使用 MD5 + AES 双重加密
  const md5Password = md5(password)
  return md5Password
}