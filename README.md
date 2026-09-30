# Northstar — Value & deployment

**Live demo:** https://northstar-intelligence-mu.vercel.app

> Tip: use the **role switcher** (top right) to move between the *LOB owner* and *Executive / Admin* views — the *Intelligence allocation* screen is executive-only.

A clickable prototype of a new surface inside **Claude Enterprise** settings, built for an Anthropic Enterprise PM take-home. It sits alongside Organization / Analytics and is designed for **existing Claude Enterprise customers with meaningful historical usage** (cold start is intentionally out of scope).

It demonstrates two linked experiences for a fictional company, **Northstar**:

1. **Value** — a line-of-business view where Claude proposes what to measure and shows measured value (consumption → work → signal).
2. **Intelligence allocation** — an executive-only view that turns those value signals into concrete, reversible deployment opportunities across **workflow × capability × consumption**.

---

## Install

```bash
npm install
```

Requires Node 18.17+ (built and tested on Node 20/24).

## Run locally

```bash
npm run dev
```

Open <http://localhost:3000>. The app redirects to `/value`.

To run a production build locally:

```bash
npm run build && npm start
```

## Deploy to Vercel

This is a stock Next.js App Router project with no database and no required environment variables, so it deploys with zero configuration.

**Option A — CLI**

```bash
npm i -g vercel   # if you don't have it
vercel            # preview deploy, accept all defaults
vercel --prod     # production deploy
```

**Option B — Dashboard**

Push the repo to GitHub and import it at <https://vercel.com/new>. Framework preset **Next.js** is detected automatically; no settings to change.

### Optional: make "Ask Claude" a live model call

The **Ask Claude** boxes (in *How this is measured* and each deployment opportunity) work out of the box with **no key** — a lightweight `/api/ask` route returns deterministic, data-derived answers so the public demo is free, fast, and reliable.

To make them call a **real Claude model** (Haiku 4.5) instead, set an `ANTHROPIC_API_KEY`:

- **Locally:** create `.env.local` with `ANTHROPIC_API_KEY=sk-ant-...`, then `npm run dev`.
- **Vercel:** add `ANTHROPIC_API_KEY` in Project → Settings → Environment Variables and redeploy.

The route grounds the model in the same mock dataset, so answers stay consistent with the UI. If the key is absent or a call fails, it silently falls back to the deterministic answer — the demo never dead-ends.

---

## Demo guide (≈5 minutes)

Everything is driven by static mock data — no login, no API calls.

- **Role switcher** (top right): toggle between **LOB owner** and **Executive / Admin**. The *Intelligence allocation* nav item and page are executive-only.
- **Line of business switcher** (Value page): toggle between **Engineering** and **Sales & Marketing**.

Suggested flow:

1. Open as **LOB owner** → **Value** (defaults to Engineering).
2. Note the framing: *Claude found these workflows and recommends measuring value this way.* One measurement (Incident investigation) is still **Proposed** — you can **Accept** it live.
3. On **Feature development**, click **How this is measured** (calculation, baseline, confidence rationale, sources, limitations) — and at the bottom, **ask Claude about the measurement** ("Is this causal?", "Why this confidence level?"). Then use **Adjust measurement** and tell Claude *"exclude epics"* (or type your own) — Claude **recomputes** the signal and confidence in plain language. Accept the revised version or revert. The same panel lets you **add data** to strengthen the signal.
4. See **confidence as a lever**: inside **Adjust measurement**, the *Add data to strengthen this* section lets you **Connect** a suggested source (e.g. *Release / deploy tooling*), enter a source manually, or pick one from **Connect via Claude connectors**. Switch to **Sales & Marketing**, open **Adjust** on *Campaign / content production* and ask for *"only count approved assets"* — Claude says it can't until the CMS is connected, then **Connect** unlocks the recompute. This shows measurement has real limits, not just knobs.
5. Scroll to **Cost predictability** — a spend forecast derived from *expected work*, not token extrapolation.
6. Switch the role to **Executive / Admin** → open **Intelligence allocation**.
7. Read the restrained overview, then the **Deployment opportunities**: expand consumption (Feature dev), expand capability (Account research), investigate before expanding (Marketing content), and tune capability (Incident response).
8. Open one with **View evidence & plan**: **Evidence → Proposed deployment change → What we'll learn** (expand / maintain / revert). At the bottom, **ask Claude** about the opportunity ("What's the risk?", "Why this workflow?").
9. Use **Move to budget draft** on a couple of opportunities. The **Budget draft** — a lightweight, editable memo with a *directional* spend envelope — fills in. Nothing is applied; **Export draft** produces the artifact you take into planning. (The Marketing item is deliberately *not* draftable — improve its measurement first.)

---

## Product hypotheses demonstrated

**Test 1 — Can we make AI value legible?**
The *Value* experience shows Claude proposing a primary value signal per workflow, computing an observed association against a historical baseline, and being explicit about confidence, data sources, and limitations. It avoids fake ROI precision (no "an hour is worth $75") and prefers the strongest observable operational proxy. The LOB owner iterates the way you'd want with Claude — **in natural language** ("exclude epics", "use a 6-month baseline"), and Claude recomputes — rather than configuring an analytics schema. Confidence is a first-class, *actionable* concept: **connecting a data source visibly raises it**, and some measurements are honestly blocked until the data exists.

**Test 2 — Can those signals help enterprises make better deployment decisions?**
The *Intelligence allocation* experience uses the same measurements to surface evidence-backed opportunities. Each separates three dimensions — **who / which workflow**, **which capability**, and **how much consumption** — and is framed as a reversible test, never an automatic budget reallocation. "Capability" means the *shape* of intelligence (reasoning effort, autonomy, tool/action access, enterprise context, consumption headroom), not a choice between Claude Code, chat, and Cowork. The executive's actions are deliberately non-binding: assemble a **budget draft** (a working memo with a directional envelope, exported into offline planning) — the human stays the decision-maker, and the draft is explicitly one input to the broader tooling/headcount tradeoff. Claude is also available to **answer questions** about any opportunity in context.

### Prototype thesis

This prototype tests whether Anthropic can first make the value of AI consumption legible, then use that evidence to help enterprises decide which workflows should receive which AI capabilities and how much consumption to fund. Existing cost controls answer "how do I avoid exceeding my budget?" and usage analytics answer "where did the money go?" — this surface aims to answer **"where should the next unit of intelligence go?"**

---

## Editing the data

All numbers live in one file: [`data/mockEnterprise.ts`](data/mockEnterprise.ts).

It defines departments, workflows (spend, work units, baselines, current outcomes, confidence, data sources, limitations, capability configuration, and spend limits/headroom), and the deployment opportunities. Rollups (totals, % of spend with a credible signal, and the work-driven forecast) are **derived** from those objects, so both experiences stay consistent when you change a number. Edit here before a demo.

## Tech

Next.js 14 (App Router) · TypeScript · Tailwind CSS. No component library, database, or auth. All product data is static mock data in `data/mockEnterprise.ts`. The only optional external call is **Ask Claude**: a `/api/ask` route that uses the Anthropic SDK when `ANTHROPIC_API_KEY` is set, and otherwise returns deterministic data-derived answers (see *Deploy → Optional*).
