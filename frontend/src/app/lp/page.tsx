'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const images = [
  "/lp/images/banner-placeholder.png",
  "/lp/images/banner-placeholder.png", 
  "/lp/images/banner-placeholder.png",
];

export default function LPPage() {
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(3) // 2回目のセットの先頭から開始

  // 無限ループのため、画像を複数回複製
  const extendedImages = [
    ...images, // 元の画像
    ...images, // 2回目
    ...images, // 3回目
  ]

  const handleScroll = (direction: 'left' | 'right') => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    
    if (direction === 'right') {
      setCurrentSlide((prev) => {
        const newIndex = prev + 1
        // 3回目のセットの最後に到達したら、1回目のセットの先頭に瞬間移動
        if (newIndex >= images.length * 2) {
          setTimeout(() => setCurrentSlide(0), 500) // 1回目のセットの先頭
          return images.length * 2 // 3回目のセットの最後
        }
        return newIndex
      })
    } else {
      setCurrentSlide((prev) => {
        const newIndex = prev - 1
        // 1回目のセットの最初に到達したら、3回目のセットの最後に瞬間移動
        if (newIndex < 0) {
          setTimeout(() => setCurrentSlide(images.length * 2 - 1), 500) // 3回目のセットの最後
          return -1 // 1回目のセットの最初
        }
        return newIndex
      })
    }
    
    // トランジション完了後にフラグをリセット
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    setCurrentSlide(index) // 2回目のセットの該当位置
    
    // トランジション完了後にフラグをリセット
    setTimeout(() => setIsTransitioning(false), 500)
  }

  return (
    <div className="w-full">
      {/* First View */}
      <div 
        className="relative w-full"
        style={{
          maxWidth: 'none',
          width: '100vw',
          height: '100vh',
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
            src="/lp/images/FV.png"
            alt="ファーストビュー背景"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 w-full">
          <div className="w-full px-4 py-4 md:px-8 md:py-6" style={{ width: '100vw', margin: 0 }}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Image
                  src="/lp/images/horizon-color-white.png"
                  alt="たまのみ"
                  width={328}
                  height={80}
                  className="w-48 h-12 md:w-82 md:h-20"
                  style={{
                    flexShrink: 0
                  }}
                />
              </div>
              <nav className="hidden md:flex items-center space-x-10">
                <a href="#about" className="text-white hover:text-blue-200 transition-colors text-lg">たまのみとは</a>
                <a href="#features" className="text-white hover:text-blue-200 transition-colors text-lg">魅力</a>
                <a href="#howto" className="text-white hover:text-blue-200 transition-colors text-lg">使い方</a>
                <a href="#pricing" className="text-white hover:text-blue-200 transition-colors text-lg">利用料金</a>
                <a href="#stores" className="text-white hover:text-blue-200 transition-colors text-lg">使えるお店</a>
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
                onClick={() => router.push('/lp/merchant')}
              >
                <span className="hidden md:inline">お店の方はこちら</span>
                <span className="md:hidden">お店の方</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="relative z-10 w-full h-full flex items-start justify-center pt-96 md:pt-40">
          <div className="text-center">

            {/* Main Title */}
            <div className="mb-10 md:mb-6" style={{ position: 'relative' }}>
              <h1 
                className="text-4xl md:text-8xl"
                style={{
                  color: '#FFF',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontWeight: '700',
                  lineHeight: '100%'
                }}
              >
                毎日1杯、無料で乾杯
              </h1>
              <Image
                src="/lp/images/fukidashi.svg"
                alt="1軒"
                width={156}
                height={128}
                className="absolute left-8 top-[-80px] md:left-16 md:top-[-120px] w-20 h-16 md:w-40 md:h-32"
              />
            </div>

            {/* Sub Title */}
            <div className="mb-16 md:mb-10">
              <h2 
                className="text-xl md:text-4xl"
                style={{
                  color: '#FFF',
                  fontFamily: '"Shippori Antique"',
                  fontWeight: '400',
                  lineHeight: '100%',
                  letterSpacing: '-2.38px'
                }}
              >
                次のお店はどこに行く?
              </h2>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <button
                className="w-80 md:w-80 px-4 py-3 md:px-6 md:py-4"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '9999px',
                  backgroundColor: '#FF6F61',
                  border: 'none',
                  cursor: 'pointer',
                  flexDirection: 'row',
                  position: 'relative'
                }}
                onClick={() => router.push('/email-registration')}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span 
                    className="text-sm md:text-lg"
                    style={{
                      color: '#FFF',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%'
                    }}
                  >
                    今すぐ始める
                  </span>
                  <span 
                    className="text-lg md:text-2xl"
                    style={{
                      color: '#FFF',
                      fontFamily: '"Zen Kaku Gothic New"',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '100%'
                    }}
                  >
                    一杯無料
                  </span>
                </div>
                <Image
                  src="/lp/images/arrow-right.svg"
                  alt="Arrow right"
                  width={40}
                  height={40}
                  className="w-6 h-6 md:w-10 md:h-10 absolute right-2 top-4 md:right-2 md:top-6"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Decorative drink icons at bottom */}
        <div className="absolute bottom-2 md:bottom-4 left-0 w-full overflow-hidden">
          <Image
            src="/lp/images/drink-icons.png"
            alt="ドリンクアイコン"
            width={1400}
            height={200}
            className="w-full h-16 md:h-auto"
            style={{
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
        </div>
      </div>

      {/* Banner Carousel Section (Second Layer) */}
      <div className="w-full bg-white py-10 md:py-20">
        <div 
          className="w-full"
          style={{
            display: 'flex',
            padding: '40px 16px',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
            alignSelf: 'stretch'
          }}
        >
          {/* Carousel Container */}
          <div className="relative flex items-center justify-center w-full overflow-x-visible" style={{ flexDirection: 'row' }}>
            {/* Left Arrow */}
            <button 
              className="absolute left-2 md:left-4 z-10 hover:opacity-80 transition-opacity bg-white rounded-full p-2 shadow-lg"
              onClick={() => handleScroll('left')}
            >
              <Image
                src="/lp/images/carousel-left.png"
                alt="前へ"
                width={40}
                height={40}
                className="w-8 h-8 md:w-10 md:h-10"
              />
            </button>

            {/* Banner Images */}
            <div className="relative w-full" style={{ maxWidth: '1600px', margin: '0 auto' }}>
              <div className="flex" style={{ gap: '24px' }}>
                {extendedImages.map((src, i) => (
                  <div
                    key={i}
                    className="relative flex-shrink-0 overflow-hidden rounded-lg w-80 h-44 md:w-96 md:h-52"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transform: `translateX(-${currentSlide * (320 + 24)}px)`,
                      transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
                    }}
                  >
                    <Image
                      src={src}
                      alt={`banner-${i}`}
                      fill
                      className="object-cover"
                      priority={i < 2}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow */}
            <button 
              className="absolute right-2 md:right-4 z-10 hover:opacity-80 transition-opacity bg-white rounded-full p-2 shadow-lg"
              onClick={() => handleScroll('right')}
            >
              <Image
                src="/lp/images/carousel-right.png"
                alt="次へ"
                width={40}
                height={40}
                className="w-8 h-8 md:w-10 md:h-10"
              />
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center space-x-2 md:space-x-3">
            {[1, 2, 3].map((index) => (
              <button 
                key={index} 
                className="p-1 hover:opacity-80 transition-opacity"
                onClick={() => goToSlide(index - 1)}
              >
                <Image
                  src={currentSlide === (index - 1) ? "/lp/images/carousel-dot-active.png" : "/lp/images/carousel-dot-inactive.png"}
                  alt={`ページ ${index}`}
                  width={16}
                  height={16}
                  className="w-3 h-3 md:w-4 md:h-4"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="w-full relative min-h-screen">
        {/* Background with split colors */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2" style={{ backgroundColor: '#FFD93B' }}></div>
          <div className="w-1/2" style={{ backgroundColor: '#6FC8E5' }}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center min-h-screen px-4 md:px-8 py-16">
          {/* Central Image */}
          <div className="absolute left-1/2 transform -translate-x-1/2 z-20 w-64 md:w-96">
            <Image
              src="/lp/images/about-section-image.png"
              alt="About Section"
              width={400}
              height={600}
              className="max-w-full h-auto"
            />
          </div>
          
          {/* Left Content */}
          <div className="w-full md:w-1/2 flex justify-center items-center pr-0 md:pr-8 mb-8 md:mb-0">
            <Image
              src="/lp/images/about-left-text.png"
              alt="たまのみ片手に街を歩こう"
              width={300}
              height={200}
              className="max-w-full h-auto w-64 md:w-80"
            />
          </div>
          
          {/* Right Content */}
          <div className="w-full md:w-1/2 flex flex-col justify-center items-center pl-0 md:pl-8">
            <div className="w-full max-w-sm md:w-[350px] flex flex-col justify-center items-center">
              {/* Heading */}
              <div className="mb-6">
                <Image
                  src="/lp/images/about-right-heading.png"
                  alt="About: たまのみとは?"
                  width={200}
                  height={60}
                  className="max-w-full h-auto"
                />
              </div>
              
              {/* Body Text */}
              <div className="text-white text-sm leading-relaxed text-center">
                <p className="mb-4">
                  「たまのみ」は、毎日1軒につきドリンクが1杯無料になる新しい&ldquo;Welcomeドリンク&rdquo;サービスです。
                </p>
                <p className="mb-4">
                  お酒でもソフトドリンクでもOK。
                </p>
                <p>
                  気になるお店をみつけたら、仲間と乾杯したり、自分だけの寄り道を楽しんだり。あなたの「今日はどこで飲もう？」をもっと自由に、もっとおトクにします。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-8">
          {/* Features Title */}
          <div className="flex justify-center mb-16">
            <Image
              src="/lp/images/features-title.png"
              alt="Features"
              width={300}
              height={80}
              className="max-w-full h-auto"
            />
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 max-w-4xl mx-auto">
            {/* Feature 01 */}
            <div className="flex flex-col items-center text-center gap-6">
              <div className="flex-shrink-0">
                <Image
                  src="/lp/images/feature-01-beer.png"
                  alt="1店舗につき1杯無料!"
                  width={300}
                  height={300}
                  className="max-w-full h-auto w-64 md:w-80"
                />
              </div>
              <div className="text-gray-700 text-sm leading-relaxed max-w-md">
                <p className="mb-2">お酒でもソフトドリンクでもOK。</p>
                <p className="mb-2">「たまのみ」の掲載店なら、</p>
                <p className="mb-2">どこでも1杯が無料に！</p>
                <p className="mb-2">ちょっと気になるお店に入ってみたり、</p>
                <p className="mb-2">気分でバーに立ち寄ったり。</p>
                <p>お財布に優しく、気軽に乾杯を楽しめます。</p>
              </div>
            </div>

            {/* Feature 02 */}
            <div className="flex flex-col items-center text-center gap-6">
              <div className="flex-shrink-0">
                <Image
                  src="/lp/images/feature-02-street.png"
                  alt="1日で複数店舗をはしごできる!"
                  width={300}
                  height={300}
                  className="max-w-full h-auto w-64 md:w-80"
                />
              </div>
              <div className="text-gray-700 text-sm leading-relaxed max-w-md">
                <p className="mb-2">1店舗につき1杯無料だから、</p>
                <p className="mb-2">1日で何軒もめぐれるのが「たまのみ」の魅力。</p>
                <p className="mb-2">今日は気の合う仲間とカジュアルに、</p>
                <p className="mb-2">明日はひとりでしっとり。</p>
                <p className="mb-2">その日の気分で、</p>
                <p>さいたまの街を自由にドリンクめぐり！</p>
              </div>
            </div>

            {/* Feature 03 */}
            <div className="flex flex-col items-center text-center gap-6">
              <div className="flex-shrink-0">
                <Image
                  src="/lp/images/feature-03-drink.png"
                  alt="お酒が苦手でも楽しめる!"
                  width={300}
                  height={300}
                  className="max-w-full h-auto w-64 md:w-80"
                />
              </div>
              <div className="text-gray-700 text-sm leading-relaxed max-w-md">
                <p className="mb-2">「たまのみ」は&ldquo;飲める人だけ&rdquo;の</p>
                <p className="mb-2">サービスじゃありません。</p>
                <p className="mb-2">ソフトドリンクも対象だから、</p>
                <p className="mb-2">ノンアル派や飲めない人も安心。</p>
                <p className="mb-2">友達や同僚と一緒に、</p>
                <p>気軽に「乾杯」をシェアできます。</p>
              </div>
            </div>

            {/* Feature 04 */}
            <div className="flex flex-col items-center text-center gap-6">
              <div className="flex-shrink-0">
                <Image
                  src="/lp/images/feature-04-server.png"
                  alt="新しいお店との出会い!"
                  width={300}
                  height={300}
                  className="max-w-full h-auto w-64 md:w-80"
                />
              </div>
              <div className="text-gray-700 text-sm leading-relaxed max-w-md">
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
        className="w-full py-24 md:py-32"
        style={{ backgroundColor: 'rgba(239, 236, 232, 1)' }}
      >
        <div className="max-w-6xl mx-auto px-8">
          {/* How to Use Title */}
          <div className="flex justify-center mb-8">
            <Image
              src="/lp/images/how-to-use-title.png"
              alt="How to Use"
              width={400}
              height={120}
              className="max-w-full h-auto"
            />
          </div>

          {/* How to Use Subtitle */}
          <div className="text-center mb-12">
            <p 
              style={{
                color: '#000',
                textAlign: 'center',
                fontFamily: '"Zen Kaku Gothic New"',
                fontSize: '20px',
                fontWeight: '700',
                lineHeight: '160%'
              }}
            >
              使い方はかんたん！たったの3ステップ
            </p>
          </div>

          {/* Steps Grid */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8 max-w-5xl mx-auto" style={{ marginTop: '24px', marginBottom: '24px' }}>
            {/* Step 01 */}
            <div 
              className="bg-white rounded-lg shadow-lg mx-auto"
              style={{
                display: 'flex',
                padding: '24px 24px',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '32px',
                width: '320px',
                height: '383px'
              }}
            >
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Image
                    src="/lp/images/step-01-number.png"
                    alt="STEP.1"
                    width={80}
                    height={18}
                    className="mx-auto"
                  />
                </div>
                <h4 
                  className="font-bold text-gray-800"
                  style={{ fontSize: '20px' }}
                >
                  お店を見つける
                </h4>
              </div>
              <div>
                <Image
                  src="/lp/images/step-01-image.png"
                  alt="Step 01"
                  width={320}
                  height={200}
                  className="w-full rounded-lg"
                  style={{
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <p 
                className="text-base font-bold leading-relaxed"
                style={{
                  color: '#000',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '16px',
                  fontWeight: '700',
                  lineHeight: '160%'
                }}
              >
                今いる場所の近くや気になるお店をマップやリストでチェック。
              </p>
            </div>

            {/* Step 02 */}
            <div 
              className="bg-white rounded-lg shadow-lg mx-auto"
              style={{
                display: 'flex',
                padding: '24px 24px',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '32px',
                width: '320px',
                height: '383px'
              }}
            >
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Image
                    src="/lp/images/step-02-number.png"
                    alt="STEP.2"
                    width={80}
                    height={18}
                    className="mx-auto"
                  />
                </div>
                <h4 
                  className="font-bold text-gray-800"
                  style={{ fontSize: '20px' }}
                >
                  スマホを見せる
                </h4>
              </div>
              <div>
                <Image
                  src="/lp/images/step-02-image.png"
                  alt="Step 02"
                  width={320}
                  height={200}
                  className="w-full rounded-lg"
                  style={{
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <p 
                className="text-base font-bold leading-relaxed"
                style={{
                  color: '#000',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '16px',
                  fontWeight: '700',
                  lineHeight: '160%'
                }}
              >
                お店でたまのみクーポン画面を見せて、対象ドリンクが1杯無料！
              </p>
            </div>

            {/* Step 03 */}
            <div 
              className="bg-white rounded-lg shadow-lg mx-auto"
              style={{
                display: 'flex',
                padding: '24px 24px',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '32px',
                width: '320px',
                height: '383px'
              }}
            >
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Image
                    src="/lp/images/step-03-number.png"
                    alt="STEP.3"
                    width={80}
                    height={18}
                    className="mx-auto"
                  />
                </div>
                <h4 
                  className="font-bold text-gray-800"
                  style={{ fontSize: '20px' }}
                >
                  はしごして楽しむ
                </h4>
              </div>
              <div>
                <Image
                  src="/lp/images/step-03-image.png"
                  alt="Step 03"
                  width={320}
                  height={200}
                  className="w-full rounded-lg"
                  style={{
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <p 
                className="text-base font-bold leading-relaxed"
                style={{
                  color: '#000',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '16px',
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
      <div className="w-full py-16 md:py-24 relative overflow-hidden">
        {/* Background with confetti */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/lp/images/pricing-confetti.png)',
            backgroundColor: '#6FC8E5',
            height: '890.5px'
          }}
        />
        
        <div className="relative z-10 max-w-6xl mx-auto px-8">
          {/* Pricing Title */}
          <div className="flex justify-center mb-8">
            <Image
              src="/lp/images/pricing-title.png"
              alt="Pricing"
              width={200}
              height={60}
              className="max-w-full h-auto"
            />
          </div>

          {/* Pricing Background Image */}
          <div className="flex justify-center mb-8">
            <Image
              src="/lp/images/pricing-background.png"
              alt="Pricing Information"
              width={900}
              height={506}
              className="max-w-full h-auto rounded-lg"
            />
          </div>

          {/* Disclaimers */}
          <div className="text-center">
            <p 
              className="mb-2"
              style={{
                color: '#FFF',
                fontFamily: '"Zen Kaku Gothic New"',
                fontSize: '16px',
                fontWeight: '400',
                lineHeight: '160%'
              }}
            >
              ※対象ドリンクは店舗により異なります。
            </p>
            <p 
              style={{
                color: '#FFF',
                fontFamily: '"Zen Kaku Gothic New"',
                fontSize: '16px',
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
        className="w-full py-16 md:py-24"
        style={{ backgroundColor: '#FFD93B' }}
      >
        <div className="max-w-6xl mx-auto px-8">
          {/* Stores Title */}
          <div className="flex justify-center mb-8">
            <Image
              src="/lp/images/stores.png"
              alt="Stores"
              width={200}
              height={60}
              className="max-w-full h-auto"
            />
          </div>

          {/* Stores Content */}
          <div className="text-center">
            <p 
              className="mb-8"
              style={{
                color: '#000',
                textAlign: 'center',
                fontFamily: '"Zen Kaku Gothic New"',
                fontSize: '20px',
                fontWeight: '700',
                lineHeight: '160%'
              }}
            >
              掲載店、続々拡大中
            </p>
            
            {/* Store List Button */}
            <div className="flex justify-center">
              <button
                className="text-white font-bold rounded-full"
                style={{
                  display: 'flex',
                  padding: '24px 24px 24px 40px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#FF6B6B'
                }}
              >
                <span>店舗一覧はこちら</span>
                <span>&gt;</span>
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-16 md:py-24 bg-white mt-16">
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
            {/* FAQ Title */}
            <div className="flex justify-center mb-8">
              <Image
                src="/lp/images/faq.png"
                alt="FAQ"
                width={120}
                height={10}
                className="mx-auto"
              />
            </div>

            {/* FAQ Description */}
            <div className="mb-12">
              <p 
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
                お問い合わせの多い質問をまとめました。<br />
                お問い合わせの前に、ご確認ください。
              </p>
            </div>

            {/* FAQ Button */}
            <div className="flex justify-center">
              <button
                className="text-white font-bold"
                style={{
                  display: 'flex',
                  padding: '24px 24px 24px 40px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  borderRadius: '9999px',
                  backgroundColor: '#6FC8E5'
                }}
              >
                <span>よくあるご質問はこちら</span>
                <span>&gt;</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Store Recruitment Section */}
      <div 
        className="w-full py-16 md:py-24 -mt-32"
        style={{ backgroundColor: '#6FC8E5' }}
      >
        <div className="max-w-6xl mx-auto px-8 text-center">
          {/* Store Recruitment Title */}
          <div className="mb-8">
            <h2 
              style={{
                color: 'var(--accent-yellow, #FFD93B)',
                fontFamily: '"Zen Kaku Gothic New"',
                fontSize: '28px',
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
              style={{
                position: 'relative',
                display: 'flex',
                padding: '24px 24px 24px 40px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                borderRadius: '9999px',
                background: 'var(--accent-yellow, #FFD93B)',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => router.push('/lp/merchant')}
            >
              <span 
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontWeight: '700',
                  lineHeight: '100%'
                }}
              >
                お店の方はこちら
              </span>
              <svg 
                width="14" 
                height="7" 
                viewBox="0 0 14 7" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  position: 'absolute',
                  right: '40px',
                  flexShrink: 0
                }}
              >
                <path 
                  d="M1 3.5H13M13 3.5L10 1M13 3.5L10 6" 
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
        <div className="max-w-6xl mx-auto px-8">
          {/* Footer Menu */}
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