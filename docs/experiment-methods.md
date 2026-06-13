# simulated mis-commit study: methods and results

## summary

the study compared a region-gating hit-test (on vs off) across three tremor tiers and two
contested-target scenarios using 1000 seeded tremor replays per cell. in the tab-contest
scenario, where the intended target is a wide contact row and the competing targets are a
narrow tab bar and dock rail, gating reduced first-try mis-commits to zero in every tremor
tier (0/1000 in all three). in the harder dock-contest scenario, where a straight drag
from the center of the screen passes through the dock rail, gating reduced but did not
eliminate mis-commits: rates dropped from 100%, 94.1%, and 80.0% (off) to 35.7%, 42.4%,
and 42.1% (on) for physiological, essential, and parkinsonian tiers respectively. gating
helped in every cell; it is not a cure for contested geometry.

## hypotheses

- H1: region gating reduces first-try mis-commit rates compared to the ungated hit-test.
- H2: risk ratio (gating on rate / gating off rate) is less than 1.0 in every cell where
  the off rate is non-zero.
- H3: the naive (ungated) failure rate is meaningfully high in both contested scenarios,
  not a rare edge case.
- H4: gating generalises across tremor tiers but does not reduce mis-commits to zero in
  all scenarios (the dock contest is a harder geometry that the prototype partly, not
  fully, resolves).

## design

the experiment is a 2 (gating: on / off) x 3 (tremor tier) x 2 (scenario) grid, yielding
12 cells. gating and tremor are within-seed (each seed is run under both conditions), so
the paired comparison is exact. seedCount = 1000 per cell, seeds 1 through 1000.

**scenarios**

- tab-contest (tab / app cross-commit): the intended target is contact row "row-dad"
  (rect 70, 150, 620, 44; region: content). the drag path runs from (360, 360) to
  (70, 216), a straight pull across the full screen that sweeps close to the tab bar
  (rect 70, 28, 110, 32; region: tabs) and through the content region. the contest is
  between the wide content rows and the narrow tab bar above them.

- dock-contest (dock rail cross-commit): the intended target is the same "row-dad" row.
  the drag path runs from (360, 360) to (60, 215), angled toward the left edge, so the
  path crosses through the dock rail (three 40x40 targets at x=8, y=150/196/242). this
  geometry is harder: any rightward tremor excursion can land on a dock icon mid-drag.

**tremor tiers**

| tier | amplitude (px) | frequency (Hz) |
|---|---|---|
| physiological | 5 | 9 |
| essential | 9 | 5 |
| parkinsonian | 13 | 4 |

## tremor model

each sample in the pointer path is displaced by a seeded deterministic tremor offset.
the PRNG is mulberry32, a 32-bit shift-register generator seeded with an integer so the
same seed yields the same sequence on every run.

the waveform is a sinusoid on x and y (quarter-cycle phase offset between axes so the
finger traces a loop, not a line), scaled by amplitudePx. a per-sample noise term scaled
by `noiseFraction * amplitudePx` (set to 0.45) is added to each axis using two PRNG
draws per sample.

critically, when `randomizePhase` is true (the default), the first PRNG draw for each
seed is the starting phase in [0, 2pi). this means a sweep of 1000 seeds is a Monte
Carlo over where in the tremor cycle the gesture happens to begin, not just a sweep of
noise realizations. without phase randomisation, every seed would share the same
waveform shape and the variance across seeds would come from noise alone, understating
the real spread of outcomes.

## metrics

- **first-try mis-commit rate** (primary): proportion of seeds where the final committed
  target is not the intended target, using the first commit event in the replay. reported
  as a proportion (0 to 1) and as a percentage.
- **mean lock changes per trial** (secondary): how many times the magnifier's region lock
  changed during the on-condition drag. a proxy for how often the gesture crossed a
  region boundary.
- **mean membrane saves per trial** (secondary): how many times the cell-membrane
  hysteresis prevented a lock change that would otherwise have triggered. zero in all
  cells in the executed run.

## statistics

**Wilson score 95% interval** is computed for every rate. the formula uses z = 1.959964
(standard normal 97.5th percentile). for cells with 0 mis-commits in 1000 trials the
Wilson upper bound is 0.3827% - these are reported as an upper bound, never as a flat
zero.

**paired seed-level percentile bootstrap** with B = 2000 resamples estimates 95%
confidence intervals for absolute risk reduction (ARR = offRate - onRate) and risk ratio
(RR = onRate / offRate). each resample b draws 1000 observations with replacement using
seed `(0xB007 + b) >>> 0` so the bootstrap is also deterministic. percentile CIs use the
2.5th and 97.5th percentile of the sorted resample distribution (indices floor(0.025 * B)
and floor(0.975 * B)).

## results

rates are formatted as percentages to one decimal place. wilson intervals are on the rate.
bootstrap intervals are on ARR and RR.

| scenario | tier | OFF rate [95% CI] | ON rate [95% CI] | absolute reduction | risk ratio [95% CI] |
|---|---|---|---|---|---|
| tab-contest | physiological | 95.1% [93.6%, 96.3%] | 0.0% [0.0%, 0.4%] | 95.1 pp [93.7, 96.4] | 0.00 [0.00, 0.00] |
| tab-contest | essential | 73.8% [71.0%, 76.4%] | 0.0% [0.0%, 0.4%] | 73.8 pp [71.0, 76.7] | 0.00 [0.00, 0.00] |
| tab-contest | parkinsonian | 67.6% [64.6%, 70.4%] | 0.0% [0.0%, 0.4%] | 67.6 pp [64.6, 70.5] | 0.00 [0.00, 0.00] |
| dock-contest | physiological | 100.0% [99.6%, 100.0%] | 35.7% [32.8%, 38.7%] | 64.3 pp [61.3, 67.1] | 0.357 [0.329, 0.387] |
| dock-contest | essential | 94.1% [92.5%, 95.4%] | 42.4% [39.4%, 45.5%] | 51.7 pp [48.7, 54.9] | 0.451 [0.417, 0.481] |
| dock-contest | parkinsonian | 80.0% [77.4%, 82.4%] | 42.1% [39.1%, 45.2%] | 37.9 pp [34.9, 40.9] | 0.526 [0.492, 0.561] |

notes on the table:
- "0.0% [0.0%, 0.4%]" for ON rate in tab-contest rows reflects the Wilson upper bound on
  0/1000; the interval is not a flat zero.
- dock-contest physiological OFF rate of 100% (1000/1000) yields a Wilson lower bound
  of 99.6%, upper of 100%.
- ARR CIs are from the bootstrap (reported as percentage points to one decimal).
- the parkinsonian tier has lower OFF rates than physiological in both scenarios because
  the lower frequency and larger amplitude combination happens to produce more partial
  misses that still resolve to the intended target under the ungated logic; the tiers
  are not a severity ladder.

## validity threats

- this is a simulation, not a human study. no participants touched a screen. the tremor
  model approximates the displacement envelope of real tremor but cannot capture gaze
  direction changes, grip adjustments, postural sway, or compensatory motor strategies
  that real users employ.
- the tremor model is a sinusoid plus noise. real tremor has richer spectral content
  (multiple peaks, asymmetric axes) and varies within a session. the sinusoid is a
  reasonable first-order approximation but will not reproduce every edge case.
- aim points are fixed per scenario. the study measures what happens when a user aims for
  a specific target from a specific origin. different start positions or slightly different
  aim points would change the rates. contested geometry is real but these numbers describe
  two specific geometry configurations, not all possible CarPlay interactions.
- the tiers are not a strict severity ladder. a physiological tremor (5 px, 9 Hz) can
  produce more mis-commits than a parkinsonian tremor (13 px, 4 Hz) in the dock scenario
  because the higher frequency oscillates through the contested boundary more times per
  drag. severity and mis-commit probability are not monotonically related.
- seedCount = 1000 gives good precision on rates above ~5% but the Wilson upper bound on
  0/1000 is 0.4%, so very rare mis-commits would not be detectable at this sample size.
- membrane saves were zero in every cell of the executed run. the membrane hysteresis path
  exists in the code but was not exercised by the scenarios tested; it may matter in
  different geometries or interaction patterns.

## reproduction

run `npm run experiment` to regenerate `data/experiment.json` and
`src/case-study/data/experimentResults.ts`. the run is deterministic (seedRange(1000)) and
byte-identical on re-run.
