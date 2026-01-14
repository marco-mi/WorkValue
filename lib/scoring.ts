import publicBenchmarks from "@/data/publicSalaryBenchmarks.json";
import platformBenchmarks from "@/data/platformRateBenchmarks.json";
import { clamp, getExpBand, type ExpBand } from "@/lib/bands";
import { getResidenceTier } from "@/lib/countryTiers";
import { normalizeRole, type RoleCategory } from "@/lib/normalizeRole";

export type Industry = "tech" | "creative" | "industrial" | "other";
export type LeadershipLevel = "none" | "small" | "org";
export type EmploymentType = "employee" | "owner" | "self-employed";
export type MarketAccessLevel = "none" | "some" | "strong";
export type EducationLevel =
  | "high_school"
  | "bachelor"
  | "master"
  | "postgraduate"
  | "bootcamp"
  | "self_taught";

export interface ScoreInput {
  role: string;
  industry: Industry;
  residenceCountry: string;
  workCountry: string;
  expYears: number;
  leadership: LeadershipLevel;
  languagesCount: number;
  employment: EmploymentType;
  education: EducationLevel;
  ethnicity?: string | null;
  annualCompensation?: number;
  hourlyRate?: number;
  hoursPerWeek?: number;
}

export interface ScoreResult {
  roleCategory: RoleCategory;
  residenceTier: number;
  expBand: ExpBand;
  annualUSD: number;
  realValueUSD: number;
  gapUSD: number;
  gapPct: number;
  label: "OVERPRICED" | "UNDERPRICED";
  strengths: string[];
  weaknesses: string[];
}

interface BenchmarkRow {
  roleCategory: RoleCategory;
  industry: Industry;
  tier: number;
  expBand: ExpBand;
  annualUSD_p50: number;
  annualUSD_p75: number;
}

const PUBLIC = publicBenchmarks as BenchmarkRow[];
const PLATFORM = platformBenchmarks as BenchmarkRow[];

function annualizeComp(input: ScoreInput): number {
  if (input.annualCompensation && input.annualCompensation > 0) {
    return input.annualCompensation;
  }
  if (input.hourlyRate && input.hoursPerWeek) {
    return input.hourlyRate * input.hoursPerWeek * 52;
  }
  return 0;
}

function findBenchmark(
  data: BenchmarkRow[],
  roleCategory: RoleCategory,
  industry: Industry,
  tier: number,
  expBand: ExpBand
): BenchmarkRow {
  const exact = data.find(
    (row) =>
      row.roleCategory === roleCategory &&
      row.industry === industry &&
      row.tier === tier &&
      row.expBand === expBand
  );
  if (exact) return exact;

  const sameTierFallback = data.find(
    (row) =>
      row.roleCategory === roleCategory &&
      row.industry === "other" &&
      row.tier === tier &&
      row.expBand === expBand
  );
  if (sameTierFallback) return sameTierFallback;

  const tierThreeFallback = data.find(
    (row) =>
      row.roleCategory === roleCategory &&
      row.industry === industry &&
      row.tier === 3 &&
      row.expBand === expBand
  );
  if (tierThreeFallback) return tierThreeFallback;

  const roleOnlyFallback = data.find((row) => row.roleCategory === roleCategory);
  if (roleOnlyFallback) return roleOnlyFallback;

  return data[0];
}

export function getMarketAccessLevel(workCountry: string): MarketAccessLevel {
  const tier = getResidenceTier(workCountry);
  if (tier <= 1) return "strong";
  if (tier === 2 || tier === 3) return "some";
  return "none";
}

function getEthnicityBias(ethnicity?: string | null) {
  if (!ethnicity || ethnicity === "Prefer not to say") return 0;
  const biasMap: Record<string, number> = {
    White: 0.05,
    Asian: 0.02,
    "South Asian": -0.02,
    Black: -0.06,
    "Hispanic/Latino": -0.04,
    "Middle Eastern": -0.03,
    Indigenous: -0.06,
    Mixed: -0.03,
    Other: 0
  };
  return biasMap[ethnicity] ?? 0;
}

function deriveStrengthsWeaknesses(
  input: ScoreInput,
  marketAccess: MarketAccessLevel,
  ethnicityBias: number
) {
  const biasSignal = ethnicityBias > 0 ? 2 : ethnicityBias < 0 ? -1 : 0;
  const factors = [
    {
      label: "Leadership exposure",
      value: input.leadership === "org" ? 2 : input.leadership === "small" ? 1 : 0,
      threshold: 1,
      weakness: "No leadership exposure"
    },
    {
      label: "Multilingual edge",
      value: input.languagesCount >= 3 ? 2 : input.languagesCount === 2 ? 1 : 0,
      threshold: 1,
      weakness: "Single-language footprint"
    },
    {
      label: "Tier-1 market access",
      value: marketAccess === "strong" ? 2 : marketAccess === "some" ? 1 : 0,
      threshold: 1,
      weakness: "Low Tier-1 market access"
    },
    {
      label: "Systemic advantage signal",
      value: biasSignal,
      threshold: 1,
      weakness: "Systemic bias headwind"
    },
    {
      label: "Education signal",
      value:
        input.education === "postgraduate"
          ? 3
          : input.education === "master"
            ? 2
            : input.education === "bachelor"
              ? 1
              : input.education === "bootcamp" || input.education === "self_taught"
                ? 0
                : 0,
      threshold: 1,
      weakness: "Low formal education signal"
    },
    {
      label: "Ownership leverage",
      value: input.employment === "owner" ? 2 : input.employment === "self-employed" ? 1 : 0,
      threshold: 1,
      weakness: "Employee-only leverage"
    }
  ];

  const strengths = factors
    .filter((factor) => factor.value >= factor.threshold)
    .sort((a, b) => b.value - a.value)
    .slice(0, 2)
    .map((factor) => factor.label);

  const weaknesses = factors
    .sort((a, b) => a.value - b.value)
    .slice(0, 2)
    .map((factor) => factor.weakness);

  return { strengths, weaknesses };
}

export function score(input: ScoreInput): ScoreResult {
  const roleCategory = normalizeRole(input.role);
  const residenceTier = getResidenceTier(input.residenceCountry);
  const expBand = getExpBand(input.expYears);
  const marketAccess = getMarketAccessLevel(input.workCountry);
  const ethnicityBias = getEthnicityBias(input.ethnicity);

  const publicRow = findBenchmark(PUBLIC, roleCategory, input.industry, residenceTier, expBand);
  const platformRow = findBenchmark(PLATFORM, roleCategory, input.industry, residenceTier, expBand);

  const baseReal = 0.6 * publicRow.annualUSD_p50 + 0.4 * platformRow.annualUSD_p50;

  const leadershipAdj = input.leadership === "org" ? 0.15 : input.leadership === "small" ? 0.08 : 0;
  const languageAdj = input.languagesCount >= 3 ? 0.06 : input.languagesCount === 2 ? 0.03 : 0;
  const overlapAdj = marketAccess === "strong" ? 0.08 : marketAccess === "some" ? 0.04 : 0;
  const employmentAdj = input.employment === "owner" ? 0.05 : input.employment === "self-employed" ? 0.03 : 0;

  const realAdj = clamp(
    leadershipAdj + languageAdj + overlapAdj + employmentAdj + ethnicityBias,
    -0.1,
    0.25
  );
  const realValueUSD = Math.round(baseReal * (1 + realAdj));

  const annualUSD = Math.round(annualizeComp(input));
  const gapUSD = annualUSD - realValueUSD;
  const gapPct = realValueUSD > 0 ? gapUSD / realValueUSD : 0;
  const label = gapUSD > 0 ? "OVERPRICED" : "UNDERPRICED";

  const { strengths, weaknesses } = deriveStrengthsWeaknesses(
    input,
    marketAccess,
    ethnicityBias
  );

  return {
    roleCategory,
    residenceTier,
    expBand,
    annualUSD,
    realValueUSD,
    gapUSD,
    gapPct,
    label,
    strengths,
    weaknesses
  };
}
