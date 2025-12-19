/**
 * セッション暗号化/復号化ユーティリティ
 * register-session APIと同じロジックを使用
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

export const COOKIE_NAME = 'register_session'
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 16
export const SESSION_MAX_AGE = 30 * 60 // 30分

/**
 * 暗号化キーを生成
 */
function getEncryptionKey(salt: Buffer): Buffer {
  const secret = process.env.SESSION_SECRET || 'default-dev-secret-key-change-in-production'
  return scryptSync(secret, salt, 32)
}

/**
 * データを暗号化
 */
export function encrypt(data: string): string {
  const salt = randomBytes(SALT_LENGTH)
  const key = getEncryptionKey(salt)
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  
  // salt + iv + authTag + encrypted data を結合
  return salt.toString('hex') + iv.toString('hex') + authTag.toString('hex') + encrypted
}

/**
 * データを復号化
 */
export function decrypt(encryptedData: string): string {
  // salt + iv + authTag + encrypted data を分離
  const salt = Buffer.from(encryptedData.slice(0, SALT_LENGTH * 2), 'hex')
  const iv = Buffer.from(encryptedData.slice(SALT_LENGTH * 2, SALT_LENGTH * 2 + IV_LENGTH * 2), 'hex')
  const authTag = Buffer.from(encryptedData.slice(SALT_LENGTH * 2 + IV_LENGTH * 2, SALT_LENGTH * 2 + IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2), 'hex')
  const encrypted = encryptedData.slice(SALT_LENGTH * 2 + IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2)
  
  const key = getEncryptionKey(salt)
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

