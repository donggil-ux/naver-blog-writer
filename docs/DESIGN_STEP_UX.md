# 네이버 블로그 AI 작성기 — Step 기반 UX 재설계안 (v1)

> **목표**: 단일 폼 → 5단계 흐름으로 전환하되, 기존 `App.jsx` 구조와 state를 최대한 보존.
> **전제**: 현재 코드에 이미 `step`(라인 417), `titleCandidates`, `plannerOutline`, `refBlock`, `bodyGenerating`, `handleGenerateBody`(라인 826) 등 2-pass 생성 기반이 존재. 이것을 그대로 확장.

---

## 1. IA (Information Architecture)

### 1-1. 전체 단계 맵

```
[Step 0: 카테고리 탭]  ─ 항상 상단에 고정. 단계 바깥의 컨텍스트.
  ▼
[Step 1: 주제 & 키워드]    SEO 시작점. 저장 대상: subject + keywords
  ▼
[Step 2: 후기 정보]        메뉴·가격·사진·메모. 저장 대상: review facts
  ▼
[Step 3: 품질 점검]         정보 누락 / 검색 의도 가이드 — AI 호출 X, 클라이언트 규칙
  ▼
[Step 4: 생성 전 설계]      제목 3안 · 첫 문장 3안 · 소제목 아웃라인 — AI 1차 호출
  ▼
[Step 5: 생성 결과 + 체크리스트]  본문 + 발행 전 체크 — AI 2차 호출
```

### 1-2. 사이드 영구 UI (단계 무관)

- 헤더 (로고 / 테마 / 생성 내역)
- 임시저장 배너
- 토스트
- 생성 내역 사이드 패널, 내역 상세 모달

### 1-3. 현재 매핑

| 현재 섹션 | 신규 단계 |
|---|---|
| 카테고리 탭 | Step 0 (고정) |
| 기본정보 (가게/장소/방문일) | Step 1 앞부분 |
| **(신규)** 메인/서브 키워드 | Step 1 뒷부분 |
| 누구랑 / 메모 / 사진 / 메뉴 칩 | Step 2 |
| 내 글 스타일 | Step 2 접힘(고급) |
| **(신규)** 정보 누락 체크 | Step 3 |
| 기존 `step="plan"` 플래너 | Step 4 |
| 기존 `step="done"` 결과 | Step 5 |
| **(신규)** 발행 전 체크리스트 | Step 5 하단 |

---

## 2. 스크린 레벨 컴포넌트 구조

**대원칙**: `src/App.jsx`는 **지휘자(state + 핸들러 + 라우팅)** 역할만 하고, 각 Step 화면을 **`src/steps/`** 디렉토리로 분리. 기존 1456줄을 유지하려 하지 말고, 단계별 파일로 쪼개기.

```
src/
├── App.jsx                     (~500줄로 축소, state hub + step router)
├── components/
│   ├── Stepper.jsx             진행 바 (1/5 ~ 5/5, 클릭 시 뒤로 가기)
│   ├── StickyFooter.jsx        이전/다음 버튼 (스크롤 밖 고정)
│   ├── ChipGroup.jsx           메뉴·키워드·동행 다중 선택 공통화
│   ├── InfoCompleteness.jsx    Step 3 체크 리스트 아이템
│   ├── SkeletonPill.jsx        기존 nb-skeleton-pill 추출
│   └── Toast.jsx
├── steps/
│   ├── Step1Subject.jsx        카테고리별 기본정보 + 키워드 입력/추천
│   ├── Step2Review.jsx         메뉴 칩, 사진, 메모, 동행, myStyle(접힘)
│   ├── Step3Quality.jsx        완성도 점수 + 누락 안내
│   ├── Step4Plan.jsx           기존 titleCandidates + plannerOutline 활용
│   └── Step5Result.jsx         본문 + 복사 버튼 + 체크리스트
├── lib/
│   ├── formModel.js            FormModel 타입 정의 + 검증
│   ├── completeness.js         Step 3 규칙 엔진 (순수 함수)
│   ├── promptBuilder.js        SYSTEM_PROMPT 분해 — subject/review/plan/body 단계별 빌더
│   └── seoRules.js             제목 길이/키워드 포함 등 발행 체크리스트 규칙
└── api/                        (기존 그대로)
```

---

## 3. 유저 플로우

### 3-1. 정상 흐름 (happy path)

```
Step1 → [다음] → Step2 → [다음] → Step3(통과) → [다음] → Step4(AI1) → [제목 선택] → Step5(AI2)
```

### 3-2. Step 3 분기

- **완성도 ≥ 70** → [다음] 활성화, 경고만
- **완성도 < 70** → [다음] 비활성. "이대로 진행" 보조 버튼으로 override (오버라이드 시 텔레메트리 이벤트)

### 3-3. 되돌아가기 (핵심)

- **Stepper의 과거 단계 클릭** → 해당 단계로 이동. **이후 단계의 휘발 데이터는 유지** (뒤로 간 뒤 다시 앞으로 가도 복구).
- 예외: Step 1-2의 값이 **변경**되면 Step 4-5의 생성 결과를 "최신 입력과 다릅니다" 배너와 함께 노출 (자동 삭제 X).

### 3-4. 자동 저장

- 모든 필드 변경 시 → 기존 `draftTimer`(라인 439) 활용. `step` 값도 draft에 포함 저장.
- 임시저장 복원 시 마지막 `step`으로 바로 이동.

### 3-5. 히스토리 복원

- `restoreFromHistory` (라인 540)는 **완료된 글**이면 Step 5로 바로 진입. 모든 중간 state 복원.

---

## 4. React 구현 플랜 (단계별 파일 분해)

### 4-1. App.jsx가 최종적으로 하는 일

```jsx
function App() {
  // 모든 useState (카테고리, FormModel, 생성 결과, history...)
  // 핸들러 (handleGenerate → Step4용 / handleGenerateBody → Step5용)
  // 자동 저장 / 복원
  // step 라우팅
  const commonProps = { form, setForm, theme: t };
  return (
    <Shell>
      <Header ... />
      <CategoryTabs ... />        {/* Step 0 */}
      <Stepper current={step} onJump={setStep} />
      {step === "subject"   && <Step1Subject   {...commonProps} />}
      {step === "review"    && <Step2Review    {...commonProps} />}
      {step === "quality"   && <Step3Quality   {...commonProps} report={completeness(form)} />}
      {step === "plan"      && <Step4Plan      {...commonProps} plan={plan} onPlan={handleGenerate} />}
      {step === "done"      && <Step5Result    {...commonProps} result={result} />}
      <StickyFooter step={step} canNext={canGoNext} onNext={goNext} onPrev={goPrev} />
      <HistoryPanel .../>
    </Shell>
  );
}
```

### 4-2. 단계 enum

```js
export const STEPS = ["subject", "review", "quality", "plan", "done"];
// 기존 "input" → "subject"로 rename. 기존 "plan"/"done"은 이름 보존.
```

### 4-3. goNext / goPrev

```js
const goNext = () => setStep(s => STEPS[Math.min(STEPS.indexOf(s)+1, 4)]);
const goPrev = () => setStep(s => STEPS[Math.max(STEPS.indexOf(s)-1, 0)]);
```

단, **Step 3 → Step 4는 AI 호출을 유발** → `goNext`가 아니라 `handleGenerate()`를 호출해야 함. `StickyFooter`의 next 버튼을 step별로 override.

---

## 5. Step별 state & 책임

기존 state를 **FormModel**이라는 하나의 객체로 묶어서 전달하면 prop drilling이 사라짐. (현재는 개별 setter 수십 개)

### 5-1. FormModel (공용)

```ts
type FormModel = {
  // Step 0
  category: "food" | "culture" | "daily";

  // Step 1 — Subject
  name: string;
  location: string;
  date: string;          // yyyy-mm-dd
  mainKeyword: string;           // 신규
  subKeywords: string[];         // 신규, max 4

  // Step 2 — Review
  menus: string[];               // string → string[]로 승격
  companion: string;
  memo: string;
  photos: File[];
  myStyle: string;

  // Step 2 부가 (가게 검색 부산물)
  storeInfo: StoreInfo | null;

  // Step 2 내부
  target?: string;               // food 카테고리의 타깃 연령대 (옵션)
};
```

### 5-2. Step별 로컬 state

| Step | 로컬 state | 책임 |
|---|---|---|
| 1 | `suggestedKeywords: string[]` | 가게명·카테고리 기반 키워드 자동 추천 (향후 AI) |
| 2 | `menusLoading`, 기존 photo 드래그 | 메뉴 fetch 레이스 가드는 기존 `menuFetchReqRef` 유지 |
| 3 | `report: CompletenessReport` | App에서 계산해서 prop으로 내려줌 |
| 4 | `plan: { titleCandidates, firstLines, outline }` | AI 1차 호출 결과 |
| 5 | `result`, `seoChecklist: Check[]` | AI 2차 호출 결과 + 규칙 기반 체크 |

### 5-3. 완성도 규칙 (Step 3의 `lib/completeness.js`)

```js
export function completeness(form) {
  const checks = [
    { key: "name",          ok: !!form.name,               weight: 15, label: "가게/장소 이름" },
    { key: "mainKeyword",   ok: !!form.mainKeyword,        weight: 20, label: "메인 키워드", hint: "제목/첫 문장 SEO의 핵심" },
    { key: "menus",         ok: form.menus.length > 0,     weight: 15, label: "메뉴·가격" },
    { key: "memo",          ok: form.memo.length >= 30,    weight: 15, label: "방문 경험 메모(30자+)" },
    { key: "photos",        ok: form.photos.length >= 3,   weight: 10, label: "사진 3장 이상" },
    { key: "companion",     ok: !!form.companion,          weight: 5,  label: "누구랑" },
    { key: "location",      ok: !!form.location,           weight: 10, label: "위치" },
    { key: "date",          ok: !!form.date,               weight: 5,  label: "방문일" },
    { key: "subKeywords",   ok: form.subKeywords.length>=2,weight: 5,  label: "서브 키워드 2개+" },
  ];
  const score = checks.reduce((s,c) => s + (c.ok ? c.weight : 0), 0);
  const missing = checks.filter(c => !c.ok);
  return { score, checks, missing, canProceed: score >= 70 };
}
```

### 5-4. 발행 전 체크리스트 규칙 (Step 5의 `lib/seoRules.js`)

```js
export function seoChecklist({ form, result, plan }) {
  const title = plan?.selectedTitle || "";
  const firstLine = result?.firstLine || "";
  const body = result?.body || "";
  return [
    { id: "title-kw",       ok: title.includes(form.mainKeyword),                      label: "제목에 메인 키워드 포함" },
    { id: "title-length",   ok: title.length >= 20 && title.length <= 40,               label: "제목 20~40자" },
    { id: "first-topic",    ok: firstLine.includes(form.mainKeyword),                  label: "첫 문장에 주제 명시" },
    { id: "menu-price",     ok: form.menus.length === 0 || /\d+원/.test(body),         label: "메뉴/가격 본문 포함" },
    { id: "subheadings",    ok: (body.match(/^##\s/gm) || []).length >= 2,             label: "소제목 2개 이상" },
    { id: "photo-flow",     ok: form.photos.length >= 3,                               label: "사진 3장+ (흐름)" },
    { id: "search-allow",   ok: null,                                                   label: "네이버 에디터에서 '검색 허용' 체크 (수동)", manual: true },
  ];
}
```

---

## 6. AI 프롬프트용 데이터 구조

**핵심**: 지금처럼 `SYSTEM_PROMPT[category](style)`에 form 전체를 던지는 방식에서 → **단계별 전용 프롬프트**로 쪼갠다. 각 단계는 책임이 다르고 재시도/수정이 독립적이어야 하기 때문.

### 6-1. Contract (공통)

```ts
type PromptContext = {
  category: "food" | "culture" | "daily";
  subject: SubjectBlock;      // Step 1
  review: ReviewBlock;         // Step 2
  style: StyleBlock;           // myStyle
};

type SubjectBlock = {
  name: string;
  location: string;
  date: string;
  mainKeyword: string;
  subKeywords: string[];
};

type ReviewBlock = {
  menus: { name: string; price?: number }[];
  companion: string;
  memo: string;
  photoCount: number;
  storeInfo?: { address?: string; hours?: string; phone?: string };
};

type StyleBlock = {
  customStyle: string;   // 기존 myStyle
  target?: string;       // 음식 카테고리 타깃
};
```

### 6-2. 단계별 프롬프트 빌더

```js
// lib/promptBuilder.js
export const promptBuilders = {
  /**
   * Step 1 보조 — 키워드 자동 추천 (선택 구현)
   * input:  { name, category, location }
   * output: { suggested: string[] }  // 최대 8개
   */
  suggestKeywords(ctx) { ... },

  /**
   * Step 4 — 제목 3안 + 첫 문장 3안 + 소제목 아웃라인
   * input:  PromptContext
   * output: { titleCandidates: string[3], firstLines: string[3], outline: { heading: string, hint: string }[] }
   * 기존 handleGenerate(라인 777)가 여기에 대응됨
   */
  planPost(ctx) { ... },

  /**
   * Step 5 — 선택된 제목 + 아웃라인 기반 본문 생성
   * input:  PromptContext & { selectedTitle, selectedFirstLine, outline }
   * output: { body: string (markdown), tags: string[], summary: Record<string,string> }
   * 기존 handleGenerateBody(라인 826)가 여기에 대응됨
   */
  writeBody(ctx, selection) { ... },
};
```

### 6-3. 현재 `SYSTEM_PROMPT`에서의 변경점

현재 프롬프트는 모놀리식 (`[제목 3가지] → [정보 요약] → [태그] → [본문]` 을 한 번에 생성). 이를 분해할 때 주의:

- **정보 요약 테이블**과 **추천 태그**는 Step 5의 `writeBody` 결과물에 붙여서 **한 번에 본문 뒤에** 출력 유지 (최상단 표시는 현재처럼 렌더 단에서 순서 조정).
- **제목은 Step 4에서만** 생성. Step 5는 선택된 제목을 이미 받은 상태에서 본문만.
- 프롬프트 분해로 **생성 비용이 1회 → 2회**가 되는 tradeoff는 있지만, 사용자가 제목을 **바꿀 수 있는 선택권**이 생기는 편익이 훨씬 큼.

### 6-4. 직렬화 포맷 (history 저장용)

```ts
type HistoryEntry = {
  id: number;
  createdAt: string;
  isDraft: boolean;
  step: StepId;                    // 신규 — 저장 시점의 단계
  formData: FormModel;             // 기존 확장
  plan?: PlanResult;               // 신규 — Step 4 결과 보존
  result?: BodyResult;             // 기존 result 확장
  keywords: string[];
  storeInfo: StoreInfo | null;
};
```

---

## 7. 마이그레이션 순서 (구현 우선순위)

기획서 우선순위를 코드 작업 순서로 번역:

| Phase | 작업 | 리스크 |
|---|---|---|
| **P0** | `menus: string` → `string[]`로 승격, `resetForm`/`restoreFromHistory`/`saveHistory` 전부 갱신. 기존 기능 그대로 동작해야 함 | 중 (회귀 주의) |
| **P1** | **키워드 입력 UI** — Step 구조 없이 기존 폼에 `mainKeyword`, `subKeywords` 필드만 먼저 추가. `SYSTEM_PROMPT`에 "메인 키워드"를 넘겨서 이미 개선 효과 확인 | 저 |
| **P2** | `lib/completeness.js` + 완성도 배지를 **기존 화면 상단**에 추가. Step 3 화면은 아직 만들지 말고, 규칙 엔진이 잘 도는지 검증 | 저 |
| **P3** | Step 4-5 분리. `handleGenerate`는 **제목/첫 문장/아웃라인만** 뽑고, 사용자가 제목 고르면 `handleGenerateBody`가 본문 생성. 이 부분은 이미 코드에 존재 → **UI만 드러내기** | 중 (프롬프트 수정) |
| **P4** | `Stepper` 컴포넌트 + `StickyFooter` 투입. 기존 화면을 Step 1/2로 **시각적으로만 분리**. 스크롤 길이 축소 | 저 |
| **P5** | Step 3 (품질 점검) 전용 화면 + Step 5 체크리스트 | 저 |
| **P6** | `src/steps/` 파일 분해 리팩터. App.jsx 500줄 타깃 | 중 (기능 변화 없음) |

**P0-P1만 먼저 배포해도 유저가 체감하는 SEO 개선 효과가 가장 큼** — Step UI 없이도 키워드 입력만으로 본문 품질이 올라감.

---

## 8. 스코프 밖 (이번 라운드)

- 키워드 자동 추천의 AI 호출 (우선 빈 입력으로 두고 사용자가 직접 입력)
- Step 4의 "첫 문장 후보 3안 리롤(re-roll)" 버튼
- Step 5 체크리스트의 자동 수정 ("고쳐줘" 버튼)
- 접근성(a11y) 전면 점검 — Stepper의 `aria-current="step"` 정도만 넣고 종료
- 모바일 제스처 (스와이프로 단계 전환)
- i18n

---

## 9. 결정 필요 항목 (사용자 확인 요청)

1. **완성도 하한 점수** — 현재 설계는 70점 미만이면 경고. 50/60/70 중 어느 쪽?
2. **Step 4 AI 호출 타이밍** — Step 3 통과 직후 자동 호출? 아니면 "설계 생성" 버튼을 명시적으로?
3. **현재 생성 내역의 하위 호환** — 기존 entry는 `menus`가 string. 로드 시 `.split(",")`로 마이그레이션 on-the-fly로 충분한지, 아니면 포맷 버전 필드를 추가할지?
4. **P1만 먼저 배포 vs P0-P5 한 번에** — 점진 배포(P1만) 선호? 아니면 Step UX까지 한 번에 나가야 설득력?

---

## 10. 배포/검증 체크

- `npm run build` 통과
- 기존 기능 5종 회귀 테스트:
  (1) 가게 검색 → 메뉴 칩 선택 (2) 생성하기 → 결과 표시 (3) 임시저장 → 복원 (4) 히스토리 → 폼 불러오기 (5) 테마 토글
- 신규 기능:
  - 키워드 입력 → 프롬프트에 반영되는지 (ai 응답 내 키워드 등장 확인)
  - 완성도 70 미만 → 다음 버튼 비활성
  - Step 4 → 제목 선택 → Step 5 본문 생성
  - 체크리스트 통과 항목 수 표시
