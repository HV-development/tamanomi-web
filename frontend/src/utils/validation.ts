import { UseRregistrationCompleteSchema } from '@/schemas/auth'
import { z } from 'zod'

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

export interface PasswordConfirmValidationResult {
  isValid: boolean
  error?: string
}

/**
 * パスワードのバリデーション（tamanomi-schemasを使用）
 */
export function validatePassword(password: string): PasswordValidationResult {
  return validateField('password', password)
}

/**
 * パスワード確認のバリデーション（tamanomi-schemasを使用）
 */
export function validatePasswordConfirm(password: string, passwordConfirm: string): PasswordConfirmValidationResult {
  try {
    UseRregistrationCompleteSchema.pick({ password: true, passwordConfirm: true }).parse({
      password,
      passwordConfirm
    })
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const confirmError = error.errors.find(err =>
        err.path.includes('passwordConfirm') || err.message.includes('一致')
      )
      if (confirmError) {
        return { isValid: false, error: confirmError.message }
      }
      return { isValid: false, error: error.errors[0]?.message || "パスワード確認でエラーが発生しました" }
    }
    return { isValid: false, error: "パスワード確認でエラーが発生しました" }
  }
}

/**
 * リアルタイムパスワードバリデーション（入力中は必須エラーを表示しない）
 */
export function validatePasswordRealtime(password: string): PasswordValidationResult {
  if (!password) {
    return { isValid: true, errors: [] }
  }
  return validatePassword(password)
}

/**
 * リアルタイムパスワード確認バリデーション
 */
export function validatePasswordConfirmRealtime(password: string, passwordConfirm: string): PasswordConfirmValidationResult {
  if (!passwordConfirm) {
    return { isValid: true }
  }
  return validatePasswordConfirm(password, passwordConfirm)
}

// ヘルパー関数
function validateField(field: string, value: any): PasswordValidationResult {
  try {
    const fieldSchema = UseRregistrationCompleteSchema.pick({ [field]: true } as any)
    fieldSchema.parse({ [field]: value })
    return { isValid: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, errors: [error.errors[0]?.message || 'バリデーションエラー'] }
    }
    return { isValid: false, errors: ['バリデーションエラーが発生しました'] }
  }
}