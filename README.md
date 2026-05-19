# One Master Affordance: CarPlay assistive-touch prototype

Accessibility-led CarPlay redesign demonstrating a single persistent system
orb that serves as Siri activation and AssistiveTouch-style rotary navigator.

See `docs/superpowers/specs/2026-05-19-one-master-affordance-design.md` for
the full design specification.

## Running the prototype

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>.

## Controls

- Tap the orb: activate Siri (rainbow aura)
- Tap the orb again (while active): cancel Siri
- Swipe down on the orb: cancel Siri
- Drag from the orb: enter rotary mode, drift over a target, lift to commit
- Long-press anywhere (toggle in debug panel): tap-rescue. A misfired tap becomes a correction. Drift to the right target and lift to commit.

## Debug panel

Floating right-side panel:
- Driving: toggles the binary parked vs driving state
- Long-press anywhere = rotary: enables the tap-rescue gesture
- Force Reduce Motion: manual override of OS reduce-motion
- High contrast: brighter liquid-glass border for high-glare conditions
- Surface: switch between Phone, Dialer, Maps sketch, Music sketch

## Tests

```bash
npm run test          # Vitest watch mode
npm run test:run      # Vitest single run
npm run test:e2e      # Playwright E2E
npm run typecheck     # TypeScript only
```

## Architecture

- `src/prototype/chrome/`: CarPlay system frame
- `src/prototype/MasterOrb/`: orb state machine + visuals (dissipation, aura)
- `src/prototype/Magnifier/`: context-aware magnifier provider + driver
- `src/prototype/phone/`: Phone app surface (tabs, rows, dialer)
- `src/prototype/surfaces/`: Maps + Music sketches
- `src/tokens/`: design tokens (CSS custom props + TS mirrors)
- `src/a11y/`: accessibility hooks + aria-live announcer

## Built with

React 19 . TypeScript . Vite . Motion . XState . Tailwind 4
