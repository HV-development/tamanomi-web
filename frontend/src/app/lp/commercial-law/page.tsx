'use client'

import Image from 'next/image'
import Link from 'next/link'

interface CommercialLawItem {
  label: string
  value: string
}

const commercialLawData: CommercialLawItem[] = [
  {
    label: 'サイト名',
    value: 'さいたま“welcome ドリンク”サイト「たまのみ」'
  },
  {
    label: '販売事業者名（会社名）',
    value: '株式会社つなぐ'
  },
  {
    label: '代表者名',
    value: '代表取締役　佐々木　彰'
  },
  {
    label: '運営委託先',
    value: '会社名: サイテックアイ株式会社\n代表者: 大澤 佳加\nURL: https://www.psytec-ai.com/\n住所: 〒761-8064 高松市上之町2丁目8番27'
  },
  {
    label: '所在地',
    value: '〒330-0063\n埼玉県さいたま市浦和区高砂2-2-3\nJRE さいたま浦和ビル5階'
  },
  {
    label: 'お問い合わせ',
    value: '以下のお問い合わせフォームよりご連絡ください。\n\n※お問い合わせいただいた内容には、遅滞なく電子メールにてご返信いたします。\n\n[お問い合わせフォーム URL]\n\nsaitama.info@tamanomi.com'
  },
  {
    label: '販売価格',
    value: '購入手続きの際に画面に表示されます。\n表示価格はすべて税抜価格であり、別途消費税が加算されます。\n※価格は消費税法その他の事情により事前に予告なく変更する場合があります。'
  },
  {
    label: '販売価格以外でお客様に発生する金銭',
    value: '当サイトのページの閲覧、コンテンツ購入、ソフトウェアのダウンロード等に必要となるインターネット接続料金、通信料金は、お客様のご負担となります。'
  },
  {
    label: 'お支払方法',
    value: '以下のいずれかのお支払方法をご利用いただけます。\n・各種クレジットカード、コード決済\n※コード決済は、自動継続での支払いはできません。\n・その他、購入にかかる決済を代行する会社が提供するお支払方法'
  },
  {
    label: '支払時期',
    value: '本サービスは、月額制の定期課金方式です。契約は自動的に毎月更新されます。一部コード決済は、毎月都度決済となっております。ただし、モニター期間などの無料期間中は除く。\n\n解約をご希望の場合は、次回決済日の前日までに「マイページ」より解約手続きを行ってください。期日を過ぎた場合、翌月分の料金が発生いたします。'
  },
  {
    label: '商品購入方法',
    value: '会員登録時または、登録後「マイページ」より「有料会員登録」メニューより各プランを選択いただき、決済ページへ進んでいただくことで有料会員登録が完了します。'
  },
  {
    label: '提供時期',
    value: '特別な定めを置いている場合を除き、お支払い手続き完了後直ちにご利用いただけます。'
  },
  {
    label: '動作環境',
    value: '動作確認済みブラウザ：Microsoft Edge、Google Chrome、Safari の最新版\n※ご利用の端末・ブラウザ・通信環境によっては、一部機能が正常に動作しない場合があります。'
  },
  {
    label: '提供開始後のキャンセル',
    value: '1．デジタルコンテンツという商品の性質上、購入確定後のキャンセル・返金には原則応じられません。ただし、当社に重大な瑕疵があった場合には、修正版の提供等の対応を行います。\n\n2．その他、利用制限、登録抹消、免責事項等について、当サイトの利用規約に従うこととします。'
  },
  {
    label: '特別条件',
    value: '1．クーリングオフについて\n本サービスは、訪問販売や電話勧誘販売等に該当しないため、特定商取引法におけるクーリングオフ制度の適用対象外です。\n\n2．定期課金方式の注意事項\n契約期間途中の解約となった場合も契約満了日までの料金が発生し、日割精算等による返金を含めた一切の返金は行われません。'
  },
  {
    label: '電気通信役務',
    value: '1．電気通信役務に該当するサービス提供においては、役務の特性上、クーリングオフの適用対象外となります。また、役務提供の性質上、利用開始後の返金には原則応じられません。'
  }
]

// URLをリンクに変換する関数
function renderValueWithLinks(value: string) {
  // URLパターンを検出（http:// または https:// で始まるURL）
  const urlPattern = /(https?:\/\/[^\s]+)/g
  const parts = value.split(urlPattern)
  
  return parts.map((part, index) => {
    if (urlPattern.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {part}
        </a>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export default function CommercialLawPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6 md:px-[120px] md:py-8">
          <div className="flex items-center justify-between">
            <Link href="/lp">
              <Image
                src="/lp/images/horizon-color-white.webp"
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
              さいたま"welcome ドリンク"サイト「たまのみ」に関する特定商取引法に基づく表記です。
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
                    {renderValueWithLinks(item.value)}
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
            <p>※本表記は2026年1月時点の情報です。内容は予告なく変更される場合があります。</p>
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


