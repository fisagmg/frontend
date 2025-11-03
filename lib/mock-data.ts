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
  realWorldCases?: string
  technicalDetails?: string
  impactScope?: string
  mitigation?: string
  references?: string[]
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

export const mockCVEs: CVEItem[] = Array.from({ length: 50 }, (_, i) => {
  const year = 2024 - Math.floor(i / 10)
  const num = String(10000 + i).padStart(5, "0")
  const cvssScore = 3.0 + (i % 8) * 0.9
  const severity = getSeverityFromCvss(cvssScore)

  const exploitTag = i % 2 === 0 ? "Exploit" : "PoC"

  const envTags = ["Windows", "Linux", "macOS", "iOS", "Android", "Network", "Container", "Cloud"]
  const selectedEnvTags = [envTags[i % 8], envTags[(i + 1) % 8]]
    .filter((tag, index, self) => self.indexOf(tag) === index)
    .slice(0, 2)

  const tags = [exploitTag, ...selectedEnvTags]

  const osOptions: CVEItem["os"][] = ["Windows", "Linux", "macOS", "iOS", "Android", "Other"]
  const domainOptions: CVEItem["domain"][] = [
    "Network",
    "Web Application",
    "Database",
    "OS/Kernel",
    "Application",
    "Cloud",
    "Container",
    "Authentication",
    "Cryptography",
    "IoT/Device",
  ]

  return {
    id: `CVE-${year}-${num}`,
    title: `CVE-${year}-${num}`,
    cvssScore: Number(cvssScore.toFixed(1)),
    severity,
    summary: `원격 코드 실행 취약점 - ${["Apache", "Nginx", "Windows", "Linux"][i % 4]} 시스템에서 발견된 보안 취약점`,
    tags,
    publishedDate: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
    os: osOptions[i % osOptions.length],
    domain: domainOptions[i % domainOptions.length],
    overview: `이 취약점은 ${["Apache", "Nginx", "Windows", "Linux"][i % 4]} 시스템의 핵심 컴포넌트에서 발견되었습니다. 공격자가 이를 악용할 경우 원격에서 임의의 코드를 실행할 수 있습니다.`,
    realWorldCases: `2024년 ${(i % 12) + 1}월, 이 취약점을 악용한 실제 공격 사례가 보고되었습니다. 공격자는 이를 통해 시스템 권한을 획득하고 민감한 데이터에 접근했습니다.`,
    technicalDetails: `취약점은 입력 검증 부족으로 인해 발생합니다. 특정 API 엔드포인트에서 사용자 입력을 적절히 검증하지 않아 버퍼 오버플로우가 발생할 수 있습니다.`,
    impactScope: `영향받는 버전: ${["2.4.x", "1.20.x", "Server 2019", "Kernel 5.x"][i % 4]}. 인터넷에 노출된 모든 시스템이 위험에 처해 있으며, 특히 기본 설정을 사용하는 경우 더욱 취약합니다.`,
    mitigation: `즉시 최신 보안 패치를 적용하십시오. 패치가 불가능한 경우, 방화벽 규칙을 통해 해당 포트에 대한 외부 접근을 차단하고 WAF를 구성하십시오.`,
    references: [
      "https://nvd.nist.gov/vuln/detail/CVE-2024-xxxxx",
      "https://www.cisa.gov/known-exploited-vulnerabilities",
      "https://github.com/advisories/GHSA-xxxx-xxxx-xxxx",
    ],
  }
})

export const mockReports: Report[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  reportName: `${mockCVEs[i].id} 실습 보고서`,
  cveName: mockCVEs[i].title,
  cveId: mockCVEs[i].id,
  content: `# ${mockCVEs[i].id} 실습 보고서\n\n## 실습 개요\n이 보고서는 ${mockCVEs[i].id} 취약점에 대한 실습 내용을 담고 있습니다.\n\n## 실습 내용\n...\n\n## 결론\n...`,
  createdAt: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
}))

export const mockLabHistory: LabHistory[] = Array.from({ length: 12 }, (_, i) => ({
  id: mockCVEs[i].id,
  title: mockCVEs[i].title,
  severity: mockCVEs[i].severity,
  summary: mockCVEs[i].summary,
  tags: mockCVEs[i].tags,
  completedAt: `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
}))
