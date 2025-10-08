# Vercel環境変数設定ガイド

## 必須環境変数

Vercelのプロジェクト設定で以下の環境変数を設定してください：

### 1. GitHub Packages認証

**変数名**: `GITHUB_TOKEN`  
**値**: GitHub Personal Access Tokenの値  
**環境**: Production, Preview, Development（全て）

```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. バックエンドAPI URL

**変数名**: `NEXT_PUBLIC_API_URL`  
**値**: RailwayでデプロイされたバックエンドAPIのURL  
**環境**: Production, Preview, Development（全て）

```
https://your-railway-api-domain.railway.app
```

> **重要**: この環境変数が設定されていないと、フロントエンドが`localhost:3002`に接続しようとしてエラーになります。

## 設定手順

1. Vercelのプロジェクトページにアクセス
2. **Settings** → **Environment Variables** を開く
3. 上記の環境変数を追加：
   - Name: `GITHUB_TOKEN`
   - Value: GitHubトークンの値
   - Environments: Production, Preview, Development にチェック
   - **Add** をクリック
4. 2つ目の環境変数を追加：
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: RailwayのバックエンドURL（例: `https://tamanomi-api-production.up.railway.app`）
   - Environments: Production, Preview, Development にチェック
   - **Add** をクリック
5. **Deployments** タブに移動
6. 最新のデプロイメントの右側の **...** メニューから **Redeploy** を選択
7. **Redeploy** をクリック

## 環境変数の確認

デプロイ後、ビルドログで以下を確認：

```
✓ Collecting page data
✓ Generating static pages
Environment Variables:
- NEXT_PUBLIC_API_URL is set
```

## トラブルシューティング

### エラー: `ECONNREFUSED 127.0.0.1:3002`

**原因**: `NEXT_PUBLIC_API_URL`が設定されていない

**解決方法**: 上記手順で`NEXT_PUBLIC_API_URL`を設定し、再デプロイ

### エラー: `ERR_PNPM_FETCH_401`

**原因**: `GITHUB_TOKEN`が設定されていない、または無効

**解決方法**: 
1. GitHubトークンが有効か確認
2. トークンに`read:packages`スコープがあるか確認
3. Vercelで`GITHUB_TOKEN`を再設定
4. 再デプロイ

## RailwayのバックエンドURL取得方法

1. Railwayのプロジェクトページにアクセス
2. `tamanomi-api`サービスを選択
3. **Settings** タブを開く
4. **Domains** セクションでURLを確認
   - 例: `https://tamanomi-api-production.up.railway.app`
5. このURLを`NEXT_PUBLIC_API_URL`に設定

## 注意事項

- `NEXT_PUBLIC_`プレフィックスの環境変数は、Next.jsのビルド時にバンドルされます
- 環境変数を変更した後は、必ず再デプロイが必要です
- セキュリティ上、本番環境では必ずHTTPSを使用してください
