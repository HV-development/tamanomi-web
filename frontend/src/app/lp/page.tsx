'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// カルーセル用のプレースホルダー（実際の画像がある場合は置き換えてください）
const images = [
  null, // プレースホルダー1
  null, // プレースホルダー2
  null, // プレースホルダー3
];

export default function LPPage() {
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(images.length * 7) // 中央のセット（8番目）の先頭から開始
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [carouselImageWidth, setCarouselImageWidth] = useState(303)

  // LPページ用：bodyの最大幅制限を解除
  useEffect(() => {
    document.body.style.maxWidth = '100vw'
    return () => {
      document.body.style.maxWidth = ''
    }
  }, [])

  // 無限ループ用：画像を15回複製（PCで3枚同時表示するため十分な余裕を持たせる）
  const extendedImages = [
    ...images,
    ...images,
    ...images,
    ...images,
    ...images,
    ...images,
    ...images,
    ...images, // 中央のセット（表示用）
    ...images,
    ...images,
    ...images,
    ...images,
    ...images,
    ...images,
    ...images,
  ]

  const handleScroll = (direction: 'left' | 'right') => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    
    // スライドを増減（無限に）
    const delta = direction === 'right' ? -1 : 1
    setCurrentSlide(prev => prev + delta)
    
    // トランジション完了後に境界チェックと瞬間移動
    setTimeout(() => {
      setIsTransitioning(false)
      
      // 境界を超えたら瞬間移動（トランジションなし）
      setCurrentSlide((prev) => {
        // 右端を超えた場合（12番目のセット以降に入った）
        if (prev >= images.length * 11) {
          return prev - images.length * 5
        }
        // 左端を超えた場合（4番目のセット以前に入った）
        if (prev < images.length * 3) {
          return prev + images.length * 5
        }
        return prev
      })
    }, 500)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    setCurrentSlide(images.length * 7 + index) // 中央のセット（8番目）の該当位置
    
    // トランジション完了後にフラグをリセット
    setTimeout(() => setIsTransitioning(false), 500)
  }

  // メディアクエリでカルーセル画像サイズを動的に変更
  useEffect(() => {
    const updateCarouselSize = () => {
      if (window.matchMedia('(min-width: 768px)').matches) {
        setCarouselImageWidth(375)
      } else {
        setCarouselImageWidth(303)
      }
    }

    updateCarouselSize()
    window.addEventListener('resize', updateCarouselSize)
    return () => window.removeEventListener('resize', updateCarouselSize)
  }, [])

  return (
    <div className="w-full overflow-x-hidden">
      {/* First View */}
      <div 
        className="relative w-full min-h-screen"
        style={{
          maxWidth: 'none',
          width: '100vw',
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
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/lp/images/user-lp-fv.png"
            alt="ファーストビュー背景"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>

        {/* Header */}
        <header className="relative w-full" style={{ zIndex: 100 }}>
          <div className="w-full px-4 py-4 md:px-8 md:py-6" style={{ width: '100vw', margin: 0 }}>
            <div className="flex items-center w-full">
              <div className="flex items-center">
                <Image
                  src="/lp/images/horizon-color-white.png"
                  alt="たまのみ"
                  width={1312}
                  height={320}
                  className="w-40 h-10 md:w-[328px] md:h-20"
                  style={{
                    flexShrink: 0
                  }}
                />
              </div>
              <div style={{ flex: 1 }}></div>
              <div className="flex items-center gap-4 md:gap-11">
                <nav className="hidden md:flex items-center space-x-6 lg:space-x-10">
                  <a href="#about" className="text-white hover:text-blue-200 transition-colors text-base lg:text-lg">たまのみとは</a>
                  <a href="#features" className="text-white hover:text-blue-200 transition-colors text-base lg:text-lg">魅力</a>
                  <a href="#howto" className="text-white hover:text-blue-200 transition-colors text-base lg:text-lg">使い方</a>
                  <a href="#pricing" className="text-white hover:text-blue-200 transition-colors text-base lg:text-lg">利用料金</a>
                  <a href="#stores" className="text-white hover:text-blue-200 transition-colors text-base lg:text-lg">使えるお店</a>
                  <Link href="/lp/contact" className="text-white hover:text-blue-200 transition-colors text-base lg:text-lg">お問い合わせ</Link>
                </nav>
                
                <Link 
                  href="/lp/merchant"
                  className="text-white font-bold hover:opacity-90 transition-opacity text-xs md:text-sm lg:text-base px-4 py-2 md:px-6 md:py-4"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    borderRadius: '9999px',
                    background: 'var(--main, #6FC8E5)'
                  }}
                >
                  <span className="hidden md:inline">お店の方はこちら</span>
                  <span className="md:hidden">お店の方</span>
                </Link>

                {/* ハンバーガーメニューアイコン（モバイルのみ表示） */}
                <button
                  className="md:hidden flex flex-col justify-center items-center cursor-pointer mr-4"
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
              className="md:hidden fixed inset-0 w-full h-full"
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
                  href="#about" 
                  className="text-gray-800 hover:text-blue-600 transition-colors text-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  たまのみとは
                </a>
                <a 
                  href="#features" 
                  className="text-gray-800 hover:text-blue-600 transition-colors text-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  魅力
                </a>
                <a 
                  href="#howto" 
                  className="text-gray-800 hover:text-blue-600 transition-colors text-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  使い方
                </a>
                <a 
                  href="#pricing" 
                  className="text-gray-800 hover:text-blue-600 transition-colors text-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  利用料金
                </a>
                <a 
                  href="#stores" 
                  className="text-gray-800 hover:text-blue-600 transition-colors text-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  使えるお店
                </a>
                <Link 
                  href="/lp/contact" 
                  className="text-gray-800 hover:text-blue-600 transition-colors text-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  お問い合わせ
                </Link>
              </nav>
            </div>
          )}
        </header>

        {/* Main Content */}
        <div className="relative w-full h-full flex items-start justify-center pt-[300px] md:pt-40 pb-32 md:pb-40 px-4" style={{ zIndex: 1 }}>
          <div className="text-center">

            {/* Main Title */}
            <div className="mb-8 md:mb-6 relative">
              <h1 
                className="md:text-[80px] md:mt-[80px]"
                style={{
                  alignSelf: 'stretch',
                  color: '#FFF',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '60px',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '120%'
                }}
              >
                <span className="block md:inline">毎日1杯、</span>
                <span className="block md:inline">無料で乾杯</span>
              </h1>
              <Image
                src="/lp/images/fukidashi.svg"
                alt="1軒"
                width={91}
                height={74}
                className="absolute left-16 top-[-80px] md:left-16 md:top-[40px] lg:top-[-70px] md:w-[155.29px] md:h-[127.06px]"
                style={{
                  width: '91px',
                  height: '74px',
                  aspectRatio: '91/74'
                }}
              />
            </div>

            {/* Sub Title */}
            <div className="mb-12 md:mb-10">
              <h2 
                style={{
                  color: '#FFF',
                  fontFamily: '"Shippori Antique"',
                  fontSize: '26px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '100%',
                  letterSpacing: '-1.82px'
                }}
              >
                次のお店はどこに行く?
              </h2>
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
                  border: 'none',
                  background: '#FF6F61',
                  cursor: 'pointer'
                }}
                onClick={() => router.push('/email-registration')}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span 
                    style={{
                      color: '#FFF',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontSize: '18px',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%'
                    }}
                  >
                    今すぐ始める
                  </span>
                  <span 
                    style={{
                      color: '#FFF',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontSize: '26px',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%'
                    }}
                  >
                    一杯無料
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

        {/* Decorative drink icons at bottom */}
        <div className="absolute bottom-2 md:bottom-4 left-0 w-full overflow-hidden">
          <div 
            className="flex justify-center items-end gap-3 sm:gap-4 md:gap-6 lg:gap-8"
          >
            <Image
              src="/lp/images/fv-glass-01.svg"
              alt="ドリンク1"
              width={168.008}
              height={140}
              className="w-10 h-8 sm:w-14 sm:h-12 md:w-20 md:h-16 lg:w-[168px] lg:h-[140px]"
              style={{ flexShrink: 0 }}
            />
            <Image
              src="/lp/images/fv-glass-02.svg"
              alt="ドリンク2"
              width={158}
              height={181}
              className="w-10 h-12 sm:w-14 sm:h-16 md:w-18 md:h-20 lg:w-[158px] lg:h-[181px]"
              style={{ flexShrink: 0 }}
            />
            <Image
              src="/lp/images/fv-glass-03.svg"
              alt="ドリンク3"
              width={154}
              height={179}
              className="w-10 h-12 sm:w-14 sm:h-16 md:w-18 md:h-20 lg:w-[154px] lg:h-[179px]"
              style={{ flexShrink: 0 }}
            />
            <Image
              src="/lp/images/fv-glass-04.svg"
              alt="ドリンク4"
              width={185}
              height={164}
              className="w-12 h-10 sm:w-16 sm:h-14 md:w-20 md:h-18 lg:w-[185px] lg:h-[164px]"
              style={{ flexShrink: 0 }}
            />
            <Image
              src="/lp/images/fv-glass-05.svg"
              alt="ドリンク5"
              width={121}
              height={146}
              className="w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 lg:w-[121px] lg:h-[146px]"
              style={{ flexShrink: 0 }}
            />
            <Image
              src="/lp/images/fv-glass-06.svg"
              alt="ドリンク6"
              width={118}
              height={181}
              className="w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-18 lg:w-[118px] lg:h-[181px]"
              style={{ flexShrink: 0 }}
            />
            <Image
              src="/lp/images/fv-glass-07.svg"
              alt="ドリンク7"
              width={113}
              height={203}
              className="w-9 h-16 sm:w-11 sm:h-18 md:w-12 md:h-20 lg:w-[113px] lg:h-[203px]"
              style={{ flexShrink: 0 }}
            />
            <Image
              src="/lp/images/fv-glass-08.svg"
              alt="ドリンク8"
              width={124}
              height={165}
              className="w-10 h-13 sm:w-12 sm:h-16 md:w-14 md:h-18 lg:w-[124px] lg:h-[165px]"
              style={{ flexShrink: 0 }}
            />
          </div>
        </div>
      </div>

      {/* Banner Carousel Section (Second Layer) */}
      <div className="w-full bg-white py-10 md:py-20">
        <div 
          className="w-full px-4 md:px-8 lg:px-20"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
            alignSelf: 'stretch'
          }}
        >
          {/* Carousel Container */}
          <div className="relative w-full max-w-6xl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Banner Images Container */}
            <div className="relative overflow-hidden w-full max-w-[375px] h-[170px] md:max-w-[1157px] md:h-[210px]">
              <div 
                className="flex absolute left-1/2"
                style={{ 
                  gap: '16px',
                  transform: `translateX(calc(-50% - ${currentSlide * (carouselImageWidth + 16)}px))`,
                  transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
                }}
              >
                {extendedImages.map((src, i) => (
                  <div
                    key={i}
                    className="relative flex-shrink-0 overflow-hidden w-[303px] h-[170px] md:w-[375px] md:h-[210px]"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      aspectRatio: '303/170',
                      borderRadius: '20px',
                      background: '#D9D9D9'
                    }}
                  >
                    {src ? (
                      <Image
                        src={src}
                        alt={`banner-${i}`}
                        fill
                        className="object-cover"
                        priority={i < 2}
                      />
                    ) : (
                      <p style={{ color: '#999', fontSize: '16px', fontWeight: 400 }}>準備中</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Left Arrow */}
            <button 
              className="absolute z-10 hover:opacity-80 transition-opacity left-[12px] top-[69px] md:left-[70px] md:top-[89px] w-8 h-8 md:w-12 md:h-12"
              onClick={() => handleScroll('left')}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                aspectRatio: '1/1',
                borderRadius: '9999px',
                background: 'var(--main, #6FC8E5)',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <Image
                src="/lp/images/carousel-arrow-left.svg"
                alt="前へ"
                width={7}
                height={12}
              />
            </button>

            {/* Right Arrow */}
            <button 
              className="absolute z-10 hover:opacity-80 transition-opacity right-[12px] top-[69px] md:right-[70px] md:top-[89px] w-8 h-8 md:w-12 md:h-12"
              onClick={() => handleScroll('right')}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                aspectRatio: '1/1',
                borderRadius: '9999px',
                background: 'var(--main, #6FC8E5)',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <Image
                src="/lp/images/carousel-arrow-right.svg"
                alt="次へ"
                width={7}
                height={12}
              />
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center space-x-2 md:space-x-3">
            {images.map((_, index) => {
              // 現在のスライドがどの画像を表示しているかを計算
              const actualIndex = ((currentSlide % images.length) + images.length) % images.length
              return (
                <button 
                  key={index} 
                  className="p-1 hover:opacity-80 transition-opacity"
                  onClick={() => goToSlide(index)}
                >
                  <div
                    className="w-3 h-3 md:w-4 md:h-4"
                    style={{
                      borderRadius: '50%',
                      backgroundColor: actualIndex === index ? '#6FC8E5' : '#D9D9D9',
                      transition: 'background-color 0.3s ease'
                    }}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="w-full relative min-h-screen">
        {/* Background with split colors - モバイル: 上下分割、PC: 左右分割 */}
        <div className="absolute inset-0 flex flex-col lg:flex-row">
          <div className="w-full h-1/2 lg:w-1/2 lg:h-full" style={{ backgroundColor: '#FFD93B' }}></div>
          <div className="w-full h-1/2 lg:w-1/2 lg:h-full" style={{ backgroundColor: '#6FC8E5' }}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center min-h-screen px-4 md:px-8 py-16 md:py-24">
          {/* Left Content */}
          <div className="w-full md:w-1/2 flex flex-col justify-center items-center pr-0 md:pr-8 mb-8 md:mb-0 order-1 md:order-1">
            {/* Logo - モバイル・タブレットのみ表示 */}
            <div className="mb-6 md:mb-8 lg:hidden">
              <Image
                src="/lp/images/about-text-logo.png"
                alt="たまのみロゴ"
                width={1305}
                height={453}
                className="w-64 h-auto md:w-80"
              />
            </div>
            
            <p
              className="md:text-4xl lg:text-5xl"
              style={{
                color: '#000',
                textAlign: 'center',
                fontFamily: '"Zen Kaku Gothic New"',
                fontSize: '30px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: '160%'
              }}
            >
              たまのみ片手に
              <br />
              街を歩こう
            </p>
            
            {/* Phone and Character - モバイル・タブレットのみ */}
            <div className="mt-8 lg:hidden">
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Phone Image */}
                <div style={{ position: 'relative', zIndex: 15 }}>
                  <Image
                    src="/lp/images/about-phone.png"
                    alt="スマホ画面"
                    width={860}
                    height={1740}
                    className="w-32 h-auto md:w-40"
                    style={{
                      aspectRatio: '43/87',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                {/* Character - overlapping bottom of phone */}
                <div className="-mt-6 md:-mt-8" style={{ zIndex: 21, position: 'relative' }}>
                  <Image
                    src="/lp/images/about-character.png"
                    alt="たまのみキャラクター"
                    width={1520}
                    height={602}
                    className="md:w-72"
                    style={{ 
                      width: '344px',
                      height: '136px',
                      aspectRatio: '43/17',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Central Image - Phone, Text Logo, and Character */}
          {/* モバイル: Left Content内、PC: 中央に絶対配置 */}
          <div className="hidden lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:flex" style={{ zIndex: 20 }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Text Logo - top center (PCのみ) */}
              <div className="mb-4 md:mb-5" style={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <Image
                  src="/lp/images/about-text-logo.png"
                  alt="たまのみテキストロゴ"
                  width={1305}
                  height={453}
                  className="w-48 h-auto md:w-60 lg:w-[326px]"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              {/* Phone and Character container */}
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Phone Image */}
                <div style={{ position: 'relative', zIndex: 15 }}>
                  <Image
                    src="/lp/images/about-phone.png"
                    alt="スマホ画面"
                    width={860}
                    height={1740}
                    className="w-32 h-auto md:w-40 lg:w-[215px]"
                    style={{
                      aspectRatio: '43/87',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              {/* Character - overlapping bottom of phone */}
              <div className="-mt-6 md:-mt-8 lg:-mt-10" style={{ zIndex: 21, position: 'relative' }}>
                <Image
                  src="/lp/images/about-character.png"
                  alt="たまのみキャラクター"
                  width={1520}
                  height={602}
                  className="w-56 h-auto md:w-72 lg:w-[380px]"
                  style={{ 
                    aspectRatio: '380.00/150.50',
                    objectFit: 'cover'
                  }}
                />
              </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div 
            className="w-full md:w-1/2 flex flex-col justify-center items-center pl-0 order-2 md:order-2"
          >
            <div className="w-full max-w-sm px-4 md:px-0 flex flex-col justify-center items-center md:gap-8">
              {/* Heading */}
              <div className="mb-6 md:mb-0" style={{ position: 'relative', display: 'inline-block' }}>
                <h2
                  className="text-[48px] md:text-[64px]"
                  style={{
                    color: 'var(--accent-yellow, #FFD93B)',
                    fontFamily: 'var(--font-plaster)',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '100%'
                  }}
                >
                  About
                </h2>
                <p
                  className="md:text-lg lg:text-xl"
                  style={{
                    position: 'absolute',
                    top: '85%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#000',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontSize: '20px',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: '100%',
                    whiteSpace: 'nowrap'
                  }}
                >
                  たまのみとは？
                </p>
              </div>
              
              {/* Body Text */}
              <div
                className="text-white w-full text-center md:text-justify md:max-w-[365px]"
                style={{
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '160%',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}
              >
                <p className="mb-4" style={{ fontWeight: '500' }}>
                  「たまのみ」は、毎日1軒につきドリンクが1杯無料になる新しい&ldquo;Welcomeドリンク&rdquo;サービスです。
                </p>
                <p className="mb-4" style={{ fontWeight: '500' }}>
                  お酒でもソフトドリンクでもOK。
                </p>
                <p style={{ fontWeight: '500' }}>
                  気になるお店をみつけたら、仲間と乾杯したり、自分だけの寄り道を楽しんだり。あなたの「今日はどこで飲もう？」をもっと自由に、もっとおトクにします。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="w-full bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* Features Title */}
          <div className="flex justify-center mb-12 md:mb-16">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <h2 
                className="md:text-5xl lg:text-6xl"
                style={{
                  color: '#EFECE8',
                  fontFamily: 'var(--font-plaster)',
                  fontSize: '48px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '100%'
                }}
              >
                Features
              </h2>
              <p 
                className="md:text-lg lg:text-xl"
                style={{
                  position: 'absolute',
                  top: '85%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#000',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '100%',
                  whiteSpace: 'nowrap'
                }}
              >
                たまのみの魅力
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-y-[80px] md:gap-x-[80px]">
            {/* Feature 01 */}
            <div className="flex flex-col items-center text-center gap-6 w-full md:w-[379px] mx-auto md:mx-0 md:justify-self-end">
              <div className="relative w-full aspect-square md:max-w-[379px]">
                <div style={{ position: 'absolute', top: '0', left: '0', zIndex: 10 }}>
                  <p 
                    style={{
                      color: 'var(--main, #6FC8E5)',
                      textAlign: 'left',
                      fontFamily: 'var(--font-limelight)',
                      fontSize: '15px',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      lineHeight: '100%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    feature
                  </p>
                  <h3 
                    style={{
                      color: 'var(--main, #6FC8E5)',
                      textAlign: 'left',
                      fontFamily: 'var(--font-limelight)',
                      fontSize: '66px',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      lineHeight: '100%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    01
                  </h3>
                </div>
                <Image
                  src="/lp/images/feature-01-beer-circle.png"
                  alt="1店舗につき1杯無料!"
                  width={379}
                  height={379}
                  className="w-full h-full object-cover rounded-full"
                />
                <div 
                  className="absolute bottom-6 md:bottom-10 left-6 px-3 md:px-4 py-1"
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    background: 'var(--main, #6FC8E5)'
                  }}
                >
                  <span 
                    style={{
                      color: '#FFF',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontSize: '18px',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    1店舗につき1杯無料！
                  </span>
                </div>
              </div>
              <div className="text-gray-700 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-2">お酒でもソフトドリンクでもOK。</p>
                <p className="mb-2">「たまのみ」の掲載店なら、</p>
                <p className="mb-2">どこでも1杯が無料に！</p>
                <p className="mb-2">ちょっと気になるお店に入ってみたり、</p>
                <p className="mb-2">気分でバーに立ち寄ったり。</p>
                <p>お財布に優しく、気軽に乾杯を楽しめます。</p>
              </div>
            </div>

            {/* Feature 02 */}
            <div className="flex flex-col items-center text-center gap-6 w-full md:w-[379px] mx-auto md:mx-0 md:justify-self-start">
              <div className="relative w-full aspect-square md:max-w-[379px]">
                <div style={{ position: 'absolute', top: '0', left: '0', zIndex: 10 }}>
                  <p 
                    style={{
                      color: 'var(--main, #6FC8E5)',
                      textAlign: 'left',
                      fontFamily: 'var(--font-limelight)',
                      fontSize: '15px',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      lineHeight: '100%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    feature
                  </p>
                  <h3 
                    style={{
                      color: 'var(--main, #6FC8E5)',
                      textAlign: 'left',
                      fontFamily: 'var(--font-limelight)',
                      fontSize: '66px',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      lineHeight: '100%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    02
                  </h3>
                </div>
                <Image
                  src="/lp/images/feature-02-street-circle.png"
                  alt="1日で複数店舗をはしごできる!"
                  width={379}
                  height={379}
                  className="w-full h-full object-cover rounded-full"
                />
                <div 
                  className="absolute bottom-6 md:bottom-10 left-6 px-3 md:px-4 py-1"
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    background: 'var(--main, #6FC8E5)'
                  }}
                >
                  <span 
                    style={{
                      color: '#FFF',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontSize: '18px',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    1日で複数店舗をはしごできる！
                  </span>
                </div>
              </div>
              <div className="text-gray-700 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-2">1店舗につき1杯無料だから、</p>
                <p className="mb-2">1日で何軒もめぐれるのが「たまのみ」の魅力。</p>
                <p className="mb-2">今日は気の合う仲間とカジュアルに、</p>
                <p className="mb-2">明日はひとりでしっとり。</p>
                <p className="mb-2">その日の気分で、</p>
                <p>さいたまの街を自由にドリンクめぐり！</p>
              </div>
            </div>

            {/* Feature 03 */}
            <div className="flex flex-col items-center text-center gap-6 w-full md:w-[379px] mx-auto md:mx-0 md:justify-self-end">
              <div className="relative w-full aspect-square md:max-w-[379px]">
                <div style={{ position: 'absolute', top: '0', left: '0', zIndex: 10 }}>
                  <p
                    style={{
                      color: 'var(--main, #6FC8E5)',
                      textAlign: 'left',
                      fontFamily: 'var(--font-limelight)',
                      fontSize: '15px',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      lineHeight: '100%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    feature
                  </p>
                  <h3
                    style={{
                      color: 'var(--main, #6FC8E5)',
                      textAlign: 'left',
                      fontFamily: 'var(--font-limelight)',
                      fontSize: '66px',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      lineHeight: '100%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    03
                  </h3>
                </div>
                <Image
                  src="/lp/images/feature-03-drink-circle.png"
                  alt="お酒が苦手でも楽しめる!"
                  width={379}
                  height={379}
                  className="w-full h-full object-cover rounded-full"
                />
                <div 
                  className="absolute bottom-6 md:bottom-10 left-6 px-3 md:px-4 py-1"
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    background: 'var(--main, #6FC8E5)'
                  }}
                >
                  <span 
                    style={{
                      color: '#FFF',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontSize: '18px',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    お酒が苦手でも楽しめる！
                  </span>
                </div>
              </div>
              <div className="text-gray-700 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-2">「たまのみ」は&ldquo;飲める人だけ&rdquo;の</p>
                <p className="mb-2">サービスじゃありません。</p>
                <p className="mb-2">ソフトドリンクも対象だから、</p>
                <p className="mb-2">ノンアル派や飲めない人も安心。</p>
                <p className="mb-2">友達や同僚と一緒に、</p>
                <p>気軽に「乾杯」をシェアできます。</p>
              </div>
            </div>

            {/* Feature 04 */}
            <div className="flex flex-col items-center text-center gap-6 w-full md:w-[379px] mx-auto md:mx-0 md:justify-self-start">
              <div className="relative w-full aspect-square md:max-w-[379px]">
                <div style={{ position: 'absolute', top: '0', left: '0', zIndex: 10 }}>
                  <p
                    style={{
                      color: 'var(--main, #6FC8E5)',
                      textAlign: 'left',
                      fontFamily: 'var(--font-limelight)',
                      fontSize: '15px',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      lineHeight: '100%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    feature
                  </p>
                  <h3
                    style={{
                      color: 'var(--main, #6FC8E5)',
                      textAlign: 'left',
                      fontFamily: 'var(--font-limelight)',
                      fontSize: '66px',
                      fontStyle: 'normal',
                      fontWeight: '400',
                      lineHeight: '100%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    04
                  </h3>
                </div>
                <Image
                  src="/lp/images/feature-04-server-circle.png"
                  alt="新しいお店との出会い!"
                  width={379}
                  height={379}
                  className="w-full h-full object-cover rounded-full"
                />
                <div 
                  className="absolute bottom-6 md:bottom-10 left-6 px-3 md:px-4 py-1"
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    background: 'var(--main, #6FC8E5)'
                  }}
                >
                  <span 
                    style={{
                      color: '#FFF',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontSize: '18px',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    新しいお店との出会い！
                  </span>
                </div>
              </div>
              <div className="text-gray-700 text-sm md:text-base leading-relaxed w-full">
                <p className="mb-2">普段は行かないお店でも、</p>
                <p className="mb-2">1杯無料なら挑戦しやすい。</p>
                <p className="mb-2">地元で愛される居酒屋から、</p>
                <p className="mb-2">おしゃれなカフェ・バーまで。</p>
                <p className="mb-2">「たまのみ」があれば、</p>
                <p className="mb-2">思わぬお気に入りの一軒に出会えます。</p>
                <p>街歩きしながら、新しい発見を楽しもう！</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How to Use Section */}
      <div 
        id="howto"
        className="w-full py-16 md:py-24 lg:py-32"
        style={{ backgroundColor: 'rgba(239, 236, 232, 1)' }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* How to Use Title */}
          <div className="flex justify-center mb-8 md:mb-12">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <h2
                className="md:text-5xl lg:text-6xl"
                style={{
                  color: '#FFF',
                  fontFamily: 'var(--font-plaster)',
                  fontSize: '48px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '100%'
                }}
              >
                How to Use
              </h2>
              <p
                className="md:text-lg lg:text-xl"
                style={{
                  position: 'absolute',
                  top: '85%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#000',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '100%',
                  whiteSpace: 'nowrap'
                }}
              >
                たまのみの使い方
              </p>
            </div>
          </div>

          {/* How to Use Subtitle */}
          <div className="text-center mb-8 md:mb-12">
            <p 
              className="text-base md:text-lg lg:text-xl"
              style={{
                color: '#000',
                textAlign: 'center',
                fontFamily: '"Zen Kaku Gothic New"',
                fontWeight: '700',
                lineHeight: '160%'
              }}
            >
              使い方はかんたん！たったの3ステップ
            </p>
          </div>

          {/* Steps Grid */}
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-[48px] max-w-5xl mx-auto">
            {/* Step 01 */}
            <div 
              className="bg-white rounded-lg md:w-[368px] mx-[39px] md:mx-0"
              style={{
                display: 'flex',
                padding: '32px 24px',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '32px',
                alignSelf: 'stretch'
              }}
            >
              <div className="text-center">
                <p 
                  className="mb-4"
                  style={{
                    color: '#000',
                    textAlign: 'center',
                    fontFamily: 'var(--font-limelight)',
                    fontSize: '18px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '100%',
                    textDecoration: 'underline'
                  }}
                >
                  STEP.1
                </p>
                <h4 
                  className="font-bold text-gray-800 text-lg md:text-xl"
                >
                  お店を見つける
                </h4>
              </div>
              <div className="w-full">
                <Image
                  src="/lp/images/how-to-use-step-01.png"
                  alt="Step 01"
                  width={320}
                  height={200}
                  className="w-full rounded-lg h-40 md:h-48 object-cover"
                />
              </div>
              <p 
                className="text-left w-full"
                style={{
                  color: '#000',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '14px',
                  fontWeight: '700',
                  lineHeight: '160%'
                }}
              >
                今いる場所の近くや気になるお店をマップやリストでチェック。
              </p>
            </div>

            {/* Step 02 */}
            <div 
              className="bg-white rounded-lg md:w-[368px] mx-[39px] md:mx-0"
              style={{
                display: 'flex',
                padding: '32px 24px',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '32px',
                alignSelf: 'stretch'
              }}
            >
              <div className="text-center">
                <p 
                  className="mb-4"
                  style={{
                    color: '#000',
                    textAlign: 'center',
                    fontFamily: 'var(--font-limelight)',
                    fontSize: '18px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '100%',
                    textDecoration: 'underline'
                  }}
                >
                  STEP.2
                </p>
                <h4 
                  className="font-bold text-gray-800 text-lg md:text-xl"
                >
                  スマホを見せる
                </h4>
              </div>
              <div className="w-full">
                <Image
                  src="/lp/images/how-to-use-step-02.png"
                  alt="Step 02"
                  width={320}
                  height={200}
                  className="w-full rounded-lg h-40 md:h-48 object-cover"
                />
              </div>
              <p 
                className="text-left w-full"
                style={{
                  color: '#000',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '14px',
                  fontWeight: '700',
                  lineHeight: '160%'
                }}
              >
                お店でたまのみクーポン画面を見せて、対象ドリンクが1杯無料！
              </p>
            </div>

            {/* Step 03 */}
            <div 
              className="bg-white rounded-lg md:w-[368px] mx-[39px] md:mx-0"
              style={{
                display: 'flex',
                padding: '32px 24px',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '32px',
                alignSelf: 'stretch'
              }}
            >
              <div className="text-center">
                <p 
                  className="mb-4"
                  style={{
                    color: '#000',
                    textAlign: 'center',
                    fontFamily: 'var(--font-limelight)',
                    fontSize: '18px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '100%',
                    textDecoration: 'underline'
                  }}
                >
                  STEP.3
                </p>
                <h4 
                  className="font-bold text-gray-800 text-lg md:text-xl"
                >
                  はしごして楽しむ
                </h4>
              </div>
              <div className="w-full">
                <Image
                  src="/lp/images/how-to-use-step-03.png"
                  alt="Step 03"
                  width={320}
                  height={200}
                  className="w-full rounded-lg h-40 md:h-48 object-cover"
                />
              </div>
              <p 
                className="text-left w-full"
                style={{
                  color: '#000',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '14px',
                  fontWeight: '700',
                  lineHeight: '160%'
                }}
              >
                お店を変えれば同じ日にもう1杯無料。気軽に&ldquo;ちょい飲み&rdquo;。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="w-full py-16 md:py-24 lg:py-32 relative overflow-hidden">
        {/* Background with confetti - スマホ用 */}
        <div 
          className="absolute md:hidden"
          style={{
            width: '875px',
            height: '262px',
            aspectRatio: '875/262',
            position: 'absolute',
            left: '-287px',
            top: '-93px',
            backgroundImage: 'url(/lp/images/pricing-confetti.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        {/* Background with confetti - PC用 */}
        <div 
          className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/lp/images/pricing-confetti.png)',
            backgroundColor: '#6FC8E5'
          }}
        />
        {/* 背景色 */}
        <div className="absolute inset-0 -z-10" style={{ backgroundColor: '#6FC8E5' }} />
        
        <div className="relative z-10 max-w-6xl mx-[39px] md:mx-auto px-0 md:px-8">
          {/* Pricing Title */}
          <div className="flex justify-center mb-8 md:mb-12">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <h2
                className="md:text-5xl lg:text-6xl"
                style={{
                  color: '#FFF',
                  fontFamily: 'var(--font-plaster)',
                  fontSize: '48px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '100%'
                }}
              >
                Pricing
              </h2>
              <p
                className="md:text-lg lg:text-xl"
                style={{
                  position: 'absolute',
                  top: '85%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#000',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '100%',
                  whiteSpace: 'nowrap'
                }}
              >
                利用料金
              </p>
            </div>
          </div>

          {/* Pricing Subtitle */}
          <div className="flex justify-center mb-8 md:mb-12">
            <p
              className="text-base md:text-lg lg:text-xl"
              style={{
                color: '#FFF',
                textAlign: 'center',
                fontFamily: '"Zen Kaku Gothic New"',
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: '160%'
              }}
            >
              1日あたり約30円でちょい飲み体験
            </p>
          </div>

          {/* Pricing Content */}
          <div className="flex justify-center mb-8">
            <div className="relative flex flex-col items-center w-full max-w-[580px]">
              {/* Top Section - White Background */}
              <div
                className="flex flex-col justify-center items-center gap-6 w-full py-12 md:py-14 px-4 bg-white rounded-lg mx-[39px] md:mx-0"
              >
                <div className="flex items-baseline gap-2">
                  <h3
                    className="text-4xl md:text-5xl"
                    style={{
                      color: '#000',
                      textAlign: 'center',
                      fontFamily: 'Rubik',
                      fontStyle: 'normal',
                      fontWeight: '600',
                      lineHeight: '100%',
                      letterSpacing: '1px',
                      WebkitTextStroke: '3px #000'
                    }}
                  >
                    980
                  </h3>
                  <p
                    className="text-lg md:text-xl"
                    style={{
                      color: '#000',
                      textAlign: 'center',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%'
                    }}
                  >
                    円/月額（税込）
                  </p>
                </div>
                <div
                  className="flex flex-col justify-center items-center px-6 md:px-8 py-3 rounded-full"
                  style={{
                    background: 'var(--accent-yellow, #FFD93B)'
                  }}
                >
                  <span
                    className="text-base md:text-lg lg:text-xl"
                    style={{
                      color: '#000',
                      textAlign: 'center',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%'
                    }}
                  >
                    1日1軒1杯無料
                  </span>
                </div>
              </div>

              {/* Images Section - Absolute Positioning */}
              <div
                className="absolute bottom-32 md:bottom-40 left-1/2 transform -translate-x-1/2 flex justify-center items-end gap-8 md:gap-16 lg:gap-32"
              >
                {/* Left illustration - スマホ用 */}
                <Image
                  src="/lp/images/pricing-left.png"
                  alt="Left illustration"
                  width={597}
                  height={481}
                  className="md:hidden"
                  style={{
                    width: '179px',
                    height: '144px',
                    aspectRatio: '179/144',
                    objectFit: 'cover'
                  }}
                />
                {/* Left illustration - PC用 */}
                <Image
                  src="/lp/images/pricing-left.png"
                  alt="Left illustration"
                  width={597}
                  height={481}
                  className="hidden md:block w-32 h-auto md:w-48 lg:w-[298px]"
                  style={{
                    aspectRatio: '298.50/240.50',
                    objectFit: 'cover'
                  }}
                />
                {/* Right illustration - スマホ用 */}
                <Image
                  src="/lp/images/pricing-right.png"
                  alt="Right illustration"
                  width={614}
                  height={476}
                  className="md:hidden"
                  style={{
                    width: '184px',
                    height: '142px',
                    aspectRatio: '92/71',
                    objectFit: 'cover'
                  }}
                />
                {/* Right illustration - PC用 */}
                <Image
                  src="/lp/images/pricing-right.png"
                  alt="Right illustration"
                  width={614}
                  height={476}
                  className="hidden md:block w-32 h-auto md:w-48 lg:w-[307px]"
                  style={{
                    aspectRatio: '307/238',
                    objectFit: 'cover'
                  }}
                />
              </div>

              {/* Bottom Section - Yellow Background */}
              <div
                className="flex items-start md:items-center gap-3 md:gap-4 w-full pt-6 pb-6 md:py-8 px-4 md:px-6 rounded-lg mt-8 md:mt-12 relative h-[317px] md:h-[160px] mx-[39px] md:mx-0"
                style={{
                  background: 'var(--accent-yellow, #FFD93B)'
                }}
              >
                <div className="flex flex-col gap-2 flex-1 md:ml-40">
                  <p
                    className="text-sm md:text-base lg:text-lg text-center"
                    style={{
                      color: '#000',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '160%'
                    }}
                  >
                    さいたま市みんなのアプリ会員なら
                  </p>
                  <div className="flex items-end gap-2 justify-center">
                    <div
                      className="flex justify-center items-center w-8 h-8 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-full self-center"
                      style={{
                        background: '#000'
                      }}
                    >
                      <span
                        className="text-xs md:text-sm"
                        style={{
                          color: '#FFF',
                          textAlign: 'center',
                          fontFamily: '"Zen Kaku Gothic New"',
                          fontStyle: 'normal',
                          fontWeight: '700',
                          lineHeight: '100%'
                        }}
                      >
                        月額
                      </span>
                    </div>
                    <h4
                      className="text-7xl md:text-7xl lg:text-8xl"
                      style={{
                        color: '#000',
                        textAlign: 'center',
                        fontFamily: 'Rubik',
                        fontStyle: 'normal',
                        fontWeight: '600',
                        lineHeight: '100%',
                        letterSpacing: '5px',
                        WebkitTextStroke: '3px #000'
                      }}
                    >
                      480
                    </h4>
                    <p
                      className="text-xs md:text-sm"
                      style={{
                        color: '#000',
                        fontFamily: '"Zen Kaku Gothic New"',
                        fontStyle: 'normal',
                        fontWeight: '700',
                        lineHeight: '120%'
                      }}
                    >
                      円で
                      <br />
                      利用可能！
                    </p>
                  </div>
                  
                </div>
                
                {/* Phone Image - PC用（absolute配置で左側） */}
                <Image
                  src="/lp/images/pricing-phone.png"
                  alt="Phone illustration"
                  width={152.5}
                  height={179.5}
                  className="hidden md:block absolute"
                  style={{
                    width: '152.5px',
                    height: '179.5px',
                    flexShrink: 0,
                    aspectRatio: '152.50/179.50',
                    left: '16px',
                    bottom: '-10px',
                    objectFit: 'cover'
                  }}
                />
                
                {/* Phone Image - スマホ用（absolute配置で中央） */}
                <Image
                  src="/lp/images/pricing-phone.png"
                  alt="Phone illustration"
                  width={145.279}
                  height={171}
                  className="md:hidden absolute"
                  style={{
                    width: '145.279px',
                    height: '171px',
                    aspectRatio: '145.28/171.00',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bottom: '-25px',
                    objectFit: 'cover'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Disclaimers */}
          <div className="text-center">
            <p 
              className="mb-2 text-sm md:text-base"
              style={{
                color: '#FFF',
                fontFamily: '"Zen Kaku Gothic New"',
                fontWeight: '400',
                lineHeight: '160%'
              }}
            >
              ※対象ドリンクは店舗により異なります。
            </p>
            <p 
              className="text-sm md:text-base"
              style={{
                color: '#FFF',
                fontFamily: '"Zen Kaku Gothic New"',
                fontWeight: '400',
                lineHeight: '160%'
              }}
            >
              ※同一店舗での無料適用は1日お一人さま1杯までです。
            </p>
          </div>
        </div>
      </div>

      {/* Stores Section */}
      <div 
        id="stores"
        className="w-full py-16 md:py-24"
        style={{ backgroundColor: '#FFD93B' }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* Stores Title */}
          <div className="flex justify-center mb-8 md:mb-12">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <h2
                className="md:text-5xl lg:text-6xl"
                style={{
                  color: '#FFF',
                  fontFamily: 'var(--font-plaster)',
                  fontSize: '48px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '100%'
                }}
              >
                Stores
              </h2>
              <p
                className="md:text-lg lg:text-xl"
                style={{
                  position: 'absolute',
                  top: '85%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#000',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '100%',
                  whiteSpace: 'nowrap'
                }}
              >
                使えるお店
              </p>
            </div>
          </div>

          {/* Stores Content */}
          <div className="text-center">
            <p 
              className="mb-8 md:mb-12 text-base md:text-lg lg:text-xl"
              style={{
                color: '#000',
                textAlign: 'center',
                fontFamily: '"Zen Kaku Gothic New"',
                fontWeight: '700',
                lineHeight: '160%'
              }}
            >
              掲載店、続々拡大中
            </p>
            
            {/* Store List Button */}
            <div className="flex justify-center">
              <button
                className="relative inline-flex py-4 md:py-6 px-8 md:px-12 lg:px-16 justify-center items-center gap-2 rounded-full border-none cursor-pointer"
                style={{
                  background: '#FF6B6B'
                }}
              >
                <span 
                  className="text-base md:text-lg lg:text-xl"
                  style={{
                    color: '#FFF',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: '100%'
                  }}
                >
                  店舗一覧はこちら
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="9" 
                  height="16" 
                  viewBox="0 0 9 16" 
                  fill="none"
                  className="absolute right-6 md:right-8 lg:right-10 flex-shrink-0"
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

        {/* FAQ Section */}
        <div id="faq" className="py-16 md:py-24 bg-white mt-12 md:mt-16">
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
            {/* FAQ Title */}
            <div className="flex justify-center mb-8 md:mb-12">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <h2
                  className="md:text-5xl lg:text-6xl"
                  style={{
                    color: 'var(--accent-yellow, #EFECE8)',
                    fontFamily: 'var(--font-plaster)',
                    fontSize: '48px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '100%'
                  }}
                >
                  FAQ
                </h2>
                <p
                  className="md:text-lg lg:text-xl"
                  style={{
                    position: 'absolute',
                    top: '85%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#000',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontSize: '20px',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: '100%',
                    whiteSpace: 'nowrap'
                  }}
                >
                  よくあるご質問
                </p>
              </div>
            </div>

            {/* FAQ Description */}
            <div className="mb-8 md:mb-12">
              <p 
                className="text-base md:text-lg lg:text-xl"
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '160%'
                }}
              >
                お問い合わせの多い質問をまとめました。<br />
                お問い合わせの前に、ご確認ください。
              </p>
            </div>

            {/* FAQ Button */}
            <div className="flex justify-center">
              <Link
                href="/lp/faq"
                className="relative inline-flex py-4 md:py-6 px-8 md:px-12 lg:px-16 justify-center items-center gap-2 rounded-full border-2 md:border-3 border-white cursor-pointer hover:opacity-90 transition-opacity"
                style={{
                  background: '#6FC8E5'
                }}
              >
                <span 
                  className="text-base md:text-lg lg:text-xl"
                  style={{
                    color: '#FFF',
                    fontFamily: '"Zen Kaku Gothic New"',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: '100%'
                  }}
                >
                  よくあるご質問はこちら
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="9" 
                  height="16" 
                  viewBox="0 0 9 16" 
                  fill="none"
                  className="absolute right-6 md:right-8 lg:right-10 flex-shrink-0"
                >
                  <path 
                    d="M0.999838 14.3333L7.6665 7.66667L0.999838 1" 
                    stroke="#FFF" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Store Recruitment Section */}
      <div 
        id="recruitment"
        className="w-full py-16 md:py-24 -mt-24 md:-mt-32"
        style={{ backgroundColor: '#6FC8E5' }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          {/* Store Recruitment Title */}
          <div className="mb-8 md:mb-12">
            <h2 
              className="text-xl md:text-2xl lg:text-3xl"
              style={{
                color: 'var(--accent-yellow, #FFD93B)',
                fontFamily: '"Zen Kaku Gothic New"',
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: '100%'
              }}
            >
              掲載店募集中！
            </h2>
          </div>

          {/* Store Recruitment Button */}
          <div className="flex justify-center">
            <button
              className="relative inline-flex py-4 md:py-6 px-8 md:px-12 lg:px-16 justify-center items-center gap-2 rounded-full border-none cursor-pointer"
              style={{
                background: 'var(--accent-yellow, #FFD93B)'
              }}
              onClick={() => router.push('/lp/merchant')}
            >
              <span 
                className="text-base md:text-lg lg:text-xl"
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '100%'
                }}
              >
                お店の方はこちら
              </span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="9" 
                height="16" 
                viewBox="0 0 9 16" 
                fill="none"
                className="absolute right-6 md:right-8 lg:right-10 flex-shrink-0"
              >
                <path 
                  d="M0.999838 14.3333L7.6665 7.66667L0.999838 1" 
                  stroke="#000" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* Footer Menu */}
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
