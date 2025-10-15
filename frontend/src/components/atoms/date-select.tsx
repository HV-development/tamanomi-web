"use client"

import { useState, useEffect, useRef } from "react"

interface DateSelectProps {
  value: string // yyyy/MM/dd形式
  onChange: (value: string) => void
  label?: string
  error?: string
  className?: string
}

export function DateSelect({ value, onChange, label, error, className = "" }: DateSelectProps) {
  // valueを年・月・日に分割
  const parseDate = (dateStr: string) => {
    if (!dateStr) return { year: "", month: "", day: "" }
    const parts = dateStr.split("/")
    return {
      year: parts[0] || "",
      month: parts[1] ? String(parseInt(parts[1])) : "", // パディングを除去して数値化
      day: parts[2] ? String(parseInt(parts[2])) : "",   // パディングを除去して数値化
    }
  }

  const [selectedDate, setSelectedDate] = useState(() => parseDate(value))
  const lastEmittedValue = useRef(value)

  // valueが外部から変更された時に更新
  // 完全な日付形式（yyyy/MM/dd）または空文字列の場合のみ更新
  useEffect(() => {
    // 完全な日付形式（yyyy/MM/dd = 10文字）または空文字列の場合のみ更新
    const isCompleteDate = value === "" || (value.length === 10 && value.split("/").length === 3)
    
    if (isCompleteDate && value !== lastEmittedValue.current) {
      setSelectedDate(parseDate(value))
      lastEmittedValue.current = value
    }
  }, [value])

  // 年の選択肢を生成（1900年から現在年まで）
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)

  // 月の選択肢
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  // 日の選択肢（選択された年月に応じて日数を調整）
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate()
  }

  const days = (() => {
    if (!selectedDate.year || !selectedDate.month) {
      return Array.from({ length: 31 }, (_, i) => i + 1)
    }
    const daysInMonth = getDaysInMonth(
      parseInt(selectedDate.year),
      parseInt(selectedDate.month)
    )
    return Array.from({ length: daysInMonth }, (_, i) => i + 1)
  })()

  const handleDateChange = (field: "year" | "month" | "day", val: string) => {
    const newDate = { ...selectedDate, [field]: val }
    setSelectedDate(newDate)

    // すべてのフィールドが選択されている場合のみonChangeを呼ぶ
    if (newDate.year && newDate.month && newDate.day) {
      const formattedMonth = newDate.month.padStart(2, "0")
      const formattedDay = newDate.day.padStart(2, "0")
      const newValue = `${newDate.year}/${formattedMonth}/${formattedDay}`
      
      // 前回と異なる値の場合のみonChangeを呼ぶ
      if (newValue !== lastEmittedValue.current) {
        lastEmittedValue.current = newValue
        onChange(newValue)
      }
    } else if (!newDate.year && !newDate.month && !newDate.day) {
      // すべて空の場合も通知
      if (lastEmittedValue.current !== "") {
        lastEmittedValue.current = ""
        onChange("")
      }
    }
    // 部分的な選択の場合はonChangeを呼ばない（内部状態のみ更新）
  }

  const selectClassName =
    "px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex gap-2 items-center">
        {/* 年 */}
        <select
          value={selectedDate.year}
          onChange={(e) => handleDateChange("year", e.target.value)}
          className={`flex-1 ${selectClassName}`}
        >
          <option value="">年</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* 月 */}
        <select
          value={selectedDate.month}
          onChange={(e) => handleDateChange("month", e.target.value)}
          className={`flex-1 ${selectClassName}`}
        >
          <option value="">月</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>

        {/* 日 */}
        <select
          value={selectedDate.day}
          onChange={(e) => handleDateChange("day", e.target.value)}
          className={`flex-1 ${selectClassName}`}
        >
          <option value="">日</option>
          {days.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}


