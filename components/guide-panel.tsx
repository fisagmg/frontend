import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function GuidePanel() {
  return (
    <div className="h-full overflow-y-auto p-4 bg-muted/30 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">실습 가이드</h2>
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="overview">
          <AccordionTrigger>개요</AccordionTrigger>
          <AccordionContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              이 실습에서는 CVE 취약점을 직접 재현하고 분석하는 방법을 학습합니다.
            </p>
            <div className="bg-muted rounded p-2 text-xs text-center text-muted-foreground">[이미지 자리표시자]</div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="hints">
          <AccordionTrigger>힌트</AccordionTrigger>
          <AccordionContent className="space-y-2">
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>먼저 시스템 환경을 확인하세요</li>
              <li>취약점이 존재하는 서비스를 찾아보세요</li>
              <li>공격 벡터를 분석하고 실행하세요</li>
            </ul>
            <div className="bg-muted rounded p-2 text-xs text-center text-muted-foreground">[이미지 자리표시자]</div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="warnings">
          <AccordionTrigger>주의사항</AccordionTrigger>
          <AccordionContent className="space-y-2">
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>실습 환경 외부에서는 절대 시도하지 마세요</li>
              <li>모든 활동은 로그로 기록됩니다</li>
              <li>시간 제한을 준수하세요</li>
            </ul>
            <div className="bg-muted rounded p-2 text-xs text-center text-muted-foreground">[이미지 자리표시자]</div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
