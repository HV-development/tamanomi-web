"use client"

"use client"

import { EmailRegistrationContainer } from "../organisms/email-registration-container"

interface EmailRegistrationLayoutProps {
  currentStep: "form" | "complete"
  email?: string
  onSubmit: (email: string) => void
  onBack: () => void
  onBackToLogin: () => void
  onResend: () => void
  onLogoClick: () => void
  isLoading?: boolean
}

export function EmailRegistrationLayout({ 
  currentStep, 
  email, 
  onSubmit, 
  onBack, 
  onBackToLogin, 
  onResend, 
  onLogoClick, 
  isLoading 
}: EmailRegistrationLayoutProps) {
  return (
    <EmailRegistrationContainer 
      currentStep={currentStep}
      email={email}
      onSubmit={onSubmit} 
      onBack={onBack} 
      onBackToLogin={onBackToLogin}
      onResend={onResend}
      onLogoClick={onLogoClick} 
      isLoading={isLoading} 
    />
  )
}
