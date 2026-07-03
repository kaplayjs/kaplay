# Testing KAPLAY

A lot of KAPLAY is rendering, timing and feel, the kind of thing a script can't
judge as right or wrong. So there isn't one conventional test suite, just a few
tools for different jobs. This doc covers what exists, where each one goes, and
when it's fine to skip.

## What we have

1. `pnpm run test:vite` runs Vitest.
   - `tests/auto/*.spec.ts`: unit tests for pure logic only, no DOM, no canvas,
     no timing. Math (`Vec2`, `Mat23`, `Color`), RNG, parsing, chord matching
     logic.
   - `tests/types/*.test-d.ts`: type-level tests (`vitest --typecheck`) for the
     public type surface, plugin typing, `core/taf.ts` generics.
2. `pnpm run test` runs a Puppeteer smoke test (`scripts/test.ts`). It opens
   every file in `examples/*.js` and `tests/playtests/*.js` tagged `@test` in a
   real browser for ~20 frames with synthetic input, and fails only if something
   throws. It doesn't check correctness, just crashes.
3. Manual: `pnpm dev` and look at it. This is the normal way to check anything
   visual, not a shortcut for when you skipped writing a real test.

## Where to add a test

- Pure function bug (math, RNG, parsing, chord matching logic): extend a
  `tests/auto/*.spec.ts`.
- Type surface or generics (plugins, `core/taf.ts`, component option types):
  extend a `tests/types/*.test-d.ts`.
- Runtime bug or feature (a component, input, physics): add a
  `tests/playtests/<name>.js` repro named after the bug, like `984.js`,
  `area_add_race.js` or `sprite_anim_onend_restart.js`. Only add `@test` to it
  if the failure can be expressed as a thrown error under synthetic input. Most
  playtests aren't tagged, they're just there for `pnpm dev` checks later.
- Editing an `examples/*.js` file that's tagged `@test`: don't break it under
  synthetic input, and check it with `pnpm dev` before pushing.

## When to skip a test

Tests aren't required for every PR. Visual or feel changes (easing, particles, a
shader) usually don't have anything worth asserting, "looks right" doesn't
throw. If you skip a test, say why in the PR, one line like "visual change,
verified with pnpm dev" is enough.

## Before you push

- `pnpm run check`
- `pnpm run fmt`
- `pnpm run test`
- `pnpm run test:vite`

CI runs format check, build, check, test and test:vite in that order, and all of
them need to pass before merging to master.
