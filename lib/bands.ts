export type ExpBand = "0-2" | "3-5" | "6-9" | "10+";
export type AgeBand = "18-24" | "25-34" | "35-44" | "45+";
export type LanguagesBand = "1" | "2" | "3+";

export function getExpBand(years: number): ExpBand {
  if (years <= 2) return "0-2";
  if (years <= 5) return "3-5";
  if (years <= 9) return "6-9";
  return "10+";
}

export function getAgeBand(age: number): AgeBand {
  if (age <= 24) return "18-24";
  if (age <= 34) return "25-34";
  if (age <= 44) return "35-44";
  return "45+";
}

export function getLanguagesBand(count: number): LanguagesBand {
  if (count >= 3) return "3+";
  if (count === 2) return "2";
  return "1";
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
