// app/learn/[cveId]/page.tsx
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "@/components/severity-badge";
import { ExternalLink, Target, Code2 } from "lucide-react";
import Link from "next/link";

// CVE 목록과 메타데이터
const cveData: Record<string, any> = {
  "CVE-2025-1302": {
    id: "CVE-2025-1302",
    title: "JSONPath-Plus 원격 코드 실행 취약점",
    cvssScore: 9.8,
    severity: "Critical",
    summary: "JSONPath-Plus의 vm 샌드박스 우회로 인한 원격 코드 실행 취약점",
    tags: ["RCE", "Node.js", "Sandbox Escape", "npm", "Exploit"],
    publishedDate: "2025-02-15",
    nvdUrl: "https://nvd.nist.gov/vuln/detail/CVE-2025-1302",
    target: [
      "JSONPath-Plus < 10.3.0",
      "kubernetes-client",
      "860+ npm packages",
    ],
    attackComplexity: "Low",
  },
  "CVE-2025-29927": {
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
    nvdUrl: "https://nvd.nist.gov/vuln/detail/CVE-2025-29927",
    target: [
      "Next.js < v15.2.3",
      "Next.js < v14.2.25",
      "Next.js < v13.5.9",
      "Next.js < v12.3.5",
      "Next.js v11.x (전체)",
    ],
    attackComplexity: "Low",
  },
  "CVE-2024-55879": {
    id: "CVE-2024-55879",
    title: "XWiki 원격 임의 코드 실행 취약점",
    cvssScore: 9.0,
    severity: "Critical",
    summary:
      "XWiki의 ConfigurableClass 객체 속성 조작을 통한 Groovy 스크립트 실행 및 원격 코드 실행 취약점",
    tags: ["RCE", "XWiki", "SSTI", "Groovy", "Template Injection", "Wiki"],
    publishedDate: "2024-12-12",
    nvdUrl: "https://nvd.nist.gov/vuln/detail/CVE-2024-55879",
    target: ["XWiki >= 2.3, < 15.10.9", "XWiki >= 16.0.0-rc-1, < 16.3.0"],
    attackComplexity: "Low",
  },
  "CVE-2024-53677": {
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
    nvdUrl: "https://nvd.nist.gov/vuln/detail/CVE-2024-53677",
    target: [
      "Apache Struts 2.0.0 - 2.3.37",
      "Apache Struts 2.5.0 - 2.5.33",
      "Apache Struts 6.0.0 - 6.3.0.2",
    ],
    attackComplexity: "Low",
  },
};

export async function generateStaticParams() {
  return Object.keys(cveData).map((cveId) => ({
    cveId: cveId,
  }));
}

export default async function CVEDetailPage({
  params,
}: {
  params: Promise<{ cveId: string }>;
}) {
  const { cveId } = await params;

  const metadata = cveData[cveId];

  if (!metadata) {
    notFound();
  }

  // 동적으로 MDX 파일 불러오기
  let MDXContent;

  try {
    // @ts-ignore
    const mdxModule = await import(`./content/${cveId}.mdx`);
    MDXContent = mdxModule.default;
  } catch (error) {
    console.error("MDX load error:", error);
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold">
                    {metadata.id}
                  </CardTitle>
                  <p className="text-xl text-muted-foreground">
                    {metadata.title}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <SeverityBadge
                    score={metadata.cvssScore}
                    level={metadata.severity}
                  />
                  <Button asChild size="lg" className="gap-2">
                    <Link href={`/lab/${cveId}/start`}>
                      <Code2 className="w-4 h-4" />
                      실습하기
                    </Link>
                  </Button>
                </div>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed">
                {metadata.summary}
              </p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Quick Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    참고 링크
                  </h3>
                  <div className="space-y-1">
                    {metadata.nvdUrl && (
                      <a
                        href={metadata.nvdUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline block"
                      >
                        NVD 상세정보
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    영향받는 대상
                  </h3>
                  <div className="space-y-1">
                    {metadata.target?.map((t: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="mr-2">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                {metadata.attackComplexity && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                      공격 복잡도
                    </h3>
                    <Badge variant="outline">{metadata.attackComplexity}</Badge>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    공개일
                  </h3>
                  <p className="text-sm">{metadata.publishedDate}</p>
                </div>
              </div>

              {/* Tags */}
              {metadata.tags && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    관련 기술
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {metadata.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="px-3 py-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* MDX Content - prose 클래스 설정 개선 */}
              <article className="prose prose-slate dark:prose-invert max-w-none prose-table:border-collapse prose-th:border prose-th:border-border prose-td:border prose-td:border-border">
                <MDXContent />
              </article>
            </CardContent>
          </Card>
        </div>

        {/* Table of Contents - Sticky Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-4 text-sm uppercase text-muted-foreground">
                목차
              </h3>
              <nav className="space-y-2">
                <a
                  href="#취약점-개요"
                  className="block text-sm hover:text-primary transition-colors py-1.5 border-l-2 border-transparent hover:border-primary pl-3"
                >
                  취약점 개요
                </a>
                <a
                  href="#공격-시나리오"
                  className="block text-sm hover:text-primary transition-colors py-1.5 border-l-2 border-transparent hover:border-primary pl-3"
                >
                  공격 시나리오
                </a>
                <a
                  href="#실습-환경-구성"
                  className="block text-sm hover:text-primary transition-colors py-1.5 border-l-2 border-transparent hover:border-primary pl-3"
                >
                  실습 환경 구성
                </a>
                <a
                  href="#패치-정보"
                  className="block text-sm hover:text-primary transition-colors py-1.5 border-l-2 border-transparent hover:border-primary pl-3"
                >
                  패치 정보
                </a>
                <a
                  href="#참고-자료"
                  className="block text-sm hover:text-primary transition-colors py-1.5 border-l-2 border-transparent hover:border-primary pl-3"
                >
                  참고 자료
                </a>
              </nav>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
