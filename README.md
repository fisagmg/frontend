# 🚀 CVEXPERT-Frontend  
**CVE 취약점 학습 & 실습 플랫폼의 프론트엔드 애플리케이션**

Next.js 기반 UI를 통해 다양한 CVE 취약점을 학습하고, VDI 기반 실습 환경에서 실제 공격을 재현해볼 수 있는 플랫폼입니다.

---

## 📌 프로젝트 소개

**CVExpert Frontend**는  
- **학습(Documentation)**  
- **실습(VM 기반 PoC 환경)**  
- **리포트 작성 및 관리**  

까지 한 번에 제공하는 보안 실습 플랫폼의 프론트엔드입니다.

Next.js + Tailwind CSS 기반 UI로 구성되어 있으며, Guacamole을 통해 사용자에게 브라우저 기반 원격 실습 환경을 제공합니다.

---

## ✨ 주요 기능

### 🎓 1) 학습 모드
- 다양한 **CVE 취약점 목록 조회 및 검색**
- 연도/도메인/OS 등 **필터링 기능**
- MDX 기반 상세 학습 문서 제공
- 학습/실습 진행 현황 표시

### 🧪 2) 실습 모드
- **Guacamole**을 통한 원격 VDI 접속
- VM에서 실제 취약점 공격 실습
- 실습 타이머 및 자동 종료/연장 기능
- 단계별 실습 가이드 제공

### 📝 3) 리포트 관리
- 템플릿 기반 리포트 작성/저장
- 파일 업로드 및 다운로드
- 리포트 상태 관리

### 🤖 4) AI 분석 (관리자 전용)
- 보안 인시던트 AI 분석
- 자동 분석 리포트 생성

### 👤 5) 사용자 관리
- 이메일 인증 기반 회원가입
- OTP 로그인
- 마이페이지(이력/리포트/프로필)
- 관리자 콘솔

### 📰 6) 보안 뉴스
- 보안 최신 뉴스 조회
- 뉴스 상세정보 제공

---

## 🛠 기술 스택

### **Core**
- Next.js 16  
- React 19  
- TypeScript 5  

### **UI**
- Tailwind CSS  
- Radix UI  
- Lucide Icons  
- next-themes (Dark mode)

### **상태 & 데이터**
- React Hook Form  
- Zod  
- Context API  
- Axios / Fetch API  

### **문서 처리**
- MDX  
- remark-gfm  

### **기타**
- date-fns  
- recharts  
- sonner  
- Vercel Analytics  

---

## 📁 프로젝트 구조

```
cve-labhub-frontend/
├── app/
│   ├── admin/
│   ├── analysis/
│   ├── lab/
│   ├── learn/
│   ├── login/
│   ├── mypage/
│   ├── news/
│   ├── reports/
│   ├── signup/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── cve-card.tsx
│   ├── action-cards.tsx
│   ├── header.tsx
│   └── footer.tsx
│
├── lib/
│   ├── api.ts
│   ├── auth-context.tsx
│   └── utils.ts
│
├── hooks/
├── types/
├── public/
├── styles/
└── ...
```

---

## 🚀 설치 및 실행

### 1) 의존성 설치
```bash
npm install
```

### 2) 개발 서버 실행
```bash
npm run dev
```

### 3) 프로덕션 빌드 및 실행
```bash
npm run build
npm start
```

---

## 🔐 환경 변수

`.env.local` 파일 생성 후 입력:

```env
NEXT_PUBLIC_API_BASE=http://localhost:8082
```

| 변수명 | 설명 |
|--------|------|
| `NEXT_PUBLIC_API_BASE` | 백엔드 API 서버 URL |

---

## 📄 주요 페이지

### 🏠 Home (`/`)
- 플랫폼 소개  
- 뉴스 하이라이트  
- 학습/실습 바로가기  

### 📘 Learn (`/learn`)
- CVE 리스트 조회  
- 연도/도메인/OS 필터  
- 검색 기능  

### 💻 Lab (`/lab`)
- 실습 VM 생성 및 접속  
- Guacamole 연동  
- 타이머 & 세션 관리  
- 가이드 패널  

### 👤 MyPage (`/mypage`)
- 실습 이력  
- 리포트 관리  
- 프로필 수정  
- 관리자 기능  

### 📝 Reports (`/reports`)
- 작성/수정  
- 파일 업로드  

### 📰 News (`/news`)
- 최신 보안 뉴스 조회  

