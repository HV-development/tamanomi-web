// 位置情報関連のユーティリティ関数

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface LocationError {
  code: number
  message: string
}

/**
 * 現在位置を取得する
 */
export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("このブラウザでは位置情報がサポートされていません"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        let message = "端末とアプリ両方の位置情報をONにしてください"
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "端末とアプリ両方の位置情報をONにしてください"
            break
          case error.POSITION_UNAVAILABLE:
            message = "端末とアプリ両方の位置情報をONにしてください"
            break
          case error.TIMEOUT:
            message = "位置情報の取得がタイムアウトしました"
            break
        }
        
        reject(new Error(message))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5分間キャッシュ
      }
    )
  })
}

/**
 * 2点間の距離を計算（ハーバーサイン公式）
 * @param lat1 地点1の緯度
 * @param lon1 地点1の経度
 * @param lat2 地点2の緯度
 * @param lon2 地点2の経度
 * @returns 距離（メートル）
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // 地球の半径（メートル）
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance)
}

/**
 * 度をラジアンに変換
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * 距離を人間が読みやすい形式にフォーマット
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`
  } else {
    const km = (meters / 1000).toFixed(1)
    return `${km}km`
  }
}