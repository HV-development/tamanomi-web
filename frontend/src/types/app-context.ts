import type { AppHandlers } from '@hv-development/schemas'
import type { AppStateExt, AppActionExt } from '@/hooks/useAppReducer'
import type { useAuth } from '@/hooks/useAuth'
import type { useNavigation } from '@/hooks/useNavigation'
import type { useFilters } from '@/hooks/useFilters'
import type { useComputedValues } from '@/hooks/useComputedValues'
import type { CreateStoreIntroductionRequest } from '@/types/store-introduction'

export type AppHandlersExt = AppHandlers & {
  handleEmailChangeSuccessModalClose: () => void
  handleStoreIntroduction: () => void
  handleStoreIntroductionSubmit: (data: CreateStoreIntroductionRequest) => Promise<void>
  handleSubscriptionPausedModalClose: () => void
  handleSubscriptionPausedModalChangePayment: () => void
}

/**
 * AppContext の型定義
 * ホーム画面全体の状態を管理するContext用の型
 */
export interface AppContextType {
  state: AppStateExt
  dispatch: React.Dispatch<AppActionExt>
  handlers: AppHandlersExt
  auth: ReturnType<typeof useAuth>
  navigation: ReturnType<typeof useNavigation>
  filters: ReturnType<typeof useFilters>
  computedValues: ReturnType<typeof useComputedValues>
}

