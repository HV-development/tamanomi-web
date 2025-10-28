'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function MerchantLPPage() {
  const router = useRouter()

  return (
    <div className="w-full">
      {/* First View - 飲食店向け */}
      <div 
        className="relative w-full"
        style={{
          maxWidth: 'none',
          width: '100vw',
          minHeight: '100vh',
          margin: 0,
          padding: 0,
          overflow: 'visible',
          position: 'relative',
          top: 0,
          left: 0,
          zIndex: 1
        }}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/lp/images/merchant-fv.png"
            alt="飲食店向けファーストビュー"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 w-full">
          <div className="w-full px-4 py-4 md:px-8 md:py-6" style={{ width: '100vw', margin: 0 }}>
            <div className="flex items-center w-full">
              <div className="flex items-center">
                <Image
                  src="/lp/images/horizon-color-white.png"
                  alt="たまのみ"
                  width={1312}
                  height={320}
                  style={{
                    width: '328px',
                    height: '80px',
                    flexShrink: 0
                  }}
                />
              </div>
              <div className="flex-1"></div>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '44px'
                }}
              >
                <nav className="hidden md:flex items-center space-x-10">
                  <a href="#overview" className="text-white hover:text-blue-200 transition-colors text-lg">概要</a>
                  <a href="#benefits" className="text-white hover:text-blue-200 transition-colors text-lg">飲食店様のメリット</a>
                  <a href="#how-to-apply" className="text-white hover:text-blue-200 transition-colors text-lg">お申し込み方法</a>
                </nav>
                <button 
                  className="text-white font-bold hover:opacity-90 transition-opacity text-sm md:text-base"
                  style={{
                    display: 'flex',
                    padding: '16px 24px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    borderRadius: '9999px',
                    background: 'var(--main, #6FC8E5)'
                  }}
                  onClick={() => router.push('/lp')}
                >
                  <span className="hidden md:inline">ユーザーはこちら</span>
                  <span className="md:hidden">ユーザー</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="relative z-10 w-full flex items-center justify-center px-4 py-20 md:py-32">
          <div className="text-center max-w-4xl">
            {/* Main Title */}
            <div className="mb-8">
              <h1 
                className="mb-4"
                style={{
                  color: '#FFF',
                  textAlign: 'center',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '40px',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '120%'
                }}
              >
                掲載料無料で<br />
                お店の売上アップに
              </h1>
              <h2 
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: '#FFF',
                  color: 'var(--green1, #007D4F)',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '72px',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '100%'
                }}
              >
                たまのみ掲載店募集中
              </h2>
            </div>

            {/* Pricing Info */}
            <div 
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '24px',
                marginBottom: '48px'
              }}
            >
              {/* 縦線（左端） */}
              <div 
                style={{
                  width: '2px',
                  alignSelf: 'stretch',
                  backgroundColor: '#FFF'
                }}
              ></div>

              {/* 初期費用 */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div 
                  style={{
                    display: 'flex',
                    padding: '4px 15px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    borderRadius: '9999px',
                    background: '#FAEE00'
                  }}
                >
                  <span 
                    style={{
                      color: 'var(--green1, #007D4F)',
                      textAlign: 'justify',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontSize: '20px',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%'
                    }}
                  >
                    初期費用
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span 
                    style={{
                      color: '#FFF',
                      textAlign: 'justify',
                      fontFamily: 'Commissioner',
                      fontSize: '80px',
                      fontStyle: 'normal',
                      fontWeight: '600',
                      lineHeight: '100%'
                    }}
                  >
                    0
                  </span>
                  <span 
                    style={{
                      color: '#FFF',
                      textAlign: 'justify',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontSize: '26px',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%'
                    }}
                  >
                    円
                  </span>
                </div>
              </div>

              {/* 縦線 */}
              <div 
                style={{
                  width: '2px',
                  alignSelf: 'stretch',
                  backgroundColor: '#FFF'
                }}
              ></div>

              {/* 掲載料 */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div 
                  style={{
                    display: 'flex',
                    padding: '4px 15px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    borderRadius: '9999px',
                    background: '#FAEE00'
                  }}
                >
                  <span 
                    style={{
                      color: 'var(--green1, #007D4F)',
                      textAlign: 'justify',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontSize: '20px',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%'
                    }}
                  >
                    掲載料
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span 
                    style={{
                      color: '#FFF',
                      textAlign: 'justify',
                      fontFamily: 'Commissioner',
                      fontSize: '80px',
                      fontStyle: 'normal',
                      fontWeight: '600',
                      lineHeight: '100%'
                    }}
                  >
                    0
                  </span>
                  <span 
                    style={{
                      color: '#FFF',
                      textAlign: 'justify',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontSize: '26px',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%'
                    }}
                  >
                    円
                  </span>
                </div>
              </div>

              {/* 縦線 */}
              <div 
                style={{
                  width: '2px',
                  alignSelf: 'stretch',
                  backgroundColor: '#FFF'
                }}
              ></div>

              {/* 解約金 */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div 
                  style={{
                    display: 'flex',
                    padding: '4px 15px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    borderRadius: '9999px',
                    background: '#FAEE00'
                  }}
                >
                  <span 
                    style={{
                      color: 'var(--green1, #007D4F)',
                      textAlign: 'justify',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontSize: '20px',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%'
                    }}
                  >
                    解約金
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span 
                    style={{
                      color: '#FFF',
                      textAlign: 'justify',
                      fontFamily: 'Commissioner',
                      fontSize: '80px',
                      fontStyle: 'normal',
                      fontWeight: '600',
                      lineHeight: '100%'
                    }}
                  >
                    0
                  </span>
                  <span 
                    style={{
                      color: '#FFF',
                      textAlign: 'justify',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontSize: '26px',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%'
                    }}
                  >
                    円
                  </span>
                </div>
              </div>

              {/* 縦線（右端） */}
              <div 
                style={{
                  width: '2px',
                  alignSelf: 'stretch',
                  backgroundColor: '#FFF'
                }}
              ></div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <button
                style={{
                  position: 'relative',
                  display: 'flex',
                  width: '320px',
                  padding: '16px 24px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '9999px',
                  border: '3px solid #FFF',
                  background: 'var(--green1, #007D4F)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span 
                    style={{
                      color: '#FFF',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%',
                      fontSize: '16px'
                    }}
                  >
                    今すぐ無料で
                  </span>
                  <span 
                    style={{
                      color: '#FFF',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%',
                      fontSize: '24px'
                    }}
                  >
                    お申し込み
                  </span>
                </div>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="9" 
                  height="16" 
                  viewBox="0 0 9 16" 
                  fill="none"
                  style={{
                    position: 'absolute',
                    right: '24px',
                    flexShrink: 0
                  }}
                >
                  <path 
                    d="M0.999838 14.3333L7.6665 7.66667L0.999838 1" 
                    stroke="#FFF" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div id="overview" className="w-full bg-white py-16 md:py-24">
        <div style={{ padding: '0 210px' }}>
          {/* Overview Content */}
          <div 
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '80px'
            }}
          >
            {/* Left Side - Image */}
            <div style={{ flexShrink: 0 }}>
              <Image
                src="/lp/images/overview-diagram.png"
                alt="たまのみの仕組み"
                width={540}
                height={400}
                style={{
                  width: '540px',
                  height: '400px',
                  objectFit: 'contain'
                }}
              />
            </div>

            {/* Right Side - Text */}
            <div 
              style={{
                alignSelf: 'stretch',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '24px'
              }}
            >
              <p 
                style={{
                  color: 'var(--green1, #007D4F)',
                  textAlign: 'justify',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '18px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '160%'
                }}
              >
                「たまのみ」を運営する株式会社つなぐは、さいたま市が出資する地域商社です。
              </p>
              <p 
                style={{
                  color: 'var(--green1, #007D4F)',
                  textAlign: 'justify',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '18px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '160%'
                }}
              >
                地元行政や金融機関と連携し、安心・信頼ある仕組みで飲食店のにぎわいをつくっていきます。
              </p>
              <p 
                style={{
                  color: 'var(--green1, #007D4F)',
                  textAlign: 'justify',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '18px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '160%'
                }}
              >
                地元に根ざした運営だからこそ、お店の皆さまも安心して「たまのみ」にご参加いただけます。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div id="benefits" className="w-full py-16 md:py-24" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 
              style={{
                color: 'var(--green1, #007D4F)',
                fontFamily: '"Zen Kaku Gothic New"',
                fontSize: '32px',
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: '100%',
                marginBottom: '45px'
              }}
            >
              掲載店のメリット
            </h2>
            <p 
              style={{
                color: '#000',
                textAlign: 'center',
                fontFamily: '"Zen Kaku Gothic New"',
                fontSize: '18px',
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: '160%'
              }}
            >
              &quot;たまのみ&quot;に掲載することで、新しいお客様との出会いが広がります！
            </p>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '40px',
              maxWidth: '1000px',
              margin: '0 auto'
            }}
          >
            {/* Merit 1 - 左上 */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '24px'
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <Image
                  src="/lp/images/benefit-free-cost.png"
                  alt="初期費用・掲載費無料"
                  width={120}
                  height={120}
                  style={{
                    width: '120px',
                    height: '120px'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h3 
                  style={{
                    color: '#000',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontSize: '20px',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: '160%',
                    marginBottom: '12px'
                  }}
                >
                  初期費用・掲載費【無料】
                </h3>
                <p 
                  style={{
                    color: '#000',
                    textAlign: 'justify',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontSize: '16px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '160%'
                  }}
                >
                  導入コストは一切不要。月額費もかからず、すぐにスタートできます。
                </p>
              </div>
            </div>

            {/* Merit 2 - 右上 */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '24px'
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <Image
                  src="/lp/images/benefit-drink.png"
                  alt="無料ドリンクで集客"
                  width={120}
                  height={120}
                  style={{
                    width: '120px',
                    height: '120px'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h3 
                  style={{
                    color: '#000',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontSize: '20px',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: '160%',
                    marginBottom: '12px'
                  }}
                >
                  無料ドリンクで集客＆回遊を促進
                </h3>
                <p 
                  style={{
                    alignSelf: 'stretch',
                    color: '#000',
                    textAlign: 'justify',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontSize: '16px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '160%'
                  }}
                >
                  「たまのみ」をきっかけに来店したお客様が、料理や追加注文をすることで客単価がアップ。回遊性も高まり、新規顧客獲得につながります。
                </p>
              </div>
            </div>

            {/* Merit 3 - 左下 */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '24px'
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <Image
                  src="/lp/images/benefit-connection.png"
                  alt="新しいお客様との接点づくり"
                  width={120}
                  height={120}
                  style={{
                    width: '120px',
                    height: '120px'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h3 
                  style={{
                    color: '#000',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontSize: '20px',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: '160%',
                    marginBottom: '12px'
                  }}
                >
                  新しいお客様との接点づくり
                </h3>
                <p 
                  style={{
                    alignSelf: 'stretch',
                    color: '#000',
                    textAlign: 'justify',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontSize: '16px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '160%'
                  }}
                >
                  普段来店しない層や若い世代など、これまで出会えなかったお客様に知ってもらうきっかけになります。
                </p>
              </div>
            </div>

            {/* Merit 4 - 右下 */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '24px'
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <Image
                  src="/lp/images/benefit-support.png"
                  alt="簡単導入＆安心サポート"
                  width={120}
                  height={120}
                  style={{
                    width: '120px',
                    height: '120px'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h3 
                  style={{
                    color: '#000',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontSize: '20px',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: '160%',
                    marginBottom: '12px'
                  }}
                >
                  簡単導入＆安心サポート
                </h3>
                <p 
                  style={{
                    color: '#000',
                    textAlign: 'justify',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontSize: '16px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '160%'
                  }}
                >
                  掲載店ステッカーを貼るだけで導入完了。たまのみスタッフが運用までしっかりサポートします。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Process Section */}
      <div className="w-full bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 
              style={{
                color: 'var(--green1, #007D4F)',
                fontFamily: '"Zen Kaku Gothic New"',
                fontSize: '32px',
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: '100%',
                marginBottom: '45px'
              }}
            >
              お店の対応はシンプル！約3秒で完了
            </h2>
            <p 
              style={{
                color: '#000',
                textAlign: 'center',
                fontFamily: '"Zen Kaku Gothic New"',
                fontSize: '18px',
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: '160%'
              }}
            >
              お客様が提示する画面を確認するだけ。<br />
              シンプルな仕組みだから、忙しい時間帯でもスムーズに対応できます。
            </p>
          </div>

          {/* Phone Images with Arrow */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '60px'
            }}
          >
            {/* Left Phone */}
            <div style={{ flexShrink: 0 }}>
              <Image
                src="/lp/images/merchant-coupon-before.png"
                alt="クーポン使用前"
                width={280}
                height={570}
                style={{
                  width: '280px',
                  height: 'auto'
                }}
              />
            </div>

            {/* Arrow */}
            <div 
              style={{
                width: '40px',
                height: '40px',
                transform: 'rotate(90deg)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#007D4F',
                borderRadius: '50%'
              }}
            >
              <svg 
                width="17" 
                height="9" 
                viewBox="0 0 17 9" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  flexShrink: 0
                }}
              >
                <path 
                  d="M1 1L8.5 8L16 1" 
                  stroke="#FFF" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Right Phone */}
            <div style={{ flexShrink: 0 }}>
              <Image
                src="/lp/images/merchant-coupon-after.png"
                alt="クーポン使用後"
                width={280}
                height={570}
                style={{
                  width: '280px',
                  height: 'auto'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* How to Apply Section */}
      <div 
        id="how-to-apply" 
        style={{
          display: 'flex',
          padding: '80px 120px',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '45px',
          alignSelf: 'stretch',
          background: '#7FBE26'
        }}
      >
        {/* Section Title */}
        <h2 
          style={{
            color: '#FFF',
            fontFamily: '"Zen Kaku Gothic New"',
            fontSize: '32px',
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: '100%'
          }}
        >
          お申し込み方法
        </h2>

        {/* Subtitle */}
        <p 
          style={{
            color: '#FFF',
            textAlign: 'center',
            fontFamily: '"Zen Kaku Gothic New"',
            fontSize: '18px',
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: '160%'
          }}
        >
          「たまのみ」のご利用を開始するまでのステップをご紹介します。
        </p>

        {/* Steps Cards */}
        <div 
          style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            alignItems: 'stretch',
            width: '100%',
            maxWidth: '1200px'
          }}
        >
          {/* Step 1 Card */}
          <div 
            style={{
              display: 'flex',
              padding: '32px 24px',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '32px',
              flex: '1 0 0',
              background: '#FFF',
              borderRadius: '8px'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p 
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: 'var(--font-limelight)',
                  fontSize: '18px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '100%',
                  marginBottom: '16px',
                  textDecoration: 'underline'
                }}
              >
                STEP.1
              </p>
              <h3 
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '160%'
                }}
              >
                お申し込み
              </h3>
            </div>
            <div>
              <Image
                src="/lp/images/merchant-step-application.png"
                alt="お申し込み"
                width={280}
                height={200}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px'
                }}
              />
            </div>
            <p 
              style={{
                alignSelf: 'stretch',
                color: '#000',
                textAlign: 'center',
                fontFamily: '"Zen Kaku Gothic New"',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: '160%'
              }}
            >
              お申し込みフォームからお店の情報を入力して送信してください
            </p>
          </div>

          {/* Step 2 Card */}
          <div 
            style={{
              display: 'flex',
              padding: '32px 24px',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '32px',
              flex: '1 0 0',
              background: '#FFF',
              borderRadius: '8px'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p 
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: 'var(--font-limelight)',
                  fontSize: '18px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '100%',
                  marginBottom: '16px',
                  textDecoration: 'underline'
                }}
              >
                STEP.2
              </p>
              <h3 
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '160%'
                }}
              >
                掲載内容確認
              </h3>
            </div>
            <div>
              <Image
                src="/lp/images/merchant-step-confirmation.png"
                alt="掲載内容確認"
                width={280}
                height={200}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px'
                }}
              />
            </div>
            <p 
              style={{
                alignSelf: 'stretch',
                color: '#000',
                textAlign: 'center',
                fontFamily: '"Zen Kaku Gothic New"',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: '160%'
              }}
            >
              申し込み内容をたまのみ事務局で確認し、販促物を店舗に向けて発送します。
            </p>
          </div>

          {/* Step 3 Card */}
          <div 
            style={{
              display: 'flex',
              padding: '32px 24px',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '32px',
              flex: '1 0 0',
              background: '#FFF',
              borderRadius: '8px'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p 
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: 'var(--font-limelight)',
                  fontSize: '18px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '100%',
                  marginBottom: '16px',
                  textDecoration: 'underline'
                }}
              >
                STEP.3
              </p>
              <h3 
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '160%'
                }}
              >
                ご利用開始
              </h3>
            </div>
            <div>
              <Image
                src="/lp/images/merchant-step-start.png"
                alt="ご利用開始"
                width={280}
                height={200}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px'
                }}
              />
            </div>
            <p 
              style={{
                alignSelf: 'stretch',
                color: '#000',
                textAlign: 'center',
                fontFamily: '"Zen Kaku Gothic New"',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: '160%'
              }}
            >
              販促キットが到着したことを確認したのち、ご利用を開始していただけます。
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div 
        style={{
          display: 'flex',
          padding: '64px 120px',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '40px',
          alignSelf: 'stretch',
          background: '#FAEE00'
        }}
      >
        {/* Text */}
        <h2 
          style={{
            color: 'var(--green1, #007D4F)',
            fontFamily: '"Zen Kaku Gothic New"',
            fontSize: '28px',
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: '100%'
          }}
        >
          あなたのお店も&quot;たまのみ&quot;に参加しませんか？
        </h2>

        {/* CTA Button */}
        <button
          style={{
            position: 'relative',
            display: 'flex',
            width: '320px',
            padding: '16px 24px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '9999px',
            border: '3px solid #FFF',
            background: 'var(--green1, #007D4F)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span 
              style={{
                color: '#FFF',
                fontFamily: '"Zen Kaku Gothic New"',
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: '100%',
                fontSize: '16px'
              }}
            >
              いますぐ<span style={{ color: '#FAEE00' }}>無料</span>で
            </span>
            <span 
              style={{
                color: '#FFF',
                fontFamily: '"Zen Kaku Gothic New"',
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: '100%',
                fontSize: '24px'
              }}
            >
              お申し込み
            </span>
          </div>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="9" 
            height="16" 
            viewBox="0 0 9 16" 
            fill="none"
            style={{
              position: 'absolute',
              right: '24px',
              flexShrink: 0
            }}
          >
            <path 
              d="M0.999838 14.3333L7.6665 7.66667L0.999838 1" 
              stroke="#FFF" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Footer Section */}
      <div className="w-full bg-white border-t">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div 
            style={{
              display: 'flex',
              paddingTop: '40px',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '40px',
              alignSelf: 'stretch'
            }}
          >
            {/* Logo */}
            <div className="mb-8">
              <Image
                src="/lp/images/logo.png"
                alt="TAMANOMI"
                width={328}
                height={329}
                style={{
                  width: '328px',
                  height: '329px',
                  aspectRatio: '328/329'
                }}
              />
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <a 
                href="#" 
                className="text-gray-700 hover:text-gray-900 transition-colors"
                style={{
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '16px',
                  fontWeight: '400'
                }}
              >
                よくあるご質問
              </a>
              <a 
                href="#" 
                className="text-gray-700 hover:text-gray-900 transition-colors"
                style={{
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '16px',
                  fontWeight: '400'
                }}
              >
                お問い合わせ
              </a>
              <a 
                href="#" 
                className="text-gray-700 hover:text-gray-900 transition-colors"
                style={{
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '16px',
                  fontWeight: '400'
                }}
              >
                プライバシーポリシー
              </a>
              <a 
                href="#" 
                className="text-gray-700 hover:text-gray-900 transition-colors"
                style={{
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '16px',
                  fontWeight: '400'
                }}
              >
                特定商取引法に基づく表記
              </a>
              <a 
                href="#" 
                className="text-gray-700 hover:text-gray-900 transition-colors"
                style={{
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '16px',
                  fontWeight: '400'
                }}
              >
                ご利用規約
              </a>
              <a 
                href="#" 
                className="text-gray-700 hover:text-gray-900 transition-colors"
                style={{
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '16px',
                  fontWeight: '400'
                }}
              >
                運営会社
              </a>
            </div>

            {/* Copyright */}
            <div className="pb-8">
              <p 
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: 'Rubik',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '100%'
                }}
              >
                ©2025 TAMANOMI
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

