# Frontend Color Palette

This file documents the main colors used across the frontend UI (semantic names, Tailwind classes, and hex values). Use these for consistency in components and when extending Tailwind's config.

## Primary / Accent

- orange-600 (main orange) — Tailwind default: `#EA580C` (class: `text-orange-600`, `bg-orange-600`)
- orange-700 (hover orange) — Tailwind default: `#C2410C` (class: `hover:bg-orange-700`, `text-orange-700`)
- Note: some components use `orange-500` for buttons/accents (Tailwind `#F97316`). A commonly-seen accent hex in the code is `#FF5722` (material orange) — used in some hard-coded styles.

## Grays

- gray-500 — Tailwind default: `#6B7280` (class: `text-gray-500`)
- gray-700 — Tailwind default: `#374151` (class: `text-gray-700`, `border-gray-700`)
- gray-800 — Tailwind default: `#1F2937` (used for darker borders/backgrounds, e.g. `border-gray-800`)
- gray-900 — Tailwind default: `#111827` (class: `text-gray-900`, used for dark backgrounds)

## Black / White / Dark custom backgrounds

- white — `#FFFFFF` (class: `text-white`, `bg-white`)
- black — `#000000` (class: `text-black`, `bg-black`)
- custom darks seen in code:
  - `#1d1c1c` (used as footer bg)
  - `#1a1a1a` (panel bg)
  - `#111111` (card bg, appears as `bg-[#111]`)
  - `#252525` (hover darker bg)

## Example usage (semantic tokens)

Consider adding these semantic names to your Tailwind config (recommended):

- primary: `--color-primary` -> `#EA580C` (orange-600)
- primary-hover: `--color-primary-hover` -> `#C2410C` (orange-700)
- accent: `#FF5722` (optional, used in a few components)
- text-muted: `#6B7280` (gray-500)
- text-secondary: `#374151` (gray-700)
- bg-dark: `#111827` (gray-900) or `#111111` for card backgrounds
- surface-1: `#1d1c1c`
- surface-2: `#1a1a1a`

## Quick tailwind.config.js snippet (example)

You can map semantic colors to Tailwind tokens:

```js
// tailwind.config.js (excerpt)
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#EA580C", // orange-600
          hover: "#C2410C", // orange-700
        },
        accent: "#FF5722",
        surface: {
          1: "#1d1c1c",
          2: "#1a1a1a",
        },
      },
    },
  },
};
```
