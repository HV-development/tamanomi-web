"use client"

import { Mail, CheckCircle, AlertTriangle, RefreshCw, ArrowLeft, Copy, ExternalLink } from "lucide-react"
import { Button } from "../atoms/button"
import { useState } from "react"

interface EmailRegistrationCompleteProps {
  email: string
  onBackToLogin: () => void
  onResend: () => void
  //テスト用
  debugInfo?: {
    registrationId?: string
    verificationUrl?: string
    otp?: string
    requestId?: string
  }
}

export function EmailRegistrationComplete({ email, onBackToLogin, onResend, debugInfo }: EmailRegistrationCompleteProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const isDevelopment = process.env.NODE_ENV === 'development'

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(item)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (err) {
    }
  }

  const openVerificationUrl = () => {
    if (debugInfo?.verificationUrl) {
      window.location.href = debugInfo.verificationUrl
    }
  }

  return (
    <div className="space-y-6">
      {/* 送信完了メッセージ */}
      <div className="text-center mb-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">認証メールを送信しました</h2>
          <p className="text-gray-600">メールアドレス認証用のリンクをお送りしました</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-green-800 font-medium mb-2">送信先メールアドレス</p>
          <p className="text-green-900 font-bold">{email}</p>
        </div>
      </div>
      {/* テスト用 */}
      {/* 開発環境用デバッグ情報 */}
      {isDevelopment && debugInfo && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6">
          <h3 className="text-yellow-900 font-bold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            開発環境 - テスト用情報
          </h3>

          {/* 確認URL */}
          {debugInfo.verificationUrl && (
            <div className="mb-4">
              <p className="text-sm text-yellow-800 font-medium mb-2">🔗 新規登録画面へのリンク</p>
              <div className="bg-white border border-yellow-300 rounded-lg p-3 flex items-center gap-2">
                <button
                  onClick={openVerificationUrl}
                  className="flex-1 text-left text-sm text-blue-600 hover:text-blue-800 underline truncate"
                >
                  {debugInfo.verificationUrl}
                </button>
                <button
                  onClick={() => copyToClipboard(debugInfo.verificationUrl!, 'url')}
                  className="p-1 hover:bg-yellow-100 rounded"
                  title="URLをコピー"
                >
                  <Copy className="w-4 h-4 text-yellow-600" />
                </button>
                <button
                  onClick={openVerificationUrl}
                  className="p-1 hover:bg-yellow-100 rounded"
                  title="新規登録画面に遷移"
                >
                  <ExternalLink className="w-4 h-4 text-yellow-600" />
                </button>
              </div>
              {copiedItem === 'url' && (
                <p className="text-xs text-green-600 mt-1">✅ URLをコピーしました</p>
              )}
            </div>
          )}

          {/* 登録ID */}
          {debugInfo.registrationId && (
            <div className="mb-4">
              <p className="text-sm text-yellow-800 font-medium mb-2">🔑 登録ID</p>
              <div className="bg-white border border-yellow-300 rounded-lg p-3 flex items-center gap-2">
                <code className="flex-1 text-sm text-gray-800 font-mono">{debugInfo.registrationId}</code>
                <button
                  onClick={() => copyToClipboard(debugInfo.registrationId!, 'registrationId')}
                  className="p-1 hover:bg-yellow-100 rounded"
                  title="登録IDをコピー"
                >
                  <Copy className="w-4 h-4 text-yellow-600" />
                </button>
              </div>
              {copiedItem === 'registrationId' && (
                <p className="text-xs text-green-600 mt-1">✅ 登録IDをコピーしました</p>
              )}
            </div>
          )}

          {/* OTP */}
          {debugInfo.otp && (
            <div className="mb-4">
              <p className="text-sm text-yellow-800 font-medium mb-2">🔢 テスト用OTP</p>
              <div className="bg-white border border-yellow-300 rounded-lg p-3 flex items-center gap-2">
                <code className="flex-1 text-lg text-gray-800 font-mono font-bold">{debugInfo.otp}</code>
                <button
                  onClick={() => copyToClipboard(debugInfo.otp!, 'otp')}
                  className="p-1 hover:bg-yellow-100 rounded"
                  title="OTPをコピー"
                >
                  <Copy className="w-4 h-4 text-yellow-600" />
                </button>
              </div>
              {copiedItem === 'otp' && (
                <p className="text-xs text-green-600 mt-1">✅ OTPをコピーしました</p>
              )}
            </div>
          )}

          {/* リクエストID */}
          {debugInfo.requestId && (
            <div className="mb-4">
              <p className="text-sm text-yellow-800 font-medium mb-2">🆔 リクエストID</p>
              <div className="bg-white border border-yellow-300 rounded-lg p-3 flex items-center gap-2">
                <code className="flex-1 text-sm text-gray-800 font-mono">{debugInfo.requestId}</code>
                <button
                  onClick={() => copyToClipboard(debugInfo.requestId!, 'requestId')}
                  className="p-1 hover:bg-yellow-100 rounded"
                  title="リクエストIDをコピー"
                >
                  <Copy className="w-4 h-4 text-yellow-600" />
                </button>
              </div>
              {copiedItem === 'requestId' && (
                <p className="text-xs text-green-600 mt-1">✅ リクエストIDをコピーしました</p>
              )}
            </div>
          )}

          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              💡 <strong>テスト手順:</strong><br />
              1. 上記の「新規登録画面へのリンク」をクリックして新規登録画面に遷移<br />
              2. OTP認証が必要な場合は上記のOTPを使用<br />
              3. 登録IDは上記の値をコピーして使用
            </p>
          </div>
        </div>
      )}

      {/* 手順説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
        <h3 className="text-blue-900 font-bold mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          次の手順で新規登録を完了してください
        </h3>
        <ol className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 mt-0.5">
              1
            </span>
            <span>送信されたメールを開いてください</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 mt-0.5">
              2
            </span>
            <span>メール内の「新規登録を続ける」リンクをクリックしてください</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 mt-0.5">
              3
            </span>
            <span>新規登録画面で必要事項を入力して登録を完了してください</span>
          </li>
        </ol>
      </div>

      {/* ボタン */}
      <div className="space-y-3">
        <Button
          onClick={onBackToLogin}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          ログイン画面に戻る
        </Button>

        <Button
          onClick={onResend}
          variant="secondary"
          className="w-full py-3 text-base font-medium flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          認証メールを再送信
        </Button>
      </div>
    </div>
  )
}