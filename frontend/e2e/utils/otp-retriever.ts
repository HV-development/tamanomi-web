import { APIRequestContext } from '@playwright/test';
import { getLatestOtp as getLatestOtpFromMailHog } from './mailhog';
import { GmailOtpRetriever, GmailConfig } from './gmail-otp-retriever';

/**
 * 環境に応じたOTP取得関数
 * E2E_OTP_RETRIEVER環境変数で取得方法を切り替え
 * - mailhog: 開発環境用（MailHogを使用）
 * - gmail: 本番環境用（Gmail APIを使用）
 */
export async function getLatestOtp(
  request: APIRequestContext,
  email: string
): Promise<string> {
  const method = process.env.E2E_OTP_RETRIEVER || 'mailhog';

  switch (method) {
    case 'mailhog':
      return getLatestOtpFromMailHog(request, email);
    
    case 'gmail':
      const gmailConfig: GmailConfig = {
        clientId: process.env.E2E_GMAIL_CLIENT_ID!,
        clientSecret: process.env.E2E_GMAIL_CLIENT_SECRET!,
        refreshToken: process.env.E2E_GMAIL_REFRESH_TOKEN!,
        userEmail: process.env.E2E_GMAIL_USER_EMAIL || email,
      };

      // 必須環境変数のチェック
      if (!gmailConfig.clientId || !gmailConfig.clientSecret || !gmailConfig.refreshToken) {
        throw new Error(
          'Gmail API設定が不完全です。以下の環境変数を設定してください:\n' +
          'E2E_GMAIL_CLIENT_ID\n' +
          'E2E_GMAIL_CLIENT_SECRET\n' +
          'E2E_GMAIL_REFRESH_TOKEN'
        );
      }

      const gmailRetriever = new GmailOtpRetriever(gmailConfig);
      return gmailRetriever.getLatestOtp(request, email);
    
    default:
      throw new Error(`Unknown OTP retriever method: ${method}. Supported methods: mailhog, gmail`);
  }
}

