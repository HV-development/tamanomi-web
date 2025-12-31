'use client'

import { useEffect } from 'react'

export default function TermsPage() {
  useEffect(() => {
    // 規約PDFを同タブで開く（プライバシーポリシーと同仕様）
    window.location.replace('/terms-of-service.pdf')
  }, [])

  return null
}
