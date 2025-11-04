#!/usr/bin/env node

/**
 * Vercelビルド時に.npmrcファイルを生成するスクリプト
 * 環境変数GITHUB_TOKENから.npmrcを生成します
 */

const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable is not set');
  console.error('   Please set GITHUB_TOKEN in Vercel environment variables');
  process.exit(1);
}

// 現在のディレクトリ（frontend）に.npmrcを作成
const npmrcPath = path.join(process.cwd(), '.npmrc');
const npmrcContent = `@hv-development:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
//npm.pkg.github.com/:always-auth=true
`;

try {
  fs.writeFileSync(npmrcPath, npmrcContent, 'utf8');
  console.log('✅ .npmrc file created successfully');
} catch (error) {
  console.error('❌ Error creating .npmrc file:', error);
  process.exit(1);
}

