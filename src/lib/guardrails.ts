import type { ChecklistItem, OfferBrief } from "@/types";

const riskyClaimPatterns = [
  "guarantee",
  "guaranteed",
  "cure",
  "instant",
  "overnight",
  "risk-free",
  "no effort",
  "without work",
  "everyone",
  "always",
  "never fails",
];

const sensitivePatterns = [
  "depression",
  "anxiety",
  "diabetes",
  "weight loss",
  "debt",
  "bankruptcy",
  "addiction",
  "medical",
  "therapy",
];

function includesAny(text: string, patterns: string[]) {
  const lower = text.toLowerCase();
  return patterns.some((pattern) => lower.includes(pattern));
}

export function buildChecklist(brief: OfferBrief): ChecklistItem[] {
  const combined = Object.values(brief).join(" ");

  return [
    {
      label: "Proof is specific",
      status: brief.proof.trim().length >= 24 ? "pass" : "warn",
      detail:
        brief.proof.trim().length >= 24
          ? "The prompt can anchor claims in proof."
          : "Add proof, data, credentials, testimonials, demonstration, or a clear reason to believe.",
    },
    {
      label: "Mechanism is concrete",
      status: brief.mechanism.trim().length >= 24 ? "pass" : "warn",
      detail:
        brief.mechanism.trim().length >= 24
          ? "The ad can explain why the offer works."
          : "Define the unique mechanism so the LLM does not fall back to generic benefits.",
    },
    {
      label: "Audience is usable",
      status: brief.audience.trim().length >= 16 ? "pass" : "warn",
      detail:
        brief.audience.trim().length >= 16
          ? "The audience is specific enough for angle selection."
          : "Name the buyer, context, sophistication level, and current pain.",
    },
    {
      label: "Risky claim language",
      status: includesAny(combined, riskyClaimPatterns) ? "warn" : "pass",
      detail: includesAny(combined, riskyClaimPatterns)
        ? "Review absolute, instant, cure, or guarantee language before using the output in ads."
        : "No obvious absolute or unsupported claim terms detected.",
    },
    {
      label: "Sensitive niche flag",
      status: includesAny(combined, sensitivePatterns) ? "warn" : "pass",
      detail: includesAny(combined, sensitivePatterns)
        ? "Use neutral language and avoid implying the viewer has a protected trait or medical/financial condition."
        : "No obvious sensitive-niche terms detected.",
    },
  ];
}
