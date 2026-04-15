# 네이버 블로그 AI 작성기 — 개발 컨텍스트 (Claude Code용)

## 프로젝트 개요

네이버 블로그 맛집/문화생활/일상 포스팅을 자동으로 작성해주는 AI 웹앱.
가게 이름 직접 입력 → 트렌드 키워드 수집 → 완성된 포스팅 생성.

**깃허브:** https://github.com/donggil-ux/naver-blog-writer
**기술 스택:** React + Vite + Anthropic Claude API

---

## 현재 파일 구조

```
naver-blog-writer/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── README.md
├── SKILL.md                  ← Claude 스킬 파일 (별도 사용)
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx
    └── App.jsx               ← 메인 앱 (전체 로직 포함)
```

---

## 기술 스택 상세

| 항목 | 내용 |
|---|---|
| 프레임워크 | React 18 + Vite 5 |
| 언어 | JSX (TypeScript 미사용) |
| 스타일 | CSS-in-JS (인라인 스타일 객체) |
| 폰트 | Pretendard (CDN import) |
| AI 모델 | `claude-sonnet-4-20250514` (포스팅 생성) |
| 검색 툴 | `web_search_20250305` (키워드 수집) |
| 환경변수 | `VITE_ANTHROPIC_API_KEY` |

---

## API 호출 구조

### 공통 헤더 (모든 fetch에 적용)
```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-calls": "true",
}
```

### 1. 키워드 수집 (`searchWithWeb`)
- 모델: `claude-sonnet-4-20250514`
- 툴: `web_search_20250305`
- max_tokens: 400
- 결과: JSON 배열 `["키워드1", "키워드2", ...]`

### 2. 포스팅 생성
- 모델: `claude-sonnet-4-20250514`
- 툴 없음 (일반 호출)
- max_tokens: 3000
- 결과: 완성된 블로그 포스팅 텍스트

### `searchWithWeb` 함수 구조
```js
const searchWithWeb = async (userMsg, system, maxTokens = 800) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { /* 공통 헤더 */ },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userMsg }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
};
```

> **주의:** `web_search_20250305`는 Anthropic 서버사이드 툴 — 단일 API 호출로 검색+응답 동시 처리. `tool_choice: any`, agentic loop 불필요.

---

## 카테고리 시스템

### 3가지 카테고리
```js
const CATEGORIES = [
  { id: "food",    emoji: "🍽", label: "음식",     sub: "맛집 · 카페" },
  { id: "culture", emoji: "🎨", label: "문화생활", sub: "전시 · 공연 · 팝업" },
  { id: "daily",   emoji: "📅", label: "일상",     sub: "리뷰 · 데일리" },
];
```

### 카테고리별 입력 필드 (`FIELD_CONFIG`)
| 필드 | food | culture | daily |
|---|---|---|---|
| nameLabel | 가게 이름 * | 전시/공연명 * | 주제 * |
| locLabel | 위치 | 장소 | 구매처/장소 |
| dateLabel | 방문일 | 관람일 | 날짜 |
| menusLabel | 주문 메뉴 & 가격 | 티켓 가격 | 가격 |
| showTarget | false | true | true |
| targetLabel | — | 추천 대상 | 추천 대상 |

### 카테고리별 시스템 프롬프트 (`SYSTEM_PROMPT`)
각 카테고리마다 다른 글 구조와 요약표 적용:
- **food:** 서론→분위기→메뉴/맛 솔직후기→결론 + 방문정보 요약표
- **culture:** 서론→공간/구성 소개→관람 포인트/솔직후기→결론(추천대상) + 관람정보 요약표
- **daily:** 서론→특징 소개→직접 써보니/솔직 장단점→결론 + 정보 요약표

### 출력 형식 (공통)
```
[추천 제목 3가지]
1.
2.
3.

[본문]

[방문/관람/정보 요약]  ← 카테고리별 다름

[추천 태그]
#태그 (7~10개)
```

---

## 주요 State 목록

```js
const [category, setCategory]     // "food" | "culture" | "daily"
const [name, setName]             // 가게/전시/주제명
const [location, setLocation]     // 위치/장소/구매처
const [date, setDate]             // 방문일/관람일/날짜
const [menus, setMenus]           // 메뉴+가격 / 티켓가격 / 가격
const [target, setTarget]         // 추천 대상 (culture/daily만)
const [memo, setMemo]             // 방문 메모
const [myStyle, setMyStyle]       // 내 글 스타일 (붙여넣기)
const [showStyle, setShowStyle]   // 스타일 섹션 토글
const [photos, setPhotos]         // 첨부 사진 배열 [{url, name}]
const [loading, setLoading]       // 포스팅 생성 중
const [loadingStep, setLoadingStep] // 로딩 단계 텍스트
const [result, setResult]         // 완성된 포스팅
const [keywords, setKeywords]     // 수집된 키워드 배열
const [copied, setCopied]         // 복사 완료 상태
const [searching, setSearching]   // 가게 검색 중 (현재 숨김)
const [storeInfo, setStoreInfo]   // 자동 검색 결과 (현재 숨김)
const [searchError, setSearchError] // 검색 에러 (현재 숨김)
```

---

## 현재 숨겨진 기능 (코드는 존재)

**가게 자동 검색 (`fetchStoreInfo`)** — 현재 UI에서 숨김 처리됨.
- 검색 버튼, 로딩 UI, 결과 카드 모두 주석 처리 또는 제거
- 코드 자체는 App.jsx에 남아있음
- 다시 활성화하려면 입력 필드에 버튼 + 결과 카드 UI 복원 필요

---

## SEO 글쓰기 원칙 (SKILL.md 기반)

- 메인 키워드를 제목 앞부분에 배치
- 본문에 키워드 5~7회 자연 반복
- 단락 3~4문장 + 단락 사이 빈 줄
- `~해요`, `~했어요` 대화체
- 서론: 독자 공감 TMI 2~3문장으로 시작
- 중요 내용: **굵은 글씨**, [대괄호] 강조
- 이미지 위치: `[이미지 첨부: 설명]` 형식
- 최소 1,500자

---

## 다음 단계 (웹사이트 추가 기능)

- [ ] 내 글 스타일 프리셋 저장 (localStorage)
- [ ] 작성 히스토리 저장 및 불러오기
- [ ] 이미지 드래그앤드롭 순서 변경
- [ ] 가게 자동 검색 기능 복원 및 안정화
- [ ] 모바일 UI 최적화
- [ ] 네이버 에디터 호환 HTML 복사 버튼

---

## Vercel 배포 설정

- **환경변수:** `VITE_ANTHROPIC_API_KEY`
- **빌드 커맨드:** `npm run build`
- **출력 디렉토리:** `dist`
- **프레임워크:** Vite (자동 감지)

---

## 알려진 이슈 및 해결 히스토리

| 이슈 | 원인 | 해결 |
|---|---|---|
| 키워드만 나오고 글 생성 안 됨 | web_search와 블로그 생성 API 호출 혼용 | 키워드/생성 호출 완전 분리 |
| 포스팅이 중간에 잘림 | max_tokens: 1000 부족 | 3000으로 증가 |
| 가게 검색 무반응 | tool_result에 실제 검색결과 미전달 + tool_choice:none 충돌 | searchWithWeb으로 단순화 |
| 검색 속도 느림 | 최대 6회 API 왕복 loop | 단일 호출로 변경 |
| 공유 링크가 이전 버전 | Claude.ai Artifact 링크 고정 특성 | Vercel 배포로 해결 |
