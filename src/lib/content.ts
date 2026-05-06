import { readFile } from "node:fs/promises";
import path from "node:path";
import type { FrameworkNote, HookTemplate, KnowledgeBase, PromptPreset, SwipeExample } from "@/types";

async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const filePath = path.join(process.cwd(), "content", fileName);
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

export async function getKnowledgeBase(): Promise<KnowledgeBase> {
  const [hooks, frameworks, swipes, presets] = await Promise.all([
    readJson<HookTemplate[]>("hooks.json", []),
    readJson<FrameworkNote[]>("frameworks.json", []),
    readJson<SwipeExample[]>("swipes.json", []),
    readJson<PromptPreset[]>("presets.json", []),
  ]);

  return { hooks, frameworks, swipes, presets };
}
