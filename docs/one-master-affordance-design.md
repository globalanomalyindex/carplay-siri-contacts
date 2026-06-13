# One Master Affordance

*Accessibility-led gesture design for CarPlay*

| | |
|---|---|
| **Spec date** | 2026-05-19 |
| **Status** | Design locked, ready for implementation planning |
| **Scope** | System principle + Phone app deep build + Maps/Music sketches |
| **Deliverable** | Case study + embedded interactive prototype |
| **Anchor metaphor** | Water (flow + surface tension); orb behaves as a liquid eddy with a magnetic home |

---

## 1. Executive summary

CarPlay's current accessibility surface is materially thinner than iOS's - there is no AssistiveTouch equivalent, gestural design is inconsistent, and the most safety-critical entry point (Siri from the Phone app) is redundantly buried behind a locked tab. This design replaces ad-hoc tap targets with **one persistent, system-level master affordance** - a Siri orb in the top-left negative space of the CarPlay chrome - that supports two distinct behaviors: tap to invoke Siri, and drag to enter a magnifier-tap-and-lift selection mode that works across the entire system.

The design is accessibility-led: it solves a real ergonomic problem for users with Parkinson's disease, essential tremor, arthritis, post-stroke motor effects, and multiple sclerosis. By the curb-cut effect, it also solves a softer version of the same problem for every driver on a bumpy road, in cold weather, gloved, or fatigued on a long drive. Three ergonomic axes - Fitts' Law (predictable target location), jitter tolerance (input noise averaging), and **fatigue (screen-as-arm-anchor)** - converge in a single primitive.

The work positions Apple to (1) close a known accessibility gap on CarPlay, (2) differentiate CarPlay-Ultra against OEM proprietary systems like BMW iDrive and Mercedes MBUX, (3) serve a demographically growing audience of older drivers, and (4) reduce AppleCare frustration tickets attributable to CarPlay mis-interaction.

---

## 2. Problem statement

### 2.1 The friction in current CarPlay Phone

The Contacts tab in the CarPlay Phone app is rendered while driving but its content is locked - the only interactive element is a button reading "Ask Siri to Make a Call." A user is required to:

1. Recognize that they want to call someone (cognitive)
2. Locate and tap the Contacts tab (precise visual + motor)
3. Read the "Ask Siri" button explanation (cognitive)
4. Tap the button OR press the hardware Siri button (motor)

Steps 2-3 deliver no value. The tab's content is exclusively a signpost to a feature the user could have used from any state. This represents wasted attention while driving - and any attention diverted from the road is a safety cost.

### 2.2 The deeper friction across CarPlay

The Phone-app friction is symptomatic. Across CarPlay:

- **Tap is the default primitive** for precise targets (tab segments, row icons, small controls) - but precise taps are the most jitter-vulnerable input class. Bumpy roads cause mis-taps. Mis-taps cause frustration. Frustration causes distracted driving.
- **No persistent assistive surface exists.** iOS users with motor conditions enable AssistiveTouch and use a single predictable affordance. CarPlay inherits no equivalent. Users who rely on AssistiveTouch on iPhone are abruptly without it in the car - the place they need it most, because road vibration and seating constraints compound motor difficulty.
- **Hover-and-tap requires sustained arm elevation.** For users with motor conditions, arthritis, or just long driving sessions, holding an arm aloft to make a precise tap is itself fatiguing. The screen could be a physical rest point if the interaction model permitted resting on it; today's tap-default does not.

### 2.3 Real-world validation

The accessibility framing is not speculative. Customer-service representatives at a major US broadband/TV provider report routine cases of customers calling for help configuring AssistiveTouch on iOS due to motor conditions, and a recurring complaint that CarPlay does not offer equivalent affordances. The gap is observed in support traffic; this design closes it.

---

## 3. Design philosophy

### 3.1 Anchor metaphor: water

Earlier iteration considered the pinecone as the anchor (calm hinged closing). Replaced with **water / liquid flow** because (a) it embraces continuous directional gestures rather than discrete states, (b) water's natural damping makes it the right metaphor for jitter tolerance, (c) the orb's metaball physics and Apple's existing Liquid Glass / Dynamic Island vocabulary are already water-physics-aligned, and (d) the same metaphor scales gracefully to the master orb's dissipation behavior (water finding a new vessel).

### 3.2 The three ergonomic axes

Every interaction in the design is justified across three axes:

| Axis | What it covers | How the design addresses it |
|---|---|---|
| **Fitts' Law** | Target hunt cost (location predictability + size) | Orb is in a fixed, system-persistent location (top-left negative space). Always there, always reachable. |
| **Jitter tolerance** | Input noise from road vibration, tremor, motor variability | Sustained gestures (drag, swipe, drift) average jitter across a path. Magnifier provides a 40pt lock-radius around any target. |
| **Fatigue (arm anchor)** | Sustained-position cost of hover-and-tap | Drag-and-lift gestures keep the finger on the screen for the duration; the screen serves as a physical rest. Single decisive lift instead of repeated precise taps. |

### 3.3 The curb-cut effect

The design is sized for the most motor-constrained user. By construction, it lifts every adjacent population. Drivers on bumpy roads benefit from the same affordances that serve a user with essential tremor. This pattern is consistent with Apple's accessibility-led product history (VoiceOver → audiobook drivers, Dynamic Type → users in glare, AssistiveTouch → one-handed phone users).

---

## 4. Component inventory

### 4.1 Layer 1 - CarPlay system chrome (new + existing)

| Component | Status | Spec |
|---|---|---|
| Status bar | Existing | Unchanged |
| **Persistent orb + liquid-glass frame** | **New** | 34pt orb inside a 46pt liquid-glass rounded-rectangle frame (14pt continuous radius). Top-left negative space above the dock. Persistent across all apps. |
| System dock | Existing | Unchanged. A 1pt separator divides it from the orb home above. |
| App content area | Existing | The frame the foreground app renders into. |

### 4.2 Layer 2 - Phone app surface

| Component | Status | Spec |
|---|---|---|
| Tab pill | Modified | 3 segments (Favorites · Recents · Contacts) parked → 2 segments driving. Contacts simply absent in driving (no notice). Supports horizontal swipe-nav. |
| Utility cluster | Modified | Keypad + voicemail icons. Keypad at 35% opacity (visible, disabled) while driving. Voicemail interactive in both states. |
| Contact rows | Modified | Standard scroll. Swipe right = call, swipe left = text. Magnifier-tap-and-lift via orb-rotary. |
| Radial dialer | New | Replaces the 3×4 keypad in the dialer screen. Ring of 10 digits, center holds running number + backspace. Parked only. Magnifier-tap-and-lift operation. |

### 4.3 Visual material spec

The orb is rendered as a 6-stop conic gradient (Siri rainbow palette: `#FF6E7F`, `#FFD86B`, `#6BFFD1`, `#6B9AFF`, `#B573FF`) starting at 200°, with an outer glow (`0 0 12pt violet @ 55%`), an inner highlight (`inset 0 3pt 6pt white @ 20%`), and an inner shadow (`inset 0 -3pt 6pt black @ 20%`).

The liquid-glass frame is a 46pt rounded-square with a 14pt continuous radius, filled white at 6% opacity, bordered at 22% opacity (raises to 45% in detected high-glare conditions), with an inset highlight (`inset 0 1pt 0 white @ 35%`), an inset shadow (`inset 0 -1pt 0 black @ 20%`), a backdrop blur of 8pt, and an outer cyan glow at 18% opacity.

The active aura is rendered separately from the orb as a 22pt-blurred conic-gradient ring, pulsing 50-75% opacity on a 3-second cycle while Siri is listening.

---

## 5. Interaction grammar

### 5.1 System orb gestures

| Gesture | Outcome | State precondition |
|---|---|---|
| **Tap orb** | Activate Siri (aura emerges, voice listens) - OR cancel Siri if already active | Any |
| **Swipe down on orb** (≥60pt) | Cancel / abort Siri | Siri-active (preferred bumpy-tolerant cancel) |
| **Drag from orb** (≥8pt motion) | Enter rotary mode (orb-initiated entry path). Orb dissipates back into the liquid-glass home frame; frame remains visible as anchor. **Glass-frame hitboxes materialize around every discrete magnifiable component on the visible surface** (rows, tabs, buttons, digits) as a discoverability affordance. | Idle |
| **Long-press on a cell** (≥250ms hold, <8pt motion) | Cell expands inline. Action chips emerge alongside the cell's existing content; surrounding cells shift to make room. Nothing disappears. Drift to a chip to highlight it; lift on a chip to fire its action; lift elsewhere collapses with no action. The hold is cell-scoped, so a press that started outside a cell does not activate any cell's expansion. | Idle, pointer-down inside a cell |
| **Drift across discrete UI** (rotary mode, over rows / tabs / buttons / digits) | Component under fingertip becomes the **locked cell** - its glass frame intensifies into a soft aura (the "cell wall" lighting up). Neighboring components' frames fade slightly. <strong>The orb itself is not visible during drift</strong> - the visual focus is on which cell is locked, not where the finger is. Aura *travels* as the user drifts; the locked component is the indicator. | Rotary mode |
| **Cell-membrane stickiness** (drift past current lock toward neighbor) | The lock has hysteresis - fingertip must travel ~60% past the next component's center before the lock transitions. A small tremor or bump that nudges the finger 5-10pt won't bounce the user between adjacent cells. Plant-cell-wall semantics: the visible boundary has soft integrity. | Rotary mode |
| **Drift across continuous canvas** (rotary mode, over map / progress bar / photo) | Free-drift with magnifier: whatever is under fingertip magnifies (`1.25× · 240ms`). A small ghost-orb floats just behind fingertip as a presence cue. Used when there is no discrete component to snap to. | Rotary mode |
| **Lift on a magnetically-locked component** | Commit - equivalent to a tap on that component. Aura fades, glass frames recede, orb reforms in home frame. | Rotary mode |
| **Lift on a free-drift location** | Commit - equivalent to a tap at that location (e.g., map coordinate, scrub-bar position). Orb reforms at home. | Rotary mode |
| **Lift on dead space (no lock)** | No action. Orb reforms at home. Safe escape - the "I changed my mind" path. | Rotary mode |

### 5.2 App-surface gestures

| Gesture | Outcome |
|---|---|
| **Swipe right on contact row** | Call. Green call-indicator slides in from left edge during swipe. |
| **Swipe left on contact row** | Open compose-text. Blue text-indicator slides in from right edge. |
| **Horizontal swipe on tab pill or content area** (≥60pt) | Switch tabs. Pill animates to next active position; content cross-fades. |
| **Tap on a row** | Parked: open contact detail. Driving: same as swipe-right (call). Tap is fallback, not primary. |
| **Drag inside radial dialer ring** | Closest digit magnifies; drift to refine; lift commits the digit. |

### 5.3 Recognition thresholds

| Threshold | Value | Notes |
|---|---|---|
| Tap vs hold (orb) | ≤250ms duration AND <8pt motion | Standard `UIGestureRecognizer` defaults |
| Drag detection (orb) | ≥8pt motion | Inverse of above |
| Swipe-down (Siri cancel) | ≥60pt downward motion | Larger than tab-swipe to disambiguate |
| Row swipe-action | ≥40pt horizontal motion | Indicator visible from 40pt |
| Tab swipe-nav | ≥60pt horizontal motion | Larger to avoid accidental triggers |
| Magnifier lock radius | 40pt from target centroid | Relaxed to 50pt on resistive screens |
| Long-press cell expansion | ≥250ms hold AND <8pt motion | Same as iOS UILongPressGestureRecognizer default. Cell-scoped: the pointer must originate inside the cell. |
| Cell-membrane hysteresis | 60% past next component's center | Lock holds until finger crosses past 60% of the distance to the next component's center - not the midpoint between centers |

---

## 6. Motion spec

### 6.1 Named easing curves

| Token | Function | Used for |
|---|---|---|
| `--ease-liquid-out` | `cubic-bezier(0.08, 0.82, 0.17, 1.00)` | Dissipation outgoing - particles disperse fast then drift |
| `--ease-liquid-in` | `cubic-bezier(0.83, 0.00, 0.92, 0.18)` | Reform incoming - particles gather slowly then lock |
| `--spring-glass-flex` | `spring(damping 0.62, stiffness 240)` | Liquid-glass frame magnify on hold |
| `--ease-magnify-lock` | `cubic-bezier(0.20, 0.90, 0.30, 1.00)` | Target magnification on drift-over |
| `--ease-ambient-breathe` | `cubic-bezier(0.45, 0.05, 0.55, 0.95)` | Idle orb ±5% scale loop |
| `--ease-snap-fire` | `cubic-bezier(0.30, 0.00, 0.20, 1.00)` | Commit flash on lift |
| `--ease-frame-emerge` | `cubic-bezier(0.20, 0.80, 0.30, 1.00)` | Glass-frame hitboxes materializing around discrete components when rotary entered |
| `--ease-aura-travel` | `cubic-bezier(0.40, 0.00, 0.20, 1.00)` | Locked-cell aura transitioning from one component to the next (after hysteresis threshold crossed) |
| `--ease-cell-membrane` | `cubic-bezier(0.60, 0.00, 0.80, 0.30)` | Hysteresis resistance feel - slight inertia before the lock transitions, like crossing a soft membrane |

### 6.2 Duration tokens

| Token | Value |
|---|---|
| `--dur-dissipate` | 180ms |
| `--dur-reform` | 220ms |
| `--dur-magnify` | 240ms |
| `--dur-flash` | 320ms |
| `--dur-frame-emerge` | 180ms (stagger 20ms between adjacent components, max 100ms total stagger) |
| `--dur-aura-travel` | 140ms |
| `--dur-long-press-threshold` | 250ms hold to enter rotary via long-press-anywhere |
| `--dur-aura-cycle` | 3s |
| `--dur-ambient-breathe` | 6s |

### 6.3 Reduced motion

iOS Reduce Motion is honored explicitly. Dissipation becomes a crossfade. Magnification becomes a state-swap (no scale animation). Aura is rendered statically. The orb breathes only via opacity, not scale. Commit flash is a constant tint with fade-out, not a wash sweep.

### 6.4 Performance budget

| Metric | Target |
|---|---|
| Frame rate | 60fps for gesture animations; idle effects may drop to 30fps under power constraints |
| Touch-to-visual latency | ≤100ms for orb response; ≤50ms for magnifier follow during drag |
| Backdrop blur layers | 1 (the liquid-glass frame); no stacked blurs |
| Particle count per dissipation | ≤12 elements per direction |
| Memory ceiling (orb assets) | ~8MB working set |
| Cold-start to interactive | <400ms from CarPlay-connect to orb visible |

---

## 7. Accessibility responses

| Condition | Approx. US prevalence | Primary design response |
|---|---|---|
| **Parkinson's disease** | ~1M | Magnifier averages out 3-6Hz resting tremor; only the lift point matters; no tap-timing window to miss. |
| **Essential tremor** | ~10M | Action tremor defeated by magnifier lock-on-target (40pt radius). Land within range, shake can continue. |
| **Arthritis** | ~58M | Fixed predictable location (zero hunt). Screen-as-anchor means arm rests. Total joint actuations to call drops from ~4 to ~2. |
| **Post-stroke hemiparesis** | ~7M | Region-mirrored layout for RHD vehicles. Single-finger drag with no required pinch/spread. |
| **Multiple sclerosis** | ~1M | No mode toggle - quick path stays fast on good days, accessibility path always available on bad days. |
| **Situational** | ~230M licensed drivers | Same accommodations serve bumpy-road, cold-hands, gloved, fatigued, and stressed-driving cases. |

### 7.1 VoiceOver labels

Every interactive element has explicit accessibility labels, traits, and hints. Magnifier announces target names on lock. Commit fires before announcement so action isn't delayed by speech. Switch Control treats the orb as the first focusable item in scan order, with scan-mode entering the magnifier path for distal targets.

---

## 8. Edge cases & graceful degradation

### 8.1 Edge cases

| Scenario | Handling |
|---|---|
| Vehicle stops mid-Siri | Siri continues uninterrupted. Surface re-renders to 3-tab state silently. |
| Vehicle starts mid-Siri | Siri continues. Surface re-renders to 2-tab. If Siri tried to open Contacts, gracefully redirects to voice. |
| CarPlay disconnects mid-gesture | Gesture aborts. No persistent state across disconnects - avoid "ghost actions." |
| RHD vehicles (UK, JP, AU, IN) | Auto-mirror: orb home moves to top-right; dock moves to right edge. Driven by CarPlay locale / vehicle-side-of-road setting. |
| No network / Siri unavailable | Tap-orb shows "voice offline." Drag-rotary still works (no network needed). Favorites/Recents calling works without network if cellular voice is up. |
| Steering-wheel Siri button pressed | Treated identically to orb tap. Aura emerges around orb visually so driver sees acknowledgement. |
| Passenger touches screen during drag | Multi-touch reject. Only the first contact point participates. |
| Map panning while orb active | Map pan is in app content area; orb is in system chrome. Both touches resolve to their respective surfaces by gesture-router origin hit-test. |
| Bright sun / glare | Glass frame border opacity raises from 22% to 45%. Aura blur radius reduces to keep edges crisp. |
| Night mode | Glass darkens, glow softens, aura saturates slightly. Same component, different token resolution. |
| Older resistive screens | Magnifier engagement threshold relaxed to 50pt. Multi-touch reject still applies. Dissipation uses crossfade instead of particles. |
| Palm rest on screen | Palm rejection (CarPlay-standard). Orb responds only to contacts beginning within its 46pt bounds. |
| User holds + forgets during rotary | After 8s of no fingertip motion: orb gently pulses to remind. After 15s total inactivity: gesture auto-aborts, orb reforms at home. |

### 8.2 Graceful degradation

| Hardware tier | Treatment |
|---|---|
| Modern capacitive, GPU-capable | Full motion. Particle dissipation. Backdrop blur. 60fps. |
| Capacitive, weak GPU | Particle dissipation → crossfade. Backdrop blur → translucent fill. Ambient breath at 30fps. |
| Resistive, slow refresh | All animations → state swaps (Reduce Motion path). Magnifier lock radius 50pt. Touch latency budget 150ms. |
| Reduce Motion + Increase Contrast | All dissipation skipped. Glass border at full opacity. Orb gradient flattens to single high-contrast color. Aura is a static ring. |

---

## 9. Implementation approach

### 9.1 Track A - Case-study artifact

**Stack:** React 19 + TypeScript 5.5, Motion (Framer) for declarative animation, Vite for dev/build, Tailwind 4 with a thin CSS-custom-property token layer for design tokens, XState (or `useReducer` finite state machine) for orb states, Vercel for hosting.

**File structure:** `src/case-study/` (long-form writeup as MDX components), `src/prototype/` (the interactive CarPlay demo with `CarPlayChrome`, `MasterOrb`, `Magnifier`, `phone/`, `surfaces/`), `src/tokens/` (motion, color, spatial as CSS custom properties), `src/a11y/` (reduced-motion + VoiceOver contract hooks).

**Engineering effort:** ~3 weeks for one senior frontend engineer working alongside the designer.

### 9.2 Track B - Hypothetical Apple production architecture

The orb belongs to the **CarPlay UI service** (system chrome layer), z-ordered above third-party app content. A **gesture router** hit-tests every touch's *origin* - origin within the orb-home bounds routes to the `OrbGestureController`; origin elsewhere passes through to the foreground app's normal touch chain. This is how Maps pan and orb-drag coexist by construction.

A **system-level long-press recognizer** runs in parallel (when the accessibility setting is enabled). It observes any sustained touch (≥250ms hold, <8pt motion) anywhere on the CarPlay surface. On firing, it preempts the foreground app's normal touch chain and routes the gesture into the `OrbGestureController` as if it were an orb-initiated drag. The app's own touch handling for that interaction is canceled cleanly via `gestureRecognizer:shouldBeRequiredToFailBy:`. This means: quick taps reach apps as today; sustained holds get rescued into the rotary system. The setting is opt-in; default-on for users who have AssistiveTouch enabled on the paired iPhone.

A new framework API exposes `CPMagnifiableTarget` (any view conforming becomes a magnifier target with hitbox bounds + a `magnifierBehavior` enum of `.snapToCenter | .freeDrift`), `CPOrbGestureDelegate` (apps receive orb-initiated tap events with extra context), and extends existing `CPSiriIntent`. The `.snapToCenter` behavior is the default for discrete UI (rows, tabs, buttons, digits); `.freeDrift` is for continuous content (maps, scrub bars, image canvases). Backwards-compatibility default: apps that don't adopt the API still receive normal tap events on lift - the orb behaves as a "remote tap" for them. Adoption unlocks the glass-frame hitbox affordance, magnetic snap behavior, and target-name VoiceOver announcements.

The orb reuses existing iOS infrastructure: **AssistiveTouch engine** (floating button, magnification, gesture set), **SiriKit/IntentsUI** (voice and intent fulfillment), and standard accessibility settings (**Reduce Motion, VoiceOver, Switch Control**).

**Apple-side engineering estimate:** small dedicated team, ~6 months for system-chrome integration + first-party Phone adoption; +3-6 months developer-relations for third-party API rollout post-WWDC.

---

## 10. Sketched surfaces (system reach demonstration)

### 10.1 Maps

Native pan and zoom on the map surface are preserved - the orb never intercepts gestures that originate on the map canvas. Drag-from-orb into the map surface engages the magnifier for **point-of-interest pins** (12pt targets become 25pt-effective) and the **quick-controls strip** at the bottom (mute voice, recenter, end route, 2D/3D). Swipe-right on a search result starts navigation; swipe-left calls the business (when phone is on the listing).

### 10.2 Music

Playback controls are sized larger; the orb's value concentrates on **queue selection** (skip-to-track via magnifier over queue rows) and **progress-bar scrubbing** (the 3pt-tall progress bar becomes selectable via drift). Swipe-right on a queue row queues-up; swipe-left removes. Tap-orb-while-music-playing invokes Siri ("Skip this," "Volume up").

### 10.3 Now Playing strip - experiment

A contextual horizontal Now Playing strip at the top of the chrome surfaces **only when audio is playing AND the foreground app is not Music**, mirroring iOS Dynamic Island / Live Activities patterns. Honest pushback against the "always-on" version: it would dilute the one-master-affordance thesis. Ship as a follow-on feature (Phase 2+ rollout), not in the v1 release.

---

## 11. Impact, validation, measurement

### 11.1 Hypotheses (testable, falsifiable)

| ID | Claim | Predicted result |
|---|---|---|
| H1 | Orb reduces time-to-call in driving state | ↓ 25-40% vs baseline |
| H2 | Eyes-off-road time decreases | ↓ 20-30% glance count |
| H3 | Mis-action rate drops on bumpy roads | ↓ 40-60% vs baseline |
| H4 | Subjective fatigue drops on long drives | ↓ 15-25% on Borg-CR10 adapted scale |
| H5 | Motor-constrained users can complete tasks without configuration | ≥80% first-try success rate |
| H6 | Adoption is high when offered as opt-in | ≥30% general / ≥70% motor-impaired beta cohort |

### 11.2 Primary KPIs

- **Eyes-off-road time per CarPlay task** (safety - primary): baseline ~3.4s → target ≤2.5s. Ceiling = baseline.
- **Time-to-call from CarPlay home** (efficiency - primary): baseline ~6.8s → target ≤4.5s.
- **Motor-constrained task completion rate** (accessibility - primary): baseline ~45% → target ≥85%. Floor 70%.
- **Mis-action rate**: baseline ~8.2% → target ≤3%.
- **Subjective fatigue (Borg-CR10 adapted)**: baseline 4.2 → target ≤3.2.

### 11.3 Research plan (four phases)

1. **Moderated remote studies** (weeks 1-6): 30 participants across Parkinson's, ET, arthritis, post-stroke cohorts. Tests H1, H4, H5. Partner with Michael J. Fox Foundation, IETF, AARP.
2. **In-vehicle field studies** (weeks 7-14): 40 drivers, instrumented vehicles, 4 road surfaces. Eye-tracking + telemetry. Tests H2, H3. NHTSA-aligned protocol.
3. **Longitudinal opt-in beta** (weeks 15-30, ~4 months): ~5,000 iOS beta users with CarPlay-equipped vehicles. Tests H6 + all telemetry KPIs.
4. **A/B cohort split at GA** (post-launch, 90 days): geographic split with Master Orb default-on vs opt-in only. Cross-checks against AppleCare ticket rate and App Store review sentiment.

### 11.4 Stop-ship criteria

- **SS-1** Eyes-off-road time increases (any positive delta at p<0.05)
- **SS-2** Mis-action rate increases on bumpy roads
- **SS-3** Motor-constrained task completion rate below 70%
- **SS-4** Subjective fatigue ratings don't improve
- **SS-5** App ecosystem regression in non-adopted third-party apps
- **SS-6** Beta adoption below 10%

### 11.5 Business case

Four reinforcing pillars: **accessibility leadership** (brand reinforcement consistent with Apple's track record of VoiceOver, AssistiveTouch, Dynamic Type), **CarPlay-Ultra OEM defense** (a feature OEMs can't easily replicate because it requires iOS-side AssistiveTouch infrastructure), **aging demographic addressable market** (~63M US drivers aged 65+ by 2030, with motor decline correlating with age), and **AppleCare cost reduction** (CarPlay-related frustration tickets are an operational cost where 15-25% reduction is meaningful at Apple's scale).

---

## 12. Open questions / future work

- **Cellular widget-grid CarPlay layout - next case study in the series.** A natural extension of this work: replace CarPlay's current main-content composition model with a customizable cellular widget-grid (Apple Home Screen Widgets / DayZ-inventory-grid metaphor). Users would compose their CarPlay layout from cells of varying sizes - Now Playing, navigation mini, contacts mini, etc. - fitting them together like widgets. The Master Orb (this case study) is the foundation that makes this future work safe to drive (snap-to-component-center magnetics remove targeting precision; layout edits happen only while parked). Reserved as a *separate* case study because (1) it's a different design problem - spatial organization vs. interaction primitive - and (2) Apple has historical safety friction around CarPlay customization that deserves its own dedicated treatment.
- **Third-party adoption ramp.** What does WWDC announcement choreography look like to maximize day-1 third-party adoption of `CPMagnifiableTarget`? Reference-implementation videos? Open-source sample app?
- **Now Playing strip rollout.** When does the experimental Now Playing strip ship - alongside Master Orb, or as a deliberate Phase 2 to manage cognitive change for users?
- **Passenger system-level handling.** This design declines to introduce a passenger-mode toggle. Long-term, zonal-touch detection (driver vs passenger touches) might justify revisiting. Not in scope for v1.
- **Haptic feedback integration.** Where vehicles support steering-wheel or seat haptics via CarPlay, can orb interactions surface haptic confirmations? Out of scope until a CarPlay haptic API exists.
- **Apple Watch integration.** A Watch tap-handoff to the orb (or vice versa) might let a passenger or wheelchair-bound driver use a wrist-based assistive control mirroring the orb's home-and-drag pattern.

---

## 13. Decisions log

Material design decisions made during brainstorming, with reasoning:

- **Nature metaphor pivoted from pinecone to water.** Pinecone modeled discrete state change (open/closed scales) - calm but did not embrace continuous gestures. Water flows continuously, dampens jitter inherently, unifies with the metaball orb already in place, and aligns with Apple's existing Liquid Glass language.
- **Orb lifted from Phone-app element to system-level chrome.** Originally a Phone-app header element (left of tab pill). Lifted to top-left CarPlay chrome (above the dock) because the orb is conceptually a system primitive (AssistiveTouch heritage), not a Phone-app feature. This unlocked the magnifier-applies-anywhere argument.
- **Orb dissipation replaced metaball stretch.** Earlier model had the orb visually stretching from home to finger via a metaball tether. Dissipation (orb dissolves at home, reforms under finger; liquid-glass frame stays as anchor) is cleaner, more honest to the water metaphor, and visually less busy.
- **Magnifier tap-and-lift adopted as system pattern.** Initially scoped to a Phone-app row pattern. Promoted to a system-level affordance because the same pattern serves Maps POIs, Music queue rows, radial dialer digits, and any third-party UI that adopts `CPMagnifiableTarget`.
- **Rotary dialer reinterpreted from literal mechanical rotary to radial-arrangement + magnifier.** Literal mechanical rotary inherits 1-2s per digit; modern reinterpretation keeps the rotary's circular form as a visual nod but operates via magnifier-tap-and-lift for fast, bumpy-tolerant per-digit selection.
- **Contacts "limited" message removed entirely.** Original CarPlay shows "Ask Siri" button under a locked Contacts tab. New design simply omits the Contacts tab in driving state - no notice. Rationale: the notice itself was a source of frustration; if you know the contact you'd ask Siri, if you don't it's not urgent enough to look up while driving.
- **No passenger-mode toggle.** Considered and declined. Same-UX-regardless preserves the safety logic; passenger has other channels (Hey Siri from any seat, the driver's own iPhone). A toggle becomes a misuse vector.
- **Scope set to "system principle + Phone deep build + 1-2 sketches"** rather than full multi-app CarPlay redesign. Full redesign was honestly months of work risking nothing finished to a high standard. Current scope is ambitious in argument, finishable in artifact.
- **Approach B - pinecone-style "motion only" - applied to water motion.** Visual surfaces remain clean Apple HIG; the water metaphor lives in motion curves and the case study narrative. No themed water-decoration on the UI itself.
- **Magnifier refined to context-aware behavior.** Initial design had pure free-drift magnification across all surfaces. Refined to context-aware: discrete UI (rows, tabs, buttons, digits) gets glass-frame hitboxes + magnetic snap-to-center as the orb drifts; continuous canvases (maps, scrub bars, photos) retain free-drift magnification. Strongest refinement because snap-to-center reduces targeting precision to nearly zero for discrete UI - the most-jitter-vulnerable input class - while preserving the exploratory feel of free-drift where it actually serves the user.
- **Cellular widget-grid layout system pulled out as next case study (not v1).** A customizable widget-grid for the CarPlay main content area is a powerful extension but introduces a second hero idea (spatial organization) that competes with this case study's thesis (one master interaction primitive). Apple's historical resistance to CarPlay customization for safety reasons also deserves dedicated treatment. Reserved as the next case study in the series; the Master Orb is the foundation that makes the customizable grid safe.
- **Visual focus shifted from "traveling orb" to "locked cell aura."** Earlier model rendered the orb as a small floating element following the user's fingertip during rotary drift. Refined: the orb dissipates into the home frame on rotary entry, and visual focus moves to the **locked component's aura** - the glass frame around the currently-locked cell intensifies into a soft glow that *travels* between components as the user drifts. Simpler visually (one focal point at a time), less screen clutter, more "the system is responding to your finger" feel.
- **Cell-membrane hysteresis added to snap behavior.** Initial snap-to-center had no resistance - lock transitions occurred at the midpoint between component centers. Refined to require ~60% past the next component's center, giving the lock soft integrity (plant-cell-wall metaphor). This adds another jitter-tolerance layer: a tremor or bump that nudges the finger 5-10pt won't bounce the user between adjacent cells.
- **Long-press-anywhere added as rotary entry path; layers over tap rather than replacing it.** Initial design had drag-from-orb as the sole entry to rotary mode. Refined to also accept a system-level long-press (≥250ms) anywhere on the screen. Quick taps still reach apps as today; sustained holds get rescued into the rotary system. This means non-accessibility users never have to learn the rotary system, accessibility users get the rotary as their primary input, and misfired-tap users get rescued in-place. Opt-in via accessibility setting; default-on for users who already enable iOS AssistiveTouch.
