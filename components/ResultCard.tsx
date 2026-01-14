"use client";

import * as React from "react";
import { toPng } from "html-to-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  id: string;
  label: "OVERPRICED" | "UNDERPRICED";
  realValueUSD: number;
  compensationUSD: number;
  gapUSD: number;
  gapPct: number;
  strengths: string[];
  weaknesses: string[];
  tier: number;
  expBand: string;
  industry: string;
}

export function ResultCard({
  id,
  label,
  realValueUSD,
  compensationUSD,
  gapUSD,
  gapPct,
  strengths,
  weaknesses,
  tier,
  expBand,
  industry
}: ResultCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = React.useState(false);

  const accent = label === "OVERPRICED" ? "green" : "red";
  const gapSign = gapUSD >= 0 ? "+" : "-";
  const gapUsdDisplay = `${gapSign}${formatCurrency(Math.abs(gapUSD))}`;
  const gapPctDisplay = `${gapSign}${formatPercent(Math.abs(gapPct))}`;

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `work-value-${id}.png`;
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div ref={cardRef} className="rounded-2xl bg-ink p-6 text-paper">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.4em] text-paper/60">WORK VALUE CALCULATOR</div>
          <Badge variant={accent}>{label}</Badge>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-xs uppercase text-paper/60">Real Value</div>
            <div className="text-2xl font-bold">{formatCurrency(realValueUSD)}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-paper/60">Compensation</div>
            <div className="text-2xl font-bold">{formatCurrency(compensationUSD)}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-paper/60">Gap</div>
            <div className="text-2xl font-bold">
              {gapUsdDisplay} ({gapPctDisplay})
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-xs uppercase text-paper/60">Strengths</div>
            <ul className="mt-2 space-y-1 text-sm">
              {strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase text-paper/60">Weaknesses</div>
            <ul className="mt-2 space-y-1 text-sm">
              {weaknesses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 text-xs uppercase tracking-widest text-paper/70">
          <span className="rounded-full border border-paper/30 px-3 py-1">Tier {tier}</span>
          <span className="rounded-full border border-paper/30 px-3 py-1">Exp {expBand}</span>
          <span className="rounded-full border border-paper/30 px-3 py-1">{industry}</span>
        </div>
      </div>

      <Card className={cn("flex flex-wrap items-center justify-between gap-3 p-4", accent === "green" ? "border-acid/40" : "border-ember/40")}>
        <div className="text-sm text-ink/70">Save the card for receipts.</div>
        <Button type="button" onClick={handleDownload} disabled={downloading}>
          {downloading ? "Rendering..." : "Download card PNG"}
        </Button>
      </Card>
    </div>
  );
}
