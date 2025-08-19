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
}

export function ConfirmationLayout({ data, onRegister, onEdit, onLogoClick, isLoading }: ConfirmationLayoutProps) {
  return (
    <ConfirmationContainer
      data={data}
      onRegister={onRegister}
      onEdit={onEdit}
      onLogoClick={onLogoClick}
      isLoading={isLoading}
    />
  )
}
