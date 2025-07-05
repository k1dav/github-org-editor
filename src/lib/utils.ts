/**
 * 工具函式庫
 * 提供專案中常用的工具函式和類型檢查
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合併 CSS 類名的工具函式
 * 結合 clsx 和 tailwind-merge 的功能，可以正確處理 Tailwind CSS 類名的合併
 * 
 * @param inputs - CSS 類名或條件式類名
 * @returns 合併後的 CSS 類名字串
 * 
 * @example
 * cn('px-2 py-1', 'text-white', { 'bg-red-500': isError })
 * cn('px-4', 'px-2') // 輸出: 'px-2' (後者覆蓋前者)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 延遲執行函式
 * 用於模擬異步操作或延遲載入
 * 
 * @param ms - 延遲時間（毫秒）
 * @returns Promise
 * 
 * @example
 * await sleep(1000) // 等待 1 秒
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 格式化日期為易讀格式
 * 
 * @param date - 日期物件或日期字串
 * @param locale - 地區設定，預設為 'zh-TW'
 * @returns 格式化的日期字串
 * 
 * @example
 * formatDate(new Date()) // '2024年1月1日'
 * formatDate('2024-01-01', 'en-US') // 'January 1, 2024'
 */
export function formatDate(date: Date | string, locale: string = 'zh-TW'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 格式化相對時間
 * 
 * @param date - 日期物件或日期字串
 * @param locale - 地區設定，預設為 'zh-TW'
 * @returns 相對時間字串
 * 
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000)) // '1 小時前'
 */
export function formatRelativeTime(date: Date | string, locale: string = 'zh-TW'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second')
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month')
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year')
  }
}

/**
 * 安全的 JSON 解析
 * 
 * @param jsonString - JSON 字串
 * @param fallback - 解析失敗時的預設值
 * @returns 解析結果或預設值
 * 
 * @example
 * safeJsonParse('{"key": "value"}', {}) // { key: 'value' }
 * safeJsonParse('invalid json', {}) // {}
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString)
  } catch {
    return fallback
  }
}

/**
 * 截斷字串並加上省略號
 * 
 * @param text - 要截斷的字串
 * @param maxLength - 最大長度
 * @returns 截斷後的字串
 * 
 * @example
 * truncate('This is a long text', 10) // 'This is a...'
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * 移除字串中的特殊字元，只保留字母、數字和連字號
 * 用於生成安全的 URL slug
 * 
 * @param text - 輸入文字
 * @returns 清理後的字串
 * 
 * @example
 * slugify('Hello World!') // 'hello-world'
 * slugify('你好 世界') // 'hello-world' (如果有中文轉換)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * 檢查是否為有效的 email 格式
 * 
 * @param email - 電子郵件地址
 * @returns 是否為有效格式
 * 
 * @example
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid-email') // false
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 生成隨機 ID
 * 
 * @param length - ID 長度，預設為 8
 * @returns 隨機 ID 字串
 * 
 * @example
 * generateId() // 'a1b2c3d4'
 * generateId(12) // 'a1b2c3d4e5f6'
 */
export function generateId(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}