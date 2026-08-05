---
name: The Ge-winning Family Cookbook
description: Heirloom recipe binder — warm paper, ink navy, maize, and handwriting
colors:
  paper: "#faf5ea"
  card: "#fffdf8"
  paper-deep: "#f3ecdc"
  line: "#e4dbc6"
  ink: "#1d2a44"
  ink-soft: "#4a5670"
  maize: "#f5c542"
  tomato: "#c8502e"
  midnight: "hsl(222, 45%, 10%)"
  midnight-card: "hsl(222, 40%, 14%)"
  midnight-text: "hsl(42, 45%, 93%)"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2.6rem, 6vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 600
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  hand:
    fontFamily: "Caveat, cursive"
    fontSize: "1.35rem"
    fontWeight: 600
    lineHeight: 1.3
  micro-label:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 800
    letterSpacing: "0.14em"
rounded:
  lg: "12px"
  xl: "16px"
  full: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.tomato}"
    textColor: "{colors.card}"
  button-maize:
    backgroundColor: "{colors.maize}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
  chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.xl}"
---

## Overview

FamBam is styled as a digitized family recipe binder: warm paper, ink-navy text, Michigan-maize accents, and sparing handwritten annotations. The direction was chosen deliberately to reject "AI template" aesthetics — the humanity (real cook names, stories, cooked counts) leads and the chrome recedes. Light "paper" theme is the default; dark is "midnight kitchen" (deep navy, same maize). Both themes are driven by the shadcn CSS variables in `src/index.css` — always style with tokens (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `hsl(var(--accent))`), never hardcoded slate/white/hex classes.

## Colors

Maize (`--primary`) is for emphasis and selected states with ink text on top. Tomato (`--accent`) is the human touch — handwritten notes, hover states, author kickers, "Mark as Cooked". Semantic colors stay conventional (emerald = done, rose = destructive, amber = caution) and must be dark-mode-safe (`color-500/10` tints, not `color-50` backgrounds). The paper grain texture is an inline SVG on `body` — never external image URLs.

## Typography

Fraunces for display/headings (`font-serif`), Nunito Sans for body (`font-sans`), Caveat (`font-hand`) only for human moments: story quotes, margin notes, playful sublines, empty-state asides. Handwriting is an accent, not a body font — one or two hand elements per screen. Never reintroduce Playfair Display, Inter, or Plus Jakarta Sans. Uppercase micro-labels (`micro-label`) are allowed for small wayfinding labels only, not headlines.

## Layout

Homepage is left-aligned editorial (hero → cooks row → featured card → filter bar → card grid), max-w-7xl; detail pages are narrower (max-w-2xl to max-w-6xl by density) with a sticky "Back to the binder" bar. Destinations (recipe, meal planner, shopping list) are full pages with query-param URLs and history support; dialogs are reserved for quick actions. Section headings sit on a dotted rule with an optional handwritten aside on the right. Mobile keeps a bottom nav (Home/Saved/Add/List/Me) and safe-area padding.

## Elevation & Depth

Soft ink-tinted shadows (`rgba(29,42,68, …)`) at low opacity; hover raises cards slightly and deepens the shadow. No glassmorphism, no backdrop-blur surfaces except the sticky top bars, no glowing blob backgrounds.

## Shapes

Radii are modest: `rounded-xl`/`rounded-2xl` for surfaces, `rounded-full` for buttons and chips — never the old 32–48px super-rounds. Signature physical touches: cards tilt ±0.5–0.7° (straighten on hover), a maize tape strip tops featured/header cards, and photo-less recipes render as ruled index cards (`.index-card-lines` + `.index-card-margin`) with a handwritten title, "from X's kitchen", and a "needs a photo!" nudge. Small line-drawn SVG doodles (pot, whisk) are the illustration language.

## Components

- **Recipe card:** photo (or index-card) top, serif title, story first-line in handwriting (tomato) when present, dashed-border meta row with cook time / serves / "Made N×" chip, ink "Cook this" pill.
- **Cook chips:** avatar-dot + name pills that filter by author; active state inverts to ink.
- **Featured card ("On the table this week"):** two-pane, tape strip, story quote in handwriting on a paper inset with maize left rule. Use flow layout, never absolute-position text that can overlap.
- **Forms/modals:** index-card headers (ruled lines + tape + handwritten title) for family-facing dialogs; paper (`--secondary`) headers with serif titles elsewhere.
- **Kitchen Mode:** stays dark (midnight + maize) as a focus mode.

## Do's and Don'ts

- **Do** pull real data into copy (recipe counts, cook names, most-cooked recipe) — provenance is the aesthetic.
- **Do** keep the family voice: "The whole binder", "Add a Tradition", "back to everyone", the Gewinning pun.
- **Don't** use emoji as imagery, placeholders, or decoration. Ever. Small lucide icons or hand-drawn SVG doodles instead.
- **Don't** reintroduce the AI-template kit: dark SaaS heroes, purple/blue gradients, floating blur blobs, glassmorphism, tracked-out uppercase taglines, identical centered card grids.
- **Don't** hardcode colors; if a surface looks wrong in one theme, fix the token usage, not the theme.
- **Don't** fabricate family content (testimonials, stories, counts) — absence is handled by invitation copy.
