'use client'

import Image from 'next/image'

export default function MaintenancePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* 背景のグラデーションとパターン */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#faf8f4] via-[#f5f2eb] to-[#eae5d9]" />
      
      {/* 装飾的な円形グラデーション */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#007D4F]/10 to-transparent blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[#7FBE26]/8 to-transparent blur-3xl" />
      
      {/* コンテンツ */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* ロゴ */}
        <div 
          className="mb-12 opacity-0 animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          <Image
            src="/logo.svg"
            alt="たまのみ"
            width={280}
            height={280}
            priority
            className="drop-shadow-lg"
          />
        </div>
        
        {/* サービス説明 */}
        <div 
          className="opacity-0 animate-fade-in mb-8"
          style={{ animationDelay: '0.5s' }}
        >
          <p className="text-base md:text-lg text-[#007D4F]/80 leading-relaxed">
            たまのみは さいたま市内の飲食店で<br />
            毎日1軒1杯無料で ドリンクを飲める<br />
            クーポンサービスです
          </p>
        </div>
        
        {/* メッセージ */}
        <div 
          className="opacity-0 animate-fade-in"
          style={{ animationDelay: '0.8s' }}
        >
          <h1 className="text-base md:text-3xl font-medium text-[#007D4F] mb-4 tracking-wide">
            公開までしばらくお待ちください
          </h1>
          
          {/* 装飾的なライン */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#007D4F]/40" />
            <div className="w-2 h-2 rounded-full bg-[#7FBE26]/50 animate-pulse-slow" />
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#007D4F]/40" />
          </div>
        </div>
        
        {/* サブテキスト */}
        <p 
          className="mt-8 text-sm text-[#007D4F]/60 opacity-0 animate-fade-in"
          style={{ animationDelay: '1.1s' }}
        >
          Coming Soon
        </p>
      </div>
      
      {/* フッター */}
      <footer 
        className="absolute bottom-8 text-xs text-[#007D4F]/40 opacity-0 animate-fade-in"
        style={{ animationDelay: '1.3s' }}
      >
        © {new Date().getFullYear()} たまのみ
      </footer>
      
      {/* アニメーション用スタイル */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  )
}

