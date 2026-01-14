import { notFound } from "next/navigation";
import Link from "next/link";
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
  gap_usd: number;
  gap_pct: number;
  label: "OVERPRICED" | "UNDERPRICED";
  strengths: string[];
  weaknesses: string[];
}

interface SimilarRow {
  id: string;
  industry: string;
  residence_tier: number;
  exp_band: string;
  gap_usd: number;
  gap_pct: number;
}

async function getResult(id: string) {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from("results").select("*").eq("id", id).single();
  return data as ResultRow | null;
}

async function getSimilarResults(roleCategory: string, excludeId: string) {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("results")
    .select("id, industry, residence_tier, exp_band, gap_usd, gap_pct")
    .eq("role_category", roleCategory)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(3);
  return (data ?? []) as SimilarRow[];
}

export default async function ResultPage({ params }: { params: { id: string } }) {
  const result = await getResult(params.id);

  if (!result) {
    notFound();
  }

  const similarResults = await getSimilarResults(result.role_category, result.id);

  const accent = result.label === "OVERPRICED" ? "green" : "red";
  const gapSign = result.gap_usd >= 0 ? "+" : "-";
  const gapUsdDisplay = `${gapSign}${formatCurrency(Math.abs(result.gap_usd))}`;
  const gapPctDisplay = `${gapSign}${formatPercent(Math.abs(result.gap_pct))}`;
  const gapGlow = result.gap_usd >= 0 ? "text-acid" : "text-ember";
  const gapGlowStyle = {
    textShadow:
      result.gap_usd >= 0
        ? "0 0 16px rgba(50, 232, 117, 0.7)"
        : "0 0 16px rgba(240, 77, 35, 0.7)"
  };
  const compensationUSD = result.real_value_usd + result.gap_usd;
  const verdictCopy =
    result.label === "OVERPRICED"
      ? "You are taking advantage from the system."
      : "Someone is taking advantage from your capacities.";

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.4em] text-ink/60">Result</div>
          <h1
            className={cn(
              "text-5xl font-bold tracking-wide",
              accent === "green" ? "text-acid" : "text-ember"
            )}
          >
            {result.label}
          </h1>
          <p className="text-sm text-ink/70">
            Compensation vs market value. Brutal. Deterministic.
          </p>
          <p className="text-sm font-semibold text-ink">{verdictCopy}</p>
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
          <div className="text-xs uppercase tracking-[0.2em] text-ink/50">Compensation</div>
          <div className="text-3xl font-bold">{formatCurrency(compensationUSD)}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-ink/50">Gap</div>
          <div className={cn("text-3xl font-bold", gapGlow)} style={gapGlowStyle}>
            {gapUsdDisplay} ({gapPctDisplay})
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <ResultCard
          id={result.id}
          label={result.label}
          realValueUSD={result.real_value_usd}
          compensationUSD={compensationUSD}
          gapUSD={result.gap_usd}
          gapPct={result.gap_pct}
          strengths={result.strengths}
          weaknesses={result.weaknesses}
          tier={result.residence_tier}
          expBand={result.exp_band}
          industry={result.industry}
        />
        <ShareActions />
      </div>

      <section className="space-y-4">
        <div className="text-xs uppercase tracking-[0.3em] text-ink/60">
          Other people in similar roles
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => {
            const item = similarResults[index];
            if (!item) {
              return (
                <Card key={`empty-${index}`} className="h-full p-4 text-sm text-ink/60">
                  No comparable profile yet.
                </Card>
              );
            }

            const isPositive = item.gap_usd >= 0;
            const sign = isPositive ? "+" : "-";
            const gapDisplay = `${sign}${formatCurrency(Math.abs(item.gap_usd))}`;
            const glowClass = isPositive
              ? "border-acid/40 shadow-glow"
              : "border-ember/40 shadow-heat";

            return (
              <div
                key={item.id}
                className={cn(
                  "flex h-full flex-col gap-3 rounded-xl border bg-paper/90 p-4",
                  glowClass
                )}
              >
                <div className="space-y-1 text-xs uppercase tracking-[0.2em] text-ink/60">
                  <div>{item.industry}</div>
                  <div>Tier {item.residence_tier}</div>
                  <div>Exp {item.exp_band}</div>
                </div>
                <div className="mt-auto text-lg font-bold">{gapDisplay}</div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-slate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate"
        >
          Take the test again
        </Link>
      </div>
    </div>
  );
}
