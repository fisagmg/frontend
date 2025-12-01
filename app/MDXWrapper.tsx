"use client";

import { MDXProvider } from "@mdx-js/react";
import { mdxComponents } from "./mdx-components";

export default function MDXWrapper({ children }) {
  return (
    <MDXProvider components={mdxComponents}>
      <div className="prose prose-invert max-w-none">
        {children}
      </div>
    </MDXProvider>
  );
}
