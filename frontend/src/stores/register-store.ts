import { create } from 'zustand'
import { UserRegistrationComplete } from '@hv-development/schemas'

interface RegisterStore {
  formData: UserRegistrationComplete | null
  setFormData: (data: UserRegistrationComplete) => void
  clearFormData: () => void
}

/**
 * 登録フォームデータ用のZustandストア
 * セキュリティ: データはメモリにのみ保持され、ネットワーク経由で送信されない
 * ページ遷移時に失われる（意図的な動作）
 */
export const useRegisterStore = create<RegisterStore>((set) => ({
  formData: null,
  setFormData: (data: UserRegistrationComplete) => set({ formData: data }),
  clearFormData: () => set({ formData: null }),
}))


