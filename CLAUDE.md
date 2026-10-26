@AGENTS.md

# Phase 10 — project guide

A pass-and-play web app for the Phase 10 card game (2–6 players on one device).

## Stack

- React 19 + TypeScript (React Compiler enabled), built with Vite+ (`vp`)
- Redux Toolkit + React Redux for state
- React Router (data mode: `createBrowserRouter` + `RouterProvider`, imported from `react-router`)
- Tailwind CSS v4 via `@tailwindcss/vite`; design tokens live in `@theme`
- Vitest via `vp test`; import test APIs from `vite-plus/test`

## Commands

| Task                       | Command        |
| -------------------------- | -------------- |
| Dev server                 | `vp dev`       |
| Format + lint + type check | `vp check`     |
| Tests                      | `vp test`      |
| Production build           | `vp run build` |

## Docs — read before working in an area

- [docs/RULES.md](docs/RULES.md): the game rules. **This is the source of truth for all game logic.**
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): the feature-based folder structure, state shape, routing and import rules.
- [docs/DESIGN.md](docs/DESIGN.md): design tokens, component specs and screens from the mockups.
- [docs/CODING.md](docs/CODING.md): TypeScript and modern React standards. **Follow these in all code.**
- [docs/PLAYWRIGHT.md](docs/PLAYWRIGHT.md): how to check screens and flows in a real browser with the Playwright MCP server.

## Key conventions

- **Feature-based layout.** Code lives in `src/features/<feature>/` and is imported only through that feature's `index.ts`. `src/shared/` must never import from `src/features/`.
- **Pure game engine.** All rules logic lives in `src/features/game/engine/` as pure, deterministic TypeScript, with no React, Redux or `Math.random` (inject the RNG). Reducers stay thin and call engine functions.
- **Strict TypeScript.** No `any`, no `!` non-null assertions, no `@ts-ignore`, no `enum`. Use discriminated unions with exhaustive switches, `readonly` engine inputs, result types instead of throwing, and named exports only. Full list in CODING.md.
- **Modern React.** Function components with typed props (no `React.FC`, no `forwardRef`). The React Compiler is on, so don't add `useMemo`, `useCallback` or `memo`. Avoid `useEffect` except to sync with external systems. Derive values instead of storing them.
- **Component files ≤ 100 lines.** Split into sub-components, a custom hook, or constants before going over. See CODING.md.
- **Typed hooks only.** Use `useAppDispatch` / `useAppSelector` from `src/app/hooks.ts`, never plain `useDispatch` / `useSelector`.
- **Serializable state.** Redux state holds plain data only: no class instances, functions, Dates or Maps.
- **Tailwind tokens only.** Use the token utilities from `docs/DESIGN.md` (`bg-table`, `text-ink`, `bg-card-red` …). No raw hex values or arbitrary color classes in components.
- **Accessibility.** Use real `<button>` / `<a>` elements, `aria-pressed` on selectable cards, `aria-label` on icon-only buttons and touch targets ≥ 44px.
- **Tests.** Co-locate tests as `*.test.ts(x)`. Every engine rule needs a test.

## Project skills (`.claude/skills/`)

- `new-feature`: scaffold a new feature folder and wire it into the store and router.
- `game-engine`: write or change game logic and its tests against RULES.md.
- `design-to-ui`: build a screen or component from the mockups with Tailwind tokens.
- `verify`: run check, test and build before calling a task done.

## Sub-agents (`.claude/agents/`)

These are read-only reviewers: they report findings and never edit. Run them after finishing a feature, in parallel when both apply, then fix what they find.

- `rules-auditor`: checks the engine and its tests against RULES.md. Run it after any change to `features/game/engine/` or `gameSlice`.
- `code-reviewer`: checks changed code against CODING.md, ARCHITECTURE.md and DESIGN.md. Run it after a feature is done and before committing.
