#!/usr/bin/env node
/**
 * Gmail API認証用のリフレッシュトークン取得スクリプト
 * 
 * 使用方法:
 * E2E_GMAIL_CLIENT_ID=your-client-id \
 * E2E_GMAIL_CLIENT_SECRET=your-client-secret \
 * node scripts/get-gmail-token.js
 */

const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = process.env.E2E_GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.E2E_GMAIL_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('エラー: 環境変数が設定されていません');
  console.error('以下の環境変数を設定してください:');
  console.error('E2E_GMAIL_CLIENT_ID');
  console.error('E2E_GMAIL_CLIENT_SECRET');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'
);

const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent', // リフレッシュトークンを確実に取得するため
});

console.log('以下のURLにアクセスして認証してください:');
console.log('');
console.log(authUrl);
console.log('');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('認証コードを入力してください: ', (code) => {
  oauth2Client.getToken(code, (err, token) => {
    if (err) {
      console.error('エラー:', err.message);
      rl.close();
      process.exit(1);
      return;
    }
    console.log('');
    console.log('=== 認証情報 ===');
    console.log('リフレッシュトークン:', token.refresh_token);
    console.log('');
    console.log('以下の環境変数を設定してください:');
    console.log(`export E2E_GMAIL_REFRESH_TOKEN="${token.refresh_token}"`);
    console.log('');
    rl.close();
  });
});



