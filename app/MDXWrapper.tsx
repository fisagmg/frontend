"use client";

import { MDXProvider } from "@mdx-js/react";
import type { ReactNode } from "react";
import { mdxComponents } from "./mdx-components";

type MDXWrapperProps = {
  children: ReactNode;
};

export default function MDXWrapper({ children }: MDXWrapperProps) {
  return (
    <MDXProvider components={mdxComponents}>
      <div className="prose prose-invert max-w-none">{children}</div>
    </MDXProvider>
  );
}
