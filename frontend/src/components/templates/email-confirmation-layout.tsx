"use client"

"use client"

import { EmailConfirmationContainer } from "../organisms/email-confirmation-container"

interface EmailConfirmationLayoutProps {
  email: string
  onLogoClick: () => void
}

export function EmailConfirmationLayout({
  email,
  onLogoClick,
}: EmailConfirmationLayoutProps) {
  return (
    <EmailConfirmationContainer
      email={email}
      onLogoClick={onLogoClick}
    />
  )
}