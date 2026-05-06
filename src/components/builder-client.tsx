"use client";

import { useMemo, useState } from "react";
import { buildChecklist } from "@/lib/guardrails";
import { composePrompt } from "@/lib/prompt";
import type { HookTemplate, KnowledgeBase, OfferBrief, PromptSelection } from "@/types";

const emptyBrief: OfferBrief = {
  offerName: "",
  offerType: "",
  audience: "",
  problem: "",
  desiredOutcome: "",
  mechanism: "",
  proof: "",
  objections: "",
  complianceNotes: "",
  oldBelief: "",
  newBelief: "",
  enemy: "",
  transformation: "",
};

const defaultSelection: PromptSelection = {
  presetId: "short-ugc",
  hookIds: [],
  frameworkIds: [],
  swipeIds: [],
  emotionalDriver: "Curiosity with a mechanism reveal",
  angle: "",
  adLength: "",
};

function updateList(list: string[], id: string, max: number) {
  if (list.includes(id)) {
    return list.filter((item) => item !== id);
  }
  return [...list, id].slice(-max);
}

function searchText(item: unknown) {
  return JSON.stringify(item).toLowerCase();
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  textarea?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      )}
    </label>
  );
}

function PillButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button className={active ? "pill active" : "pill"} type="button" onClick={onClick}>
      {children}
    </button>
  );
}

function HookCard({
  hook,
  selected,
  onToggle,
}: {
  hook: HookTemplate;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button className={selected ? "library-card selected" : "library-card"} type="button" onClick={onToggle}>
      <span className="eyebrow">{hook.pattern}</span>
      <strong>{hook.rawTemplate}</strong>
      <small>{hook.emotionalTrigger}</small>
    </button>
  );
}

export default function BuilderClient({ knowledge }: { knowledge: KnowledgeBase }) {
  const [brief, setBrief] = useState<OfferBrief>(emptyBrief);
  const [selection, setSelection] = useState<PromptSelection>({
    ...defaultSelection,
    hookIds: knowledge.hooks.slice(0, 3).map((hook) => hook.id),
    frameworkIds: knowledge.frameworks.slice(0, 2).map((framework) => framework.id),
    swipeIds: knowledge.swipes.slice(0, 2).map((swipe) => swipe.id),
  });
  const [query, setQuery] = useState("");

  const selectedPreset = knowledge.presets.find((preset) => preset.id === selection.presetId);
  const selectedHooks = knowledge.hooks.filter((hook) => selection.hookIds.includes(hook.id));
  const selectedFrameworks = knowledge.frameworks.filter((framework) => selection.frameworkIds.includes(framework.id));
  const selectedSwipes = knowledge.swipes.filter((swipe) => selection.swipeIds.includes(swipe.id));
  const checklist = buildChecklist(brief);

  const prompt = useMemo(
    () =>
      composePrompt({
        brief,
        preset: selectedPreset,
        hooks: selectedHooks,
        frameworks: selectedFrameworks,
        swipes: selectedSwipes,
        selection,
      }),
    [brief, selectedPreset, selectedHooks, selectedFrameworks, selectedSwipes, selection],
  );

  const filteredHooks = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return knowledge.hooks.filter((hook) => !normalized || searchText(hook).includes(normalized)).slice(0, 18);
  }, [knowledge.hooks, query]);

  const filteredSwipes = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return knowledge.swipes.filter((swipe) => !normalized || searchText(swipe).includes(normalized)).slice(0, 10);
  }, [knowledge.swipes, query]);

  function setBriefField(field: keyof OfferBrief, value: string) {
    setBrief((current) => ({ ...current, [field]: value }));
  }

  return (
    <main>
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Private workspace</p>
          <h1>Ad Script Prompt Builder</h1>
          <p className="sidebar-copy">
            Build a structured brief, choose proven hook and swipe logic, then export a master prompt for any LLM.
          </p>
        </div>
        <nav>
          <a href="#brief">Offer brief</a>
          <a href="#angle">Angle builder</a>
          <a href="#library">Wisdom library</a>
          <a href="#prompt">Prompt export</a>
        </nav>
        <div className="stat-grid">
          <div>
            <strong>{knowledge.hooks.length}</strong>
            <span>Hooks</span>
          </div>
          <div>
            <strong>{knowledge.frameworks.length}</strong>
            <span>Frameworks</span>
          </div>
          <div>
            <strong>{knowledge.swipes.length}</strong>
            <span>Swipes</span>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Prompt-first ad creation</p>
            <h2>Turn offer strategy into an LLM-ready ad brief</h2>
          </div>
          <a className="ghost-button" href="#prompt">
            View prompt
          </a>
        </header>

        <section className="panel" id="brief">
          <div className="section-head">
            <div>
              <p className="eyebrow">Step 1</p>
              <h3>Offer brief</h3>
            </div>
            <span>{checklist.filter((item) => item.status === "warn").length} warnings</span>
          </div>
          <div className="form-grid">
            <Field label="Offer name" value={brief.offerName} onChange={(value) => setBriefField("offerName", value)} placeholder="Example: 7-minute sales call audit" />
            <Field label="Offer type" value={brief.offerType} onChange={(value) => setBriefField("offerType", value)} placeholder="Service, product, quiz, method, coaching..." />
            <Field label="Audience" value={brief.audience} onChange={(value) => setBriefField("audience", value)} placeholder="Who this is for, with context" textarea />
            <Field label="Problem" value={brief.problem} onChange={(value) => setBriefField("problem", value)} placeholder="Pain, blocked desire, or hidden cost" textarea />
            <Field label="Desired outcome" value={brief.desiredOutcome} onChange={(value) => setBriefField("desiredOutcome", value)} placeholder="What they want instead" textarea />
            <Field label="Unique mechanism" value={brief.mechanism} onChange={(value) => setBriefField("mechanism", value)} placeholder="Why this works differently" textarea />
            <Field label="Proof" value={brief.proof} onChange={(value) => setBriefField("proof", value)} placeholder="Data, examples, demos, credentials, screenshots, testimonials" textarea />
            <Field label="Objections" value={brief.objections} onChange={(value) => setBriefField("objections", value)} placeholder="What they doubt, fear, or misunderstand" textarea />
          </div>
        </section>

        <section className="panel" id="angle">
          <div className="section-head">
            <div>
              <p className="eyebrow">Step 2</p>
              <h3>Angle and concept map</h3>
            </div>
            <span>Mechanism first</span>
          </div>
          <div className="preset-row">
            {knowledge.presets.map((preset) => (
              <PillButton
                key={preset.id}
                active={selection.presetId === preset.id}
                onClick={() => setSelection((current) => ({ ...current, presetId: preset.id, adLength: preset.lengthTarget }))}
              >
                {preset.name}
              </PillButton>
            ))}
          </div>
          <div className="form-grid">
            <Field label="Primary angle" value={selection.angle} onChange={(value) => setSelection((current) => ({ ...current, angle: value }))} placeholder="Example: The hidden reason sales calls stall" />
            <Field label="Emotional driver" value={selection.emotionalDriver} onChange={(value) => setSelection((current) => ({ ...current, emotionalDriver: value }))} placeholder="Curiosity, relief, frustration, proof..." />
            <Field label="Old belief" value={brief.oldBelief} onChange={(value) => setBriefField("oldBelief", value)} placeholder="What they currently believe" textarea />
            <Field label="New belief" value={brief.newBelief} onChange={(value) => setBriefField("newBelief", value)} placeholder="What the ad should install instead" textarea />
            <Field label="Enemy / false solution" value={brief.enemy} onChange={(value) => setBriefField("enemy", value)} placeholder="What they should stop trusting" textarea />
            <Field label="Transformation" value={brief.transformation} onChange={(value) => setBriefField("transformation", value)} placeholder="Before and after state" textarea />
            <Field label="Compliance notes" value={brief.complianceNotes} onChange={(value) => setBriefField("complianceNotes", value)} placeholder="Claims to avoid, proof limits, regulated niche notes" textarea />
            <Field label="Preferred ad length" value={selection.adLength} onChange={(value) => setSelection((current) => ({ ...current, adLength: value }))} placeholder="Example: 45-60 seconds" />
          </div>
        </section>

        <section className="split">
          <section className="panel" id="library">
            <div className="section-head">
              <div>
                <p className="eyebrow">Step 3</p>
                <h3>Wisdom library</h3>
              </div>
              <input className="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search hooks and swipes" />
            </div>

            <h4>Hook Lab</h4>
            <div className="library-grid">
              {filteredHooks.map((hook) => (
                <HookCard
                  key={hook.id}
                  hook={hook}
                  selected={selection.hookIds.includes(hook.id)}
                  onToggle={() =>
                    setSelection((current) => ({ ...current, hookIds: updateList(current.hookIds, hook.id, 6) }))
                  }
                />
              ))}
            </div>

            <h4>Framework Notes</h4>
            <div className="preset-row">
              {knowledge.frameworks.map((framework) => (
                <PillButton
                  key={framework.id}
                  active={selection.frameworkIds.includes(framework.id)}
                  onClick={() =>
                    setSelection((current) => ({
                      ...current,
                      frameworkIds: updateList(current.frameworkIds, framework.id, 4),
                    }))
                  }
                >
                  {framework.topic}
                </PillButton>
              ))}
            </div>

            <h4>Swipe Logic Browser</h4>
            <div className="swipe-list">
              {filteredSwipes.map((swipe) => (
                <button
                  key={swipe.id}
                  className={selection.swipeIds.includes(swipe.id) ? "swipe selected" : "swipe"}
                  type="button"
                  onClick={() => setSelection((current) => ({ ...current, swipeIds: updateList(current.swipeIds, swipe.id, 4) }))}
                >
                  <strong>{swipe.title}</strong>
                  <span>{swipe.hookExcerpt}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="panel checklist">
            <div className="section-head">
              <div>
                <p className="eyebrow">Guardrails</p>
                <h3>Output checklist</h3>
              </div>
            </div>
            {checklist.map((item) => (
              <div className={item.status === "pass" ? "check pass" : "check warn"} key={item.label}>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </section>
        </section>

        <section className="panel prompt-panel" id="prompt">
          <div className="section-head">
            <div>
              <p className="eyebrow">Step 4</p>
              <h3>Master prompt export</h3>
            </div>
            <button className="primary-button" type="button" onClick={() => navigator.clipboard.writeText(prompt)}>
              Copy prompt
            </button>
          </div>
          <textarea className="prompt-output" value={prompt} readOnly />
        </section>
      </section>
    </main>
  );
}
