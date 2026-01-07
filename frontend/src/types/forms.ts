/**
 * フォーム関連の共通型定義
 */

/**
 * ユーザー登録フォームのデータ型
 */
export interface SignupFormData {
  nickname: string
  password: string
  passwordConfirm: string
  postalCode: string
  address: string
  birthDate: string
  gender: string
  phone?: string
  saitamaAppId: string
}

/**
 * プロフィール編集フォームのデータ型
 */
export interface ProfileEditFormData {
  nickname: string
  postalCode: string
  address: string
  birthDate: string
  gender: string
  phone?: string
  saitamaAppId: string
}

