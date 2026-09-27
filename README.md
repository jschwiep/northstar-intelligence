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

This is a stock Next.js App Router project with no environment variables, database, or backend, so it deploys with zero configuration.

**Option A — CLI**

```bash
npm i -g vercel   # if you don't have it
vercel            # preview deploy, accept all defaults
vercel --prod     # production deploy
```

**Option B — Dashboard**

Push the repo to GitHub and import it at <https://vercel.com/new>. Framework preset **Next.js** is detected automatically; no settings to change.

---

## Demo guide (≈5 minutes)

Everything is driven by static mock data — no login, no API calls.

- **Role switcher** (top right): toggle between **LOB owner** and **Executive / Admin**. The *Intelligence allocation* nav item and page are executive-only.
- **Line of business switcher** (Value page): toggle between **Engineering** and **Sales & Marketing**.

Suggested flow:

1. Open as **LOB owner** → **Value** (defaults to Engineering).
2. Note the framing: *Claude found these workflows and recommends measuring value this way.* One measurement (Incident investigation) is still **Proposed** — you can **Accept** or **Edit** it live, including choosing an alternative metric.
3. On **Feature development**, click **How this is measured** to see calculation, baseline period, confidence rationale, source systems, and limitations.
4. Scroll to **Cost predictability** — a spend forecast derived from *expected work*, not token extrapolation.
5. Switch the role to **Executive / Admin** → open **Intelligence allocation**.
6. Read the restrained overview, then the **Deployment opportunities**: expand consumption (Feature dev), expand capability (Account research), investigate before expanding (Marketing content), and tune capability (Incident response).
7. Open any opportunity to see **Evidence → Proposed deployment change → What we'll learn**, with expand / maintain / revert criteria.

---

## Product hypotheses demonstrated

**Test 1 — Can we make AI value legible?**
The *Value* experience shows Claude proposing a primary value signal per workflow, computing an observed association against a historical baseline, and being explicit about confidence, data sources, and limitations. It deliberately avoids fake ROI precision (no "an hour is worth $75") and prefers the strongest observable operational proxy.

**Test 2 — Can those signals help enterprises make better deployment decisions?**
The *Intelligence allocation* experience uses the same measurements to surface evidence-backed opportunities. Each one separates three dimensions — **who / which workflow**, **which capability**, and **how much consumption** — and is framed as a reversible experiment, never an automatic budget reallocation. "Capability" means the *shape* of intelligence (reasoning effort, autonomy, tool/action access, enterprise context, consumption headroom), not a choice between Claude Code, chat, and Cowork.

### Prototype thesis

This prototype tests whether Anthropic can first make the value of AI consumption legible, then use that evidence to help enterprises decide which workflows should receive which AI capabilities and how much consumption to fund. Existing cost controls answer "how do I avoid exceeding my budget?" and usage analytics answer "where did the money go?" — this surface aims to answer **"where should the next unit of intelligence go?"**

---

## Editing the data

All numbers live in one file: [`data/mockEnterprise.ts`](data/mockEnterprise.ts).

It defines departments, workflows (spend, work units, baselines, current outcomes, confidence, data sources, limitations, capability configuration, and spend limits/headroom), and the deployment opportunities. Rollups (totals, % of spend with a credible signal, and the work-driven forecast) are **derived** from those objects, so both experiences stay consistent when you change a number. Edit here before a demo.

## Tech

Next.js 14 (App Router) · TypeScript · Tailwind CSS. No component library, database, auth, or external APIs — static mock data only.
