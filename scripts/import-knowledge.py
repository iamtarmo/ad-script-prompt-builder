from __future__ import annotations

import argparse
import json
import re
import textwrap
import zipfile
from pathlib import Path
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_HOOKS = Path(r"C:\Users\tarmo\Documents\Obsidian Vault\100 hooks.md")
DEFAULT_SWIPE_ZIP = Path(r"C:\Users\tarmo\Projects\NHB Swipe.zip")
DEFAULT_HOOKS_PDF = Path(
    r"C:\Users\tarmo\Projects\NHB\Info file\Coaches\Alen Sultanic\Alen pdfs\2025-08-21 - Creating World Class Hooks.pdf"
)
DEFAULT_CONCEPTS_PDF = Path(
    r"C:\Users\tarmo\Projects\NHB\Info file\Coaches\Alen Sultanic\Alen pdfs\2025-10-09 - Creating Concepts.pdf"
)

W_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

REPLACEMENTS = {
    "\u2018": "'",
    "\u2019": "'",
    "\u201c": '"',
    "\u201d": '"',
    "\u2013": "-",
    "\u2014": "-",
    "\u2026": "...",
    "\u00a0": " ",
}

PRESETS = [
    {
        "id": "short-ugc",
        "name": "Short UGC",
        "lengthTarget": "30-45 seconds",
        "outputFormat": "Casual UGC video script plus concise Facebook primary text",
        "selectedFrameworks": ["hooks-world-class", "concept-creation"],
        "requiredSections": ["Pattern interrupt hook", "Problem", "Mechanism", "Proof", "CTA"],
    },
    {
        "id": "long-vsl-ugc",
        "name": "Long VSL-style UGC",
        "lengthTarget": "90-180 seconds",
        "outputFormat": "UGC-style spoken VSL with direct-response pacing plus longer Facebook copy",
        "selectedFrameworks": ["hooks-world-class", "concept-creation"],
        "requiredSections": ["Hook", "Agitate", "Hidden cause", "Concept", "Proof", "Offer", "CTA"],
    },
    {
        "id": "quiz-ad",
        "name": "Quiz ad",
        "lengthTarget": "35-60 seconds",
        "outputFormat": "Quiz invitation video script plus curiosity-driven Facebook copy",
        "selectedFrameworks": ["hooks-world-class", "concept-creation"],
        "requiredSections": ["Curiosity hook", "Symptom pattern", "Quiz promise", "Low-friction CTA"],
    },
    {
        "id": "mechanism-heavy",
        "name": "Mechanism-heavy",
        "lengthTarget": "60-90 seconds",
        "outputFormat": "Mechanism-led script and explanatory ad copy",
        "selectedFrameworks": ["concept-creation"],
        "requiredSections": ["Old belief", "New mechanism", "Why it works", "Proof", "CTA"],
    },
    {
        "id": "founder-story",
        "name": "Founder/story ad",
        "lengthTarget": "60-120 seconds",
        "outputFormat": "Personal story UGC script plus narrative Facebook copy",
        "selectedFrameworks": ["hooks-world-class"],
        "requiredSections": ["Personal hook", "Discovery", "Mistake or enemy", "Mechanism", "Invitation"],
    },
    {
        "id": "direct-response",
        "name": "Direct response Facebook ad",
        "lengthTarget": "45-75 seconds",
        "outputFormat": "Tight conversion-focused script plus direct Facebook primary text",
        "selectedFrameworks": ["hooks-world-class", "concept-creation"],
        "requiredSections": ["Hook", "Problem", "Specific payoff", "Proof", "CTA"],
    },
]


def slugify(value: str, fallback: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or fallback


def normalize_text(text: str) -> str:
    if any(marker in text for marker in ("â", "Ã", "€")):
        try:
            text = text.encode("latin1", errors="ignore").decode("utf-8", errors="ignore")
        except UnicodeError:
            pass

    for old, new in REPLACEMENTS.items():
        text = text.replace(old, new)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def sentence_chunks(text: str) -> list[str]:
    clean = re.sub(r"\s+", " ", text).strip()
    parts = re.split(r"(?<=[.!?])\s+", clean)
    return [part.strip() for part in parts if len(part.strip()) > 20]


def hook_pattern(template: str) -> tuple[str, str, str, str]:
    lower = template.lower()
    if "mistake" in lower or "wrong" in lower:
        return ("Mistake", "mistake reveal", "fear of wasting effort", "When the audience is doing the common thing wrong")
    if "story" in lower or "started" in lower or "first" in lower:
        return ("Story", "personal story", "identification", "When the offer needs trust and human context")
    if "nobody" in lower or "truth" in lower or "warns" in lower:
        return ("Contrarian", "unexpected truth", "curiosity", "When the market has a stale or incomplete belief")
    if "before" in lower or "watch this" in lower:
        return ("Warning", "before you try", "loss avoidance", "When prospects are about to take the wrong next step")
    if "why" in lower or "works" in lower:
        return ("Mechanism", "mechanism reveal", "curiosity", "When the ad should explain why the offer works")
    if "tested" in lower or "spent money" in lower:
        return ("Proof", "tested-for-you", "relief", "When the ad can borrow credibility from testing or experience")
    return ("Curiosity", "open loop", "curiosity", "When the goal is to interrupt scrolling without over-explaining")


def parse_hooks(path: Path) -> list[dict]:
    text = normalize_text(path.read_text(encoding="utf-8", errors="ignore"))
    hooks: list[dict] = []
    for match in re.finditer(r"^\s*(\d+)\.\s+(.+?)\s*$", text, re.MULTILINE):
        number = match.group(1)
        template = normalize_text(match.group(2))
        category, pattern, trigger, best_use = hook_pattern(template)
        hooks.append(
            {
                "id": f"hook-{number.zfill(3)}",
                "title": f"{category} hook {number}",
                "rawTemplate": template,
                "category": category,
                "pattern": pattern,
                "emotionalTrigger": trigger,
                "bestUseCase": best_use,
            }
        )
    return hooks


def pdf_text(path: Path) -> str:
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise RuntimeError("pypdf is required for PDF extraction. Use the bundled Codex Python runtime or install pypdf.") from exc

    reader = PdfReader(str(path))
    pages = [(page.extract_text() or "") for page in reader.pages]
    return normalize_text("\n".join(pages))


def framework_from_pdf(path: Path, framework_id: str, topic: str, prompt_instructions: list[str]) -> dict:
    text = pdf_text(path)
    chunks = sentence_chunks(text)
    summary = " ".join(chunks[:4])[:900]
    rules = []
    for chunk in chunks[4:24]:
        if len(rules) >= 7:
            break
        if any(word in chunk.lower() for word in ("because", "condition", "change", "doubt", "concept", "belief", "create")):
            rules.append(chunk[:260])
    if not rules:
        rules = chunks[4:11]

    return {
        "id": framework_id,
        "source": path.name,
        "topic": topic,
        "summary": summary,
        "rules": rules[:7],
        "examples": chunks[24:29],
        "promptInstructions": prompt_instructions,
    }


def docx_text_from_zip(zip_file: zipfile.ZipFile, entry_name: str) -> str:
    with zip_file.open(entry_name) as docx_handle:
        with zipfile.ZipFile(docx_handle) as docx:
            xml = docx.read("word/document.xml")
    root = ElementTree.fromstring(xml)
    paragraphs = []
    for paragraph in root.iter(W_NS + "p"):
        parts = [node.text for node in paragraph.iter(W_NS + "t") if node.text]
        if parts:
            paragraphs.append("".join(parts))
    return normalize_text("\n".join(paragraphs))


def infer_niche(title: str, text: str) -> str:
    lower = f"{title} {text[:2500]}".lower()
    checks = [
        ("Health", ["diabetes", "weight", "skinny", "ed", "back freedom", "youth", "food"]),
        ("Wealth", ["money", "profits", "millionaire", "commission", "binary", "wealth", "traffic"]),
        ("Security", ["security", "survival", "home"]),
        ("Relationships", ["ex back", "sex"]),
        ("Marketing", ["marketing", "click", "affiliate", "webinar", "launch", "list"]),
    ]
    for niche, words in checks:
        if any(word in lower for word in words):
            return niche
    return "General direct response"


def infer_offer_type(title: str, text: str) -> str:
    lower = f"{title} {text[:2500]}".lower()
    if "webinar" in lower:
        return "Webinar"
    if "upsell" in lower:
        return "Upsell"
    if "software" in lower or "tool" in lower or ".com" in lower:
        return "Software/tool"
    if "blueprint" in lower or "system" in lower or "method" in lower:
        return "Methodology"
    if "sales letter" in lower or "front end" in lower or "vsl" in lower:
        return "Long-form sales ad"
    return "Offer copy"


def structure_notes(text: str) -> list[str]:
    lower = text.lower()
    notes = []
    if "dear " in lower:
        notes.append("Opens like a letter and quickly establishes a direct one-to-one conversation.")
    if "do you" in lower or "have you" in lower:
        notes.append("Uses diagnostic questions to make the reader self-identify with the problem.")
    if "introducing" in lower:
        notes.append("Builds tension before naming the offer or mechanism.")
    if "imagine" in lower:
        notes.append("Uses future pacing to make the outcome feel tangible.")
    if "because" in lower:
        notes.append("Connects claims with reasons, which is useful for mechanism-heavy prompts.")
    if not notes:
        notes.append("Use as a direct-response structure reference for hook, problem, proof, and close sequencing.")
    return notes[:5]


def transitions(text: str) -> list[str]:
    candidates = []
    for line in re.split(r"[\n.!?]+", text):
        clean = normalize_text(line)
        lower = clean.lower()
        if 18 <= len(clean) <= 160 and any(
            phrase in lower
            for phrase in ("the good news", "introducing", "in short", "imagine", "here's", "that's why", "because")
        ):
            candidates.append(clean)
        if len(candidates) >= 5:
            break
    return candidates


def parse_swipes(path: Path, limit: int | None = None) -> list[dict]:
    swipes = []
    with zipfile.ZipFile(path) as archive:
        entries = [entry for entry in archive.namelist() if entry.lower().endswith(".docx")]
        for index, entry in enumerate(entries[:limit], start=1):
            try:
                text = docx_text_from_zip(archive, entry)
            except Exception as exc:
                print(f"Skipping {entry}: {exc}")
                continue
            title = Path(entry).stem
            chunks = sentence_chunks(text)
            hook_excerpt = chunks[0] if chunks else text[:220]
            swipes.append(
                {
                    "id": f"swipe-{index:03d}-{slugify(title, str(index))}",
                    "title": normalize_text(title),
                    "sourceFile": entry,
                    "niche": infer_niche(title, text),
                    "offerType": infer_offer_type(title, text),
                    "hookExcerpt": textwrap.shorten(hook_excerpt, width=260, placeholder="..."),
                    "structureNotes": structure_notes(text),
                    "usefulTransitions": transitions(text),
                    "rawTextReference": textwrap.shorten(text, width=5000, placeholder="..."),
                }
            )
    return swipes


def write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Import local ad wisdom into repo-backed JSON content.")
    parser.add_argument("--hooks", type=Path, default=DEFAULT_HOOKS)
    parser.add_argument("--swipe-zip", type=Path, default=DEFAULT_SWIPE_ZIP)
    parser.add_argument("--hooks-pdf", type=Path, default=DEFAULT_HOOKS_PDF)
    parser.add_argument("--concepts-pdf", type=Path, default=DEFAULT_CONCEPTS_PDF)
    parser.add_argument("--swipe-limit", type=int, default=None)
    args = parser.parse_args()

    hooks = parse_hooks(args.hooks)
    frameworks = [
        framework_from_pdf(
            args.hooks_pdf,
            "hooks-world-class",
            "Creating World Class Hooks",
            [
                "Start with a condition, illusion, or stuck belief that already exists in the prospect's mind.",
                "Make the hook create movement from illusion to curiosity rather than using empty shock value.",
                "Tie the opener to the mechanism so the rest of the ad pays off the first line.",
            ],
        ),
        framework_from_pdf(
            args.concepts_pdf,
            "concept-creation",
            "Creating Concepts",
            [
                "Define the old belief, new belief, enemy, mechanism, and transformation before writing copy.",
                "Use the concept to make the offer feel like a new reality, not another tip or generic benefit.",
                "Make the mechanism remove doubt by explaining why this path works differently.",
            ],
        ),
    ]
    swipes = parse_swipes(args.swipe_zip, args.swipe_limit)

    write_json(ROOT / "content" / "hooks.json", hooks)
    write_json(ROOT / "content" / "frameworks.json", frameworks)
    write_json(ROOT / "content" / "swipes.json", swipes)
    write_json(ROOT / "content" / "presets.json", PRESETS)

    print(f"Imported {len(hooks)} hooks, {len(frameworks)} frameworks, {len(swipes)} swipes.")


if __name__ == "__main__":
    main()
