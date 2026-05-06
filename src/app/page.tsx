import { getKnowledgeBase } from "@/lib/content";
import BuilderClient from "@/components/builder-client";

export default async function Home() {
  const knowledge = await getKnowledgeBase();
  return <BuilderClient knowledge={knowledge} />;
}
