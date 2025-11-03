import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { mockCVEs } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { SeverityBadge } from "@/components/severity-badge"

export default async function CVEDetailPage({
  params,
}: {
  params: Promise<{ cveId: string }>
}) {
  const { cveId } = await params

  if (cveId === "all") {
    redirect("/learn/all")
  }

  const cve = mockCVEs.find((c) => c.id === cveId)

  if (!cve) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 mb-4">
            <CardTitle className="text-2xl">{cve.id}</CardTitle>
            <div className="flex items-center gap-3">
              <SeverityBadge score={cve.cvssScore} level={cve.severity} />
              <Button asChild size="sm">
                <Link href={`/lab/${cve.id}/start`}>실습하기</Link>
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">{cve.summary}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tags */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">태그</h3>
            <div className="flex flex-wrap gap-2">
              {cve.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Published Date */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">공개일</h3>
            <p>{cve.publishedDate}</p>
          </div>

          {/* Accordion Sections */}
          <Accordion type="single" collapsible defaultValue="overview" className="w-full">
            <AccordionItem value="overview">
              <AccordionTrigger>개요</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{cve.overview || "정보가 제공되지 않았습니다."}</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cases">
              <AccordionTrigger>실제 사건/사례</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{cve.realWorldCases || "정보가 제공되지 않았습니다."}</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="technical">
              <AccordionTrigger>기술적 상세</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{cve.technicalDetails || "정보가 제공되지 않았습니다."}</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="impact">
              <AccordionTrigger>영향 범위 / 취약 조건</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{cve.impactScope || "정보가 제공되지 않았습니다."}</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="mitigation">
              <AccordionTrigger>완화/패치 정보</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{cve.mitigation || "정보가 제공되지 않았습니다."}</p>
              </AccordionContent>
            </AccordionItem>

            {cve.references && cve.references.length > 0 && (
              <AccordionItem value="references">
                <AccordionTrigger>레퍼런스</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside space-y-1">
                    {cve.references.map((ref, index) => (
                      <li key={index}>
                        <a
                          href={ref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {ref}
                        </a>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
