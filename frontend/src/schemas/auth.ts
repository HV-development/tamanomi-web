import { z } from 'zod'

export const emailRegistrationSchema = z.object({
  email: z.string().email('正しいメールアドレスを入力してください。'),
  campaignCode: z.string().optional()
})

// パスワードのZodスキーマ
export const passwordSchema = z
  .string()
  .min(1, 'パスワードを入力してください')
  .min(8, '8文字以上で入力してください')
  .max(255, '255文字以下で入力してください')
  .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]*$/, '英数字混在で入力してください')

export const userRegistrationSchema = z.object({
  token: z.string().min(1, 'トークンが必要です。'),
  nickname: z.string().min(1, 'ニックネームを入力してください。').max(20, 'ニックネームは20文字以内で入力してください。'),
  password: passwordSchema,
  postalCode: z.string().regex(/^\d{7}$/, '郵便番号は7桁の数字で入力してください。'),
  address: z.string().min(1, '住所を入力してください。'),
  birthDate: z.string().min(1, '生年月日を入力してください。'),
  gender: z.enum(['male', 'female', 'other'], { required_error: '性別を選択してください。' }),
})

export type EmailRegistrationData = z.infer<typeof emailRegistrationSchema>
export type UserRegistrationData = z.infer<typeof userRegistrationSchema>
