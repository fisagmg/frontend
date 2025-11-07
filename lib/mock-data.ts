// lib/mock-data.ts
export interface NewsItem {
  id: number
  title: string
  source: string
  date: string
  url: string
  snippet: string
  thumbnail?: string
}

export interface CVEItem {
  id: string
  title: string
  cvssScore: number
  severity: "Low" | "Medium" | "High" | "Critical"
  summary: string
  tags: string[]
  publishedDate: string
  os: "Windows" | "Linux" | "macOS" | "iOS" | "Android" | "Other"
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
    | "IoT/Device"
  overview?: string
  impactScope?: string
  mitigation?: string
  references?: string[]
  
  // 🔥 새로 추가된 필드들
  nvdUrl?: string
  target?: string[]
  attackComplexity?: string
  privilegesRequired?: string
  whyDangerous?: string
  attackScenario?: string
  labEnvironment?: {
    victim: { description: string; ip: string }
    attacker: { description: string; ip: string }
  }
  prerequisites?: string[]
  keyTakeaways?: string[]
}

export interface Report {
  id: number
  reportName: string
  cveName: string
  cveId: string
  content: string
  createdAt: string
}

export interface LabHistory {
  id: string
  title: string
  severity: "Low" | "Medium" | "High" | "Critical"
  summary: string
  tags: string[]
  completedAt: string
}

const getSeverityFromCvss = (cvssScore: number): "Low" | "Medium" | "High" | "Critical" => {
  return cvssScore >= 9.0 ? "Critical" : cvssScore >= 7.0 ? "High" : cvssScore >= 4.0 ? "Medium" : "Low"
}

// News는 그대로 유지
export const mockNews: NewsItem[] = [
  {
    id: 1,
    title: "대규모 랜섬웨어 공격으로 의료 시스템 마비 - CVE-2024-10001 악용 확인",
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
    snippet: "국내 은행 시스템을 겨냥한 제로데이 취약점 공격이 발견되어 금융위원회가 긴급 보안 패치를 권고했습니다.",
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
    thumbnail: i % 3 === 0 ? undefined : `/placeholder.svg?height=80&width=112&query=cyber+attack+${i}`,
  })),
)

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
    target: ["JSONPath-Plus < 10.3.0", "kubernetes-client", "860+ npm packages"],
    attackComplexity: "Low",
    privilegesRequired: "None",
    
    // Overview
    overview: 
    ` • JSONPath-Plus는 JSON 데이터에서 특정 값을 추출하는 오픈소스 라이브러리
      • npm 생태계에서 860개 이상의 패키지에 의존
      • 이 취약점은 Node.js vm 모듈의 샌드박스 탈출 취약점(CVE-2024-21534)의 불완전한 패치로 인해 발생
      • 블랙리스트 기반 필터링이 우회 가능하여, 공격자가 악의적인 JSONPath 표현식을 통해 서버에서 임의의 코드 실행 가능`,
    
    whyDangerous: 
    `• 광범위한 영향: kubernetes-client를 포함한 수많은 프로덕션 환경에서 사용
    • 체이닝 공격 가능: 초기 침투 후 권한 상승, 데이터 탈취, 랜섬웨어 설치 등 연계 공격
    • 탐지 어려움: 정상적인 JSON 쿼리로 위장 가능`,
    
    attackScenario: 
    `1. Initial Access: 공격자가 취약한 JSONPath-Plus를 사용하는 API 엔드포인트에 악의적 쿼리 전송

    2. Execution: vm 샌드박스를 우회하여 임의의 Node.js 코드 실행

    3. Persistence: 리버스 쉘을 통해 서버 제어권 확보

    4. Impact: 크립토마이너 설치 또는 데이터 암호화(랜섬웨어)`,
    
    // Lab Environment
    labEnvironment: {
      victim: {
        description: "Node.js + JSONPath-Plus 10.2.0",
        ip: "10.233.3.66"
      },
      attacker: {
        description: "Kali Linux",
        ip: "10.233.78.36"
      }
    },
    prerequisites: [
      "Node.js 18.x 이상",
      "npm 또는 yarn",
      "기본적인 JavaScript 지식"
    ],
    
    mitigation: `• JSONPath-Plus 10.3.0 이상으로 업그레이드
• Input validation 강화: 사용자 입력을 JSONPath 쿼리로 사용하지 않기
• 샌드박스 환경 개선: isolated-vm 등 더 안전한 대안 고려
• 모니터링 강화: 비정상적인 프로세스 실행 탐지`,
    
    keyTakeaways: [
      "의존성 관리의 중요성: 오픈소스 라이브러리의 버전을 항상 최신으로 유지",
      "블랙리스트 필터링의 한계: 화이트리스트 기반 접근이 더 안전",
      "샌드박스 != 완전한 격리: vm 모듈의 한계 이해 필요",
      "Defense in Depth: 여러 계층의 보안 통제 필요"
    ],
    
    references: [
      "https://nvd.nist.gov/vuln/detail/CVE-2025-1302",
      "https://github.com/JSONPath-Plus/JSONPath",
      "https://nvd.nist.gov/vuln/detail/CVE-2024-21534"
    ]
  }
]

// Reports와 LabHistory는 첫 번째 CVE 기준으로 생성
export const mockReports: Report[] = [
  {
    id: 1,
    reportName: `${mockCVEs[0].id} 실습 보고서`,
    cveName: mockCVEs[0].title,
    cveId: mockCVEs[0].id,
    content: `# ${mockCVEs[0].id} 실습 보고서\n\n## 실습 개요\n이 보고서는 ${mockCVEs[0].id} 취약점에 대한 실습 내용을 담고 있습니다.\n\n## 실습 내용\n...\n\n## 결론\n...`,
    createdAt: mockCVEs[0].publishedDate,
  }
]

export const mockLabHistory: LabHistory[] = [
  {
    id: mockCVEs[0].id,
    title: mockCVEs[0].title,
    severity: mockCVEs[0].severity,
    summary: mockCVEs[0].summary,
    tags: mockCVEs[0].tags,
    completedAt: mockCVEs[0].publishedDate,
  }
]