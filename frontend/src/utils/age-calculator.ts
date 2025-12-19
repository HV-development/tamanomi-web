/**
 * 年齢計算ユーティリティ
 */

/**
 * 生年月日から年齢を計算
 * @param birthDate 生年月日（yyyy-mm-dd形式またはDate型）
 * @returns 年齢
 */
export function calculateAge(birthDate: string | Date): number {
  const today = new Date();
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  // まだ誕生日が来ていない場合
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * 成人判定（20歳以上かどうか）
 * @param birthDate 生年月日（yyyy-mm-dd形式またはDate型）
 * @returns 20歳以上の場合true
 */
export function isAdult(birthDate: string | Date): boolean {
  return calculateAge(birthDate) >= 20;
}



