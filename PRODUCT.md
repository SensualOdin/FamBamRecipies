# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The Gewinner family and their extended relatives — George, Aliki, "Momda" (Rhonda), and about eight contributing cooks in total, based around Frisco, TX. Primary situations: browsing for what to cook, cooking hands-busy in the kitchen (Kitchen Mode), adding recipes from photos of handwritten cards and cookbooks, and planning the week's meals. Visitors without accounts can browse; contributing (adding, editing, favoriting, cooking) requires a family sign-in.

## Product Purpose

FamBam (www.gewinningrecipes.com) is the family's digitized recipe binder: it preserves family recipes, the stories behind them, and the record of who cooks what. Success looks like family members actually cooking from it, adding their recipes with photos, and the binder feeling like an heirloom rather than an app.

## Positioning

Not a recipe app — a single family's living binder. Its differentiators are provenance and voice: every recipe belongs to a named family cook, "Made N×" counts and stories travel with recipes, and the site speaks in the family's own voice ("The Ge-winning Family Cookbook" — the domain pun is the brand).

## Operating Context

- Recipes come from photos of handwritten cards and cookbook pages, extracted by AI (Supabase edge function → GPT), then edited in a guided form.
- Kitchen Mode is used mid-cooking: wake lock, step narration via ElevenLabs (family-chosen voice, browser-voice fallback), voice commands.
- Meal planner exports to Google Calendar / .ics; shopping list is shared via the Web Share API and shopped against Walmart search links.

## Capabilities and Constraints

- Stack: React 18 + Vite + TypeScript PWA on GitHub Pages (deploys from `main`); Supabase for Postgres/Auth/Storage/Realtime/Edge Functions. No server-side routing — pages are query-param views (`?recipe=`, `?view=`).
- Recipe detail, meal planner, and shopping list are full pages with URLs and browser-history support — popups are reserved for quick actions (auth, add-recipe wizard, converter, profile, rating).
- Anonymous visitors can read recipes; all writes require auth (RLS-enforced). Family emails must never be publicly readable.
- ~17 of ~36 recipes have no photo; the design must treat photo-less recipes as charming (index cards), not broken.
- `servings` is an integer in the database; upstream inputs like "4-6" are coerced.

## Brand Commitments

- Name: "The Ge-winning Family Cookbook" (FamBam is the short app name). The Ge-winning pun is binding.
- Voice: warm family microcopy — "The whole binder", "Add a Tradition", "Made with love & butter in Frisco, TX — Gewinning since forever."
- Michigan maize is the accent color family (see DESIGN.md for the visual system).
- Real family data is copy: recipe counts, cook names, most-cooked recipe appear in the hero.

## Evidence on Hand

- ~36 real family recipes in Supabase with authors, photos (Supabase storage), stories (e.g. Momda's soup and pancake stories), and cooked counts. No fabricated testimonials, reviews, or metrics — never invent family content.

## Product Principles

1. Provenance over polish: who made it, how many times it's been cooked, and the story matter more than stock-photo perfection.
2. Never block dinner: every enhanced capability (AI voice, extraction) degrades gracefully to something that still works.
3. Family-only writes, world-readable warmth: browsing is open; contribution is authenticated.
4. Website, not app: real URLs, back buttons, and shareable links for every destination.
5. Missing content is an invitation ("needs a photo — someone cook it!"), never an error state.
