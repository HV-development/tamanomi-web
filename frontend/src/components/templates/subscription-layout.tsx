import { SubscriptionContainer } from "../organisms/subscription-container"

interface SubscriptionLayoutProps {
  onSubscribe: (planId: string) => void
  onLogoClick: () => void
  isLoading?: boolean
}

export function SubscriptionLayout({ onSubscribe, onLogoClick, isLoading }: SubscriptionLayoutProps) {
  return <SubscriptionContainer onSubscribe={onSubscribe} onLogoClick={onLogoClick} isLoading={isLoading} />
}
