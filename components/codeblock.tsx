"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

interface CodeBlockProps {
  code: string;
  id?: string;
}

export default function CodeBlock({ code, id }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  return (
    <div
      id={id}
      className="
        relative bg-[#1E1E1E] text-gray-200
        rounded-lg p-4 my-4 font-mono text-sm
        overflow-auto border border-gray-700 shadow-md
      "
    >
      {/* Copy Button */}
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 text-gray-400 hover:text-white transition"
        aria-label="Copy code"
      >
        <Copy size={18} />
      </button>

      {/* Fix: MDX resets <pre>/<code> styles → we enforce our own */}
      <pre className="whitespace-pre-wrap !bg-transparent !text-gray-200">
        <code className="!text-gray-200">{code}</code>
      </pre>

      {copied && (
        <span className="absolute bottom-2 right-3 text-xs text-green-400">
          Copied!
        </span>
      )}
    </div>
  );
}