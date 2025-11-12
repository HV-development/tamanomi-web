#!/bin/sh
set -e

echo "🚀 Starting Web app setup..."

# node_modulesが空の場合のみインストール
if [ ! -d "node_modules/next" ]; then
  echo "📦 Installing dependencies..."
  pnpm install --prefer-offline
  echo "✅ Dependencies installed"
else
  echo "✅ Dependencies already installed (skipping)"
fi

# schemas のビルドとコピー
echo "🔨 Building tamanomi-schemas..."
cd /app/tamanomi-schemas
if [ ! -d "node_modules" ]; then
  pnpm install --prefer-offline
fi
pnpm run build

echo "📋 Copying schemas to node_modules..."
cd /app
mkdir -p /app/node_modules/@hv-development/schemas
cp -r /app/tamanomi-schemas/dist /app/node_modules/@hv-development/schemas/
cp /app/tamanomi-schemas/package.json /app/node_modules/@hv-development/schemas/
echo "✅ Schemas built and copied"

echo "🎉 Setup complete! Starting application..."
exec "$@"

