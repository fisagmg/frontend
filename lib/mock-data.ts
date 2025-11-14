// lib/mock-data.ts
export interface NewsItem {
  id: number;
  title: string;
  source: string;
  date: string;
  url: string;
  snippet: string;
  thumbnail?: string;
}

export interface CVEItem {
  id: string;
  title: string;
  cvssScore: number;
  severity: "Low" | "Medium" | "High" | "Critical";
  summary: string;
  tags: string[];
  publishedDate: string;
  os: "Windows" | "Linux" | "macOS" | "iOS" | "Android" | "Other";
  domain:
    | "Network"
    | "Web Application"
    | "Database"
    | "OS/Kernel"
    | "Application"
    | "Cloud"
    | "Container"
    | "Authentication"
    | "Cryptography"
    | "IoT/Device";
  overview?: string;
  impactScope?: string;
  mitigation?: string;
  references?: string[];

  // 🔥 새로 추가된 필드들
  nvdUrl?: string;
  target?: string[];
  attackComplexity?: string;
  privilegesRequired?: string;
  whyDangerous?: string;
  attackScenario?: string;
  labEnvironment?: {
    victim: { description: string; ip: string };
    attacker: { description: string; ip: string };
  };
  prerequisites?: string[];
  keyTakeaways?: string[];
}

export interface Report {
  id: number;
  reportName: string;
  cveName: string;
  cveId: string;
  content: string;
  createdAt: string;
}

export interface LabHistory {
  id: string;
  title: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  summary: string;
  tags: string[];
  completedAt: string;
}

const getSeverityFromCvss = (
  cvssScore: number
): "Low" | "Medium" | "High" | "Critical" => {
  return cvssScore >= 9.0
    ? "Critical"
    : cvssScore >= 7.0
      ? "High"
      : cvssScore >= 4.0
        ? "Medium"
        : "Low";
};

// News는 그대로 유지
export const mockNews: NewsItem[] = [
  {
    id: 1,
    title:
      "대규모 랜섬웨어 공격으로 의료 시스템 마비 - CVE-2024-10001 악용 확인",
    source: "KISA",
    date: "2024-01-15",
    url: "https://example.com",
    snippet:
      "국내 주요 병원 네트워크가 랜섬웨어 공격을 받아 환자 기록 시스템이 일시 중단되었습니다. 공격자는 Apache 취약점을 악용한 것으로 확인되었습니다.",
    thumbnail: "/ransomware-attack-hospital.png",
  },
  {
    id: 2,
    title: "금융권 대상 제로데이 공격 발생 - 긴급 패치 권고",
    source: "FSC",
    date: "2024-01-20",
    url: "https://example.com",
    snippet:
      "국내 은행 시스템을 겨냥한 제로데이 취약점 공격이 발견되어 금융위원회가 긴급 보안 패치를 권고했습니다.",
  },
  {
    id: 3,
    title: "공공기관 개인정보 유출 사고 - SQL Injection 공격 확인",
    source: "KISA",
    date: "2024-02-01",
    url: "https://example.com",
    snippet:
      "정부 산하 공공기관의 웹사이트가 SQL Injection 공격을 받아 약 50만 건의 개인정보가 유출된 것으로 확인되었습니다.",
    thumbnail: "/data-breach-sql-injection.jpg",
  },
].concat(
  Array.from({ length: 27 }, (_, i) => ({
    id: i + 4,
    title: `${["랜섬웨어", "APT", "DDoS", "피싱"][i % 4]} 공격으로 ${["제조업", "유통업", "교육기관", "연구소"][i % 4]} 피해 발생`,
    source: ["KISA", "NIST", "CISA", "SecurityWeek"][i % 4],
    date: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
    url: "https://example.com",
    snippet: `${["Windows", "Linux", "Apache", "Nginx"][i % 4]} 시스템의 알려진 취약점을 악용한 실제 침해 사고가 발생했습니다. 피해 규모와 대응 방안을 분석합니다.`,
    thumbnail:
      i % 3 === 0
        ? undefined
        : `/placeholder.svg?height=80&width=112&query=cyber+attack+${i}`,
  }))
);

// 🔥 CVE 데이터 - 실제 데이터로 교체
export const mockCVEs: CVEItem[] = [
  // CVE-2025-1302: JSONPath-Plus RCE
  {
    id: "CVE-2025-1302",
    title: "JSONPath-Plus 원격 코드 실행 취약점",
    cvssScore: 9.8,
    severity: "Critical",
    summary: "JSONPath-Plus의 vm 샌드박스 우회로 인한 원격 코드 실행 취약점",
    tags: ["RCE", "Node.js", "Sandbox Escape", "npm", "Exploit"],
    publishedDate: "2025-02-15",
    os: "Other",
    domain: "Application",

    // Quick Info
    nvdUrl: "https://nvd.nist.gov/vuln/detail/CVE-2025-1302",
    target: [
      "JSONPath-Plus < 10.3.0",
      "kubernetes-client",
      "860+ npm packages",
    ],
    attackComplexity: "Low",
    privilegesRequired: "None",

    // Overview
    overview: ` • JSONPath-Plus는 JSON 데이터에서 특정 값을 추출하는 오픈소스 라이브러리
      • npm 생태계에서 860개 이상의 패키지에 의존
      • 이 취약점은 Node.js vm 모듈의 샌드박스 탈출 취약점(CVE-2024-21534)의 불완전한 패치로 인해 발생
      • 블랙리스트 기반 필터링이 우회 가능하여, 공격자가 악의적인 JSONPath 표현식을 통해 서버에서 임의의 코드 실행 가능`,

    whyDangerous: `• 광범위한 영향: kubernetes-client를 포함한 수많은 프로덕션 환경에서 사용
    • 체이닝 공격 가능: 초기 침투 후 권한 상승, 데이터 탈취, 랜섬웨어 설치 등 연계 공격
    • 탐지 어려움: 정상적인 JSON 쿼리로 위장 가능`,

    attackScenario: `1. Initial Access: 공격자가 취약한 JSONPath-Plus를 사용하는 API 엔드포인트에 악의적 쿼리 전송

    2. Execution: vm 샌드박스를 우회하여 임의의 Node.js 코드 실행

    3. Persistence: 리버스 쉘을 통해 서버 제어권 확보

    4. Impact: 크립토마이너 설치 또는 데이터 암호화(랜섬웨어)`,

    // Lab Environment
    labEnvironment: {
      victim: {
        description: "Node.js + JSONPath-Plus 10.2.0",
        ip: "10.233.3.66",
      },
      attacker: {
        description: "Kali Linux",
        ip: "10.233.78.36",
      },
    },
    prerequisites: [
      "Node.js 18.x 이상",
      "npm 또는 yarn",
      "기본적인 JavaScript 지식",
    ],

    mitigation: `• JSONPath-Plus 10.3.0 이상으로 업그레이드
• Input validation 강화: 사용자 입력을 JSONPath 쿼리로 사용하지 않기
• 샌드박스 환경 개선: isolated-vm 등 더 안전한 대안 고려
• 모니터링 강화: 비정상적인 프로세스 실행 탐지`,

    keyTakeaways: [
      "의존성 관리의 중요성: 오픈소스 라이브러리의 버전을 항상 최신으로 유지",
      "블랙리스트 필터링의 한계: 화이트리스트 기반 접근이 더 안전",
      "샌드박스 != 완전한 격리: vm 모듈의 한계 이해 필요",
      "Defense in Depth: 여러 계층의 보안 통제 필요",
    ],

    references: [
      "https://nvd.nist.gov/vuln/detail/CVE-2025-1302",
      "https://github.com/JSONPath-Plus/JSONPath",
      "https://nvd.nist.gov/vuln/detail/CVE-2024-21534",
    ],
  },
  {
    id: "CVE-2025-29927",
    title: "Next.js Middleware 인증 우회 취약점",
    cvssScore: 9.1,
    severity: "Critical",
    summary:
      "Next.js의 middleware 우회로 인한 인증 절차 무력화 및 제한된 페이지 접근 취약점",
    tags: [
      "Next.js",
      "Authentication Bypass",
      "Middleware",
      "Web Framework",
      "Node.js",
    ],
    publishedDate: "2025-03-21",
    os: "Other",
    domain: "Web Application",

    // Quick Info
    nvdUrl: "https://nvd.nist.gov/vuln/detail/CVE-2025-29927",
    target: [
      "Next.js < v15.2.3",
      "Next.js < v14.2.25",
      "Next.js < v13.5.9",
      "Next.js < v12.3.5",
      "Next.js v11.x (전체)",
    ],
    attackComplexity: "Low",
    privilegesRequired: "None",

    // Overview
    overview: `• Next.js는 서버 사이드 렌더링(SSR)과 정적 웹 페이지 생성(SSG)을 지원하는 Node.js 기반 오픈소스 웹 프레임워크
    • React 공식 문서에서 권장하는 툴체인 중 하나로, 2025년 4월 기준 전 세계 442만 개 사이트에서 사용
    • 이 취약점은 특정 헤더 값(x-middleware-subrequest)을 조작하여 middleware 실행 여부를 확인하는 내부 로직을 악용
    • 공격자는 인증 절차를 우회하고 제한된 페이지(예: 관리자 페이지)에 무단 접근 가능`,

    whyDangerous: `• 광범위한 영향: 전 세계 442만 개 이상의 Next.js 사이트가 잠재적 위험에 노출
    • 인증 무력화: Middleware를 통한 인증 구현이 완전히 우회 가능
    • 낮은 공격 난이도: 단순 HTTP 헤더 조작만으로 관리자 페이지 접근
    • 민감 정보 노출: 사용자 관리 페이지, 개인정보, 내부 시스템 접근 가능`,

    attackScenario: `1. Initial Access: 공격자가 취약한 Next.js 버전을 사용하는 서버 탐색

    2. Privilege Escalation: x-middleware-subrequest 헤더 조작으로 middleware 인증 우회

    3. Defense Evasion: 서버는 이미 인증이 완료된 것으로 오인

    4. Impact: 관리자 페이지 접근 → 대량의 개인정보 열람 및 탈취 → 외부 유출`,

    // Lab Environment
    labEnvironment: {
      victim: {
        description: "Next.js v15.1.7 (Docker)",
        ip: "192.168.0.3",
      },
      attacker: {
        description: "Kali Linux",
        ip: "192.168.216.133",
      },
    },
    prerequisites: [
      "Docker 설치",
      "Node.js 환경",
      "기본적인 HTTP 요청 지식",
      "Burp Suite 또는 curl 사용 능력",
    ],

    mitigation: `• Next.js v15.2.3 이상으로 업그레이드 (권장)
    • Next.js v14.2.25, v13.5.9, v12.3.5 이상 안전
    • ⚠️ Next.js v11.x는 지원 종료로 패치 불가 → v15로 마이그레이션 필수
    • 임시 대응: WAF/리버스 프록시에서 x-middleware-subrequest 헤더 포함 요청 차단
    • Middleware 대신 서버 사이드 인증 구현 검토`,

    keyTakeaways: [
      "프레임워크 보안의 중요성: 웹 프레임워크의 내부 메커니즘 이해 필요",
      "버전 관리: 지원이 종료된 버전(v11.x) 사용 시 마이그레이션 필수",
      "헤더 검증: 클라이언트가 조작 가능한 헤더를 신뢰하지 말 것",
      "Defense in Depth: Middleware 외에도 다중 인증 계층 구현",
      "패치 메커니즘: crypto.getRandomValues를 활용한 예측 불가능한 난수 검증",
    ],

    references: [
      "https://github.com/vercel/next.js/security/advisories/GHSA-f82v-jwr5-mffw",
      "https://nextjs.org/docs/app/building-your-application/routing/middleware",
      "https://zhero-web-sec.github.io/research-and-things/nextjs-and-the-corrupt-middleware",
      "https://nvd.nist.gov/vuln/detail/CVE-2025-29927",
    ],
  },
  {
    id: "CVE-2024-55879",
    title: "XWiki 원격 임의 코드 실행 취약점",
    cvssScore: 9.0,
    severity: "Critical",
    summary:
      "XWiki의 ConfigurableClass 객체 속성 조작을 통한 Groovy 스크립트 실행 및 원격 코드 실행 취약점",
    tags: ["RCE", "XWiki", "SSTI", "Groovy", "Template Injection", "Wiki"],
    publishedDate: "2024-12-12",
    os: "Linux",
    domain: "Web Application",

    // Quick Info
    nvdUrl: "https://nvd.nist.gov/vuln/detail/CVE-2024-55879",
    target: ["XWiki >= 2.3, < 15.10.9", "XWiki >= 16.0.0-rc-1, < 16.3.0"],
    attackComplexity: "Low",
    privilegesRequired: "Low (Script 권한 필요)",

    // Overview
    overview: `• XWiki는 Java로 개발된 무료 오픈소스 위키 소프트웨어
    • 2025년 2월 기준 미국, 독일, 영국 등 약 4만 개 사이트에서 사용 중
    • 이 취약점은 XWiki의 ConfigurableClass 기능에서 heading 속성을 통한 Velocity 템플릿 인젝션으로 발생
    • 공격자는 Script 권한이 있는 계정을 통해 사용자 객체에 악성 Groovy 코드를 주입하여 서버에서 임의 명령 실행 가능`,

    whyDangerous: `• 광범위한 영향: 전 세계 약 4만 개 사이트가 잠재적 위험에 노출
    • 낮은 공격 난이도: Script 권한만 있으면 웹 UI를 통해 공격 가능
    • 완전한 서버 제어: 리버스 쉘 획득을 통한 시스템 장악
    • 탐지 어려움: 정상적인 관리 기능으로 위장 가능
    • 데이터 유출: 위키 내 모든 문서 및 사용자 정보 접근 가능`,

    attackScenario: `1. Initial Access: 공격자가 XWiki 사용자 계정 탈취 (피싱, 자격 증명 유출 등)

    2. Privilege Escalation: Script 권한이 있는 관리자 계정으로 권한 상승

    3. Execution: 사용자 객체에 ConfigurableClass 추가 후 heading 속성에 악성 Groovy 스크립트 주입

    4. Persistence: 리버스 쉘을 통해 서버 제어권 확보

    5. Impact: 암호화폐 채굴기 설치 또는 랜섬웨어 배포, 데이터 탈취`,

    // Lab Environment
    labEnvironment: {
      victim: {
        description: "XWiki-platform v15.10.5 (Docker)",
        ip: "172.19.0.4",
      },
      attacker: {
        description: "Kali Linux",
        ip: "172.19.0.3",
      },
    },
    prerequisites: [
      "Docker & Docker Compose",
      "Script 권한이 있는 XWiki 계정",
      "기본적인 Velocity 및 Groovy 지식",
      "Netcat 사용 능력",
    ],

    mitigation: `• XWiki v15.10.9 이상 또는 v16.3.0 이상으로 업그레이드
    • 패치 전 모든 중요 데이터 백업 필수
    • Script 권한 최소화: 신뢰할 수 있는 사용자에게만 부여
    • 정기적인 사용자 권한 감사
    • 웹 애플리케이션 방화벽(WAF) 적용`,

    keyTakeaways: [
      "템플릿 인젝션의 위험성: Velocity/Groovy 같은 템플릿 엔진의 입력 검증 중요성",
      "권한 관리: Script 권한은 신뢰할 수 있는 사용자에게만 부여",
      "다층 방어: 단일 보안 통제에 의존하지 말 것",
      "SSTI 방어: 사용자 입력을 템플릿 엔진에 직접 전달하지 말 것",
      "패치 전략: 백업 → 테스트 환경 검증 → 프로덕션 적용",
    ],

    references: [
      "https://github.com/xwiki/xwiki-platform/security/advisories/GHSA-r279-47wg-chpr",
      "https://github.com/xwiki/xwiki-platform/commit/8493435ff9606905a2d913607d6c79862d0c168d",
      "https://jira.xwiki.org/browse/XWIKI-21207",
      "https://www.xwiki.org/xwiki/bin/view/Documentation/AdminGuide/Upgrade",
    ],
  },
  {
    id: "CVE-2024-53677",
    title: "Apache Struts2 파일 업로드 우회 취약점",
    cvssScore: 9.5,
    severity: "Critical",
    summary:
      "Apache Struts2의 File Upload Interceptor 로직 결함을 통한 OGNL 표현식 악용 및 임의 파일 업로드 취약점",
    tags: [
      "RCE",
      "File Upload",
      "Apache Struts2",
      "OGNL",
      "Path Traversal",
      "Web Framework",
    ],
    publishedDate: "2024-12-11",
    os: "Linux",
    domain: "Web Application",

    // Quick Info
    nvdUrl: "https://nvd.nist.gov/vuln/detail/CVE-2024-53677",
    target: [
      "Apache Struts 2.0.0 - 2.3.37",
      "Apache Struts 2.5.0 - 2.5.33",
      "Apache Struts 6.0.0 - 6.3.0.2",
    ],
    attackComplexity: "Low",
    privilegesRequired: "None",

    // Overview
    overview: `• Apache Struts2는 Java EE 웹 애플리케이션 개발을 위한 오픈소스 프레임워크
    • 2025년 1월 기준 전 세계 약 358만 개 사이트에서 사용 중
    • CVE-2023-50164 취약점의 불완전한 패치로 인해 발생
    • OGNL 표현식(top.uploadFileName)을 이용한 파라미터 바인딩 로직 우회
    • 공격자는 임의 경로에 악성 JSP 웹쉘을 업로드하여 서버 장악 가능`,

    whyDangerous: `• 광범위한 영향: 전 세계 358만 개 사이트가 잠재적 위험에 노출
    • 활발한 악용: 2024년 12월 17일부터 실제 공격 시도 다수 보고
    • 낮은 공격 난이도: 파일 업로드 기능만 있으면 공격 가능
    • 완전한 시스템 장악: 웹쉘을 통한 원격 명령 실행
    • 국가 기관 경보: 캐나다, 호주, 벨기에 등 다수 국가에서 긴급 패치 권고`,

    attackScenario: `1. Initial Access: 공격자가 Apache Struts2를 사용하는 파일 업로드 페이지 발견

    2. Exploitation: OGNL 표현식(top.uploadFileName)을 이용하여 파일명 재정의

    3. Execution: 임의 경로(../)에 악성 JSP 웹쉘 업로드 성공

    4. Persistence: 웹쉘을 통해 서버에서 임의 명령 실행

    5. Impact: 데이터베이스 정보 탈취, 랜섬웨어 설치, 또는 추가 공격을 위한 거점 확보`,

    // Lab Environment
    labEnvironment: {
      victim: {
        description: "Apache Struts2 6.3.0.2 (Docker)",
        ip: "192.168.0.5",
      },
      attacker: {
        description: "Kali Linux",
        ip: "192.168.216.129",
      },
    },
    prerequisites: [
      "Docker 환경",
      "Python 3.x",
      "기본적인 HTTP 요청 지식",
      "OGNL 표현식 이해",
    ],

    mitigation: `• Apache Struts2 6.4.0 이상으로 업그레이드 (권장)
    • Struts2 7.0.0 이상에서는 File Upload Interceptor 완전 제거
    • File Upload Interceptor 대신 Action File Upload Interceptor 사용
    • WAF/리버스 프록시에서 의심스러운 파일 업로드 차단
    • 업로드 디렉토리 권한 최소화 및 실행 권한 제거`,

    keyTakeaways: [
      "연속된 취약점: CVE-2023-50164 패치 후에도 유사 우회 기법 발견",
      "OGNL 표현식의 위험성: top, [0] 등의 표현식으로 파라미터 바인딩 조작 가능",
      "Interceptor 이해: File Upload Interceptor의 근본적 결함 인식",
      "방어 깊이: 파일 업로드는 다중 검증 계층 필요",
      "마이그레이션 전략: 레거시 Interceptor에서 안전한 대안으로 전환",
    ],

    references: [
      "https://cwiki.apache.org/confluence/display/WW/S2-067",
      "https://struts.apache.org/core-developers/file-upload-interceptor",
      "https://github.com/EQSTLab/CVE-2024-53677",
      "https://attackerkb.com/topics/YfjepZ70DS/cve-2024-53677",
      "https://www.cyber.gc.ca/en/alerts-advisories/cve-2024-53677-vulnerability-impacting-apache-struts-2",
    ],
  },
];

// Reports와 LabHistory는 첫 번째 CVE 기준으로 생성
export const mockReports: Report[] = [
  {
    id: 1,
    reportName: `${mockCVEs[0].id} 실습 보고서`,
    cveName: mockCVEs[0].title,
    cveId: mockCVEs[0].id,
    content: `# ${mockCVEs[0].id} 실습 보고서\n\n## 실습 개요\n이 보고서는 ${mockCVEs[0].id} 취약점에 대한 실습 내용을 담고 있습니다.\n\n## 실습 내용\n...\n\n## 결론\n...`,
    createdAt: mockCVEs[0].publishedDate,
  },
];

export const mockLabHistory: LabHistory[] = [
  {
    id: mockCVEs[0].id,
    title: mockCVEs[0].title,
    severity: mockCVEs[0].severity,
    summary: mockCVEs[0].summary,
    tags: mockCVEs[0].tags,
    completedAt: mockCVEs[0].publishedDate,
  },
];
