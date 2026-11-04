
#!/bin/bash
echo "중복 라우팅 제거 중..."
rm -rf "app/(auth)"
rm -rf "app/(auth)/login"
rm -rf "app/signin"
rm -rf "app/(auth)/signup"
echo "제거 완료!"
ls -la app/ | grep -E "login|auth"
echo "app/login 만 남아야 정상"
