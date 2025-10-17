"use client"

import React from "react"

// スケルトンローディング用のコンポーネント
export const SkeletonCard = React.memo(() => (
    <div className="bg-white rounded-2xl border border-green-200 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        </div>
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
        </div>
    </div>
))

export const SkeletonRankCard = React.memo(() => (
    <div className="bg-white rounded-2xl border border-green-200 p-4 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
                <div className="h-5 bg-gray-200 rounded w-40"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
            <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded-full mx-auto w-48"></div>
                <div className="flex items-center justify-center gap-4">
                    <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-5 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
    </div>
))

export const SkeletonMenuButton = React.memo(() => (
    <div className="w-full bg-white rounded-2xl border border-green-200 p-4 animate-pulse">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
        </div>
    </div>
))

export const SkeletonMyPage = React.memo(() => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
            <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="w-12"></div>
            </div>
        </div>

        <div className="p-4 space-y-4 max-w-md mx-auto">
            {/* プロフィールカード */}
            <SkeletonCard />

            {/* ランクカード */}
            <SkeletonRankCard />

            {/* メニューボタン群 */}
            <div className="space-y-3">
                <SkeletonMenuButton />
                <SkeletonMenuButton />
                <SkeletonMenuButton />
                <SkeletonMenuButton />
                <SkeletonMenuButton />
                <SkeletonMenuButton />
                <SkeletonMenuButton />
            </div>
        </div>
    </div>
))
