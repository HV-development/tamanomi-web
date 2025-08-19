import type { Notification } from "../types/notification"

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    title: "新しいお店が追加されました！",
    message:
      "大宮区に新しいイタリアンレストラン「ベラ・ノッテ」が加盟店として追加されました。今なら初回利用で特別クーポンをプレゼント！",
    type: "promotion",
    isRead: false,
    createdAt: new Date("2024-01-22T10:00:00"),
    imageUrl: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg",
  },
  {
    id: "notif-2",
    title: "メンテナンスのお知らせ",
    message:
      "1月25日（木）午前2:00〜4:00の間、システムメンテナンスを実施いたします。この間、アプリの一部機能がご利用いただけません。",
    type: "warning",
    isRead: false,
    createdAt: new Date("2024-01-21T15:30:00"),
  },
  {
    id: "notif-3",
    title: "ランクアップおめでとうございます！",
    message: "継続利用ありがとうございます。あなたのランクがシルバーにアップしました！新しい特典をお楽しみください。",
    type: "success",
    isRead: true,
    createdAt: new Date("2024-01-20T12:00:00"),
  },
  {
    id: "notif-4",
    title: "週末限定キャンペーン開催中",
    message:
      "今週末（1/20-21）限定で、対象店舗でのドリンク2杯目が半額になるキャンペーンを開催中です。この機会をお見逃しなく！",
    type: "promotion",
    isRead: true,
    createdAt: new Date("2024-01-19T09:00:00"),
  },
  {
    id: "notif-5",
    title: "利用規約の更新について",
    message: "2024年2月1日より利用規約を一部改定いたします。主な変更点についてはアプリ内でご確認ください。",
    type: "info",
    isRead: true,
    createdAt: new Date("2024-01-18T14:00:00"),
  },
]
