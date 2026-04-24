"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { memberSoftButtonClass } from "@/components/dashboard/member-ui";

type CopyLinkButtonProps = {
  copiedLabel?: string;
  copyLabel?: string;
  link: string;
};

export function CopyLinkButton({
  copiedLabel = "Copied",
  copyLabel = "Copy Link",
  link,
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      className={memberSoftButtonClass}
      onClick={handleCopy}
      type="button"
      variant="outline"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? copiedLabel : copyLabel}
    </Button>
  );
}
