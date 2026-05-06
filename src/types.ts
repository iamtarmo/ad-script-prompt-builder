export type HookTemplate = {
  id: string;
  title: string;
  rawTemplate: string;
  category: string;
  pattern: string;
  emotionalTrigger: string;
  bestUseCase: string;
};

export type FrameworkNote = {
  id: string;
  source: string;
  topic: string;
  summary: string;
  rules: string[];
  examples: string[];
  promptInstructions: string[];
};

export type SwipeExample = {
  id: string;
  title: string;
  sourceFile: string;
  niche: string;
  offerType: string;
  hookExcerpt: string;
  structureNotes: string[];
  usefulTransitions: string[];
  rawTextReference: string;
};

export type PromptPreset = {
  id: string;
  name: string;
  lengthTarget: string;
  outputFormat: string;
  selectedFrameworks: string[];
  requiredSections: string[];
};

export type OfferBrief = {
  offerName: string;
  offerType: string;
  audience: string;
  problem: string;
  desiredOutcome: string;
  mechanism: string;
  proof: string;
  objections: string;
  complianceNotes: string;
  oldBelief: string;
  newBelief: string;
  enemy: string;
  transformation: string;
};

export type KnowledgeBase = {
  hooks: HookTemplate[];
  frameworks: FrameworkNote[];
  swipes: SwipeExample[];
  presets: PromptPreset[];
};

export type PromptSelection = {
  presetId: string;
  hookIds: string[];
  frameworkIds: string[];
  swipeIds: string[];
  emotionalDriver: string;
  angle: string;
  adLength: string;
};

export type ChecklistItem = {
  label: string;
  status: "pass" | "warn";
  detail: string;
};
