
# FastPass 보안 체크리스트 - 필수!

## 🔴 Critical (오늘 해야 함)

### 1. 비밀번호 해싱 확인
```bash
# DB에서 비밀번호 확인 - $2a$ 또는 $2b$로 시작해야 함 (bcrypt)
SELECT loginId, LEFT(password, 10) FROM "User";
# $2a$12$... → OK (bcrypt)
# plain text → 즉시 해시로 변경!
```

### 2. JWT_SECRET 길이
```bash
# Vercel env 확인
echo $JWT_SECRET | wc -c
# 32자 이상이어야 안전
# 현재: a7f3c9e2b8d4f1a6c5e0b9d2a8f3a7d1f5e0c2b8a4f6e9d → 32자 OK
```

### 3. httpOnly 쿠키 확인
```ts
// app/api/auth/login/route.ts
res.cookies.set('token', token, {
  httpOnly: true,  // ← 이게 없으면 XSS로 토큰 탈취!
  secure: true,
  sameSite: 'strict'
})
```

### 4. Rate Limiting
- 로그인: 5회 실패시 10분 차단
- 회원가입: 1시간에 5개까지
- 현재 구현: lib/rate-limit.ts

### 5. 관리자 API 보호
- /api/admin/* 는 ADMIN만 접근
- middleware.ts에서 자동 체크

## 🟠 High (이번주)

### 6. PDF 업로드 검증
- 확장자 .pdf만
- MIME type application/pdf
- 매직 바이트 %PDF 확인
- 50MB 이하
- 구현: lib/security.ts validatePDFFile()

### 7. Input Sanitization
- 모든 사용자 입력 sanitizeInput()
- < > 제거, javascript: 제거
- 길이 제한 1000자

### 8. SQL Injection 방어
- Prisma 사용 → 자동 방어됨 (OK)
- Raw query 쓰지 말 것!

### 9. XSS 방어
- middleware.ts에서 CSP 헤더 설정
- Content-Security-Policy
- X-Frame-Options: DENY (Clickjacking 방어)

### 10. 환경변수 노출 방지
- .env 절대 git에 커밋 금지!
- .gitignore에 .env 포함 확인

## 🟡 Medium (이번달)

### 11. HTTPS 강제
- Vercel은 자동 HTTPS (OK)
- httpOnly + secure 쿠키

### 12. 로그에 민감정보 금지
- console.log(password) 절대 금지
- console.log(token) 금지

### 13. 에러 메시지
- "아이디 또는 비밀번호가 틀렸습니다" (둘 다 같은 메시지)
- "아이디가 존재하지 않습니다" → 이렇게 하면 아이디 존재 여부 노출됨! 금지

### 14. CORS 설정
- Vercel은 기본적으로 같은 origin만 허용 (OK)

### 15. 파일 업로드 경로 조작 방지
- 파일명 Date.now() + random으로 재생성
- ../../etc/passwd 같은 경로 조작 불가

## ✅ 적용 방법

1. 이 zip 풀기:
   unzip SECURITY_HARDENED.zip -d FastPass

2. 파일 덮어쓰기:
   - middleware.ts (루트)
   - lib/rate-limit.ts, lib/security.ts, lib/prisma.ts
   - app/api/auth/login/route.ts
   - app/api/auth/signup/route.ts
   - app/api/auth/logout/route.ts
   - app/api/auth/me/route.ts
   - app/api/admin/upload-pdf/route.ts
   - app/api/admin/users/route.ts

3. 푸시:
   git add .
   git commit -m "security: harden - rate limit, bcrypt, httpOnly, XSS, CSP, PDF validation"
   git push

4. Vercel env 확인:
   - DATABASE_URL
   - JWT_SECRET (32자 이상)
   - BLOB_READ_WRITE_TOKEN
   - ADMIN_SECRET (추가 권장)

## 🔍 보안 테스트

```bash
# 1. 로그인 6회 실패 - 429 에러 나는지
for i in {1..6}; do curl -X POST https://your-domain/api/auth/login -d '{"loginId":"test","password":"wrong"}' -H "Content-Type: application/json"; done

# 2. XSS 테스트 - <script> 입력시 제거되는지
curl -X POST https://your-domain/api/auth/signup -d '{"loginId":"test<script>","password":"test1234","name":"<img src=x onerror=alert(1)>"}'

# 3. PDF 아닌 파일 업로드 - 거부되는지
curl -X POST https://your-domain/api/admin/upload-pdf -F "file=@malware.exe"

# 4. 관리자 API - 일반 유저로 접근시 403인지
curl https://your-domain/api/admin/users -H "Cookie: token=일반유저토큰"
```

## 📞 보안 이슈 발견시

- 즉시 JWT_SECRET 변경
- 모든 유저 강제 로그아웃 (토큰 무효화)
- DB 비밀번호 전부 재해시
