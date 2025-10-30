# cvelabhub
cve 학습 플랫폼의 프론트엔드 애플리케이션입니다.  
React + TypeScript + Next.js 기반으로 구현되었고, **Feature-Sliced Design (FSD)** 아키텍처를 적용하여 전체 파일/폴더 구조와 책임을 명확히 구분했습니다.

---

## 🔍 주요 기술 스택

| 항목                 | 기술                                    |
| ------------------ | ------------------------------------- |
| **프레임워크**          | Next.js (React 기반)                    |
| **언어**             | TypeScript                            |
| **스타일 / UI**       | Tailwind CSS, shadcn/ui, Lucide Icons |
| **상태 관리 / 데이터 패칭** | React Query, Zustand                  |
| **라우팅 구조**         | Next.js App Router                    |
| **아키텍처 패턴**        | Feature-Sliced Design (FSD)           |
| **API 통신**         | Axios (REST API 연동)                   |
| **코드 품질 / 포맷팅**    | ESLint, Prettier                      |
| **디자인 협업 도구**      | Figma, v0                                 |


---

## 🏗 아키텍처: Feature-Sliced Design (FSD)

FSD는 프론트엔드 애플리케이션을 **레이어(Layers)**, **슬라이스(Slices)**, **세그먼트(Segments)**로 나눠 규모가 커져도 유지보수성과 확장성을 확보하도록 돕는 구조입니다.

- **레이어(Layers)**: 앱 전체에서 책임 수준이 다른 상위 구조  
  예: `app`, `pages`, `widgets`, `features`, `entities`, `shared`  
- **슬라이스(Slices)**: 레이어 내 특정 비즈니스 도메인 또는 기능 단위  
- **세그먼트(Segments)**: 슬라이스 내부에서 기술적 역할/책임별 폴더 (`ui`, `api`, `model`, `lib`, `consts`)  
- **Public API 패턴**: 각 슬라이스/세그먼트는 외부 접근 가능한 인터페이스(`index.ts`)를 정의하여 내부 구현 숨김

이 구조 덕분에:

- 새로운 기능 추가 용이  
- 리팩토링 시 영향 범위 명확  
- 팀원 간 코드 위치 예측 가능  

---


## 📂 폴더 구조 예시

```
src/
├─ app/
│  ├─ providers/          # QueryClientProvider, AuthProvider 등 글로벌 Provider
│  ├─ routes/             # 라우터 설정
│  ├─ styles/             # 글로벌 스타일, reset.css
│  └─ index.tsx
│
├─ pages/
│  ├─ HomePage/
│  │   └─ index.tsx       # 홈 (뉴스/최근 CVE/내 진행중 세션 등 조합)
│  ├─ CVEListPage/
│  │   └─ index.tsx       # CVE 전체 목록 페이지
│  ├─ CVEDetailPage/
│  │   └─ index.tsx       # 특정 CVE 상세+실습 시작 버튼
│  ├─ LabSessionPage/
│  │   └─ index.tsx       # VM 세션 화면 (타이머, 터미널 안내 등)
│  ├─ MyReportsPage/
│  │   └─ index.tsx       # 내가 쓴 보고서 목록/열람
│  └─ LoginPage/
│      └─ index.tsx
│
├─ widgets/
│  ├─ MainHeader/
│  │   └─ MainHeader.tsx      # 상단 Navbar (프로필, 로그아웃, 알림 등)
│  ├─ SidebarNav/
│  │   └─ SidebarNav.tsx      # 좌측 사이드바 (CVE / 실습 / 보고서 / 마이페이지)
│  ├─ CVEOverviewSection/
│  │   ├─ CVEOverviewSection.tsx  # 홈에 쓰는 "핫한 취약점 TOP5" 블록
│  │   └─ model.ts
│  ├─ ActiveSessionCard/
│  │   └─ ActiveSessionCard.tsx   # "현재 진행중인 실습 세션" 카드
│  └─ UserSummaryPanel/
│      └─ UserSummaryPanel.tsx    # 마이페이지 상단 요약(완료한 실습 수 등)
│
├─ features/
│  ├─ auth/
│  │   ├─ ui/
│  │   │   └─ LoginForm.tsx       # 아이디/비번 입력 폼
│  │   ├─ model/
│  │   │   ├─ useLogin.ts         # 로그인 mutate 훅
│  │   │   └─ authStore.ts        # zustand or context slice
│  │   └─ api/
│  │       └─ loginApi.ts         # /api/auth/login 호출
│  │
│  ├─ startLabSession/
│  │   ├─ ui/
│  │   │   └─ StartLabButton.tsx  # "실습 시작" 버튼
│  │   ├─ model/
│  │   │   └─ useStartSession.ts  # 세션 생성 요청 훅
│  │   └─ api/
│  │       └─ startSessionApi.ts  # POST /api/lab-sessions
│  │
│  ├─ submitReport/
│  │   ├─ ui/
│  │   │   └─ ReportEditor.tsx    # 보고서 작성/편집 컴포넌트 (제목, 단계, 결과 등)
│  │   ├─ model/
│  │   │   └─ useSubmitReport.ts  # 제출 요청 훅
│  │   └─ api/
│  │       └─ reportApi.ts        # POST /api/reports
│  │
│  ├─ cveFilters/
│  │   ├─ ui/
│  │   │   └─ CVEFilterBar.tsx    # 심각도 / OS / 태그 필터 UI
│  │   ├─ model/
│  │   │   ├─ useCVEFilterStore.ts  # zustand 상태관리 (riskLevel, tag 등)
│  │   │   └─ buildQueryParams.ts  # 필터 → 쿼리스트링 변환
│  │   └─ lib/
│  │       └─ severityColor.ts    # 심각도 배지 색 결정 로직
│  │
│  └─ sessionTimer/
│      ├─ ui/
│      │   └─ SessionTimer.tsx    # "남은 시간 29:31" 이런 타이머 UI
│      ├─ model/
│      │   └─ useCountdown.ts     # 타이머 훅
│      └─ lib/
│          └─ formatTime.ts       # 초 → mm:ss
│
├─ entities/
│  ├─ cve/
│  │   ├─ ui/
│  │   │   ├─ CVECard.tsx         # CVE 요약 카드 (ID, CVSS, 설명)
│  │   │   └─ CVESeverityBadge.tsx
│  │   ├─ model/
│  │   │   ├─ cveTypes.ts         # 타입 정의 { id, cvss, summary, tags... }
│  │   │   ├─ useCVEList.ts       # react-query로 CVE 목록 fetch
│  │   │   └─ useCVEDetail.ts     # 특정 CVE 상세 fetch
│  │   └─ api/
│  │       ├─ fetchCVEList.ts     # GET /api/cves
│  │       └─ fetchCVEDetail.ts   # GET /api/cves/:id
│  │
│  ├─ session/
│  │   ├─ ui/
│  │   │   └─ SessionStatusBadge.tsx   # RUNNING / EXPIRED / DONE 등 상태 뱃지
│  │   ├─ model/
│  │   │   ├─ sessionTypes.ts         # {sessionId, cveId, expiresAt...}
│  │   │   └─ useSessionInfo.ts       # 현재 세션 정보 불러오기
│  │   └─ api/
│  │       └─ fetchSessionInfo.ts     # GET /api/lab-sessions/:id
│  │
│  ├─ report/
│  │   ├─ ui/
│  │   │   └─ ReportListItem.tsx      # 마이페이지 보고서 목록에서 한 줄
│  │   ├─ model/
│  │   │   ├─ reportTypes.ts
│  │   │   └─ useMyReports.ts         # GET /api/reports?userId=me
│  │   └─ api/
│  │       └─ fetchMyReports.ts
│  │
│  └─ user/
│      ├─ ui/
│      │   └─ UserAvatar.tsx          # 프로필 이미지/이름
│      ├─ model/
│      │   ├─ userTypes.ts
│      │   └─ useCurrentUser.ts       # 현재 로그인 유저 정보
│      └─ api/
│          └─ fetchCurrentUser.ts
│
├─ shared/
│  ├─ ui/
│  │   ├─ Button.tsx
│  │   ├─ Card.tsx
│  │   ├─ Modal.tsx
│  │   └─ Input.tsx
│  ├─ hooks/
│  │   ├─ useToggle.ts
│  │   └─ useDebounce.ts
│  ├─ api/
│  │   └─ httpClient.ts              # axios/fetch wrapper, 공통 인터셉터
│  ├─ lib/
│  │   ├─ formatDate.ts
│  │   └─ cn.ts                       # className merge util (tailwind용)
│  └─ config/
│      └─ constants.ts               # BASE_URL, SESSION_MAX_MINUTES 등
│
└─ index.tsx / main.tsx
```
---

## 🚀 시작 및 개발 가이드

### 개발 환경 세팅

1. 레포지토리 클론  
```bash
git clone https://github.com/fisagmg/frontend.git
 ```

2. 의존성 설치

  ```
  npm install
  ```

3. 개발 서버 실행
  
  ```
  npm run dev
  ```

4. 빌드
  
  ```
  npm run build
  ```

**코드 규칙**

- 코드 스타일: ESLint + TypeScript 설정 사용
- FSD 계층/슬라이스/세그먼트 규칙 준수
- 일반 유틸, 재사용 UI 요소 등은 shared 레이어에 위치

