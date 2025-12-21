import { APIRequestContext } from '@playwright/test';

export async function getLatestOtp(request: APIRequestContext, email: string): Promise<string> {
    const mailhogUrl = 'http://localhost:8025/api/v2/messages';
    const maxRetries = 10; // 10回（さらに短縮）
    const interval = 600; // 0.6秒（さらに短縮）

    for (let i = 0; i < maxRetries; i++) {
        const response = await request.get(mailhogUrl);
        const data = await response.json();

        interface MailItem {
            Created?: string;
            Content: {
                Headers: {
                    Date?: string[];
                    To?: string[];
                };
                Body?: string;
            };
        }
        // items配列から最新のメールを探す（受信時刻でソート）
        const items = ((data.items as MailItem[] | undefined) || []).sort((a: MailItem, b: MailItem) => {
            const timeA = new Date(a.Created || a.Content.Headers.Date?.[0] || '0').getTime();
            const timeB = new Date(b.Created || b.Content.Headers.Date?.[0] || '0').getTime();
            return timeB - timeA; // 新しい順
        });
        
        // 指定されたメールアドレス宛の最新のメールを探す
        // 並列実行時の競合を避けるため、最新のメールを優先的に取得
        const targetMails = items.filter((item: MailItem) =>
            item.Content.Headers.To?.[0]?.includes(email)
        );
        
        // 最新のメールを取得（Created時刻でソート済み）
        const targetMail = targetMails[0];

        if (targetMail) {
            // MailHogのAPIレスポンス構造を確認
            // Content.BodyはHTMLメールの本文（マルチパート形式の場合はbase64エンコードされている可能性がある）
            let body = targetMail.Content.Body || '';
            
            // base64エンコードされている場合はデコードを試みる
            try {
                // base64エンコードされたテキストを検出
                if (body.includes('Content-Transfer-Encoding: base64')) {
                    // base64エンコードされた部分を抽出
                    const base64Match = body.match(/Content-Transfer-Encoding: base64\s+([A-Za-z0-9+/=\s]+)/);
                    if (base64Match && base64Match[1]) {
                        const base64Text = base64Match[1].replace(/\s/g, '');
                        try {
                            const decoded = Buffer.from(base64Text, 'base64').toString('utf-8');
                            body = decoded;
                        } catch (e) {
                        }
                    }
                }
            } catch (e) {
            }
            
            // デバッグ用: メール本文の一部をログに出力
            
            // OTPコードは通常、大きなフォントサイズや特別なスタイルで表示される
            // テンプレートでは `<div class="otp-code">${data.otp}</div>` の形式で表示される
            // まず、otp-codeクラスを含む部分を探す
            const otpCodeMatch = body.match(/<div[^>]*class="otp-code"[^>]*>(\d{6})<\/div>/i);
            if (otpCodeMatch && otpCodeMatch[1]) {
                return otpCodeMatch[1];
            }
            
            // HTMLメールの場合は、HTMLタグを除去してから検索
            // 改行やスペースを正規化
            const textBody = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            
            // 次に、認証コードの前後に特定の文字列がある6桁の数字を探す
            const matches = textBody.match(/\b\d{6}\b/g);
            if (matches && matches.length > 0) {
                // OTPコードの前後に特定の文字列があるか確認
                const otpCode = matches.find(match => {
                    const index = textBody.indexOf(match);
                    const context = textBody.substring(Math.max(0, index - 30), Math.min(textBody.length, index + 30));
                    // OTPコードの前後に「認証コード」「ワンタイムパスワード」「OTP」などの文字列があるか確認
                    return /(認証|コード|ワンタイム|パスワード|OTP|verification|code|認証コード)/i.test(context);
                });
                if (otpCode) {
                    return otpCode;
                }
                // 見つからない場合は最初の6桁の数字を返す
                return matches[0];
            }
            
            // HTMLタグ除去後の本文からも検索
            const match = body.match(/\b\d{6}\b/);
            if (match) {
                return match[0];
            }
        }

        await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error(`OTP not found for email: ${email}`);
}
