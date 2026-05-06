import type { FrameworkNote, HookTemplate, OfferBrief, PromptPreset, PromptSelection, SwipeExample } from "@/types";

function valueOrPlaceholder(value: string, placeholder: string) {
  return value.trim() || `[${placeholder}]`;
}

function list(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None selected";
}

export function composePrompt({
  brief,
  preset,
  hooks,
  frameworks,
  swipes,
  selection,
}: {
  brief: OfferBrief;
  preset: PromptPreset | undefined;
  hooks: HookTemplate[];
  frameworks: FrameworkNote[];
  swipes: SwipeExample[];
  selection: PromptSelection;
}) {
  const selectedPreset =
    preset ??
    ({
      id: "custom",
      name: "Custom ad prompt",
      lengthTarget: selection.adLength || "Choose the best length for the offer",
      outputFormat: "UGC video script plus Facebook ad copy",
      selectedFrameworks: [],
      requiredSections: ["Hook", "Problem", "Mechanism", "Proof", "Offer", "CTA"],
    } satisfies PromptPreset);

  const hookBlock = hooks
    .map(
      (hook) =>
        `- ${hook.rawTemplate}\n  Pattern: ${hook.pattern}. Trigger: ${hook.emotionalTrigger}. Best use: ${hook.bestUseCase}.`,
    )
    .join("\n");

  const frameworkBlock = frameworks
    .map(
      (framework) =>
        `## ${framework.topic}\nSource: ${framework.source}\nSummary: ${framework.summary}\nRules:\n${list(
          framework.rules,
        )}\nPrompt instructions:\n${list(framework.promptInstructions)}`,
    )
    .join("\n\n");

  const swipeBlock = swipes
    .map(
      (swipe) =>
        `## ${swipe.title}\nNiche: ${swipe.niche}. Offer type: ${swipe.offerType}.\nOpening: ${swipe.hookExcerpt}\nStructure notes:\n${list(
          swipe.structureNotes,
        )}\nUseful transitions:\n${list(swipe.usefulTransitions)}`,
    )
    .join("\n\n");

  return `You are a senior direct-response video ad strategist writing for Facebook and similar paid social channels.

Your job is to write a master-level ad for the offer below. Use the provided hooks, concept logic, swipe structures, and guardrails. Do not mechanically combine lines. Synthesize them into a fresh ad that feels native, specific, and persuasive.

# Output Required
1. UGC AI avatar video script with natural spoken language.
2. Facebook ad primary text for readers.
3. 5 alternate opening hooks.
4. A short compliance and claim-risk note.

# Preset
Name: ${selectedPreset.name}
Length target: ${selectedPreset.lengthTarget}
Format: ${selectedPreset.outputFormat}
Required sections:
${list(selectedPreset.requiredSections)}

# Offer Brief
Offer name: ${valueOrPlaceholder(brief.offerName, "offer name")}
Offer type: ${valueOrPlaceholder(brief.offerType, "service/product/quiz/methodology/etc.")}
Audience: ${valueOrPlaceholder(brief.audience, "specific audience")}
Problem: ${valueOrPlaceholder(brief.problem, "pain or urgent problem")}
Desired outcome: ${valueOrPlaceholder(brief.desiredOutcome, "desired result")}
Unique mechanism: ${valueOrPlaceholder(brief.mechanism, "why this works differently")}
Proof: ${valueOrPlaceholder(brief.proof, "proof, credibility, demonstration, or reason to believe")}
Objections: ${valueOrPlaceholder(brief.objections, "main objections")}
Compliance notes: ${valueOrPlaceholder(brief.complianceNotes, "claims or policy constraints")}

# Concept Map
Old belief to challenge: ${valueOrPlaceholder(brief.oldBelief, "old belief")}
New belief to install: ${valueOrPlaceholder(brief.newBelief, "new belief")}
Enemy or false solution: ${valueOrPlaceholder(brief.enemy, "enemy or false solution")}
Transformation: ${valueOrPlaceholder(brief.transformation, "before-to-after transformation")}

# Angle Direction
Primary angle: ${valueOrPlaceholder(selection.angle, "choose the strongest angle")}
Emotional driver: ${valueOrPlaceholder(selection.emotionalDriver, "curiosity, relief, frustration, proof, contrarian insight, etc.")}
Preferred length: ${valueOrPlaceholder(selection.adLength, selectedPreset.lengthTarget)}

# Hook Inputs
Use these as inspiration, not as exact copy:
${hookBlock || "- No hook templates selected. Create hooks from the offer and concept map."}

# Framework Notes
${frameworkBlock || "No framework notes selected. Still use mechanism-first direct response logic."}

# Swipe Logic
${swipeBlock || "No swipe examples selected. Use a clear hook, problem, mechanism, proof, offer, CTA sequence."}

# Guardrails
- Avoid implying the viewer personally has a protected trait, medical condition, financial status, or other sensitive attribute.
- Do not make unsupported guarantees, cure claims, instant-result claims, or income claims.
- If proof is weak, write with softer language and call out that stronger proof is needed.
- Keep the UGC script speakable, concrete, and built around one main idea.
- Make the concept/mechanism clear enough that the ad does not sound like generic benefit copy.
- Use transitions that make the logic feel inevitable: problem -> hidden cause -> new mechanism -> proof -> next step.
`;
}
