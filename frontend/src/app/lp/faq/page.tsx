'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
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
        answer: 'さいたま市を中心に"ちょい飲み"を楽しめる月額制（サブスク）サービスです。掲載店で提示すると「各店舗につき1日に1杯の対象ドリンクが無料」になり（※対象ドリンクや条件等は店舗・キャンペーンにより異なります）、地域ポイント「たまポン」の還元施策とも連動する場合があります。掲載費は店舗無料、ユーザーは月額課金で利用できます。'
      },
      {
        question: '料金は？',
        answer: '月額 一般価格：980円、会員価格：490円。今後は、6か月・12か月分をまとめて購入できるパッケージや観光客向けのショートプラン（３Days）などを販売する予定です。'
      },
      {
        question: '目的は？',
        answer: '背景として酒類出荷の長期減少傾向や若年層の飲酒頻度低下が指摘されています。飲食業界の活性化、若年層の"ちょい飲み"機会づくり、観光・来街促進などを目的としています。'
      },
      {
        question: 'だれが運営？出資・連携は？',
        answer: '株式会社つなぐが運営。さいたま市、J:COM、JTB、イオンフィナンシャルサービス、埼玉りそな銀行、武蔵野銀行、埼玉縣信用金庫、さいたま商工会議所等が出資・連携しております（商連は出資なし）。最新の構成はさいたま市みんなのアプリの公式サイト等をご確認ください。'
      }
    ]
  },
  {
    title: '2) ユーザー向け',
    items: [
      {
        question: '利用する際のルールは？',
        answer: '原則「1店舗につき1日1杯」が無料対象です。同日に複数店舗を回れば、その都度1杯無料でドリンクが提供されます（同一店舗で2杯目以降は、通常料金で提供）。対象ドリンク・銘柄・サイズ、サービスを受けるための条件は店舗や企画で異なります。'
      },
      {
        question: 'どんなドリンクが無料対象？',
        answer: '店舗ごとの「対象メニュー」からの提供が基本です（例：最初の1杯限定・指定銘柄・ソフトドリンク可など）。たまのみサイトのクーポンページで事前にご確認ください。'
      },
      {
        question: '年齢制限は？',
        answer: 'ソフトドリンクの提供に関しては、年齢制限はありません。アルコール入りドリンクは、20歳未満の飲酒は法律で禁止されています。店舗で身分証の提示を求める場合があります。また、飲酒運転は絶対にしないでください。'
      },
      {
        question: '同伴者の分も無料になりますか？',
        answer: '無料1杯はご本人アカウントのみです。1アカウント＝1名分が原則です。新規登録時に本人確認のためメール認証があります。'
      },
      {
        question: '使い方の流れは？',
        answer: '1) たまのみサイトで掲載店を検索 → 2) 入店 → 3) 店舗スタッフにたまのみサイトの「無料1杯」画面を提示 → 4) 店舗スタッフが確認 → 5) 無料ドリンクが提供 → 6) 会計時に値引。※提示タイミング・画面種別は店舗オペレーションにより多少異なります。'
      },
      {
        question: 'たまポンのポイント還元を受けられる？',
        answer: '実施中のキャンペーンにより、条件満たされた方にポイント還元されます。付与タイミング・上限・対象は企画ごとに異なるため、専用サイト等で告知をご確認ください。ポイント還元を受けるためには、さいたま市みんなのアプリのIDをたまのみサイト上で登録する必要があります。'
      },
      {
        question: '支払い方法は？',
        answer: 'たまのみサイト内の月額課金です。利用可能な決済手段（例：各種クレジットカード、コード決済等）を選択できます。詳細はサイト内の画面でご確認ください。'
      },
      {
        question: '解約はどうする？更新日は？',
        answer: '更新日前日までにサイトで「退会」手続きしてください。課金期間中の途中解約は原則日割りになりません。解約後も更新日までは利用可です。'
      },
      {
        question: '機種変更・紛失時の引き継ぎは？',
        answer: '同一アカウント（ＩＤ・パスワード）でログインすれば、過去の情報が引き継がれます。ただし、同時ログイン数や不正利用防止の観点で端末制限がかかる場合があります。'
      },
      {
        question: '市外・県外からの来訪者も使える？',
        answer: '対象エリア内の掲載店であれば来訪者でも利用できます。'
      },
      {
        question: '店舗側の理由でサービスが利用できない場合は？',
        answer: '安全・品質確保のため、店舗判断で提供タイミングを調整する場合があります。提供不可・売切れ・商品不良などの際は代替メニューや別日振替の有無を店頭でご確認ください。'
      }
    ]
  },
  {
    title: '3) 掲載店向け',
    items: [
      {
        question: '掲載費は？',
        answer: '掲載費は無料です（別途、掲載店様用の約款をご確認ください）。'
      },
      {
        question: '店舗のオペレーションは？',
        answer: '基本は「お客さまがクーポン画面提示 → 対象ドリンク1杯提供 → 会計処理（値引き等）」のシンプルな運用です。レジでの無料分処理（サービス扱い/割引/クーポン等）は既存フローに合わせた方法でご対応してください。'
      },
      {
        question: 'POSやレシート表記は？',
        answer: '店舗レジシステムに応じて「サービス値引き」「クーポン」等の勘定処理を推奨します。会計上の処理は、一般的に販促費となりますが、会計・税務上の扱いは顧問税理士等にご相談ください。'
      },
      {
        question: 'メニュー・画像・営業時間の更新は？',
        answer: '管理画面から更新依頼が可能です。反映までのリードタイムは、店舗側で直接管理画面から更新した後、運営側で承認後に反映されますが、タイミングや審査等の状況により反映までのリードタイムは異なります。'
      },
      {
        question: '休業・満席・提供一時停止の扱いは？',
        answer: '店舗都合で無料杯提供を一時停止する場合は、事前に運営側へご連絡ください。また、店頭ではユーザーが事前に分かるようにしてください。'
      },
      {
        question: '未成年・本人確認は？',
        answer: 'ソフトドリンクの場合、特に必要はありませんが、アルコール類の提供で年齢確認が必要と判断した場合は、身分証確認をお願いします。'
      },
      {
        question: '掲載停止・退会は？',
        answer: '規約違反、提供品質の著しい低下、法令違反等が確認された場合、運営判断で停止・退会となることがあります。通常の任意解約は契約に定める予告期間に従います。'
      }
    ]
  },
  {
    title: '4) 行政・パートナー向け（概要）',
    items: [
      {
        question: '社会的な狙いと評価指標は？',
        answer: '来店回数・はしご率・平均滞在時間・客単価・曜日/時間帯分散・来街者の回遊性、地域ポイント循環など。観光・MICEとの連携や、市民満足度向上効果も今後検証できるようにしていきたいと考えています。'
      },
      {
        question: 'エコシステム連携は？',
        answer: '地域ポイント「たまポン」や商店会施策、観光キャンペーン等と組み合わせ、20万人規模のユーザー基盤活用による波及効果を想定しています（数値は目標の一例）。'
      }
    ]
  },
  {
    title: '5) セキュリティ・プライバシー',
    items: [
      {
        question: '個人情報の取り扱いは？',
        answer: '利用目的の範囲で最小限を取得し、適切に管理します。必要に応じて、アクセス制御・ログ監査を行います。詳細はプライバシーポリシーをご確認ください。'
      },
      {
        question: '不正利用対策は？',
        answer: '1日1杯ルールの検知、同一アカウントの不自然な利用、端末・位置情報の整合性チェック、スクリーンショット防止策（画面動的要素・カウントダウン等）を段階導入します。'
      },
      {
        question: '位置情報は必須？',
        answer: '近隣店舗表示や不正対策のために許諾をお願いする場合があります。'
      }
    ]
  },
  {
    title: '6) トラブルシューティング',
    items: [
      {
        question: '「無料1杯」が反映されない/押下できない',
        answer: '既に当日その店舗で1杯利用済みの可能性、通信不良／スマホの古いバージョン、店舗側の提供一時停止などが考えられます。たまのみサイト再起動、電波状況の確認、店舗スタッフへお知らせをお試しください。解決しない場合はサポート窓口へご連絡ください。'
      },
      {
        question: '課金・請求金額がおかしい',
        answer: 'ご利用サイトの履歴を確認してください。更新日前後のタイミング差異の可能性があります。明細（スクリーンショット）添付のうえサポートへご連絡ください。'
      },
      {
        question: '店舗が混雑・売切れで提供不可だった',
        answer: '当日の提供可否は店舗裁量です。代替メニューの有無や別日振替は店頭でご確認ください。'
      },
      {
        question: 'アカウントにログインできない',
        answer: 'パスワード再設定、スマホのバージョンの更新をお試しください。端末制限に該当する可能性もあります。解決しない場合はサポートへご連絡ください。'
      }
    ]
  },
  {
    title: '7) ルール・マナー（重要）',
    items: [
      {
        question: '利用時の注意事項は？',
        answer: 'アルコール類の提供の場合、20歳未満の飲酒禁止／飲酒運転禁止。迷惑行為（長時間の占有、大声、他客・スタッフへの迷惑）は利用停止対象。たまのみサイト画面の不正転用・転売・貸与は禁止。健康状態に留意し、節度ある飲酒をお願いします。'
      }
    ]
  },
  {
    title: '8) 連絡先',
    items: [
      {
        question: 'ユーザーサポートの連絡先は？',
        answer: 'サイト内「ヘルプ・お問い合わせ」からご連絡ください。'
      },
      {
        question: '掲載店サポートの連絡先は？',
        answer: '運営窓口、営業担当へご連絡ください。'
      },
      {
        question: '取材・協業の連絡先は？',
        answer: '運営窓口までご連絡ください。'
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

