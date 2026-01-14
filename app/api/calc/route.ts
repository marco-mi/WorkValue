import { NextResponse } from "next/server";
import { getMarketAccessLevel, score } from "@/lib/scoring";
import { getAgeBand, getLanguagesBand } from "@/lib/bands";
import { getSupabaseServerClient } from "@/lib/supabase";

interface CalcRequest {
  role: string;
  industry: "tech" | "creative" | "industrial" | "other";
  residenceCountry: string;
  workCountry: string;
  birthCountry?: string;
  age: number;
  expYears: number;
  leadership: "none" | "small" | "org";
  companyName?: string;
  employment: "employee" | "owner" | "self-employed";
  languagesCount: number;
  education:
    | "high_school"
    | "bachelor"
    | "master"
    | "postgraduate"
    | "bootcamp"
    | "self_taught";
  annualCompensation?: number;
  hourlyRate?: number;
  hoursPerWeek?: number;
  ethnicity?: string | null;
  consentConcept: boolean;
  consentAggregate: boolean;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CalcRequest;

    if (!body?.consentConcept) {
      return NextResponse.json({ error: "Consent required." }, { status: 400 });
    }

    if (!body.role || !body.residenceCountry || !body.workCountry || !body.industry) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const hasAnnual = !!body.annualCompensation && body.annualCompensation > 0;
    const hasHourly = !!body.hourlyRate && !!body.hoursPerWeek;
    if (!hasAnnual && !hasHourly) {
      return NextResponse.json({ error: "Compensation input required." }, { status: 400 });
    }

    const result = score({
      role: body.role,
      industry: body.industry,
      residenceCountry: body.residenceCountry,
      workCountry: body.workCountry,
      expYears: body.expYears,
      leadership: body.leadership,
      languagesCount: body.languagesCount,
      employment: body.employment,
      education: body.education,
      ethnicity: body.ethnicity ?? undefined,
      annualCompensation: body.annualCompensation,
      hourlyRate: body.hourlyRate,
      hoursPerWeek: body.hoursPerWeek
    });

    const supabase = getSupabaseServerClient();

    const { data: insertData, error } = await supabase
      .from("results")
      .insert({
        role_category: result.roleCategory,
        industry: body.industry,
        residence_tier: result.residenceTier,
        exp_band: result.expBand,
        real_value_usd: result.realValueUSD,
        gap_usd: result.gapUSD,
        gap_pct: result.gapPct,
        label: result.label,
        strengths: result.strengths,
        weaknesses: result.weaknesses
      })
      .select("id")
      .single();

    if (error || !insertData) {
      return NextResponse.json({ error: error?.message || "Insert failed." }, { status: 500 });
    }

    if (body.consentAggregate) {
      const ethnicity =
        body.ethnicity && body.ethnicity !== "Prefer not to say" ? body.ethnicity : null;
      const marketAccess = getMarketAccessLevel(body.workCountry);

      await supabase.from("aggregate_events").insert({
        role_category: result.roleCategory,
        industry: body.industry,
        residence_tier: result.residenceTier,
        exp_band: result.expBand,
        age_band: getAgeBand(body.age),
        education_level: body.education,
        languages_band: getLanguagesBand(body.languagesCount),
        leadership_level: body.leadership,
        overlap_level: marketAccess,
        employment_type: body.employment,
        ethnicity,
        real_value_usd: result.realValueUSD,
        gap_usd: result.gapUSD,
        label: result.label
      });
    }

    return NextResponse.json({ id: insertData.id });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
