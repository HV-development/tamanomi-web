/**
 * クーポン種別に応じたデフォルト画像URLを取得
 * @param drinkType - ドリンク種別 ('alcohol' | 'soft_drink' | 'other' | null)
 * @returns デフォルト画像のURL、該当なしの場合はnull
 */
export function getDefaultCouponImage(drinkType: 'alcohol' | 'soft_drink' | 'other' | null | undefined): string | null {
  switch (drinkType) {
    case 'alcohol':
      return '/アルコールドリンク.png'
    case 'soft_drink':
      return '/ソフトドリンク.png'
    default:
      return null
  }
}
