import { ConfirmationContainer } from "../organisms/confirmation-container"

interface SignupFormData {
  nickname: string
  password: string
  passwordConfirm: string
  postalCode: string
  address: string
  birthDate: string
  gender: string
  saitamaAppId: string
}

interface ConfirmationLayoutProps {
  data: SignupFormData
  onRegister: () => void
  onEdit: () => void
  onLogoClick: () => void
  isLoading?: boolean
  currentUserRank?: string | null
}

export function ConfirmationLayout({ data, onRegister, onEdit, onLogoClick, isLoading, currentUserRank }: ConfirmationLayoutProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null) => {
    // 全ての背景色をブロンズ・非会員色に統一
    return "bg-gradient-to-br from-green-50 to-green-100"
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank ?? null)

  return (
    <ConfirmationContainer
      data={data}
      onRegister={onRegister}
      onEdit={onEdit}
      onLogoClick={onLogoClick}
      isLoading={isLoading}
      backgroundColorClass={backgroundColorClass}
    />
  )
}
