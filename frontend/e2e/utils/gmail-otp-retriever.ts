import { google } from 'googleapis';
import { APIRequestContext } from '@playwright/test';

export interface GmailConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  userEmail: string;
}

export class GmailOtpRetriever {
  private oauth2Client: ReturnType<typeof google.auth.OAuth2Client>;
  private gmail: ReturnType<typeof google.gmail>;
  private config: GmailConfig;

  constructor(config: GmailConfig) {
    this.config = config;
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      'urn:ietf:wg:oauth:2.0:oob' // リダイレクトURI（OOBフロー）
    );
    
    this.oauth2Client.setCredentials({
      refresh_token: config.refreshToken,
    });

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async getLatestOtp(request: APIRequestContext, email: string): Promise<string> {
    const maxRetries = 8; // さらに短縮
    const interval = 1000; // 1.0秒（さらに短縮、Gmail APIのレート制限を考慮）

    for (let i = 0; i < maxRetries; i++) {
      try {
        // 最新のメールを検索
        const response = await this.gmail.users.messages.list({
          userId: 'me',
          q: `to:${email} subject:"ログイン認証コード" is:unread`,
          maxResults: 1,
        });

        const messages = response.data.messages;
        if (!messages || messages.length === 0) {
          await new Promise(resolve => setTimeout(resolve, interval));
          continue;
        }

        // 最新のメールを取得
        const messageId = messages[0].id;
        const message = await this.gmail.users.messages.get({
          userId: 'me',
          id: messageId,
          format: 'full',
        });

        // メール本文を取得
        const body = this.extractEmailBody(message.data);
        
        // デバッグ用: メール本文の一部をログに出力
        
        // OTPを抽出
        const otp = this.extractOtp(body);
        if (otp) {
          
          // メールを既読にする（オプション）
          await this.gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
              removeLabelIds: ['UNREAD'],
            },
          }).catch(() => {
            // 既読化に失敗してもエラーにしない
          });

          return otp;
        }

        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
        console.error(`[Gmail] エラー (試行 ${i + 1}/${maxRetries}):`, errorMessage);
        
        // 認証エラーの場合は再試行しない
        if (errorCode === 401 || errorCode === 403) {
          throw new Error(`Gmail API認証エラー: ${errorMessage}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    throw new Error(`OTP not found for email: ${email} after ${maxRetries} retries`);
  }

  private extractEmailBody(message: {
    payload?: {
      body?: { data?: string };
      parts?: Array<{
        mimeType?: string;
        body?: { data?: string };
        parts?: Array<{
          mimeType?: string;
          body?: { data?: string };
        }>;
      }>;
    };
  }): string {
    let body = '';
    
    if (message.payload) {
      // マルチパートメールの場合
      if (message.payload.parts) {
        for (const part of message.payload.parts) {
          if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
            const data = part.body?.data;
            if (data) {
              body += Buffer.from(data, 'base64').toString('utf-8');
            }
          }
          // ネストされたパーツ（マルチパート内のマルチパート）を処理
          if (part.parts) {
            for (const nestedPart of part.parts) {
              if (nestedPart.mimeType === 'text/plain' || nestedPart.mimeType === 'text/html') {
                const data = nestedPart.body?.data;
                if (data) {
                  body += Buffer.from(data, 'base64').toString('utf-8');
                }
              }
            }
          }
        }
      } else if (message.payload.body?.data) {
        // シンプルなメールの場合
        body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
      }
    }

    return body;
  }

  private extractOtp(body: string): string | null {
    // HTMLタグを除去
    const textBody = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // otp-codeクラスを含む部分を探す
    const otpCodeMatch = body.match(/<div[^>]*class="otp-code"[^>]*>(\d{6})<\/div>/i);
    if (otpCodeMatch && otpCodeMatch[1]) {
      return otpCodeMatch[1];
    }
    
    // 認証コードの前後に特定の文字列がある6桁の数字を探す
    const matches = textBody.match(/\b\d{6}\b/g);
    if (matches && matches.length > 0) {
      const otpCode = matches.find(match => {
        const index = textBody.indexOf(match);
        const context = textBody.substring(
          Math.max(0, index - 30),
          Math.min(textBody.length, index + 30)
        );
        return /(認証|コード|ワンタイム|パスワード|OTP|verification|code|認証コード)/i.test(context);
      });
      if (otpCode) {
        return otpCode;
      }
      // 見つからない場合は最初の6桁の数字を返す
      return matches[0];
    }
    
    return null;
  }
}

