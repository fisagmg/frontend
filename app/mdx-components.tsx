import CodeBlock from "@/components/codeblock";
import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  CodeBlock,
  pre: CodeBlock,   // ← 이거 추가
};