"use client"

"use client"

import { EmailConfirmationContainer } from "../organisms/email-confirmation-container"

interface EmailConfirmationLayoutProps {
  email: string
  onBackToLogin: () => void
  onLogoClick: () => void
}

export function EmailConfirmationLayout({
  email,
  onBackToLogin,
  onLogoClick,
}: EmailConfirmationLayoutProps) {
  return (
    <EmailConfirmationContainer
      email={email}
      onBackToLogin={onBackToLogin}
      onLogoClick={onLogoClick}
    />
  )
}