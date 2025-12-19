'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function MerchantLPPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="w-full">
      {/* First View - 飲食店向け */}
      
      {/* スマホ専用FV (md未満) */}
      <div className="md:hidden w-full min-h-screen flex flex-col">
        {/* 上半分: 背景画像とヘッダー */}
        <div className="relative w-full h-[50vh] flex-shrink-0">
          <Image
            src="/lp/images/merchant-fv-sp.png"
            alt="飲食店向けファーストビュー"
            fill
            className="object-cover"
            priority
          />
          
          {/* Header - スマホ用 */}
          <header className="absolute top-0 left-0 right-0 z-[1000] w-full">
            <div className="w-full px-[39px] md:px-4 py-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Image
                    src="/lp/images/horizon-color-white.png"
                    alt="たまのみ"
                    width={1312}
                    height={320}
                    className="w-40 h-10 flex-shrink-0"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Link 
                    href="/lp"
                    className="text-white font-bold hover:opacity-90 transition-opacity text-xs px-4 py-3 rounded-full"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background: 'var(--main, #6FC8E5)'
                    }}
                  >
                    ユーザー
                  </Link>

                  {/* ハンバーガーメニューアイコン */}
                  <button
                    className="flex flex-col justify-center items-center cursor-pointer mr-4"
                    style={{ gap: '6px' }}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="メニュー"
                  >
                    <div style={{ width: '24px', height: '2px', background: '#FFF' }}></div>
                    <div style={{ width: '24px', height: '2px', background: '#FFF' }}></div>
                    <div style={{ width: '24px', height: '2px', background: '#FFF' }}></div>
                  </button>
                </div>
              </div>
            </div>

            {/* モバイルメニュー */}
            {isMobileMenuOpen && (
              <div 
                className="fixed inset-0 w-full h-full"
                style={{
                  background: '#FFF',
                  display: 'flex',
                  paddingBottom: '184px',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '32px',
                  flex: '1 0 0',
                  alignSelf: 'stretch',
                  zIndex: 9999
                }}
              >
                {/* 閉じるボタン */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
                  aria-label="メニューを閉じる"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="#007D4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <nav className="flex flex-col items-center gap-8 py-8">
                  <a 
                    href="#overview" 
                    className="text-gray-800 hover:text-blue-600 transition-colors text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    概要
                  </a>
                  <a 
                    href="#benefits" 
                    className="text-gray-800 hover:text-blue-600 transition-colors text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    飲食店様のメリット
                  </a>
                  <a 
                    href="#how-to-apply" 
                    className="text-gray-800 hover:text-blue-600 transition-colors text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    お申し込み方法
                  </a>
                  <Link 
                    href="/lp/contact?type=merchant" 
                    className="text-gray-800 hover:text-blue-600 transition-colors text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    お問い合わせ
                  </Link>
                </nav>
              </div>
            )}
          </header>
          
          {/* 上半分のテキスト */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 
              className="text-white text-center text-2xl px-4"
              style={{
                fontFamily: '"Zen Kaku Gothic New"',
                fontWeight: '700',
                lineHeight: '120%'
              }}
            >
              掲載料無料で<br />
              お店の売上アップに
            </h1>
          </div>
        </div>

        {/* 下半分: 緑背景 + コンテンツ */}
        <div 
          className="w-full min-h-[50vh] flex flex-col items-center justify-center px-[39px] md:px-4 py-8 mt-6"
          style={{ background: '#7FBE26' }}
        >
          {/* 白いボックス */}
          <div 
            className="bg-white px-6 py-4 mb-10 md:mb-8 -mt-[200px] md:mt-0 relative z-[100]"
            style={{
              display: 'inline-block'
            }}
          >
            <h2 
              className="text-4xl leading-tight"
              style={{
                color: 'var(--green1, #007D4F)',
                fontFamily: '"Zen Kaku Gothic New"',
                fontWeight: '700',
                textAlign: 'center'
              }}
            >
              たまのみ掲載店<br />
              募集中
            </h2>
          </div>

          {/* 料金情報 */}
          <div className="flex flex-row items-stretch gap-0 mb-10 md:mb-8 w-full max-w-sm">
            {/* 初期費用 */}
            <div className="flex-1 flex flex-col items-center gap-2 px-2">
              <div 
                className="px-3 py-1 rounded-full"
                style={{ background: '#FAEE00' }}
              >
                <span 
                  className="text-sm"
                  style={{
                    color: 'var(--green1, #007D4F)',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontWeight: '700'
                  }}
                >
                  初期費用
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span 
                  className="text-5xl text-white"
                  style={{
                    fontFamily: 'Commissioner',
                    fontWeight: '600'
                  }}
                >
                  0
                </span>
                <span 
                  className="text-xl text-white"
                  style={{
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontWeight: '700'
                  }}
                >
                  円
                </span>
              </div>
            </div>

            {/* 縦線 */}
            <div className="w-0.5 bg-white self-stretch"></div>

            {/* 掲載料 */}
            <div className="flex-1 flex flex-col items-center gap-2 px-2">
              <div 
                className="px-3 py-1 rounded-full"
                style={{ background: '#FAEE00' }}
              >
                <span 
                  className="text-sm"
                  style={{
                    color: 'var(--green1, #007D4F)',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontWeight: '700'
                  }}
                >
                  掲載料
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span 
                  className="text-5xl text-white"
                  style={{
                    fontFamily: 'Commissioner',
                    fontWeight: '600'
                  }}
                >
                  0
                </span>
                <span 
                  className="text-xl text-white"
                  style={{
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontWeight: '700'
                  }}
                >
                  円
                </span>
              </div>
            </div>

            {/* 縦線 */}
            <div className="w-0.5 bg-white self-stretch"></div>

            {/* 解約金 */}
            <div className="flex-1 flex flex-col items-center gap-2 px-2">
              <div 
                className="px-3 py-1 rounded-full"
                style={{ background: '#FAEE00' }}
              >
                <span 
                  className="text-sm"
                  style={{
                    color: 'var(--green1, #007D4F)',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontWeight: '700'
                  }}
                >
                  解約金
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span 
                  className="text-5xl text-white"
                  style={{
                    fontFamily: 'Commissioner',
                    fontWeight: '600'
                  }}
                >
                  0
                </span>
                <span 
                  className="text-xl text-white"
                  style={{
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontWeight: '700'
                  }}
                >
                  円
                </span>
              </div>
            </div>
          </div>

          {/* CTAボタン */}
          <Link href="/lp/merchant/apply">
            <button
              className="relative flex w-[320px] md:w-full md:max-w-sm px-6 py-4 justify-center items-center gap-2 rounded-full border-[3px] md:border-2 border-white cursor-pointer"
              style={{
                background: 'var(--green1, #007D4F)'
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <span 
                  className="text-sm text-white"
                  style={{
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontWeight: '700'
                  }}
                >
                  今すぐ無料で
                </span>
                <span 
                  className="text-xl text-white"
                  style={{
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontWeight: '700'
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
                className="absolute right-6 flex-shrink-0"
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
          </Link>
        </div>
      </div>

      {/* PC用FV (md以上) */}
      <div className="hidden md:block w-full">
        {/* 上半分: 背景画像とヘッダー */}
        <div className="relative w-full md:min-h-screen">
          {/* Background Image */}
          <div className="relative w-full md:absolute md:inset-0">
            {/* PC用画像 */}
            <Image
              src="/lp/images/merchant-fv.png"
              alt="飲食店向けファーストビュー"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black bg-opacity-10 pointer-events-none"></div>
          </div>

          {/* Header - PC用 */}
          <header className="absolute top-0 left-0 right-0 z-[1000] w-full">
          <div className="w-full px-[39px] py-4 md:px-8 md:py-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Image
                  src="/lp/images/horizon-color-white.png"
                  alt="たまのみ"
                  width={1312}
                  height={320}
                  className="w-40 h-10 md:w-[328px] md:h-20 flex-shrink-0"
                />
              </div>
              <div className="flex items-center gap-4 md:gap-8 lg:gap-11">
                <nav className="hidden lg:flex items-center space-x-6 xl:space-x-10">
                  <a href="#overview" className="text-white hover:text-blue-200 transition-colors text-base lg:text-lg">概要</a>
                  <a href="#benefits" className="text-white hover:text-blue-200 transition-colors text-base lg:text-lg">飲食店様のメリット</a>
                  <a href="#how-to-apply" className="text-white hover:text-blue-200 transition-colors text-base lg:text-lg">お申し込み方法</a>
                  <Link href="/lp/contact?type=merchant" className="text-white hover:text-blue-200 transition-colors text-base lg:text-lg">お問い合わせ</Link>
                </nav>
                
                <Link 
                  href="/lp"
                  className="text-white font-bold hover:opacity-90 transition-opacity text-xs md:text-sm lg:text-base px-4 py-3 md:px-6 md:py-4 rounded-full"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'var(--main, #6FC8E5)'
                  }}
                >
                  <span className="hidden md:inline">ユーザーはこちら</span>
                  <span className="md:hidden">ユーザー</span>
                </Link>

                {/* ハンバーガーメニューアイコン（モバイル・タブレットのみ表示） */}
                <button
                  className="lg:hidden flex flex-col justify-center items-center cursor-pointer mr-4"
                  style={{
                    gap: '6px'
                  }}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="メニュー"
                >
                  <div style={{ width: '24px', height: '2px', background: '#FFF' }}></div>
                  <div style={{ width: '24px', height: '2px', background: '#FFF' }}></div>
                  <div style={{ width: '24px', height: '2px', background: '#FFF' }}></div>
                </button>
              </div>
            </div>
          </div>

          {/* モバイルメニュー */}
          {isMobileMenuOpen && (
            <div 
              className="lg:hidden fixed inset-0 w-full h-full"
              style={{
                background: '#FFF',
                display: 'flex',
                paddingBottom: '184px',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '32px',
                flex: '1 0 0',
                alignSelf: 'stretch',
                zIndex: 9999
              }}
            >
              {/* 閉じるボタン */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
                aria-label="メニューを閉じる"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#007D4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <nav className="flex flex-col items-center gap-8 py-8">
                <a 
                  href="#overview" 
                  className="text-gray-800 hover:text-blue-600 transition-colors text-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  概要
                </a>
                <a 
                  href="#benefits" 
                  className="text-gray-800 hover:text-blue-600 transition-colors text-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  飲食店様のメリット
                </a>
                <a 
                  href="#how-to-apply" 
                  className="text-gray-800 hover:text-blue-600 transition-colors text-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  お申し込み方法
                </a>
                <Link 
                  href="/lp/contact?type=merchant" 
                  className="text-gray-800 hover:text-blue-600 transition-colors text-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  お問い合わせ
                </Link>
              </nav>
            </div>
          )}
        </header>
        </div>

        {/* 下半分: Main Content */}
        <div 
          className="w-full bg-[#7FBE26] pt-14 pb-14 md:bg-transparent md:absolute md:top-0 md:left-0 md:right-0 md:pt-[30vh] md:pb-[10vh] md:z-0"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '40px',
            alignSelf: 'stretch'
          }}
        >
          <div className="text-center max-w-4xl px-[39px] md:px-0 -mt-[200px] md:mt-0 relative md:z-30">
            {/* Main Title */}
            <div className="mb-6 md:mb-10">
              <h1 
                className="mb-4 md:mb-10 text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                style={{
                  color: '#FFF',
                  textAlign: 'center',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '120%'
                }}
              >
                掲載料無料で<br />
                お店の売上アップに
              </h1>
              <h2 
                className="inline-block px-3 py-2 md:px-4 md:py-2 text-[40px] md:text-5xl lg:text-6xl xl:text-7xl leading-[120%] md:leading-[100%]"
                style={{
                  backgroundColor: '#FFF',
                  color: 'var(--green1, #007D4F)',
                  textAlign: 'center',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontStyle: 'normal',
                  fontWeight: '700'
                }}
              >
                たまのみ掲載店<br className="md:hidden" />
                募集中
              </h2>
            </div>

            {/* Pricing Info */}
            <div 
              className="flex flex-row md:flex-row justify-center items-stretch gap-0 md:gap-6"
            >
              {/* 縦線（左端） - PCのみ */}
              <div 
                className="hidden md:block w-0.5 self-stretch bg-white"
              ></div>

              {/* 初期費用 */}
              <div 
                className="flex flex-col md:flex-row items-center gap-3 md:gap-3 px-4 md:px-0"
              >
                <div 
                  className="flex px-3 py-1 md:px-4 md:py-1 justify-center items-center rounded-full"
                  style={{
                    background: '#FAEE00'
                  }}
                >
                  <span 
                    className="text-sm md:text-base lg:text-xl"
                    style={{
                      color: 'var(--green1, #007D4F)',
                      textAlign: 'justify',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%'
                    }}
                  >
                    初期費用
                  </span>
                </div>
                <div className="flex flex-row md:flex-row items-baseline gap-1">
                  <span 
                    className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl"
                    style={{
                      color: '#FFF',
                      textAlign: 'justify',
                      fontFamily: 'Commissioner',
                      fontStyle: 'normal',
                      fontWeight: '600',
                      lineHeight: '100%'
                    }}
                  >
                    0
                  </span>
                  <span 
                    className="text-lg md:text-xl lg:text-2xl"
                    style={{
                      color: '#FFF',
                      textAlign: 'justify',
                      fontFamily: '"Zen Kaku Gothic New"',
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
                className="w-0.5 md:w-0.5 self-stretch bg-white"
              ></div>

              {/* 掲載料 */}
              <div 
                className="flex flex-col md:flex-row items-center gap-3 md:gap-3 px-4 md:px-0"
              >
                <div 
                  className="flex px-3 py-1 md:px-4 md:py-1 justify-center items-center rounded-full"
                  style={{
                    background: '#FAEE00'
                  }}
                >
                  <span 
                    className="text-sm md:text-base lg:text-xl"
                    style={{
                      color: 'var(--green1, #007D4F)',
                      textAlign: 'justify',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%'
                    }}
                  >
                    掲載料
                  </span>
                </div>
                <div className="flex flex-row md:flex-row items-baseline gap-1">
                  <span 
                    className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl"
                    style={{
                      color: '#FFF',
                      textAlign: 'justify',
                      fontFamily: 'Commissioner',
                      fontStyle: 'normal',
                      fontWeight: '600',
                      lineHeight: '100%'
                    }}
                  >
                    0
                  </span>
                  <span 
                    className="text-lg md:text-xl lg:text-2xl"
                    style={{
                      color: '#FFF',
                      textAlign: 'justify',
                      fontFamily: '"Zen Kaku Gothic New"',
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
                className="w-0.5 md:w-0.5 self-stretch bg-white"
              ></div>

              {/* 解約金 */}
              <div 
                className="flex flex-col md:flex-row items-center gap-3 md:gap-3 px-4 md:px-0"
              >
                <div 
                  className="flex px-3 py-1 md:px-4 md:py-1 justify-center items-center rounded-full"
                  style={{
                    background: '#FAEE00'
                  }}
                >
                  <span 
                    className="text-sm md:text-base lg:text-xl"
                    style={{
                      color: 'var(--green1, #007D4F)',
                      textAlign: 'justify',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%'
                    }}
                  >
                    解約金
                  </span>
                </div>
                <div className="flex flex-row md:flex-row items-baseline gap-1">
                  <span 
                    className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl"
                    style={{
                      color: '#FFF',
                      textAlign: 'justify',
                      fontFamily: 'Commissioner',
                      fontStyle: 'normal',
                      fontWeight: '600',
                      lineHeight: '100%'
                    }}
                  >
                    0
                  </span>
                  <span 
                    className="text-lg md:text-xl lg:text-2xl"
                    style={{
                      color: '#FFF',
                      textAlign: 'justify',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%'
                    }}
                  >
                    円
                  </span>
                </div>
              </div>

              {/* 縦線（右端） - PCのみ */}
              <div 
                className="hidden md:block w-0.5 self-stretch bg-white"
              ></div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center mt-0 md:mt-16">
              <Link href="/lp/merchant/apply">
                <button
                  className="relative flex w-64 md:w-72 lg:w-80 px-4 py-3 md:px-6 md:py-4 justify-center items-center gap-2 rounded-full border-2 md:border-3 border-white cursor-pointer"
                  style={{
                    background: 'var(--green1, #007D4F)'
                  }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span 
                      className="text-sm md:text-base"
                      style={{
                        color: '#FFF',
                        fontFamily: '"Zen Kaku Gothic New"',
                        fontStyle: 'normal',
                        fontWeight: '700',
                        lineHeight: '100%'
                      }}
                    >
                      今すぐ無料で
                    </span>
                    <span 
                      className="text-lg md:text-xl lg:text-2xl"
                      style={{
                        color: '#FFF',
                        fontFamily: '"Zen Kaku Gothic New"',
                        fontStyle: 'normal',
                        fontWeight: '700',
                        lineHeight: '100%'
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
                    className="absolute right-4 md:right-6 flex-shrink-0"
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
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div id="overview" className="w-full bg-white py-12 md:py-16 lg:py-24">
        <div className="px-[39px] md:px-8 lg:px-16 xl:px-52">
          {/* Overview Content */}
          <div 
            className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-20"
          >
            {/* Left Side - Image */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <Image
                src="/lp/images/overview-diagram.png"
                alt="たまのみの仕組み"
                width={540}
                height={400}
                className="w-full h-auto lg:w-[440px] xl:w-[540px] object-contain"
              />
            </div>

            {/* Right Side - Text */}
            <div 
              className="flex flex-col justify-center gap-4 md:gap-6"
            >
              <p 
                className="text-base md:text-lg"
                style={{
                  color: 'var(--green1, #007D4F)',
                  textAlign: 'justify',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '160%'
                }}
              >
                「たまのみ」を運営する株式会社つなぐは、さいたま市が出資する地域商社です。
              </p>
              <p 
                className="text-base md:text-lg"
                style={{
                  color: 'var(--green1, #007D4F)',
                  textAlign: 'justify',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '160%'
                }}
              >
                地元行政や金融機関と連携し、安心・信頼ある仕組みで飲食店のにぎわいをつくっていきます。
              </p>
              <p 
                className="text-base md:text-lg"
                style={{
                  color: 'var(--green1, #007D4F)',
                  textAlign: 'justify',
                  fontFamily: '"Zen Kaku Gothic New"',
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
      <div id="benefits" className="w-full py-12 md:py-16 lg:py-24" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="max-w-6xl mx-auto px-[39px] md:px-[120px]">
          <div className="text-center mb-8 md:mb-12 lg:mb-16">
            <h2 
              className="text-2xl md:text-3xl lg:text-4xl mb-6 md:mb-8 lg:mb-11"
              style={{
                color: 'var(--green1, #007D4F)',
                fontFamily: '"Zen Kaku Gothic New"',
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: '100%'
              }}
            >
              掲載店のメリット
            </h2>
            <p 
              className="text-base md:text-lg"
              style={{
                color: '#000',
                textAlign: 'center',
                fontFamily: '"Zen Kaku Gothic New"',
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: '160%'
              }}
            >
              &quot;たまのみ&quot;に掲載することで、新しいお客様との出会いが広がります！
            </p>
          </div>

          <div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10 max-w-4xl mx-auto"
          >
            {/* Merit 1 - 左上 */}
            <div 
              className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6"
            >
              {/* スマホ: 画像とタイトルを横並び */}
              <div className="flex flex-row gap-4 items-center md:items-start md:gap-0 md:flex-shrink-0">
                <div className="flex-shrink-0">
                  <Image
                    src="/lp/images/benefit-free-cost.png"
                    alt="初期費用・掲載費無料"
                    width={120}
                    height={120}
                    className="w-[70px] h-[70px] md:w-20 md:h-20 lg:w-[120px] lg:h-[120px]"
                  />
                </div>
                <h3 
                  className="text-lg md:text-xl flex-1 md:hidden"
                  style={{
                    color: '#000',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: '160%'
                  }}
                >
                  初期費用・掲載費【無料】
                </h3>
              </div>
              {/* PCレイアウト: タイトルと説明テキスト */}
              <div className="flex-1 flex flex-col gap-2 md:gap-3">
                <h3 
                  className="hidden md:block text-lg md:text-xl"
                  style={{
                    color: '#000',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: '160%'
                  }}
                >
                  初期費用・掲載費【無料】
                </h3>
                <p 
                  className="text-sm md:text-base text-left md:text-justify"
                  style={{
                    color: '#000',
                    fontFamily: '"Zen Kaku Gothic New"',
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
              className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6"
            >
              {/* スマホ: 画像とタイトルを横並び */}
              <div className="flex flex-row gap-4 items-center md:items-start md:gap-0 md:flex-shrink-0">
                <div className="flex-shrink-0">
                  <Image
                    src="/lp/images/benefit-drink.png"
                    alt="無料ドリンクで集客"
                    width={120}
                    height={120}
                    className="w-[70px] h-[70px] md:w-20 md:h-20 lg:w-[120px] lg:h-[120px]"
                  />
                </div>
                <h3 
                  className="text-lg md:text-xl flex-1 md:hidden"
                  style={{
                    color: '#000',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: '160%'
                  }}
                >
                  無料ドリンクで集客＆回遊を促進
                </h3>
              </div>
              {/* PCレイアウト: タイトルと説明テキスト */}
              <div className="flex-1 flex flex-col gap-2 md:gap-3">
                <h3 
                  className="hidden md:block text-lg md:text-xl"
                  style={{
                    color: '#000',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: '160%'
                  }}
                >
                  無料ドリンクで集客＆回遊を促進
                </h3>
                <p 
                  className="text-sm md:text-base text-left md:text-justify"
                  style={{
                    color: '#000',
                    fontFamily: '"Zen Kaku Gothic New"',
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
              className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6"
            >
              {/* スマホ: 画像とタイトルを横並び */}
              <div className="flex flex-row gap-4 items-center md:items-start md:gap-0 md:flex-shrink-0">
                <div className="flex-shrink-0">
                  <Image
                    src="/lp/images/benefit-connection.png"
                    alt="新しいお客様との接点づくり"
                    width={120}
                    height={120}
                    className="w-[70px] h-[70px] md:w-20 md:h-20 lg:w-[120px] lg:h-[120px]"
                  />
                </div>
                <h3 
                  className="text-lg md:text-xl flex-1 md:hidden"
                  style={{
                    color: '#000',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: '160%'
                  }}
                >
                  新しいお客様との接点づくり
                </h3>
              </div>
              {/* PCレイアウト: タイトルと説明テキスト */}
              <div className="flex-1 flex flex-col gap-2 md:gap-3">
                <h3 
                  className="hidden md:block text-lg md:text-xl"
                  style={{
                    color: '#000',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: '160%'
                  }}
                >
                  新しいお客様との接点づくり
                </h3>
                <p 
                  className="text-sm md:text-base text-left md:text-justify"
                  style={{
                    color: '#000',
                    fontFamily: '"Zen Kaku Gothic New"',
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
              className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6"
            >
              {/* スマホ: 画像とタイトルを横並び */}
              <div className="flex flex-row gap-4 items-center md:items-start md:gap-0 md:flex-shrink-0">
                <div className="flex-shrink-0">
                  <Image
                    src="/lp/images/benefit-support.png"
                    alt="簡単導入＆安心サポート"
                    width={120}
                    height={120}
                    className="w-[70px] h-[70px] md:w-20 md:h-20 lg:w-[120px] lg:h-[120px]"
                  />
                </div>
                <h3 
                  className="text-lg md:text-xl flex-1 md:hidden"
                  style={{
                    color: '#000',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: '160%'
                  }}
                >
                  簡単導入＆安心サポート
                </h3>
              </div>
              {/* PCレイアウト: タイトルと説明テキスト */}
              <div className="flex-1 flex flex-col gap-2 md:gap-3">
                <h3 
                  className="hidden md:block text-lg md:text-xl"
                  style={{
                    color: '#000',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: '160%'
                  }}
                >
                  簡単導入＆安心サポート
                </h3>
                <p 
                  className="text-sm md:text-base text-left md:text-justify"
                  style={{
                    color: '#000',
                    fontFamily: '"Zen Kaku Gothic New"',
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
      <div className="w-full bg-white py-12 md:py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-[39px] md:px-8">
          <div className="text-center mb-8 md:mb-12 lg:mb-16">
            <h2 
              className="text-2xl md:text-3xl lg:text-4xl mb-6 md:mb-8 lg:mb-11"
              style={{
                color: 'var(--green1, #007D4F)',
                fontFamily: '"Zen Kaku Gothic New"',
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: '100%'
              }}
            >
              お店の対応はシンプル！<br className="md:hidden" />
              約3秒で完了
            </h2>
            <p 
              className="text-base md:text-lg"
              style={{
                color: '#000',
                textAlign: 'center',
                fontFamily: '"Zen Kaku Gothic New"',
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
            className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 lg:gap-15"
          >
            {/* Left Phone */}
            <div className="flex-shrink-0">
              <Image
                src="/lp/images/merchant-coupon-before.png"
                alt="クーポン使用前"
                width={280}
                height={570}
                className="w-48 h-auto md:w-56 lg:w-[280px]"
              />
            </div>

            {/* Arrow */}
            <div 
              className="w-10 h-10 flex items-center justify-center bg-[#007D4F] rounded-full flex-shrink-0 md:-rotate-90"
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
            <div className="flex-shrink-0">
              <Image
                src="/lp/images/merchant-coupon-after.png"
                alt="クーポン使用後"
                width={280}
                height={570}
                className="w-48 h-auto md:w-56 lg:w-[280px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* How to Apply Section */}
      <div 
        id="how-to-apply" 
        className="flex flex-col justify-center items-center gap-6 md:gap-8 lg:gap-11 py-12 px-[39px] md:py-16 md:px-8 lg:py-20 lg:px-16 xl:px-30"
        style={{
          background: '#7FBE26'
        }}
      >
        {/* Section Title */}
        <h2 
          className="text-2xl md:text-3xl lg:text-4xl"
          style={{
            color: '#FFF',
            fontFamily: '"Zen Kaku Gothic New"',
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: '100%'
          }}
        >
          お申し込み方法
        </h2>

        {/* Subtitle */}
        <p 
          className="text-base md:text-lg"
          style={{
            color: '#FFF',
            textAlign: 'center',
            fontFamily: '"Zen Kaku Gothic New"',
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: '160%'
          }}
        >
          「たまのみ」のご利用を開始するまでのステップをご紹介します。
        </p>

        {/* Steps Cards */}
        <div 
          className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-stretch w-full max-w-6xl"
        >
          {/* Step 1 Card */}
          <div 
            className="flex flex-col justify-center items-center gap-6 md:gap-8 w-[312px] md:w-[368px] flex-shrink-0 bg-white rounded-lg p-6 md:p-8"
          >
            <div className="text-center">
              <p 
                className="text-base md:text-lg mb-3 md:mb-4 underline"
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: 'var(--font-limelight)',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '100%'
                }}
              >
                STEP.1
              </p>
              <h3 
                className="text-lg md:text-xl"
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '160%'
                }}
              >
                お申し込み
              </h3>
            </div>
            <div className="w-full">
              <Image
                src="/lp/images/merchant-step-application.png"
                alt="お申し込み"
                width={280}
                height={200}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <p 
              className="text-sm md:text-base w-full"
              style={{
                color: '#000',
                textAlign: 'left',
                fontFamily: '"Zen Kaku Gothic New"',
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
            className="flex flex-col justify-center items-center gap-6 md:gap-8 w-[312px] md:w-[368px] flex-shrink-0 bg-white rounded-lg p-6 md:p-8"
          >
            <div className="text-center">
              <p 
                className="text-base md:text-lg mb-3 md:mb-4 underline"
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: 'var(--font-limelight)',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '100%'
                }}
              >
                STEP.2
              </p>
              <h3 
                className="text-lg md:text-xl"
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '160%'
                }}
              >
                掲載内容確認
              </h3>
            </div>
            <div className="w-full">
              <Image
                src="/lp/images/merchant-step-confirmation.png"
                alt="掲載内容確認"
                width={280}
                height={200}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <p 
              className="text-sm md:text-base w-full"
              style={{
                color: '#000',
                textAlign: 'left',
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
            className="flex flex-col justify-center items-center gap-6 md:gap-8 w-[312px] md:w-[368px] flex-shrink-0 bg-white rounded-lg p-6 md:p-8"
          >
            <div className="text-center">
              <p 
                className="text-base md:text-lg mb-3 md:mb-4 underline"
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: 'var(--font-limelight)',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '100%'
                }}
              >
                STEP.3
              </p>
              <h3 
                className="text-lg md:text-xl"
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '160%'
                }}
              >
                ご利用開始
              </h3>
            </div>
            <div className="w-full">
              <Image
                src="/lp/images/merchant-step-start.png"
                alt="ご利用開始"
                width={280}
                height={200}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <p 
              className="text-sm md:text-base w-full"
              style={{
                color: '#000',
                textAlign: 'left',
                fontFamily: '"Zen Kaku Gothic New"',
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
        className="flex flex-col justify-center items-center gap-6 md:gap-8 lg:gap-10 py-12 px-[39px] md:py-16 md:px-8 lg:px-16 xl:px-30"
        style={{
          background: '#FAEE00'
        }}
      >
        {/* Text */}
        <h2 
          className="text-xl md:text-2xl lg:text-3xl text-center"
          style={{
            color: 'var(--green1, #007D4F)',
            fontFamily: '"Zen Kaku Gothic New"',
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: '100%'
          }}
        >
          あなたのお店も&quot;たまのみ&quot;に参加しませんか？
        </h2>

        {/* CTA Button */}
        <Link href="/lp/merchant/apply">
          <button
            className="relative flex w-64 md:w-72 lg:w-80 px-4 py-3 md:px-6 md:py-4 justify-center items-center gap-2 rounded-full border-2 md:border-3 border-white cursor-pointer"
            style={{
              background: 'var(--green1, #007D4F)'
            }}
          >
            <div className="flex flex-col items-center gap-1">
              <span 
                className="text-sm md:text-base"
                style={{
                  color: '#FFF',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '100%'
                }}
              >
                いますぐ<span style={{ color: '#FAEE00' }}>無料</span>で
              </span>
              <span 
                className="text-lg md:text-xl lg:text-2xl"
                style={{
                  color: '#FFF',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '100%'
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
              className="absolute right-4 md:right-6 flex-shrink-0"
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
        </Link>
      </div>

      {/* Footer Section */}
      <div className="w-full bg-white border-t">
        <div className="max-w-6xl mx-auto px-[39px] md:px-8">
          <div 
            className="flex flex-col justify-center items-center gap-8 md:gap-10 pt-8 md:pt-12"
          >
            {/* Logo */}
            <div className="mb-4 md:mb-8">
              <Image
                src="/lp/images/logo.png"
                alt="TAMANOMI"
                width={328}
                height={329}
                className="w-48 h-auto md:w-64 lg:w-[328px]"
                style={{
                  aspectRatio: '328/329'
                }}
              />
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8 mb-4 md:mb-8">
              <a 
                href="#" 
                className="text-gray-700 hover:text-gray-900 transition-colors text-sm md:text-base"
                style={{
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontWeight: '400'
                }}
              >
                よくあるご質問
              </a>
              <Link 
                href="/lp/contact?type=merchant" 
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
                特定商取引法に基づく表記
              </a>
              <a 
                href="#" 
                className="text-gray-700 hover:text-gray-900 transition-colors text-sm md:text-base"
                style={{
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontWeight: '400'
                }}
              >
                ご利用規約
              </a>
              <a 
                href="#" 
                className="text-gray-700 hover:text-gray-900 transition-colors text-sm md:text-base"
                style={{
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontWeight: '400'
                }}
              >
                運営会社
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
        </div>
      </div>
    </div>
  )
}

