"use client"

import React, { useState, useEffect } from "react"

// プログレッシブ表示用のコンポーネント
export const ProgressiveLoader = React.memo(({
    children,
    delay = 0,
    fallback = null
}: {
    children: React.ReactNode
    delay?: number
    fallback?: React.ReactNode
}) => {
    const [isVisible, setIsVisible] = useState(delay === 0)

    useEffect(() => {
        if (delay > 0) {
            const timer = setTimeout(() => {
                setIsVisible(true)
            }, delay)
            return () => clearTimeout(timer)
        }
    }, [delay])

    if (!isVisible) {
        return <>{fallback}</>
    }

    return <>{children}</>
})

// 段階的表示用のコンテナ
export const StaggeredContainer = React.memo(({
    children,
    staggerDelay = 100
}: {
    children: React.ReactNode[]
    staggerDelay?: number
}) => {
    return (
        <>
            {children.map((child, index) => (
                <ProgressiveLoader
                    key={index}
                    delay={index * staggerDelay}
                    fallback={<div className="opacity-0">{child}</div>}
                >
                    {child}
                </ProgressiveLoader>
            ))}
        </>
    )
})

// フェードインアニメーション付きコンポーネント
export const FadeInComponent = React.memo(({
    children,
    delay = 0
}: {
    children: React.ReactNode
    delay?: number
}) => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, delay)
        return () => clearTimeout(timer)
    }, [delay])

    return (
        <div
            className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'
                }`}
        >
            {children}
        </div>
    )
})
