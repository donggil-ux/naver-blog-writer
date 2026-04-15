# 🍃 네이버 블로그 AI 작성기

> 가게 이름·메모·사진만 넣으면 SEO 최적화된 네이버 블로그 포스팅을 자동 생성해주는 AI 웹앱

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google&logoColor=white)

---

## ✨ 소개

맛집·문화생활·일상 3개 카테고리의 네이버 블로그 포스팅을 자동으로 작성해주는 웹앱입니다.
가게 이름과 간단한 메모만 입력하면:

1. 🔍 웹 검색으로 가게 정보·트렌드 키워드 자동 수집
2. ✍️ SEO 상위 노출 규칙에 맞춰 포스팅 작성
3. 📋 네이버 스마트에디터에 바로 붙여넣기 가능한 HTML로 출력

---

## 🎯 주요 기능

### 카테고리별 포스팅
| 카테고리 | 내용 |
|---|---|
| 🍽 **음식** | 맛집·카페 방문 후기 (분위기→메뉴/맛→결론 + 방문정보 요약표) |
| 🎨 **문화생활** | 전시·공연·팝업 관람 후기 (공간 소개→관람 포인트→추천 대상) |
| 📅 **일상** | 제품 리뷰·데일리 기록 (특징 소개→사용 경험→장단점) |

### AI 기능
- **🔍 가게 자동 검색** — 이름 옆 검색 버튼 한 번으로 주소·영업시간·메뉴·전화·주차 정보 자동 입력
- **🔑 트렌드 키워드 수집** — `web_search_20250305` 툴로 네이버 블로그 상위 노출 키워드 실시간 수집
- **✍️ 내 글 스타일 학습** — 기존 블로그 글을 붙여넣으면 동일한 말투·리듬으로 작성
- **📸 사진 드래그 순서 변경** — 썸네일을 드래그해서 원하는 순서로 배치, 순서 번호 배지 표시
- **📋 네이버 에디터 호환 복사** — 표·굵은 글씨·제목이 포함된 HTML을 클립보드에 복사, 스마트에디터에 그대로 붙여넣기 가능

### UX
- 📱 **모바일·아이패드·데스크톱 반응형** — 브레이크포인트 3단계 (≤480 / 481-900 / ≥901)
- 🎨 Pretendard 폰트 + 미니멀 그린 팔레트
- ⚡ 단계별 로딩 표시 (키워드 수집 → 포스팅 작성)
- 🍎 iOS 입력 줌 방지 적용

---

## 🚀 시작하기

### 사전 준비
- **Node.js** 18 이상
- **Google Gemini API 키** — [Google AI Studio](https://aistudio.google.com/apikey)에서 무료 발급

### 설치

```bash
git clone https://github.com/donggil-ux/naver-blog-writer.git
cd naver-blog-writer
npm install
```

### 환경변수 설정

API 호출은 `api/gemini.js` 서버리스 프록시를 경유하므로 **`VITE_` 프리픽스 없이** 서버 전용으로 설정합니다.

**로컬 개발 (`.env` 파일):**
```env
Google_API_KEY=AIza...
```

**Vercel 배포:** 대시보드 → Settings → Environment Variables에서 `Google_API_KEY` 추가 → 재배포

> ⚠️ `.env` 파일은 절대 커밋하지 마세요 (`.gitignore`에 포함되어 있습니다)
> 🔒 API 키는 서버에서만 사용되며 브라우저에 노출되지 않습니다
> 💡 Gemini 2.5 Flash는 **무료 티어** (분당 15회 / 일 1,500회)로 개인 블로그 용도에 충분합니다

### 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 빌드

```bash
npm run build      # dist/ 폴더에 빌드
npm run preview    # 빌드 결과 미리보기
```

---

## 🛠 기술 스택

| 분야 | 스택 |
|---|---|
| **프레임워크** | React 18 + Vite 5 |
| **언어** | JSX |
| **스타일** | CSS-in-JS 인라인 스타일 + CSS 미디어 쿼리 |
| **폰트** | Pretendard (CDN) |
| **AI 모델** | `gemini-2.5-flash` (Google) |
| **웹 검색** | Google Search grounding (`google_search` 툴) |
| **API 프록시** | Vercel Serverless (`api/gemini.js`) |
| **배포** | Vercel |

---

## 📂 프로젝트 구조

```
naver-blog-writer/
├── api/
│   └── gemini.js     # Vercel 서버리스 프록시 (Gemini API 호출 + 키 보호)
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx       # 메인 앱 (전체 로직)
│   └── main.jsx      # React 엔트리
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── CONTEXT.md        # 개발 컨텍스트 (API 구조, state, 이슈 히스토리)
└── SKILL.md          # Claude 스킬 정의 (네이버 블로그 SEO 규칙)
```

---

## 🧠 동작 원리

```
[사용자 입력]
    ↓
[선택] 🔍 가게 검색 → gemini-2.5-flash + Google Search → JSON 파싱 → 폼 자동 입력
    ↓
🚀 생성 버튼
    ↓
1️⃣ 트렌드 키워드 수집
   gemini-2.5-flash + Google Search grounding → JSON 배열
    ↓
2️⃣ 포스팅 작성
   gemini-2.5-flash (maxOutputTokens 8000)
   + 카테고리별 시스템 프롬프트
   + 내 글 스타일 가이드
    ↓
[결과물]
   - 텍스트 복사
   - 📋 에디터용 HTML 복사 (ClipboardItem text/html)
```

---

## 🌐 Vercel 배포 설정

| 항목 | 값 |
|---|---|
| **빌드 커맨드** | `npm run build` |
| **출력 디렉토리** | `dist` |
| **루트 디렉토리** | `.` (리포 루트) |
| **환경변수** | `Google_API_KEY` |
| **프레임워크** | Vite (자동 감지) |

---

## 🗺 로드맵

- [x] 🍽 음식·🎨 문화생활·📅 일상 3개 카테고리
- [x] 트렌드 키워드 자동 수집
- [x] 내 글 스타일 학습
- [x] 이미지 드래그로 순서 변경
- [x] 가게 자동 검색 복원
- [x] 모바일·아이패드 반응형
- [x] 네이버 에디터 호환 HTML 복사
- [ ] 내 글 스타일 프리셋 저장 (localStorage)
- [ ] 작성 히스토리 저장 및 불러오기
- [ ] 다크 모드

---

## ⚠️ 보안 주의사항

- ✅ API 키는 Vercel 서버리스 함수(`api/gemini.js`)에서만 사용되며 **브라우저에 노출되지 않습니다**
- ✅ CORS 이슈도 같은 도메인 경유로 해결됨
- ⚠️ 공개 배포 시에는 본인만 쓸 수 있도록 Vercel의 **Password Protection**이나 **Deployment Protection** 기능을 활성화하는 것을 권장합니다 (남용 방지)
- 💡 Gemini 2.5 Flash는 **무료 티어**가 넉넉하지만 도용 방지를 위해 접근 제어는 해두세요

---

## 📚 관련 문서

- [CONTEXT.md](./CONTEXT.md) — 개발 컨텍스트 (API 구조, state, 이슈 히스토리)
- [SKILL.md](./SKILL.md) — 네이버 블로그 SEO 규칙 & 글쓰기 스타일 가이드

---

## 📝 라이선스

개인 프로젝트 — 자유롭게 참고·수정 가능

---

Made with 🍃 by [@donggil-ux](https://github.com/donggil-ux)
