# Ad Script Prompt Builder

Private Next.js workspace for building comprehensive LLM prompts for Facebook-style video ads.

The app stores ad wisdom in repo-backed JSON files, lets you fill an offer brief, select hooks/frameworks/swipe logic, and exports a master prompt for an external LLM. It does not call an LLM API in v1.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`.

## Refresh the knowledge base

The importer reads the source files originally supplied for the project:

- `C:\Users\tarmo\Projects\NHB Swipe.zip`
- `C:\Users\tarmo\Documents\Obsidian Vault\100 hooks.md`
- `C:\Users\tarmo\Projects\NHB\Info file\Coaches\Alen Sultanic\Alen pdfs\2025-08-21 - Creating World Class Hooks.pdf`
- `C:\Users\tarmo\Projects\NHB\Info file\Coaches\Alen Sultanic\Alen pdfs\2025-10-09 - Creating Concepts.pdf`

Use the bundled Codex Python runtime if your system Python does not have `pypdf`:

```powershell
& 'C:\Users\tarmo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts/import-knowledge.py
```

The generated repo files live in `content/`.

## Checks

```powershell
npm.cmd run typecheck
npm.cmd run build
```

## Private access on Vercel

Production deployments use a secret unlock link through `src/proxy.ts` and `src/app/unlock/route.ts`.

Set this Vercel environment variable before exposing the deployment:

```text
ACCESS_TOKEN=your-secret-token-here
```

Open the app once with:

```text
https://your-domain.vercel.app/unlock?token=your-secret-token-here
```

That sets a secure browser cookie. After that, the normal app URL opens without a Basic Auth prompt, which is easier for browser automation tools.
