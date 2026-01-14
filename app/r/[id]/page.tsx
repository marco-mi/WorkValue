import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ResultCard } from "@/components/ResultCard";
import { ShareActions } from "@/components/ShareActions";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getSupabaseServerClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface ResultRow {
  id: string;
  created_at: string;
  role_category: string;
  industry: string;
  residence_tier: number;
  exp_band: string;
  real_value_usd: number;
  perceived_value_usd: number;
  gap_usd: number;
  gap_pct: number;
  label: "OVERPRICED" | "UNDERPRICED";
  strengths: string[];
  weaknesses: string[];
}

async function getResult(id: string) {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from("results").select("*").eq("id", id).single();
  return data as ResultRow | null;
}

export default async function ResultPage({ params }: { params: { id: string } }) {
  const result = await getResult(params.id);

  if (!result) {
    notFound();
  }

  const accent = result.label === "OVERPRICED" ? "green" : "red";

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.4em] text-ink/60">Result</div>
          <h1
            className={cn(
              "font-display text-5xl tracking-wide",
              accent === "green" ? "text-acid" : "text-ember"
            )}
          >
            {result.label}
          </h1>
          <p className="text-sm text-ink/70">Real vs perceived market value. Brutal. Deterministic.</p>
        </div>
        <Badge variant={accent} className="text-sm">
          {result.label}
        </Badge>
      </header>

      <Card
        className={cn(
          "grid gap-6 p-6 md:grid-cols-3",
          accent === "green" ? "border-acid/40" : "border-ember/40"
        )}
      >
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-ink/50">Real value</div>
          <div className="text-3xl font-bold">{formatCurrency(result.real_value_usd)}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-ink/50">Perceived value</div>
          <div className="text-3xl font-bold">{formatCurrency(result.perceived_value_usd)}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-ink/50">Gap</div>
          <div className="text-3xl font-bold">
            {formatCurrency(result.gap_usd)} ({formatPercent(result.gap_pct)})
          </div>
        </div>
      </Card>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <ResultCard
          id={result.id}
          label={result.label}
          realValueUSD={result.real_value_usd}
          perceivedValueUSD={result.perceived_value_usd}
          gapUSD={result.gap_usd}
          gapPct={result.gap_pct}
          strengths={result.strengths}
          weaknesses={result.weaknesses}
          tier={result.residence_tier}
          expBand={result.exp_band}
          industry={result.industry}
        />
        <Card className="space-y-4 p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-ink/60">Metadata</div>
          <div className="space-y-2 text-sm">
            <div>Role category: {result.role_category}</div>
            <div>Industry: {result.industry}</div>
            <div>Tier: {result.residence_tier}</div>
            <div>Experience band: {result.exp_band}</div>
          </div>
          <ShareActions />
        </Card>
      </div>
    </div>
  );
}
