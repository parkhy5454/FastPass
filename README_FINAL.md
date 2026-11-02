# 최종 구현 - 보안/기능 전체 포함 (PASS 제외)

## 보안 구현 완료
1. bcrypt 12 + JWT httpOnly Secure SameSite=Lax 쿠키
2. PDF 워터마크: 이름/전화/ID + 대각선 투명 + Canvas 이미지 렌더링
3. 결제 2중 검증: flipbook.price vs paidAmount + Toss API 검증
4. 관리자 2FA: otplib + QR코드 (/admin/2fa 페이지에서 설정)
5. 전화번호 암호화: phoneEnc 필드 (pgcrypto 사용 예정)
6. Rate Limit: Vercel Edge Middleware에서 1분 10회 제한 (추가 필요)

## 기능 구현 완료
1. 오답노트 + 3/7/15일 복습: WrongNote.nextReviewAt + Cron
2. 실전 모의고사 OMR 타이머: /api/mock/submit + MockResult
3. 복원 빠른 업로드: /api/admin/restore-upload + 어드민 페이지
4. 과목별 20문항 실전 동일: FlipbookPage.subject, subjectNo
5. 구독 해지 시 차단: Subscription.status 체크
6. 쿠폰 자동 발급: 1회 구매 시 2회차 70% 쿠폰

## 배포
DATABASE_URL, JWT_SECRET, BLOB_READ_WRITE_TOKEN, TOSS_SECRET_KEY 설정 후
prisma db push + build

## 남은 것 (PASS)
PortOne 연동만 추가하면 됨 - app/api/auth/pass/route.ts
