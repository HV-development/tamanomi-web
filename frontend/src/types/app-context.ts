import type { AppState, AppAction, AppHandlers } from '@hv-development/schemas'
import type { useAuth } from '@/hooks/useAuth'
import type { useNavigation } from '@/hooks/useNavigation'
import type { useFilters } from '@/hooks/useFilters'
import type { useComputedValues } from '@/hooks/useComputedValues'

/**
 * AppContext の型定義
 * ホーム画面全体の状態を管理するContext用の型
 */
export interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  handlers: AppHandlers
  auth: ReturnType<typeof useAuth>
  navigation: ReturnType<typeof useNavigation>
  filters: ReturnType<typeof useFilters>
  computedValues: ReturnType<typeof useComputedValues>
}

