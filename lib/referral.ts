import { prisma } from './db'

// 피추천인이 처음 결제했을 때 추천인에게 포인트를 한 번만 지급합니다.
export async function rewardReferrerOnce(userId: string) {
  const p: any = prisma
  const user = await p.user.findUnique({ where: { id: userId } }).catch(() => null)
  if (!user || !user.referredBy || user.referralRewarded) return
  await p.$transaction([
    p.user.update({ where: { id: userId }, data: { referralRewarded: true } }),
    p.user.update({ where: { loginId: user.referredBy }, data: { points: { increment: 5000 }, pointsUpdatedAt: new Date() } }),
  ])
}
