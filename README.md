
# 결제 제외 전체 기능

## 보안
- lib/rate-limit.ts : 5회 실패시 10분 차단
- lib/security.ts : bcrypt, JWT, sanitize

## 학습 기능
- ExamTimer : 실제 시험 타이머
- WrongNoteList : 오답노트, 3회 이상 취약
- LearningStats : 오늘 목표, 연속, 정답률
- BookmarkButton : 별표 저장
- SearchBar : 문제 검색 + 최근 검색어
- ReferralLeaderboard : 추천왕
- CouponInput : 쿠폰 검증
- DarkModeToggle : 다크모드
- PWA : manifest.ts

## 설치
1. unzip
2. prisma/schema.prisma 에 PRISMA_ADDITIONS.prisma 추가
3. npx prisma generate && npx prisma db push
4. 기존 페이지에 컴포넌트 import

## MY 페이지 추가 예시
import LearningStats from '@/components/LearningStats'
import WrongNoteList from '@/components/WrongNoteList'
import SearchBar from '@/components/SearchBar'
import CouponInput from '@/components/CouponInput'
import DarkModeToggle from '@/components/DarkModeToggle'

<LearningStats />
<SearchBar onSearch={...} />
<WrongNoteList />
<CouponInput onApply={...} />
<DarkModeToggle />

## 로그인 보안 적용
app/api/auth/login/route.ts 를 app/api/auth/login_secure/route.ts 로 교체
또는 checkRateLimit 코드 추가

## 쿠폰
WELCOME10 10%, FRIEND20 20%, FIRST50 50%, ELECTRIC15 15%, PASS2026 25%, STUDY30 30%
