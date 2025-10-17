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

### 2. バックエンドAPI URL（サーバーサイド）

**変数名**: `API_BASE_URL`  
**値**: RailwayでデプロイされたバックエンドAPIのベースURL（**バージョンなし**）  
**環境**: Production, Preview, Development（全て）

```
https://your-railway-api-domain.railway.app
```

> **重要**: 
> - `/api/v1` は**含めないでください**。バージョン管理はプログラム側で行います。
> - この環境変数が設定されていないと、エラーになります。
> - 例: `https://tamanomi-api-develop.up.railway.app`

## 設定手順

1. Vercelのプロジェクトページにアクセス
2. **Settings** → **Environment Variables** を開く
3. 1つ目の環境変数を追加：
   - Name: `GITHUB_TOKEN`
   - Value: GitHubトークンの値
   - Environments: Production, Preview, Development にチェック
   - **Add** をクリック
4. 2つ目の環境変数を追加：
   - Name: `API_BASE_URL`
   - Value: RailwayのバックエンドURL（例: `https://tamanomi-api-production.up.railway.app`）
   - Environments: Production, Preview, Development にチェック
   - **Add** をクリック

> **注意**: `/api/v1` は含めません。バージョン管理はプログラム側で自動的に行われます。
6. **Deployments** タブに移動
7. 最新のデプロイメントの右側の **...** メニューから **Redeploy** を選択
8. **Redeploy** をクリック

## 環境変数の確認

デプロイ後、ビルドログで以下を確認：

```
✓ Collecting page data
✓ Generating static pages
Environment Variables:
- NEXT_PUBLIC_API_URL is set
```

## トラブルシューティング

### エラー: `ENOTFOUND api` または `getaddrinfo ENOTFOUND api`

**原因**: `API_BASE_URL`が設定されていない（サーバーサイドAPIルートがDockerコンテナ名`api`を使おうとしている）

**解決方法**: 上記手順で`API_BASE_URL`を設定し、再デプロイ

### エラー: `ECONNREFUSED 127.0.0.1:3002`

**原因**: `API_BASE_URL`が設定されていない（サーバーサイドAPIルートがlocalhostに接続しようとしている）

**解決方法**: 
1. 上記手順で`API_BASE_URL`を設定（RailwayのURL + `/api/v1`）
2. 再デプロイ

> **注意**: このエラーはサーバーサイドのAPI routeで発生します。`NEXT_PUBLIC_API_URL`ではなく`API_BASE_URL`（プレフィックスなし）の設定が必要です。

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
