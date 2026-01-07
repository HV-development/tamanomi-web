'use client'

import Image from 'next/image'
import Link from 'next/link'

interface CommercialLawItem {
  label: string
  value: string
}

const commercialLawData: CommercialLawItem[] = [
  {
    label: '事業者名',
    value: '株式会社つなぐ'
  },
  {
    label: '代表者名',
    value: '代表取締役 〇〇 〇〇'
  },
  {
    label: '所在地',
    value: '〒000-0000\n埼玉県さいたま市〇〇区〇〇〇〇〇〇'
  },
  {
    label: '電話番号',
    value: '000-0000-0000'
  },
  {
    label: 'メールアドレス',
    value: 'info@tamanomi.jp'
  },
  {
    label: '販売価格',
    value: '月額980円（一般価格）\n月額490円（会員価格）\n※価格は税込表示です'
  },
  {
    label: '支払方法',
    value: 'クレジットカード決済、コード決済（PayPay、イオンPay等）'
  },
  {
    label: '支払時期',
    value: 'サービス利用開始時に初回決済が行われ、以降は毎月自動更新日に決済が行われます'
  },
  {
    label: 'サービス提供時期',
    value: 'お申し込み完了後、即座にサービスをご利用いただけます'
  },
  {
    label: '返品・キャンセルポリシー',
    value: 'サービス開始後の返金は原則として行っておりません。\n解約をご希望の場合は、更新日前日までにマイページから退会手続きを行ってください。\n解約後も更新日まではサービスをご利用いただけます。'
  },
  {
    label: 'その他',
    value: 'サービスに関するお問い合わせは、お問い合わせフォームまたはメールアドレスよりご連絡ください。'
  }
]

export default function CommercialLawPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6 md:px-[120px] md:py-8">
          <div className="flex items-center justify-between">
            <Link href="/lp">
              <Image
                src="/lp/images/horizon-color-white.png"
                alt="たまのみ"
                width={1312}
                height={320}
                className="w-32 h-8 md:w-[246px] md:h-[60px]"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-[120px]">
          {/* Page Title */}
          <div className="text-center mb-12 md:mb-16">
            <h1 
              className="text-4xl md:text-5xl mb-4"
              style={{
                color: '#000',
                fontFamily: '"Zen Kaku Gothic New"',
                fontWeight: '700',
                lineHeight: '100%'
              }}
            >
              特定商取引法に基づく表記
            </h1>
            <p 
              className="text-base md:text-lg"
              style={{
                color: '#666',
                fontFamily: '"Zen Kaku Gothic New"',
                fontWeight: '400',
                lineHeight: '160%'
              }}
            >
              たまのみサービスに関する特定商取引法に基づく表記です。
            </p>
          </div>

          {/* Commercial Law Items */}
          <div className="space-y-8 md:space-y-10">
            {commercialLawData.map((item, index) => (
              <div 
                key={index}
                className="border-b border-gray-200 pb-8 md:pb-10 last:border-b-0"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                  <div 
                    className="w-full md:w-48 flex-shrink-0"
                    style={{
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontWeight: '500',
                      fontSize: '16px',
                      lineHeight: '160%',
                      color: '#000'
                    }}
                  >
                    {item.label}
                  </div>
                  <div 
                    className="flex-1 whitespace-pre-line"
                    style={{
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontWeight: '400',
                      fontSize: '16px',
                      lineHeight: '160%',
                      color: '#333'
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div 
            className="mt-12 md:mt-16 pt-8 md:pt-12 border-t border-gray-200"
            style={{
              fontFamily: '"Zen Kaku Gothic New"',
              fontWeight: '400',
              fontSize: '14px',
              lineHeight: '160%',
              color: '#666',
              textAlign: 'center'
            }}
          >
            <p>※本表記は2025年1月時点の情報です。内容は予告なく変更される場合があります。</p>
            <p className="mt-2">最新の情報はお問い合わせフォームよりご確認ください。</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-50 border-t border-gray-200 mt-16 md:mt-24">
        <div className="max-w-6xl mx-auto px-4 py-8 md:px-[120px] md:py-12">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8 mb-4 md:mb-8">
            <Link 
              href="/lp/faq"
              className="text-gray-700 hover:text-gray-900 transition-colors text-sm md:text-base"
              style={{
                fontFamily: '"Zen Kaku Gothic New"',
                fontWeight: '400'
              }}
            >
              よくあるご質問
            </Link>
            <Link 
              href="/lp/contact" 
              className="text-gray-700 hover:text-gray-900 transition-colors text-sm md:text-base"
              style={{
                fontFamily: '"Zen Kaku Gothic New"',
                fontWeight: '400'
              }}
            >
              お問い合わせ
            </Link>
            <a 
              href="/プライバシーポリシー.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 transition-colors text-sm md:text-base"
              style={{
                fontFamily: '"Zen Kaku Gothic New"',
                fontWeight: '400'
              }}
            >
              プライバシーポリシー
            </a>
            <Link 
              href="/lp/commercial-law"
              className="text-gray-700 hover:text-gray-900 transition-colors text-sm md:text-base"
              style={{
                fontFamily: '"Zen Kaku Gothic New"',
                fontWeight: '400'
              }}
            >
              特定商取引法に基づく表記
            </Link>
            <a 
              href="/たまのみサービス利用規約.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 transition-colors text-sm md:text-base"
              style={{
                fontFamily: '"Zen Kaku Gothic New"',
                fontWeight: '400'
              }}
            >
              ご利用規約
            </a>
          </div>

          {/* Copyright */}
          <div className="pb-6 md:pb-8">
            <p 
              className="text-sm md:text-base"
              style={{
                color: '#000',
                textAlign: 'center',
                fontFamily: 'Rubik',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: '100%'
              }}
            >
              ©2025 TAMANOMI
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

