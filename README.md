# One Master Affordance

Accessibility-led CarPlay redesign: a single persistent system orb that is both a
Siri trigger and a tremor-tolerant magnifier, so the whole car interface stays
reachable while driving. A long-form case study wrapping a faithful, fully-coded
CarPlay prototype, plus a reproducible simulation that measures the core claim.

**Live:** <https://globalanomalyindex.github.io/carplay-siri-contacts/>

- Case study at `/`, the standalone prototype at `/prototype`.
- Methods, statistics, and results for the simulation: `docs/experiment-methods.md`.

## Running locally

```bash
npm install
npm run dev
```

Then open <http://localhost:5173> for the case study. The prototype is embedded
inline and also lives at <http://localhost:5173/prototype>.

## The simulation study

A seeded hand-tremor model drives the same hit-test the live prototype ships,
with region gating on versus off, over the same seeds, across three tremor
profiles and two contested layouts. It reports first-try mis-commit rates with
Wilson score intervals and a paired seed-level bootstrap for the effect sizes.
Every quantitative claim shown in the case study is read from this run, never
hand-typed.

```bash
npm run experiment    # regenerate data/experiment.json + the typed results module
```

The run is deterministic (a fixed seed range), so the output is byte-identical on
re-run. Full protocol in `docs/experiment-methods.md`.

## Prototype controls

- Tap the orb: activate Siri (rainbow aura)
- Tap the orb again (while active): cancel Siri
- Swipe down on the orb: cancel Siri
- Drag from the orb: enter magnifier mode, drift over a target, lift to commit
- Long-press anywhere (toggle in debug panel): tap-rescue. A misfired tap becomes a correction. Drift to the right target and lift to commit.
- Keyboard: every control is focusable. Tab to reach it, Enter or Space to commit. The locked target is announced through an aria-live region.

## Debug panel

Floating right-side panel:
- Driving: toggles the binary parked vs driving state
- Long-press anywhere = rotary: enables the tap-rescue gesture
- Force Reduce Motion: manual override of OS reduce-motion
- High contrast: brighter liquid-glass border for high-glare conditions
- Surface: switch between Phone, Dialer, Maps sketch, Music sketch

## Scripts

```bash
npm run dev           # Vite dev server
npm run build         # type-check and production build
npm run test          # Vitest watch mode
npm run test:run      # Vitest single run
npm run test:e2e      # Playwright E2E
npm run typecheck     # TypeScript only
npm run experiment    # regenerate the simulation data (deterministic, byte-identical)
```

## Architecture

- `src/case-study/`: the long-form case study (sections, components, the brutalist mis-commit chart)
- `src/case-study/data/`: the generated, import-only experiment results the page reads
- `src/prototype/chrome/`: CarPlay system frame
- `src/prototype/MasterOrb/`: orb state machine + visuals (dissipation, aura)
- `src/prototype/Magnifier/`: context-aware magnifier provider + driver, plus the simulation core (`tremor.ts`, `replay.ts`, `experiment.ts`, `stats.ts`)
- `src/prototype/phone/`: Phone app surface (tabs, rows, dialer)
- `src/prototype/surfaces/`: Maps + Music sketches
- `src/tokens/`: design tokens (CSS custom props + TS mirrors) and self-hosted fonts
- `src/a11y/`: accessibility hooks + aria-live announcer
- `scripts/run-experiment.ts`: runs the experiment and writes the data artifacts

## Deployment

Pushing to `main` builds and deploys to GitHub Pages via
`.github/workflows/deploy.yml`. The Vite base path is `/carplay-siri-contacts/`
in production (it stays `/` for dev and tests), and the build copies `index.html`
to `404.html` as the single-page-app fallback so deep routes resolve.

## Built with

React 19 . TypeScript . Vite . Motion . XState . Tailwind 4
