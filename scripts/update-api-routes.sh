#!/bin/bash

# APIルートファイルを一括更新するスクリプト
# フォールバック処理を削除し、api-config.tsを使用するように変更

API_ROUTES=(
  "frontend/src/app/api/auth/pre-register/route.ts"
  "frontend/src/app/api/auth/login/route.ts"
  "frontend/src/app/api/auth/register/route.ts"
  "frontend/src/app/api/auth/send-otp/route.ts"
  "frontend/src/app/api/auth/verify-otp/route.ts"
  "frontend/src/app/api/plans/route.ts"
  "frontend/src/app/api/user/me/route.ts"
  "frontend/src/app/api/user/link-saitama-app/route.ts"
  "frontend/src/app/api/payment/register/route.ts"
  "frontend/src/app/api/payment/session/[customer_id]/route.ts"
)

echo "🔄 APIルートファイルを更新中..."
echo ""

for route in "${API_ROUTES[@]}"; do
  if [ -f "$route" ]; then
    echo "📝 更新: $route"
    
    # バックアップを作成
    cp "$route" "$route.bak"
    
    # パターン1: const API_BASE_URL = ... のフォールバック削除
    sed -i '' 's|const API_BASE_URL = process\.env\.API_BASE_URL \|\| process\.env\.NEXT_PUBLIC_API_URL \|\| '\''http://localhost:3002'\''|import { buildApiUrl } from '\''@/lib/api-config'\''|g' "$route"
    
    # パターン2: API_BASE_URLの使用箇所を buildApiUrl() に置き換え
    # これは手動で調整が必要なので、コメントで示す
    echo "  ⚠️  手動確認が必要: API_BASE_URLの使用箇所を buildApiUrl() に置き換えてください"
  else
    echo "❌ 見つかりません: $route"
  fi
done

echo ""
echo "✅ 更新完了"
echo ""
echo "📋 次のステップ:"
echo "1. 各ファイルを開いて、API_BASE_URLの使用箇所を buildApiUrl('/endpoint') に置き換える"
echo "2. バックアップファイル (*.bak) を確認して、問題なければ削除する"
echo "3. git diff で変更内容を確認する"

