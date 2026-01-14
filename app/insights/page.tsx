import { Card } from "@/components/ui/card";
import { getSupabaseServerClient } from "@/lib/supabase";
import { formatCurrency } from "@/lib/format";

interface AggregateRow {
  residence_tier: number;
  role_category: string;
  industry: string;
  ethnicity: string | null;
  gap_usd: number;
  label: "OVERPRICED" | "UNDERPRICED";
}

function groupBy<T>(rows: T[], key: (row: T) => string) {
  return rows.reduce<Record<string, T[]>>((acc, row) => {
    const k = key(row);
    acc[k] = acc[k] ?? [];
    acc[k].push(row);
    return acc;
  }, {});
}

function summarize(rows: AggregateRow[]) {
  const count = rows.length;
  const avgGap = Math.round(rows.reduce((sum, row) => sum + row.gap_usd, 0) / Math.max(count, 1));
  const overpriced = rows.filter((row) => row.label === "OVERPRICED").length;
  const ratio = count > 0 ? overpriced / count : 0;
  return { count, avgGap, ratio };
}

export default async function InsightsPage() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("aggregate_events")
    .select("residence_tier, role_category, industry, ethnicity, gap_usd, label");

  const rows = (data as AggregateRow[]) ?? [];

  const tierGroups = groupBy(rows, (row) => `Tier ${row.residence_tier}`);
  const roleGroups = groupBy(rows, (row) => row.role_category);
  const industryGroups = groupBy(rows, (row) => row.industry);
  const ethnicityGroups = groupBy(rows.filter((row) => row.ethnicity), (row) => row.ethnicity as string);

  const kThreshold = 30;
  const hasData = rows.length > 0;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-[0.4em] text-ink/60">Insights</div>
        <h1 className="font-display text-5xl tracking-wide">Bias Snapshot</h1>
        <p className="text-sm text-ink/70">
          Aggregated signals only. No names. No companies. No birth countries. No free text.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-ink/60">
            Gap distribution by tier
          </div>
          <div className="space-y-3 text-sm">
            {!hasData ? (
              <p className="text-sm text-ink/70">No data yet.</p>
            ) : (
              Object.entries(tierGroups).map(([label, group]) => {
                const summary = summarize(group);
                return (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span>{label}</span>
                      <span>{formatCurrency(summary.avgGap)} avg gap</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-ink/10">
                      <div
                        className="h-2 rounded-full bg-ink"
                        style={{ width: `${Math.round(summary.ratio * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-ink/60">
            Overpriced vs underpriced by tier
          </div>
          <div className="space-y-3 text-sm">
            {!hasData ? (
              <p className="text-sm text-ink/70">No data yet.</p>
            ) : (
              Object.entries(tierGroups).map(([label, group]) => {
                const summary = summarize(group);
                return (
                  <div key={label} className="flex items-center justify-between">
                    <span>{label}</span>
                    <span>{Math.round(summary.ratio * 100)}% overpriced</span>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-ink/60">
            Gap distribution by role category
          </div>
          <div className="space-y-3 text-sm">
            {!hasData ? (
              <p className="text-sm text-ink/70">No data yet.</p>
            ) : (
              Object.entries(roleGroups).map(([label, group]) => {
                const summary = summarize(group);
                return (
                  <div key={label} className="flex items-center justify-between">
                    <span>{label}</span>
                    <span>
                      {formatCurrency(summary.avgGap)} avg gap ({summary.count})
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-ink/60">
            Gap distribution by industry
          </div>
          <div className="space-y-3 text-sm">
            {!hasData ? (
              <p className="text-sm text-ink/70">No data yet.</p>
            ) : (
              Object.entries(industryGroups).map(([label, group]) => {
                const summary = summarize(group);
                return (
                  <div key={label} className="flex items-center justify-between">
                    <span>{label}</span>
                    <span>
                      {formatCurrency(summary.avgGap)} avg gap ({summary.count})
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      <Card className="space-y-4 p-6">
        <div className="text-xs uppercase tracking-[0.3em] text-ink/60">Gap by ethnicity</div>
        {!hasData || Object.keys(ethnicityGroups).length === 0 ? (
          <p className="text-sm text-ink/70">No data yet.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {Object.entries(ethnicityGroups).map(([label, group]) => {
              if (group.length < kThreshold) {
                return (
                  <div key={label} className="flex items-center justify-between text-ink/50">
                    <span>{label}</span>
                    <span>Not enough data</span>
                  </div>
                );
              }
              const summary = summarize(group);
              return (
                <div key={label} className="flex items-center justify-between">
                  <span>{label}</span>
                  <span>
                    {formatCurrency(summary.avgGap)} avg gap ({summary.count})
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-xs text-ink/60">Subgroups under {kThreshold} samples are hidden.</p>
      </Card>
    </div>
  );
}
