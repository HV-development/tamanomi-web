import { NextRequest, NextResponse } from 'next/server';

// サーバーサイドなのでNEXT_PUBLIC_プレフィックスなしの環境変数を使用
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // tamanomi-apiにプロキシ
    const response = await fetch(`${API_BASE_URL}/api/v1/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ お問い合わせAPI エラー:', data);
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'お問い合わせの送信に失敗しました',
          errors: data.errors,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('❌ お問い合わせAPI 例外エラー:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        message: 'お問い合わせの送信中にエラーが発生しました',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

