"use client";
import { useState } from "react";

interface Props {
  text: string;
  label?: string;
  className?: string;
}

export default function CopyButton({ text, label, className }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className={className ?? "rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"}
      title="Copy to clipboard"
    >
      {copied ? "✓ Copied!" : label ?? "📋 Copy"}
    </button>
  );
}
