#!/usr/bin/env bash
# 테스트 회원 생성 스크립트 — 실제 회원가입 플로우대로 진행
# Usage: ./scripts/create-test-member.sh

set -e

BASE_URL="http://localhost:8080"

echo "================================================"
echo "  Randsome 테스트 회원 생성 스크립트"
echo "================================================"
echo ""

# ── 입력값 받기 ──────────────────────────────────────────────
read -rp "이메일 아이디 (예: 20211234): " EMAIL_USERNAME
EMAIL="${EMAIL_USERNAME}@sangmyung.kr"

read -rp "비밀번호 (8자 이상): " PASSWORD
read -rp "실명: " LEGAL_NAME
read -rp "성별 (MALE/FEMALE): " GENDER
read -rp "MBTI (예: ENFP): " MBTI
read -rp "인스타그램 ID (선택, 없으면 엔터): " INSTAGRAM_ID
read -rp "자기소개: " SELF_INTRO
read -rp "이상형: " IDEAL_DESC
read -rp "은행명 (예: 국민): " BANK_NAME
read -rp "계좌번호 (숫자만): " ACCOUNT_NUMBER

echo ""
echo "▶ [1/3] 이메일 인증 코드 발송 중... → ${EMAIL}"

curl -s -X POST "${BASE_URL}/v1/auth/email/verification-codes" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${EMAIL}\"}" | python3 -c "
import sys, json
res = json.load(sys.stdin)
if res.get('result') == 'SUCCESS':
    print('   ✅ 인증 코드 발송 완료')
else:
    print('   ❌ 발송 실패:', res.get('error', {}).get('message', '알 수 없는 오류'))
    sys.exit(1)
"

echo ""
read -rp "📧 학교 아웃룩에서 인증 코드를 입력하세요: " VERIFY_CODE

echo ""
echo "▶ [2/3] 인증 코드 확인 중..."

EMAIL_VERIFICATION_TOKEN=$(curl -s -X POST "${BASE_URL}/v1/auth/email/verification-codes/verify" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${EMAIL}\", \"code\": \"${VERIFY_CODE}\"}" | python3 -c "
import sys, json
res = json.load(sys.stdin)
if res.get('result') == 'SUCCESS' and res.get('data'):
    print(res['data']['emailVerificationToken'])
else:
    import sys
    print('ERROR:' + res.get('error', {}).get('message', '인증 실패'), file=sys.stderr)
    sys.exit(1)
")

echo "   ✅ 이메일 인증 완료 (token: ${EMAIL_VERIFICATION_TOKEN:0:10}...)"

echo ""
echo "▶ [3/3] 회원가입 요청 중..."

# instagramId 필드 처리 (빈 값이면 포함하지 않음)
if [ -n "$INSTAGRAM_ID" ]; then
  INSTAGRAM_FIELD="\"instagramId\": \"${INSTAGRAM_ID}\","
else
  INSTAGRAM_FIELD=""
fi

SIGNUP_RESULT=$(curl -s -X POST "${BASE_URL}/v1/members/sign-up" \
  -H "Content-Type: application/json" \
  -d "{
    \"emailVerificationToken\": \"${EMAIL_VERIFICATION_TOKEN}\",
    \"email\": \"${EMAIL}\",
    \"password\": \"${PASSWORD}\",
    \"legalName\": \"${LEGAL_NAME}\",
    \"gender\": \"${GENDER}\",
    \"mbti\": \"${MBTI}\",
    ${INSTAGRAM_FIELD}
    \"selfIntroduction\": \"${SELF_INTRO}\",
    \"idealDescription\": \"${IDEAL_DESC}\",
    \"agreedToTerms\": true,
    \"bankName\": \"${BANK_NAME}\",
    \"accountNumber\": \"${ACCOUNT_NUMBER}\"
  }")

echo "$SIGNUP_RESULT" | python3 -c "
import sys, json
res = json.load(sys.stdin)
if res.get('result') == 'SUCCESS':
    print('   ✅ 회원가입 완료!')
else:
    print('   ❌ 회원가입 실패:', res.get('error', {}).get('message', '알 수 없는 오류'))
    sys.exit(1)
"

echo ""
echo "================================================"
echo "  완료! 아래 정보로 로그인 가능합니다."
echo "  이메일:  ${EMAIL}"
echo "  비밀번호: ${PASSWORD}"
echo "================================================"
