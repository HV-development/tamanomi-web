'use client';

import { useState } from 'react';

export default function BasicTest() {
  const [showDrink2, setShowDrink2] = useState(false);

  return (
    <div className="p-4 border-2 border-green-500">
      <h3 className="text-lg font-bold mb-2">基本テスト</h3>

      <button
        onClick={() => {
          console.log('Button clicked, current state:', showDrink2);
          setShowDrink2(!showDrink2);
        }}
        className="px-4 py-2 bg-green-500 text-white rounded mb-4"
      >
        画像切り替え ({showDrink2 ? 'drink2' : 'drink1'})
      </button>

      <div className="w-32 h-32 border border-gray-300 bg-gray-100 flex items-center justify-center">
        {showDrink2 ? (
          <img
            src="/drink2.svg"
            alt="飲んでいる"
            className="w-24 h-24"
            onLoad={() => console.log('drink2.svg loaded')}
            onError={() => { }}
          />
        ) : (
          <img
            src="/drink1.svg"
            alt="飲む前"
            className="w-24 h-24"
            onLoad={() => console.log('drink1.svg loaded')}
            onError={() => { }}
          />
        )}
      </div>

      <div className="mt-2 text-sm">
        <p>表示中: {showDrink2 ? 'drink2.svg' : 'drink1.svg'}</p>
      </div>
    </div>
  );
}
