# LevelUp

A habit tracker that turns real-life goals into an RPG: small daily quests, XP, levels, streaks and achievements.
UX/UI portfolio project by Miki.

**Live demo:** _add your Vercel link here_

## What's in it

| Screen | What it does |
|---|---|
| Landing | Explains the product, has a working mini dashboard, "Start your journey" and "Try with sample data" |
| Onboarding (3 steps) | Pick goals → create character (name + avatar) → pick a first quest. Nothing else is asked. |
| Today (dashboard) | Today's quests with one-tap completion, level + XP bar, streak, XP today, next achievement, this week |
| Create / edit quest | Form with inline validation, live preview and XP shown before saving |
| Quests | Manage all quests, delete with confirmation, Quest helper that splits a big goal into small quests |
| Progress | Weekly stats, quests per day, by category, weekly review (what went well / what to adjust), achievements |
| Profile | Name, avatar, goals, language (EN / ไทย), light/dark theme, sound, reset data |

## Design decisions

- **One main action per screen.** Today = tick quests. Everything else supports it.
- **No numbers to invent.** XP comes from difficulty (Easy 25 / Medium 50 / Hard 100), so creating a quest takes seconds.
- **Feedback on every action.** Completing a quest shows +XP on the row, a toast with Undo, a sound, and a level-up screen when you reach a new level.
- **Forgiving.** Undo after completing, confirmation before deleting, earned XP is kept if a quest is deleted, a streak isn't "lost" until a full day is missed.
- **States designed, not left blank.** Empty states (no quests today, no quests yet, no data this week), error states (form validation, onboarding), success states (toasts, level up, achievements).
- **Colour carries meaning.** Blue = action, gold = XP, orange = streak, green = done, red = errors. Each category has its own colour stripe.
- **Accessible.** Keyboard and screen-reader friendly (labels, focus states, `aria-*`), 44px+ tap targets, respects reduced motion, works from 360px phones to desktop.
- **Bilingual.** Every string lives in `src/lib/i18n.tsx` in English and Thai.

## Quest helper and AI

The PRD treats AI as optional for v1, and the core loop must work without it. The Quest helper (`src/lib/helper.ts`)
uses built-in topic rules to turn a goal like "I want to improve my English" into three small quests the user can edit before saving.
`suggestQuests()` is the single function an AI model could replace later without changing the UI.

## Tech

React 18 · TypeScript · Framer Motion · CSS (design tokens, light + dark) · Web Audio API for sound · Vite.
Data is stored in `localStorage` (no account needed). Routes use the URL hash, so it runs on any static host.

```
npm install
npm run dev     # local
npm run build   # production build in dist/
```

```
src/
  lib/         game rules (XP, levels, streaks, achievements), store, i18n, quest helper, router, sound
  components/  shared UI: icons, bars, modal, toasts, quest row, logo
  screens/     Landing, Onboarding, AppShell, Today, Quests, QuestForm, Progress, Profile
```

## Still to do for the case study

- Research: interview 3–5 people about how they build habits and why they stop.
- Usability test this build (e.g. "add a quest for reading", "find out how much XP you need for the next level") and record what changes.
