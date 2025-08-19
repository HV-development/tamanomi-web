// パスワードバリデーション関連のユーティリティ関数

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

export interface PasswordConfirmValidationResult {
  isValid: boolean
  error?: string
}

/**
 * パスワードのバリデーション
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []

  // 必須チェック
  if (!password) {
    errors.push("パスワードを入力してください")
    return { isValid: false, errors }
  }

  // 最小桁チェック
  if (password.length < 8) {
    errors.push("8文字以上で入力してください")
  }

  // 最大桁チェック
  if (password.length > 255) {
    errors.push("255文字以下で入力してください")
  }

  // フォーマットチェック（英数字混在）
  const hasLetter = /[A-Za-z]/.test(password)
  const hasNumber = /\d/.test(password)
  if (!hasLetter || !hasNumber) {
    errors.push("英数字混在で入力してください")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * パスワード確認のバリデーション
 */
export function validatePasswordConfirm(password: string, passwordConfirm: string): PasswordConfirmValidationResult {
  // 必須チェック
  if (!passwordConfirm) {
    return {
      isValid: false,
      error: "パスワードを入力してください"
    }
  }

  // パスワードが一致しているかチェック
  if (password !== passwordConfirm) {
    return {
      isValid: false,
      error: "パスワードが一致していません"
    }
  }

  return { isValid: true }
}

/**
 * リアルタイムパスワードバリデーション（入力中は必須エラーを表示しない）
 */
export function validatePasswordRealtime(password: string): PasswordValidationResult {
  const errors: string[] = []

  // 入力中は必須チェックをスキップ
  if (!password) {
    return { isValid: true, errors: [] }
  }

  // 最小桁チェック
  if (password.length < 8) {
    errors.push("8文字以上で入力してください")
  }

  // 最大桁チェック
  if (password.length > 255) {
    errors.push("255文字以下で入力してください")
  }

  // フォーマットチェック（英数字混在）
  const hasLetter = /[A-Za-z]/.test(password)
  const hasNumber = /\d/.test(password)
  if (!hasLetter || !hasNumber) {
    errors.push("英数字混在で入力してください")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * リアルタイムパスワード確認バリデーション
 */
export function validatePasswordConfirmRealtime(password: string, passwordConfirm: string): PasswordConfirmValidationResult {
  // 入力中は必須チェックをスキップ
  if (!passwordConfirm) {
    return { isValid: true }
  }

  // パスワードが一致しているかチェック
  if (password !== passwordConfirm) {
    return {
      isValid: false,
      error: "パスワードが一致していません"
    }
  }

  return { isValid: true }
}