"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { COUNTRY_OPTIONS } from "@/lib/countryTiers";
import { cn } from "@/lib/utils";

const ROLE_PRESETS = [
  "Software Engineer",
  "Product Manager",
  "Designer",
  "Data Analyst",
  "Marketing",
  "Sales",
  "Operations",
  "Finance",
  "Other"
];

const INDUSTRIES = [
  { value: "tech", label: "Tech" },
  { value: "creative", label: "Creative" },
  { value: "industrial", label: "Industrial" },
  { value: "other", label: "Other" }
];

const LEADERSHIP = [
  { value: "none", label: "None" },
  { value: "small", label: "Led small team" },
  { value: "org", label: "Led org" }
];

const EMPLOYMENT = [
  { value: "employee", label: "Employee" },
  { value: "self-employed", label: "Self-employed" },
  { value: "owner", label: "Owner" }
];

const LANGUAGES = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3+", label: "3+" }
];

const EDUCATION = [
  { value: "high_school", label: "High school" },
  { value: "bachelor", label: "Bachelor" },
  { value: "master", label: "Master" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "bootcamp", label: "Bootcamp" },
  { value: "self_taught", label: "Self-taught" }
];

const ETHNICITY_OPTIONS = [
  "Asian",
  "Black",
  "Hispanic/Latino",
  "Middle Eastern",
  "Indigenous",
  "South Asian",
  "White",
  "Mixed",
  "Other",
  "Prefer not to say"
];

export function ValueForm() {
  const router = useRouter();
  const [rolePreset, setRolePreset] = React.useState("");
  const [roleText, setRoleText] = React.useState("");
  const [industry, setIndustry] = React.useState("");
  const [industryOther, setIndustryOther] = React.useState("");
  const [residenceCountry, setResidenceCountry] = React.useState("");
  const [birthCountry, setBirthCountry] = React.useState("");
  const [workCountry, setWorkCountry] = React.useState("");
  const [age, setAge] = React.useState("");
  const [expYears, setExpYears] = React.useState("");
  const [leadership, setLeadership] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [employment, setEmployment] = React.useState("");
  const [languagesCount, setLanguagesCount] = React.useState("");
  const [education, setEducation] = React.useState("");
  const [compType, setCompType] = React.useState<"" | "annual" | "hourly">("");
  const [annualComp, setAnnualComp] = React.useState("");
  const [hourlyRate, setHourlyRate] = React.useState("");
  const [hoursPerWeek, setHoursPerWeek] = React.useState("");
  const [ethnicity, setEthnicity] = React.useState("");
  const [consentConcept, setConsentConcept] = React.useState(false);
  const [consentAggregate, setConsentAggregate] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!consentConcept) {
      setError("Consent is required.");
      return;
    }

    const role = roleText.trim() || rolePreset;
    if (!role) {
      setError("Role is required.");
      return;
    }

    if (!industry) {
      setError("Industry is required.");
      return;
    }

    if (industry === "other" && !industryOther.trim()) {
      setError("Specify an industry.");
      return;
    }

    if (!residenceCountry) {
      setError("Country of residence is required.");
      return;
    }

    if (!workCountry) {
      setError("Main work country is required.");
      return;
    }

    if (!leadership) {
      setError("Leadership experience is required.");
      return;
    }

    if (!employment) {
      setError("Employment type is required.");
      return;
    }

    if (!languagesCount) {
      setError("Languages count is required.");
      return;
    }

    if (!education) {
      setError("Education level is required.");
      return;
    }

    if (!compType) {
      setError("Compensation type is required.");
      return;
    }

    const parsedAge = Number(age);
    if (!age || Number.isNaN(parsedAge)) {
      setError("Age is required.");
      return;
    }

    const parsedExp = Number(expYears);
    if (!expYears || Number.isNaN(parsedExp)) {
      setError("Experience is required.");
      return;
    }

    const parsedLanguages = languagesCount === "3+" ? 3 : Number(languagesCount);
    if (Number.isNaN(parsedLanguages)) {
      setError("Languages count is required.");
      return;
    }

    const parsedAnnual = compType === "annual" ? Number(annualComp) : undefined;
    const parsedHourly = compType === "hourly" ? Number(hourlyRate) : undefined;
    const parsedHours = compType === "hourly" ? Number(hoursPerWeek) : undefined;

    if (compType === "annual" && (!annualComp || Number.isNaN(parsedAnnual))) {
      setError("Annual compensation is required.");
      return;
    }

    if (compType === "hourly") {
      if (!hourlyRate || Number.isNaN(parsedHourly)) {
        setError("Hourly rate is required.");
        return;
      }
      if (!hoursPerWeek || Number.isNaN(parsedHours)) {
        setError("Weekly hours are required.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        role,
        industry,
        residenceCountry,
        workCountry,
        age: parsedAge,
        expYears: parsedExp,
        leadership,
        employment,
        languagesCount: parsedLanguages,
        education,
        annualCompensation: parsedAnnual,
        hourlyRate: parsedHourly,
        hoursPerWeek: parsedHours,
        ethnicity: ethnicity || null,
        consentConcept,
        consentAggregate
      };

      const response = await fetch("/api/calc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Calculation failed.");
      }

      const data = await response.json();
      router.push(`/r/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Role / profession</Label>
            <Select value={rolePreset} onChange={(e) => setRolePreset(e.target.value)}>
              <option value="" disabled>
                Department / Sector
              </option>
              {ROLE_PRESETS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
            <Input
              placeholder="Optional specific title"
              value={roleText}
              onChange={(e) => setRoleText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Industry</Label>
            <Select value={industry} onChange={(e) => setIndustry(e.target.value)}>
              <option value="" disabled>
                Pick your industry
              </option>
              {INDUSTRIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
            {industry === "other" ? (
              <Input
                placeholder="Specify industry (not stored)"
                value={industryOther}
                onChange={(e) => setIndustryOther(e.target.value)}
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Country of residence</Label>
            <Select
              value={residenceCountry}
              onChange={(e) => setResidenceCountry(e.target.value)}
            >
              <option value="" disabled>
                Pick your country of residence
              </option>
              {COUNTRY_OPTIONS.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Country of birth (never stored)</Label>
            <Select value={birthCountry} onChange={(e) => setBirthCountry(e.target.value)}>
              <option value="" disabled>
                Pick your country of birth
              </option>
              {COUNTRY_OPTIONS.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Country you mainly work for</Label>
            <Select value={workCountry} onChange={(e) => setWorkCountry(e.target.value)}>
              <option value="" disabled>
                Pick your main work country
              </option>
              {COUNTRY_OPTIONS.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Age</Label>
            <Input
              type="number"
              min={18}
              max={80}
              placeholder="Enter your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Years of experience in role</Label>
            <Input
              type="number"
              min={0}
              max={40}
              placeholder="Years in role"
              value={expYears}
              onChange={(e) => setExpYears(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Leadership experience</Label>
            <Select value={leadership} onChange={(e) => setLeadership(e.target.value)}>
              <option value="" disabled>
                Pick leadership level
              </option>
              {LEADERSHIP.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Company name (never stored)</Label>
            <Input
              placeholder="Optional"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Employment type</Label>
            <Select value={employment} onChange={(e) => setEmployment(e.target.value)}>
              <option value="" disabled>
                Pick employment type
              </option>
              {EMPLOYMENT.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Languages spoken fluently</Label>
            <Select
              value={languagesCount}
              onChange={(e) => setLanguagesCount(e.target.value)}
            >
              <option value="" disabled>
                Pick languages count
              </option>
              {LANGUAGES.map((item) => (
                <option key={item.label} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Education level</Label>
            <Select value={education} onChange={(e) => setEducation(e.target.value)}>
              <option value="" disabled>
                Pick education level
              </option>
              {EDUCATION.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Compensation input</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={compType === "annual" ? "default" : "outline"}
                onClick={() => setCompType("annual")}
              >
                Annual USD
              </Button>
              <Button
                type="button"
                variant={compType === "hourly" ? "default" : "outline"}
                onClick={() => setCompType("hourly")}
              >
                Hourly USD
              </Button>
            </div>
            {!compType ? (
              <p className="text-xs text-ink/60">Pick a compensation type to continue.</p>
            ) : compType === "annual" ? (
              <Input
                type="number"
                min={0}
                placeholder="Annual salary USD"
                value={annualComp}
                onChange={(e) => setAnnualComp(e.target.value)}
              />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink/60">
                    $
                  </span>
                  <Input
                    type="number"
                    min={0}
                    className="pl-7"
                    placeholder="Hourly rate"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                  />
                </div>
                <Input
                  type="number"
                  min={1}
                  max={80}
                  placeholder="weekly hours"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Ethnicity (optional, aggregate only)</Label>
            <Select value={ethnicity} onChange={(e) => setEthnicity(e.target.value)}>
              <option value="">Pick ethnicity (optional)</option>
              {ETHNICITY_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <p className="text-xs text-ink/70">
              Used only for anonymized insights when consent is granted.
            </p>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <div className="space-y-2">
          <Label className="flex items-start gap-3">
            <Checkbox
              checked={consentConcept}
              onChange={(e) => setConsentConcept(e.target.checked)}
            />
            <span>I understand this is a conceptual tool.</span>
          </Label>
          <Label className="flex items-start gap-3">
            <Checkbox
              checked={consentAggregate}
              onChange={(e) => setConsentAggregate(e.target.checked)}
            />
            <span>I consent to share anonymized, aggregated data for insights.</span>
          </Label>
        </div>
        <p className="text-xs text-ink/70">
          We store only anonymized aggregates if you consent. No names. No company. No birth country. No free text.
        </p>
      </Card>

      {error ? (
        <p className="rounded-md border border-ember/40 bg-ember/10 px-4 py-2 text-sm text-ember">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.2em] text-ink/60">
          Brutally deterministic. Zero empathy.
        </div>
        <Button type="submit" className={cn(isSubmitting && "opacity-70")}>
          {isSubmitting ? "Calculating..." : "Calculate"}
        </Button>
      </div>
    </form>
  );
}
