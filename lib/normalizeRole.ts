export const ROLE_CATEGORIES = [
  "software",
  "product",
  "design",
  "data",
  "marketing",
  "sales",
  "operations",
  "finance"
] as const;

export type RoleCategory = (typeof ROLE_CATEGORIES)[number];

const KEYWORDS: Record<RoleCategory, string[]> = {
  software: ["engineer", "developer", "software", "frontend", "backend", "fullstack", "mobile", "devops"],
  product: ["product", "pm", "owner", "growth"],
  design: ["design", "designer", "ux", "ui", "graphic", "visual"],
  data: ["data", "analyst", "analytics", "ml", "machine learning", "ai", "scientist"],
  marketing: ["marketing", "brand", "content", "seo", "social", "copy"],
  sales: ["sales", "account", "bizdev", "business development"],
  operations: ["ops", "operations", "people", "hr", "talent", "project", "program"],
  finance: ["finance", "accounting", "fp&a", "controller", "audit"]
};

export function normalizeRole(input: string): RoleCategory {
  const value = input.toLowerCase();
  for (const category of ROLE_CATEGORIES) {
    if (KEYWORDS[category].some((keyword) => value.includes(keyword))) {
      return category;
    }
  }
  return "operations";
}
