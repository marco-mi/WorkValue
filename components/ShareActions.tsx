"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export function ShareActions() {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button type="button" variant="outline" onClick={handleCopy}>
        {copied ? "Link copied" : "Copy share link"}
      </Button>
    </div>
  );
}
