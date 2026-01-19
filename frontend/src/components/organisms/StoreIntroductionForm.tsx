"use client"

import React, { useState, useEffect } from 'react';
import { Store } from 'lucide-react';
import type { CreateStoreIntroductionRequest } from '@/types/store-introduction';

interface StoreIntroductionFormProps {
  onSubmit: (data: CreateStoreIntroductionRequest) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
  initialData?: CreateStoreIntroductionRequest | null;
  isEditMode?: boolean;
}

export const StoreIntroductionForm: React.FC<StoreIntroductionFormProps> = ({
  onSubmit,
  onBack,
  isLoading = false,
  initialData = null,
  isEditMode = false,
}) => {
  const [formData, setFormData] = useState<CreateStoreIntroductionRequest>({
    storeName1: '',
    recommendedMenu1: '',
    storeName2: '',
    recommendedMenu2: '',
    storeName3: '',
    recommendedMenu3: '',
  });

  // 初期データがある場合はフォームにセット
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const [errors, setErrors] = useState<Partial<Record<keyof CreateStoreIntroductionRequest, string>>>({});

  const handleChange = (field: keyof CreateStoreIntroductionRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateStoreIntroductionRequest, string>> = {};

    // 1店舗目は必須
    if (!formData.storeName1.trim()) {
      newErrors.storeName1 = '店舗名を入力してください';
    }
    if (!formData.recommendedMenu1.trim()) {
      newErrors.recommendedMenu1 = 'おすすめメニューを入力してください';
    }

    // 2店舗目は任意（ただし店舗名を入力した場合はおすすめメニューも必要）
    if (formData.storeName2.trim() && !formData.recommendedMenu2.trim()) {
      newErrors.recommendedMenu2 = 'おすすめメニューを入力してください';
    }
    if (!formData.storeName2.trim() && formData.recommendedMenu2.trim()) {
      newErrors.storeName2 = '店舗名を入力してください';
    }

    // 3店舗目は任意（ただし店舗名を入力した場合はおすすめメニューも必要）
    if (formData.storeName3.trim() && !formData.recommendedMenu3.trim()) {
      newErrors.recommendedMenu3 = 'おすすめメニューを入力してください';
    }
    if (!formData.storeName3.trim() && formData.recommendedMenu3.trim()) {
      newErrors.storeName3 = '店舗名を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex items-center mb-6">
            <Store className="w-8 h-8 text-green-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditMode ? '店舗紹介の変更' : '店舗紹介'}
            </h1>
          </div>
          
          <p className="text-gray-600 mb-6">
            お気に入りの店舗をご紹介ください。1店舗目は必須、2店舗目・3店舗目は任意です。
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 店舗1 */}
            <div className="border-2 border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">店舗 1</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  店舗名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.storeName1}
                  onChange={(e) => handleChange('storeName1', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.storeName1 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="例: カフェ たまのみ"
                  disabled={isLoading}
                />
                {errors.storeName1 && (
                  <p className="text-red-500 text-sm mt-1">{errors.storeName1}</p>
                )}
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  おすすめメニュー <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.recommendedMenu1}
                  onChange={(e) => handleChange('recommendedMenu1', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.recommendedMenu1 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="例: 特製パスタランチ"
                  disabled={isLoading}
                />
                {errors.recommendedMenu1 && (
                  <p className="text-red-500 text-sm mt-1">{errors.recommendedMenu1}</p>
                )}
              </div>
            </div>

            {/* 店舗2（任意） */}
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">店舗 2 <span className="text-sm font-normal text-gray-500">（任意）</span></h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  店舗名
                </label>
                <input
                  type="text"
                  value={formData.storeName2}
                  onChange={(e) => handleChange('storeName2', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.storeName2 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="例: 居酒屋 さくら"
                  disabled={isLoading}
                />
                {errors.storeName2 && (
                  <p className="text-red-500 text-sm mt-1">{errors.storeName2}</p>
                )}
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  おすすめメニュー
                </label>
                <input
                  type="text"
                  value={formData.recommendedMenu2}
                  onChange={(e) => handleChange('recommendedMenu2', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.recommendedMenu2 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="例: 刺身盛り合わせ"
                  disabled={isLoading}
                />
                {errors.recommendedMenu2 && (
                  <p className="text-red-500 text-sm mt-1">{errors.recommendedMenu2}</p>
                )}
              </div>
            </div>

            {/* 店舗3（任意） */}
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">店舗 3 <span className="text-sm font-normal text-gray-500">（任意）</span></h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  店舗名
                </label>
                <input
                  type="text"
                  value={formData.storeName3}
                  onChange={(e) => handleChange('storeName3', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.storeName3 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="例: ラーメン 一番"
                  disabled={isLoading}
                />
                {errors.storeName3 && (
                  <p className="text-red-500 text-sm mt-1">{errors.storeName3}</p>
                )}
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  おすすめメニュー
                </label>
                <input
                  type="text"
                  value={formData.recommendedMenu3}
                  onChange={(e) => handleChange('recommendedMenu3', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.recommendedMenu3 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="例: 特製味噌ラーメン"
                  disabled={isLoading}
                />
                {errors.recommendedMenu3 && (
                  <p className="text-red-500 text-sm mt-1">{errors.recommendedMenu3}</p>
                )}
              </div>
            </div>

            {/* ボタン */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                マイページに戻る
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (isEditMode ? '変更中...' : '登録中...') : (isEditMode ? '変更する' : '登録する')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

