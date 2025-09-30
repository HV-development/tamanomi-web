'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function SimpleDrinkTest() {
  const [currentImage, setCurrentImage] = useState<'drink1' | 'drink2'>('drink1');

  const handleClick = () => {
    console.log('Button clicked, current image:', currentImage);
    if (currentImage === 'drink1') {
      setCurrentImage('drink2');
    } else {
      setCurrentImage('drink1');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">シンプルテスト</h2>
      <div className="mb-4">
        <p>現在の画像: {currentImage}</p>
        <button 
          onClick={handleClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          画像切り替え
        </button>
      </div>
      <div className="w-32 h-32 border-2 border-gray-300">
        <Image
          src={`/${currentImage}.svg`}
          alt={currentImage === 'drink1' ? '飲む前' : '飲んでいる'}
          width={128}
          height={128}
          className="w-full h-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
