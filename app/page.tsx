import Link from "next/link";
import { ValueForm } from "@/components/ValueForm";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-ink/60">CORPO</p>
            <h1 className="text-5xl font-bold tracking-wide text-ink md:text-7xl">
              WORK VALUE CALCULATOR
            </h1>
          </div>
          <div className="space-y-3">
            <Card className="max-w-sm border-ink/20 bg-paper/80 p-4 text-sm">
              Real value is what the market pays. Perceived value is what you sell. The gap is the story.
            </Card>
            <Link href="/insights" className="text-xs uppercase tracking-[0.3em] text-ink underline">
              View insights
            </Link>
          </div>
        </div>
        <p className="max-w-2xl text-sm text-ink/70">
          Feed the machine. Get a number. See the bias. This is a conceptual tool built to provoke, not validate.
        </p>
      </header>
      <ValueForm />
    </div>
  );
}
