// components/lab-guide-panel.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table as TableComponent,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

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
      <pre className="bg-transparent p-3 text-xs text-black overflow-x-auto">
        <code className="text-black">{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-200 text-slate-500"
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
    // shadcn/ui Table 컴포넌트 추가
    Table: ({ children, className, ...props }: any) => (
      <div className="dark-table my-8">
        <TableComponent className={cn("w-full", className)} {...props}>
          {children}
        </TableComponent>
      </div>
    ),
    TableHeader: (props: any) => <TableHeader {...props} />,
    TableBody: (props: any) => <TableBody {...props} />,
    TableRow: (props: any) => <TableRow {...props} />,
    TableHead: ({ children, className, ...props }: any) => (
      <TableHead className={cn("!text-white", className)} {...props}>
        {children}
      </TableHead>
    ),
    TableCell: ({ children, className, ...props }: any) => (
      <TableCell className={cn("!text-white", className)} {...props}>
        {children}
      </TableCell>
    ),
    pre: ({ children, ...props }: any) => (
      <pre
        {...props}
        className="bg-transparent p-3 text-xs text-black overflow-x-auto my-3"
      >
        {children}
      </pre>
    ),
    h1: (props: any) => <h1 {...props} className="text-2xl font-bold text-black mt-6 mb-4" />,
    h2: (props: any) => <h2 {...props} className="text-xl font-bold text-black mt-5 mb-3" />,
    h3: (props: any) => <h3 {...props} className="text-lg font-bold text-black mt-4 mb-2" />,
    p: (props: any) => <p {...props} className="text-black mb-4 leading-relaxed" />,
    ul: (props: any) => <ul {...props} className="list-disc list-inside text-black mb-4 space-y-1" />,
    ol: (props: any) => <ol {...props} className="list-decimal list-inside text-black mb-4 space-y-1" />,
    li: (props: any) => <li {...props} className="text-black" />,
    strong: (props: any) => <strong {...props} className="font-bold text-black" />,
  };

  return (
    <>
      <div className="p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
        <h2 className="text-lg font-bold text-slate-900">{metadata.title}</h2>
        <p className="text-xs text-slate-500 mt-1">
          {metadata.subtitle}
        </p>
      </div>

      {MDXContent ? (
        <div className="lab-guide-content p-4 text-slate-900">
          <MDXContent components={components} />
        </div>
      ) : (
        <div className="p-4">
          <p className="text-sm text-slate-500">
            가이드를 불러오는 중...
          </p>
        </div>
      )}
    </>
  );
}
