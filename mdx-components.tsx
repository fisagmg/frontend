// mdx-components.tsx
import type { MDXComponents } from "mdx/types";
import { ReactNode } from "react";
import {
  Flame,
  Shield,
  BookOpen,
  Server,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

// 아이콘 매핑 함수
const getIconForHeading = (text: string) => {
  const lowerText = String(text).toLowerCase();

  if (lowerText.includes("개요") || lowerText.includes("설명")) {
    return <BookOpen className="w-5 h-5" />;
  }
  if (lowerText.includes("시나리오") || lowerText.includes("공격")) {
    return <Flame className="w-5 h-5 text-red-500" />;
  }
  if (lowerText.includes("환경") || lowerText.includes("구성")) {
    return <Server className="w-5 h-5 text-blue-500" />;
  }
  if (lowerText.includes("패치") || lowerText.includes("완화")) {
    return <Shield className="w-5 h-5 text-green-500" />;
  }
  if (lowerText.includes("참고") || lowerText.includes("자료")) {
    return <ExternalLink className="w-5 h-5 text-purple-500" />;
  }

  return null;
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }: { children?: ReactNode }) => {
      const icon = getIconForHeading(String(children));
      const id = String(children)
        ?.toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9가-힣-]/g, "");

      return (
        <div className="mt-12 mb-6 first:mt-0">
          <h1
            className="text-3xl font-bold flex items-center gap-3 pb-3 border-b-2 border-primary/20 scroll-mt-24"
            id={id}
          >
            {icon}
            <span>{children}</span>
          </h1>
        </div>
      );
    },

    h2: ({ children }: { children?: ReactNode }) => {
      const text = String(children);
      const id = text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9가-힣-]/g, "");

      return (
        <h2
          className="text-2xl font-semibold mt-8 mb-4 flex items-center gap-2 scroll-mt-24"
          id={id}
        >
          {children}
        </h2>
      );
    },

    h3: ({ children }: { children?: ReactNode }) => (
      <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground/90">
        {children}
      </h3>
    ),

    h4: ({ children }: { children?: ReactNode }) => (
      <h4 className="text-base font-semibold mt-4 mb-2 text-foreground/80">
        {children}
      </h4>
    ),

    p: ({ children }: { children?: ReactNode }) => {
      const text = String(children);

      // 공격 시나리오 단계인 경우 특별한 스타일 적용
      if (
        text.includes("Initial Access:") ||
        text.includes("Execution:") ||
        text.includes("Persistence:") ||
        text.includes("Impact:")
      ) {
        let stepNumber = 1;
        let stepColor = "bg-blue-500";
        let stepTitle = "";

        if (text.includes("Initial Access:")) {
          stepNumber = 1;
          stepColor = "bg-blue-500";
          stepTitle = "Initial Access";
        } else if (text.includes("Execution:")) {
          stepNumber = 2;
          stepColor = "bg-purple-500";
          stepTitle = "Execution";
        } else if (text.includes("Persistence:")) {
          stepNumber = 3;
          stepColor = "bg-orange-500";
          stepTitle = "Persistence";
        } else if (text.includes("Impact:")) {
          stepNumber = 4;
          stepColor = "bg-red-500";
          stepTitle = "Impact";
        }

        const description = text.split(":")[1]?.trim() || "";

        return (
          <div className="mb-4 flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
            <div
              className={`flex-shrink-0 w-8 h-8 ${stepColor} text-white rounded-full flex items-center justify-center font-bold text-sm`}
            >
              {stepNumber}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground mb-1 flex items-center gap-2">
                {stepTitle}
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-foreground/80 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        );
      }

      return <p className="mb-4 leading-7 text-foreground/80">{children}</p>;
    },

    ul: ({ children }: { children?: ReactNode }) => (
      <ul className="mb-6 space-y-3">{children}</ul>
    ),

    ol: ({ children }: { children?: ReactNode }) => (
      <ol className="mb-6 space-y-4 list-decimal list-inside">{children}</ol>
    ),

    li: ({ children }: { children?: ReactNode }) => (
      <li className="text-foreground/80 leading-relaxed ml-6 relative before:content-['▸'] before:absolute before:left-[-1.5rem] before:text-primary/60">
        {children}
      </li>
    ),

    strong: ({ children }: { children?: ReactNode }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),

    code: ({ children }: { children?: ReactNode }) => (
      <code className="font-mono text-sm text-black px-1">
        {children}
      </code>
    ),

    pre: ({ children }: { children?: ReactNode }) => (
      <div className="my-6 relative group">
        <pre className="bg-transparent text-black p-6 rounded-lg overflow-x-auto">
          {children}
        </pre>
      </div>
    ),

    blockquote: ({ children }: { children?: ReactNode }) => (
      <blockquote className="border-l-4 border-primary/50 bg-muted/50 pl-6 pr-4 py-4 my-6 rounded-r-lg">
        <div className="text-foreground/80 italic">{children}</div>
      </blockquote>
    ),

    // 표 컴포넌트 - 깔끔하고 모던한 디자인
    table: ({ children }: { children?: ReactNode }) => (
      <div className="my-8 w-full overflow-hidden rounded-xl border-2 border-border shadow-lg bg-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">{children}</table>
        </div>
      </div>
    ),

    thead: ({ children }: { children?: ReactNode }) => (
      <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        {children}
      </thead>
    ),

    tbody: ({ children }: { children?: ReactNode }) => (
      <tbody className="divide-y divide-border bg-white dark:bg-slate-900">
        {children}
      </tbody>
    ),

    tr: ({ children }: { children?: ReactNode }) => (
      <tr className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors duration-150">
        {children}
      </tr>
    ),

    th: ({ children }: { children?: ReactNode }) => (
      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-slate-100 border-r border-border/50 last:border-r-0 whitespace-nowrap">
        {children}
      </th>
    ),

    td: ({ children }: { children?: ReactNode }) => {
      const text = String(children);

      // IP 주소인지 확인
      const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(text.trim());

      return (
        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 border-r border-border/30 last:border-r-0">
          {isIP ? (
            <code className="inline-flex items-center px-3 py-1.5 rounded-md font-mono text-xs font-medium bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700">
              {children}
            </code>
          ) : (
            <span className="font-medium">{children}</span>
          )}
        </td>
      );
    },

    a: ({ children, href }: { children?: ReactNode; href?: string }) => (
      <a
        href={href}
        className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/60 transition-colors inline-flex items-center gap-1 group"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
        <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
      </a>
    ),

    hr: () => (
      <hr className="my-12 border-t-2 border-dashed border-border/50" />
    ),

    ...components,
  };
}
