'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, type ReactNode } from 'react'

interface FAQItem {
  question: string
  answer: ReactNode
}

interface FAQSection {
  title: string
  items: FAQItem[]
}

const faqData: FAQSection[] = [
  {
    title: '1) サービス全体について',
    items: [
      {
        question: 'たまのみって何？',
        answer: 'さいたま市内の対象店で、毎日1軒につきドリンクが1杯無料になる月額制の『Welcomeドリンク』サービスです。対象ドリンクや条件等は店舗により異なります。'
      },
      {
        question: '料金は？',
        answer: '月額 一般価格：980円、「さいたま市みんなのアプリ」会員価格：480円。'
      }
    ]
  },
  {
    title: '2) ユーザー向け',
    items: [
      {
        question: '利用する際のルールは？',
        answer: '原則「1店舗につき1日1杯」が無料対象です。同日に複数店舗を回れば、その都度1杯無料でドリンクが提供されます（同一店舗で2杯目以降は通常料金）。対象ドリンク・サイズ、サービスを受けるための条件は店舗により異なります。'
      },
      {
        question: 'どんなドリンクが無料対象？',
        answer: '店舗ごとに「クーポン対象ドリンク」が決められています。「たまのみ」の各掲載店クーポンページで、利用条件と併せて事前にご確認ください。（例：料理1品以上オーダーした方対象 / 生ビール中ジョッキ提供）。'
      },
      {
        question: '年齢制限は？',
        answer: 'ソフトドリンクについては、年齢制限はありません。アルコール入りドリンク（酒類）については、20歳未満の飲酒は法律で禁止されています。店舗で身分証の提示を求められる場合があります。また、飲酒運転は絶対にしないでください。'
      },
      {
        question: '同伴者の分も無料になりますか？',
        answer: '同伴者分は無料になりません。「たまのみ」会員ご本人のみクーポン対象となります。'
      },
      {
        question: 'クーポンの使い方の流れは？',
        answer: (
          <div className="flex flex-col items-center gap-6">
            <Image
              src="/lp/images/利用の流れ①.png"
              alt="利用の流れ 1"
              width={1280}
              height={720}
              className="w-full max-w-2xl h-auto rounded-lg border border-gray-200"
            />
            <Image
              src="/lp/images/利用の流れ②.png"
              alt="利用の流れ 2"
              width={1280}
              height={720}
              className="w-full max-w-2xl h-auto rounded-lg border border-gray-200"
            />
          </div>
        )
      },
      {
        question: '支払い方法は？',
        answer: 'たまのみサイト内の月額課金です。利用可能な決済手段を選択できます。詳細はサイト内でご確認ください。'
      },
      {
        question: '退会（解約）方法は？契約更新日は？',
        answer: '契約更新日（毎月1日）の前日までに、サイト内「マイページ」⇒「プロフィール編集」にて「退会」手続きをしてください。課金期間中の途中退会（解約）は、原則として日割計算による返金はいたしません。退会（解約）後も更新日までは利用可能です。'
      },
      {
        question: '機種変更・紛失時の引き継ぎは？',
        answer: '同一アカウント（ID・パスワード）でログインすれば、過去の情報が引き継がれます。ただし、同時ログイン数や不正利用防止の観点で端末制限がかかる場合があります。'
      },
      {
        question: 'さいたま市民以外も使える？',
        answer: 'さいたま市民に限らず、市外在住の方も利用できます。'
      },
      {
        question: '店舗側の理由でサービスが利用できない場合は？　トラブルシューティングへ',
        answer: '店舗側の理由（売り切れ等）により、サービスが利用できない場合は、代替メニューの有無等を店舗にご確認ください。'
      }
    ]
  },
  {
    title: '3) 掲載店向け',
    items: [
      {
        question: '目的は？',
        answer: '背景として酒類出荷の長期減少傾向や若年層の飲酒頻度低下が指摘されています。飲食業界の活性化、若年層の"ちょい飲み"機会づくり、観光・来街促進などを目的としています。'
      },
      {
        question: '掲載費は？',
        answer: '掲載費は無料です（別途、掲載店用の規約をご確認ください）。'
      },
      {
        question: '店舗のオペレーションは？',
        answer: (
          <div className="flex flex-col items-center gap-6">
            <Image
              src="/lp/images/利用の流れ①.png"
              alt="利用の流れ 1"
              width={1280}
              height={720}
              className="w-full max-w-2xl h-auto rounded-lg border border-gray-200"
            />
            <Image
              src="/lp/images/利用の流れ②.png"
              alt="利用の流れ 2"
              width={1280}
              height={720}
              className="w-full max-w-2xl h-auto rounded-lg border border-gray-200"
            />
          </div>
        )
      },
      {
        question: 'POSやレシート表記は？',
        answer: '店舗レジシステムに応じて「サービス値引き」「クーポン」等の勘定処理を推奨します。会計上の処理は一般的に販促費となりますが、会計・税務上の扱いは顧問税理士等にご相談ください。'
      },
      {
        question: '掲載するクーポン内容・店舗情報の変更・登録方法は？',
        answer: '管理画面から変更（登録）可能です。たまのみ運営事務局が承認すると反映されます。タイミングや審査等の状況により反映までの日数は異なります。'
      },
      {
        question: '長期休業・クーポン利用一時停止の際の対応は？',
        answer: '店舗都合でクーポン利用を一時停止する場合は、事前にたまのみ運営事務局へご連絡ください。'
      },
      {
        question: '未成年と思われる方への年齢確認は？',
        answer: 'ソフトドリンクの場合、特に必要はありません。アルコール類の提供で年齢確認が必要と判断した場合は、身分証等による確認をお願いします。'
      },
      {
        question: '運営事務局による掲載一時停止・退会について',
        answer: '規約違反、サービス品質の著しい低下、法令違反等が確認された場合、運営事務局の判断で一時停止・退会となることがあります。通常の任意退会は規約に定める予告期間に従います。'
      }
    ]
  },
  {
    title: '4) セキュリティ・プライバシー',
    items: [
      {
        question: '個人情報の取り扱いは？',
        answer: '利用目的の範囲で最小限を取得し、適切に管理します。必要に応じて、アクセス制御・ログ監査を行います。詳細はプライバシーポリシーをご確認ください。'
      }
    ]
  },
  {
    title: '5) トラブルシューティング',
    items: [
      {
        question: '「このクーポンで乾杯！」がタップできない',
        answer: '既に当日その店舗でクーポン利用済みである場合や、通信状態の不良などが考えられます。WEBブラウザの再起動、電波状況の確認等をお試しください。解決しない場合は「お問い合わせ」フォームにてご連絡ください。'
      },
      {
        question: '課金・請求金額がおかしい',
        answer: 'マイページ内の「決済履歴」をご確認の上、「お問い合わせ」フォームにてご連絡ください。'
      },
      {
        question: 'アカウントにログインできない',
        answer: 'パスワード再設定、スマホOSのバージョン更新をお試しください。解決しない場合は「お問い合わせ」フォームにてご連絡ください。'
      }
    ]
  },
  {
    title: '6) ルール・マナー（重要）',
    items: [
      {
        question: '利用時の注意事項は？',
        answer: 'アルコール類の提供の場合、20歳未満の飲酒禁止／飲酒運転禁止。たまのみクーポン画面の不正転用・貸与は禁止されています。健康状態に留意し、節度あるご利用をお願いします。'
      }
    ]
  },
  {
    title: '7) 連絡先',
    items: [
      {
        question: 'ユーザーサポートの連絡先は？',
        answer: 'サイト内「お問い合わせ」からご連絡ください。'
      }
    ]
  }
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (sectionIndex: number, itemIndex: number) => {
    const key = `${sectionIndex}-${itemIndex}`
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

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
          {/* Back Button */}
          <div className="mb-8">
            <Link
              href="/lp"
              className="inline-flex items-center gap-2 hover:opacity-70 transition-opacity"
              style={{
                color: '#6FC8E5',
                fontFamily: '"Zen Kaku Gothic New"',
                fontWeight: '500',
                fontSize: '16px'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              トップへ戻る
            </Link>
          </div>

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
              よくあるご質問
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
              お問い合わせの多い質問をまとめました。
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-12 md:space-y-16">
            {faqData.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {/* Section Title */}
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                  <div 
                    style={{
                      width: '5px',
                      height: '20px',
                      background: 'var(--main, #6FC8E5)'
                    }}
                  />
                  <h2 
                    className="text-xl md:text-2xl"
                    style={{
                      color: '#000',
                      textAlign: 'center',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontSize: '20px',
                      fontWeight: '500',
                      lineHeight: '100%'
                    }}
                  >
                    {section.title}
                  </h2>
                </div>

                {/* FAQ Items */}
                <div>
                  {section.items.map((item, itemIndex) => {
                    const key = `${sectionIndex}-${itemIndex}`
                    const isOpen = openItems[key]

                    return (
                      <div 
                        key={itemIndex}
                        style={{
                          display: 'flex',
                          padding: '32px 0',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '40px',
                          borderTop: '1px solid #D5D5D5',
                          background: '#FFF'
                        }}
                      >
                        {/* Question Button */}
                        <button
                          className="w-full text-left flex items-center justify-between hover:opacity-80 transition-opacity"
                          onClick={() => toggleItem(sectionIndex, itemIndex)}
                        >
                          <span 
                            className="text-sm md:text-base pr-4"
                            style={{
                              color: 'var(--main, #6FC8E5)',
                              fontFamily: '"Zen Kaku Gothic New"',
                              fontSize: '16px',
                              fontWeight: '500',
                              lineHeight: '160%'
                            }}
                          >
                            {item.question}
                          </span>
                          <div 
                            className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full"
                            style={{
                              background: '#6FC8E5'
                            }}
                          >
                            {isOpen ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M20.5 12H3.5" stroke="white" strokeLinecap="round"/>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3.5V20.5M20.5 12H3.5" stroke="white" strokeLinecap="round"/>
                              </svg>
                            )}
                          </div>
                        </button>

                        {/* Answer */}
                        {isOpen && (
                          <div className="w-full">
                            {typeof item.answer === 'string' ? (
                              <p 
                                className="text-sm md:text-base"
                                style={{
                                  color: '#333',
                                  fontFamily: '"Zen Kaku Gothic New"',
                                  fontWeight: '400',
                                  lineHeight: '160%'
                                }}
                              >
                                {item.answer}
                              </p>
                            ) : (
                              item.answer
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div 
            className="mt-16 md:mt-20 p-8 md:p-12 rounded-lg text-center"
            style={{
              backgroundColor: '#F0F9FF'
            }}
          >
            <h3 
              className="text-xl md:text-2xl mb-4"
              style={{
                color: '#000',
                fontFamily: '"Zen Kaku Gothic New"',
                fontWeight: '700',
                lineHeight: '100%'
              }}
            >
              解決しない場合は
            </h3>
            <p 
              className="text-base md:text-lg mb-6"
              style={{
                color: '#666',
                fontFamily: '"Zen Kaku Gothic New"',
                fontWeight: '400',
                lineHeight: '160%'
              }}
            >
              お問い合わせフォームよりご連絡ください
            </p>
            <Link
              href="/lp/contact"
              className="inline-flex py-3 md:py-4 px-8 md:px-12 justify-center items-center gap-2 rounded-full border-none cursor-pointer hover:opacity-90 transition-opacity"
              style={{
                background: '#6FC8E5',
                color: '#FFF',
                fontFamily: '"Zen Kaku Gothic New"',
                fontWeight: '700',
                fontSize: '16px',
                textDecoration: 'none'
              }}
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 mt-16 md:mt-20">
        <div className="max-w-6xl mx-auto px-4 md:px-[120px] py-12 md:py-16">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-8">
              <Image
                src="/lp/images/logo.png"
                alt="TAMANOMI"
                width={328}
                height={329}
                className="w-32 h-auto md:w-40 mx-auto"
              />
            </div>

            {/* Back to Top Link */}
            <div className="mb-8">
              <Link
                href="/lp"
                className="inline-flex items-center gap-2 hover:opacity-70 transition-opacity"
                style={{
                  color: '#6FC8E5',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontWeight: '500',
                  fontSize: '16px'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                トップへ戻る
              </Link>
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-6">
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
                href="#"
                className="text-gray-700 hover:text-gray-900 transition-colors text-sm md:text-base"
                style={{
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontWeight: '400'
                }}
              >
                プライバシーポリシー
              </a>
              <a 
                href="#"
                className="text-gray-700 hover:text-gray-900 transition-colors text-sm md:text-base"
                style={{
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontWeight: '400'
                }}
              >
                利用規約
              </a>
            </div>

            {/* Copyright */}
            <p 
              className="text-sm"
              style={{
                color: '#666',
                fontFamily: 'Rubik',
                fontWeight: '400'
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

