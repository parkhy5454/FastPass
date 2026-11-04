
prisma/schema.prisma 에 추가:

model User {
  id           String   @id @default(cuid())
  loginId      String   @unique
  password     String
  name         String
  phone        String?
  interests    String[] @default([])
  role         String   @default("USER")
  points       Int      @default(0)
  referredBy   String?  // 추천인 loginId
  referralCode String?  @unique
  createdAt    DateTime @default(now())
}

model Purchase {
  id                  String @id @default(cuid())
  userId              String
  amount              Int
  isReferralBonusPaid Boolean @default(false)
  createdAt           DateTime @default(now())
}

추가 후:
npx prisma generate
npx prisma db push

app/(auth)/signup/page.tsx 수정:
- useSearchParams로 ?ref= 읽기
- 회원가입 body에 referredBy: refCode?.split('-')[0] 추가

app/api/auth/signup/route.ts 수정:
const { referredBy } = await req.json()
if(referredBy){
  await prisma.user.update({where:{loginId: referredBy}, data:{points:{increment:1000}}})
}

결제 완료시:
await fetch('/api/referral/payout', {method:'POST', body: JSON.stringify({userId: paidUserId})})
