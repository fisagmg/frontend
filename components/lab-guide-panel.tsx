// components/lab-guide-panel.tsx
"use client";

import { useState, useEffect } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LabGuidePanelProps {
  cveId: string;
  metadata: {
    title: string;
    subtitle: string;
  };
}

export function LabGuidePanel({ cveId, metadata }: LabGuidePanelProps) {
  const [MDXContent, setMDXContent] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    // 동적으로 MDX 파일 로드
    import(`@/app/lab/[cveId]/start/guides/${cveId}.mdx`)
      .then((module) => {
        setMDXContent(() => module.default);
      })
      .catch((error) => {
        console.error("MDX load error:", error);
        setMDXContent(null);
      });
  }, [cveId]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // 코드 블록 컴포넌트
  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative group">
      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto border border-border">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copyToClipboard(code, id)}
      >
        {copiedCode === id ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );

  // MDX용 커스텀 컴포넌트 - 회색 배경
  const components = {
    CodeBlock,
    pre: ({ children, ...props }: any) => (
      <pre
        {...props}
        className="bg-secondary p-3 rounded text-xs overflow-x-auto border border-border my-3"
      >
        {children}
      </pre>
    ),
  };

  return (
    <>
      <div className="p-4 border-b border-border sticky top-0 bg-card z-10">
        <h2 className="text-lg font-bold">{metadata.title}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {metadata.subtitle}
        </p>
      </div>

      {MDXContent ? (
        <div className="lab-guide-content p-4">
          <MDXContent components={components} />
        </div>
      ) : (
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            가이드를 불러오는 중...
          </p>
        </div>
      )}
    </>
  );
}
