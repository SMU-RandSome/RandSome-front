# Randsome Frontend — Performance Improvement PRD

작성일: 2026-03-21
담당: Claude Code (20년차 FE 관점)

---

## 현황 요약

| 지표 | 현재 상태 |
|------|----------|
| 보안 | ❌ AdminRoute 완전 우회 (미인증 사용자 /admin 접근 가능) |
| 렌더링 | ⚠️ FeedCard(리스트) 미메모, statsConfig 매 렌더 재생성 |
| 네트워크 | ⚠️ TanStack Query 설치됐으나 미사용, 탭 숨김에도 폴링 지속 |
| 애니메이션 | ⚠️ prefers-reduced-motion 미지원, will-change 없음 |
| 빌드 | ⚠️ chunk 분리 없음 (모든 vendor 단일 번들) |
| SEO/Meta | ❌ description·OG 태그 없음, Google Fonts preconnect 없음 |

---

## Phase 1: 보안 (즉시)

### 1-1. AdminRoute 개발용 우회 제거
- **파일**: `src/router.tsx`
- **문제**: `return <Outlet />` 한 줄이 role 체크 코드를 dead code로 만들어 누구나 `/admin` 접근 가능
- **작업**: 우회 제거, 기존 role 체크 코드 복원

---

## Phase 2: 렌더링 성능

### 2-1. FeedCard React.memo 적용
- **파일**: `src/components/ui/FeedCard.tsx`
- **문제**: `feed.map()` 안에서 매 폴링(10s)마다 전체 리스트 리렌더
- **효과**: FeedItem props가 동일하면 재렌더 스킵

### 2-2. statsConfig useMemo 적용
- **파일**: `src/pages/GuestMainPage.tsx`, `src/pages/MemberMainPage.tsx`
- **문제**: `statsConfig` 배열이 매 렌더마다 새 객체로 생성됨
- **효과**: `stats` 값이 바뀔 때만 재계산

### 2-3. TiltCard mousemove → requestAnimationFrame 스로틀
- **파일**: `src/components/ui/TiltCard.tsx`
- **문제**: mousemove 이벤트가 초당 수십~수백 번 발생, 매 이벤트마다 MotionValue 업데이트
- **효과**: 프레임당 1회로 제한, 부드러운 성능

---

## Phase 3: 네트워크 / TanStack Query 마이그레이션

QueryClientProvider는 이미 App.tsx에 설정됨 (staleTime: 5min, retry: 1).
현재 수동 fetch → useQuery/refetchInterval 패턴으로 전환.

### 3-1. useFeed → TanStack Query
- **파일**: `src/hooks/useFeed.ts`
- **개선**:
  - `refetchInterval: 10_000`
  - `refetchIntervalInBackground: false` → 탭 숨김 시 자동 폴링 중단
  - 에러 시 silent swallow 제거 (query onError로 처리)

### 3-2. useDashboard → TanStack Query
- **파일**: `src/hooks/useDashboard.ts`
- **개선**:
  - `queryKey: ['dashboard']` → 여러 컴포넌트에서 호출해도 요청 1번만
  - staleTime 5분 (전역 기본값 상속)

### 3-3. useAnnouncements → TanStack Query
- **파일**: `src/hooks/useAnnouncements.ts`
- **개선**:
  - `queryKey: ['announcements']`
  - 중복 요청 자동 dedup

---

## Phase 4: CSS / 애니메이션 성능

### 4-1. prefers-reduced-motion 지원
- **파일**: `src/index.css`
- **문제**: 모든 animation이 접근성 설정 무시
- **작업**: `@media (prefers-reduced-motion: reduce)` 블록으로 모든 CSS 애니메이션 비활성화

### 4-2. 장식 orb에 will-change 추가
- **파일**: `src/index.css`
- **문제**: float/morph 애니메이션이 매 프레임 레이아웃 재계산 유발
- **작업**: `animate-morph`, `animate-float*` 클래스에 `will-change: transform` 추가
  (blur-3xl 필터가 있으므로 이미 composite layer지만 명시적 힌트 추가)

---

## Phase 5: 빌드 최적화

### 5-1. Vite manual chunk 분리
- **파일**: `vite.config.ts`
- **문제**: 모든 vendor(React, motion, lucide, react-router, TanStack Query) 단일 청크
- **작업**: `rollupOptions.output.manualChunks`로 vendor별 분리
  - 각 라이브러리 버전 변경 시 해당 청크만 캐시 무효화
  - 초기 번들 병렬 로드

---

## Phase 6: SEO & 리소스 로딩

### 6-1. index.html 메타 + 리소스 힌트
- **파일**: `index.html`
- **작업**:
  - `<meta name="description">` 추가
  - `<meta property="og:*">` OG 태그 추가
  - `<meta name="theme-color">` 추가
  - Google Fonts `preconnect` 추가 (CSS import보다 DNS/TLS 선행 처리)
  - `<meta name="viewport">` 개선 (viewport-fit=cover for notch)

---

## 작업 순서

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
```

각 Phase 완료 후 `pnpm build` 통과 확인.
