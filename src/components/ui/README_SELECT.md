# 커스텀 Select 컴포넌트 가이드

이 프로젝트에는 두 가지 커스텀 Select 컴포넌트가 있습니다.

## 1. CustomSelect - 기본 드롭다운

옵션이 적을 때 사용하는 예쁜 드롭다운 컴포넌트입니다.

### 특징
- 클릭하면 드롭다운이 부드럽게 펼쳐짐
- 선택된 항목에 체크 아이콘 표시
- 호버 시 배경색 변경
- 외부 클릭 시 자동으로 닫힘

### 사용 예시

```tsx
import { CustomSelect } from '@/components/ui/CustomSelect';

const MBTI_OPTIONS = [
  { value: 'ISTJ', label: 'ISTJ' },
  { value: 'ISFJ', label: 'ISFJ' },
  // ...
];

<CustomSelect
  label="MBTI"
  options={MBTI_OPTIONS}
  value={formData.mbti}
  onChange={(value) => setFormData({ ...formData, mbti: value })}
  placeholder="MBTI를 선택해주세요"
/>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | ❌ | 레이블 텍스트 |
| `options` | `SelectOption[]` | ✅ | 선택 옵션 배열 `{ value: string, label: string }[]` |
| `value` | `string` | ✅ | 현재 선택된 값 |
| `onChange` | `(value: string) => void` | ✅ | 값 변경 핸들러 (기존 `Select`와 달리 `value`를 직접 받음) |
| `error` | `string` | ❌ | 에러 메시지 |
| `placeholder` | `string` | ❌ | 기본값: `"선택해주세요"` |
| `className` | `string` | ❌ | 추가 스타일 클래스 |
| `id` | `string` | ❌ | HTML id 속성 |

---

## 2. SearchableSelect - 검색 가능한 드롭다운

옵션이 많을 때 사용하는 검색 가능한 Select 컴포넌트입니다.

### 특징
- 검색창이 있어 옵션을 필터링할 수 있음
- 선택된 값을 X 버튼으로 클리어 가능
- 검색 결과가 없을 때 안내 메시지 표시
- 드롭다운 열릴 때 자동으로 검색창에 포커스

### 사용 예시

```tsx
import { SearchableSelect } from '@/components/ui/SearchableSelect';

const DEPARTMENT_OPTIONS = [
  { value: 'computer', label: '컴퓨터과학과' },
  { value: 'business', label: '경영학과' },
  // ... 많은 옵션들
];

<SearchableSelect
  label="학과"
  options={DEPARTMENT_OPTIONS}
  value={formData.department}
  onChange={(value) => setFormData({ ...formData, department: value })}
  placeholder="학과를 선택해주세요"
  searchPlaceholder="학과명 검색..."
/>
```

### Props

`CustomSelect`의 모든 props + 추가 props:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `searchPlaceholder` | `string` | ❌ | 검색창 플레이스홀더, 기본값: `"검색..."` |

---

## 기존 Select와의 차이점

### 기존 Select (HTML `<select>` 기반)
```tsx
<Select
  label="MBTI"
  options={MBTI_OPTIONS}
  value={formData.mbti}
  onChange={(e) => setFormData({ ...formData, mbti: e.target.value })}
  //       ^^^ event 객체를 받음
  placeholder="MBTI를 선택해주세요"
/>
```

### 새로운 CustomSelect / SearchableSelect
```tsx
<CustomSelect
  label="MBTI"
  options={MBTI_OPTIONS}
  value={formData.mbti}
  onChange={(value) => setFormData({ ...formData, mbti: value })}
  //       ^^^^^ 값을 직접 받음
  placeholder="MBTI를 선택해주세요"
/>
```

**주요 차이:**
- `onChange` 핸들러가 `event` 객체 대신 `value`를 직접 전달받습니다.
- `e.target.value` → `value`

---

## 어떤 컴포넌트를 사용해야 할까요?

| 상황 | 추천 컴포넌트 |
|------|-------------|
| MBTI (16개 옵션) | `CustomSelect` |
| 학과 (수십 개 옵션) | `SearchableSelect` |
| 은행 (수십 개 옵션) | `SearchableSelect` |
| 성별 (2개 옵션) | 버튼 그룹 또는 `CustomSelect` |
| 국가 (많은 옵션) | `SearchableSelect` |

**경험 법칙:** 
- **10개 미만** → `CustomSelect`
- **10개 이상** → `SearchableSelect`

---

## 스타일 커스터마이징

두 컴포넌트 모두 Tailwind CSS를 사용합니다:

```tsx
<CustomSelect
  className="mb-6"  // 하단 여백 추가
  label="선택"
  options={options}
  value={value}
  onChange={onChange}
/>
```

테마 색상은 `focus:border-blue-500`, `focus:ring-blue-200`, `bg-blue-50` 등으로 통일되어 있습니다.
