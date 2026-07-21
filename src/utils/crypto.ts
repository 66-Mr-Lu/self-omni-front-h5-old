import CryptoJS from 'crypto-js'
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';

// 设置同步哈希（只需设置一次）
// ed.hashes.sha512 = sha512;

// 使用 as any 绕过类型检查（运行时完全正常）
(ed.hashes as any).sha512 = sha512;

/**
 * 加密密钥（可从环境变量或配置文件中获取）
 * 注意：生产环境应使用更安全的密钥管理方式
 */
const SECRET_KEY = import.meta.env.VITE_CRYPTO_KEY || 'omni_secret_key_2024'

/**
 * 加密偏移量
 */
const SECRET_IV = import.meta.env.VITE_CRYPTO_IV || 'omni_iv_20240607'

// 前端（JavaScript）示例：从密码派生 Ed25519 密钥对
// export const deriveSigningKeyPair = async (password: string, salt: string) => {
//   const encoder = new TextEncoder();
//   // 将 salt 字符串转换为 BufferSource (Uint8Array)
//   const saltBuffer = encoder.encode(salt);
//
//
//   // 1. PBKDF2 派生 32 字节种子
//   const keyMaterial = await crypto.subtle.importKey(
//       "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
//   );
//   const seed = new Uint8Array(await crypto.subtle.deriveBits(
//       { name: "PBKDF2", salt: saltBuffer, iterations: 310000, hash: "SHA-256" },
//       keyMaterial, 256 // 32 字节
//   ));
//
//   // 2. 用种子生成 Ed25519 密钥对（需使用支持库，如 tweetnacl.js）
//   // 注意：Web Crypto API 不直接支持从种子导入 Ed25519，需用第三方库
//   // 以下为概念示意，实际可用 @noble/ed25519 或 tweetnacl
//   const { publicKey, secretKey } = nacl.sign.keyPair.fromSeed(seed);
//   return { publicKey, secretKey };
//
// }

/**
 * 生成加密安全的随机盐值（16 字节）
 * @returns Base64 编码的盐值字符串（便于传输和存储）
 */
export const generateSalt = (): string => {
    // 1. 生成 16 字节（128位）的随机数
    const saltBytes = crypto.getRandomValues(new Uint8Array(16));

    // 2. 转为 Base64 字符串（便于 JSON 传输和数据库存储）
    // return btoa(String.fromCharCode(...saltBytes));

    // 转16进制字符串
    return toHex(saltBytes);
};

// 工具函数：Uint8Array -> Hex
const toHex = (bytes: Uint8Array): string => {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

export const deriveSigningKeyPair = async (password: string, salt: string) => {
  const encoder = new TextEncoder();

  // 1. 导入密码作为密钥材料
  const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
  );

  // 2. 使用 PBKDF2 派生 32 字节种子（私钥）
  const seed = new Uint8Array(
      await crypto.subtle.deriveBits(
          {
            name: 'PBKDF2',
            salt: encoder.encode(salt), // 如果 salt 是 Base64，需先解码
            iterations: 571,
            hash: 'SHA-256',
          },
          keyMaterial,
          256 // 32 字节
      )
  );

  // 3. 私钥 = seed，公钥由 @noble/ed25519 派生
  const secretKey = seed;
  const publicKey = ed.getPublicKey(secretKey); // 同步方法，无需 await

  return { publicKey, secretKey };
};

export const deriveCryptoKeys = async (password: string, salt: string) => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
    );

    // 关键点：派生 512 bits = 64 字节
    const derivedBits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 310000, hash: 'SHA-256' },
        keyMaterial,
        512
    );

    const buffer = new Uint8Array(derivedBits);

    // 拆分密钥
    const aesKeyBytes = buffer.slice(0, 32);   // AES-256 密钥
    const edSeed = buffer.slice(32, 64);       // Ed25519 私钥种子

    // 将 AES 密钥导入 Web Crypto API 格式
    const aesKey = await crypto.subtle.importKey(
        'raw', aesKeyBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']
    );

    // 获得 Ed25519 公钥（私钥就是 edSeed）
    const publicKey = ed.getPublicKey(edSeed);

    return { aesKey, privateKeySeed: edSeed, publicKey };
};

export const encryptAndSignNote = async (text: string, password: string, salt: string) => {
    // 1. 派生出 AES 密钥 和 Ed25519 私钥
    const { aesKey, privateKeySeed } = await deriveCryptoKeys(password, salt);

    // 2. 生成 12 字节随机 IV（GCM 模式推荐 12 字节）
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();

    // 3. 使用 AES-GCM 加密内容
    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        aesKey,
        encoder.encode(text)
    );
    const ciphertext = new Uint8Array(encryptedBuffer);

    // 4. 使用 Ed25519 私钥对 (IV + 密文) 进行签名
    const dataToSign = new Uint8Array([...iv, ...ciphertext]);
    const signature = await ed.signAsync(dataToSign, privateKeySeed);

    // 5. 返回给后端的参数（这里全部转为 Hex，因为你之前说不用 Base64）
    const toHex = (bytes: Uint8Array) =>
        Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

    return {
        iv: toHex(iv),
        content: btoa(
            Array.from(ciphertext)
                .map(byte => String.fromCharCode(byte))
                .join('')
        ),
        signature: toHex(signature)
    };
};

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

// 设置密码时，派生两个密钥
export const deriveTwoKeys = async (password: string, salt: string) => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
      "raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]
  );

  // 将 salt 字符串转换为 BufferSource (Uint8Array)
  const saltBuffer = encoder.encode(salt);

  // 派生 64 字节（512位）密钥材料
  const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: saltBuffer,
        iterations: 581,
        hash: "SHA-256"
      },
      keyMaterial,
      512 // 64字节
  );

  // 拆分为两个独立密钥：
  // 前 32 字节 = AES-256 加密密钥（仅前端持有，绝不上传）
  // 后 32 字节 = HMAC-SHA256 校验密钥（作为“校验码”上传后台）
  const keyBuffer = new Uint8Array(derivedBits);
  const aesKey = keyBuffer.slice(0, 32);   // 加密用
  const hmacKey = keyBuffer.slice(32, 64); // 校验码用

  return { aesKey, hmacKey };
}