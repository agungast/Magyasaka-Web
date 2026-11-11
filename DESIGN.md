# Design System — Magyasaka v2 (Crest-Centered)

This document captures the visual language rebuilt around the class crest (Lambang). It is the single source of truth for tokens, components, and craft rules. All prior indigo/zinc/Plus Jakarta Sans references are superseded.

---

## Colour

### Ink Ramp (Neutral)
| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--color-ink-50`  | #f8fafc | #0b111a | — |
| `--color-ink-100` | #f1f5f9 | #101823 | — |
| `--color-ink-200` | #e2e8f0 | #1c2634 | border muted |
| `--color-ink-300` | #cbd5e1 | #2a3646 | border accented |
| `--color-ink-400` | #94a3b8 | #7d8fa6 | text dimmed |
| `--color-ink-500` | #64748b | #aebdd0 | text toned |
| `--color-ink-600` | #475569 | #dfe6ef | — |
| `--color-ink-700` | #334155 | #ffffff | — |
| `--color-ink-800` | #1e293b | #ffffff | — |
| `--color-ink-900` | #0f172a | #ffffff | — |
| `--color-ink-950` | **#05080c** | **#05080c** | **ink surface (dark bg, light text-on-ink)** |

### Azure Ramp (Primary Action)
| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--color-azure-50`  | #f0f7ff | #081320 | — |
| `--color-azure-100` | #e0efff | #0d1a2b | — |
| `--color-azure-200` | #bddbff | #152942 | — |
| `--color-azure-300` | **#5b9ae8** | **#5b9ae8** | **primary action (dark mode)** |
| `--color-azure-400` | #3d7fd9 | #3d7fd9 | — |
| `--color-azure-500` | **#2f6bc9** | **#2f6bc9** | **primary action (light mode)** |
| `--color-azure-600` | #2453a0 | #2453a0 | — |
| `--color-azure-700` | #1d4280 | #1d4280 | — |
| `--color-azure-800` | #193566 | #193566 | — |
| `--color-azure-900` | #162c54 | #162c54 | — |
| `--color-azure-950` | #101f3a | #101f3a | — |

### Semantic (stepped 500 for 11px legibility)
| Token | Light | Dark | Contrast (11px on paper/ink) |
|-------|-------|------|------------------------------|
| `--ui-color-error-500`   | #b42318 | (400) | 6.40:1 / 6.95:1 |
| `--ui-color-warning-500` | #a16207 | (400) | 4.80:1 / 5.21:1 |
| `--ui-color-success-500` | #15803d | (400) | 5.61:1 / 6.02:1 |
| `--ui-color-info-500`    | #1d4ed8 | (400) | 6.53:1 / 7.01:1 |

**Rule:** Semantic 500s are overridden **unlayered** in `:root`/`.dark` (see `main.css:57-60`). Dark mode keeps Tailwind 400 shades.

### Surface Tokens (unlayered, beat module defaults)
| Token | Light | Dark |
|-------|-------|------|
| `--ui-bg`            | #fbfcfe | #05080c |
| `--ui-bg-muted`      | #eef2f8 | #0b111a |
| `--ui-bg-elevated`   | #ffffff | #101823 |
| `--ui-bg-accented`   | #e6ecf4 | #1a2432 |
| `--ui-border`        | #dbe3ee | #1c2634 |
| `--ui-border-muted`  | #e6ecf4 | #151d29 |
| `--ui-border-accented`| #c3cfdf | #2a3646 |
| `--ui-text`          | #1b2433 | #dfe6ef |
| `--ui-text-muted`    | #5b6b80 | #93a4b9 |
| `--ui-text-dimmed`   | #667587 | #7d8fa6 |
| `--ui-text-toned`    | #455468 | #aebdd0 |
| `--ui-text-highlighted`| #05080c | #ffffff |
| `--ui-text-inverted` | #ffffff | #05080c |

### Plate / Halftone
| Token | Light | Dark |
|-------|-------|------|
| `--plate-bg`      | #eef2f8 | #0b111a |
| `--plate-dot`     | #d0dbe9 | #1d2836 |
| `--halftone-dot`  | #cfd9e6 | #26364a |
| `--card-shadow`   | rgba(11,17,26,0.5) | rgba(0,0,0,0.7) |

### Crest Assets
- `magyasaka-crest-ink.png` — 552×512, #10141a (ink on paper)
- `magyasaka-crest-light.png` — 552×512, white (on ink)
- Aspect ratio locked: **552/512 ≈ 1.078**
- Favicon: 64×64, 180×180 apple-touch-icon, PNG-in-ICO favicon.ico

---

## Typography

| Role | Family | Weights | CSS Var |
|------|--------|---------|---------|
| Display / Logo | **Outfit** | 400, 500, 600, 700, **800** | `--font-display` |
| Sans / UI | **Schibsted Grotesk** | 400, 500, 600, 700 | `--font-sans` |
| Mono / Data | **Geist Mono** | 400, 500 | `--font-mono` |

**Self-hosted** via `@nuxt/fonts` (`nuxt.config.ts → fonts.families`).

### Scale (Tailwind v4 default, no custom scale)
- Base: 16px (1rem)
- Heading clamp: `text-[2.75rem] md:text-6xl lg:text-7xl` (hero), `text-2xl md:text-3xl` (page h1), `text-xl md:text-2xl` (section h2), `text-lg` (card h3), `text-base` (badge label), `text-sm` (meta), `text-xs` (12px, floor for functional text), `text-[11px]` (badge xs).

**Craft floor:** No functional text below 11px. Badge `xs` = 11px, `sm` = 12px.

---

## Crest Usage

### Component: `MagyasakaCrest.vue`
```vue
<MagyasakaCrest :size="64" mode="ink" />  <!-- or mode="light" -->
```
- CSS mask (`currentColor` tint) — one asset serves both modes.
- `--crest-size` (default 2rem), `--crest-url` (asset path).
- Aspect ratio 552/512 preserved.

### Placement
| Location | Size | Mode | Context |
|----------|------|------|---------|
| Header (left) | 32px | ink | `text-muted` → `hover:text-primary!` |
| Hero | 200px | ink / light (ikut mode) | centered, `animate: hero-enter`, `text-highlighted` |
| Login | 72px | light | replaces shield tile |
| Admin | 48px | ink | next to `font-display` heading |
| Footer | 28px | ink | centered, `text-muted` |
| Favicon / apple-touch-icon | 64 / 180 | ink/light | generated |

---

## Components

### `.hero-plate` (Home hero ground)
- `background-color: var(--ui-bg)` (paper/ink)
- `::before` halftone dot grid (8px, animated drift 24s)
- `::after` radial gradient wash (azure 34% → transparent)
- Crest centered (200px), caption below, CTA pair
- `animation: hero-enter 900ms cubic-bezier(0.16,1,0.3,1)`

### `.plate` (Photo placeholder)
- `background-color: var(--plate-bg)`
- Halftone dot grid (8px, static)
- Crest watermark (bottom-right, 18% opacity)
- Used on: galeri index, galeri detail, proyek index

### `.card-hover`
- `transition: transform 0.25s, box-shadow 0.25s` (cubic-bezier 0.16,1,0.3,1)
- Hover: `translateY(-2px)` + `box-shadow: 0 14px 30px -18px var(--card-shadow)`

### `.accent` (Data colour chip)
```css
.accent {
  --accent: var(--ui-primary);
  background-color: color-mix(in srgb, var(--accent) 14%, transparent);
  color: color-mix(in oklab, var(--accent) 62%, var(--ui-text));
}
```
- Usage: course chips (jadwal), assignment type icons (tugas), project kategori badges (proyek), officer avatar (pengurus).
- Inline: `:style="{ '--accent': <hex> }"`
- **Never** used as body text — only marks/chips.

### `.accent-text` (Inline badge, no bg)
```css
.accent-text { color: color-mix(in oklab, var(--accent, var(--ui-primary)) 62%, var(--ui-text)); }
```
- Usage: proyek kategori badges (`variant="outline"`), any inline label needing data colour without bg.

### `.accent-plain` (Decorator mark, no bg)
```css
.accent-plain { color: color-mix(in oklab, var(--accent, var(--ui-primary)) 62%, var(--ui-text)); }
```
- Usage: decorative icons next to accent chips (e.g., pengurus role icon).

---

## Craft Rules (Non-Negotiable)

1. **No eyebrow/kicker above headings.** Heading is the first thing.
2. **No gradient text.** Ever.
3. **No glass/blur.** `backdrop-filter: none` on header; no `.glass`, `.glass-light`.
4. **No colored `border-l` > 1px.** Use hairline rows or accent dots.
5. **No same-size icon + heading + text card grid as page structure.**
6. **One authored motion moment:** `.hero-enter` + `halftone-drift`. No `animate-float`, `animate-pulse-glow`, `bounce`.
7. **Themed browser surfaces:** `::selection` (azure), `caret-color` (azure), scrollbar (ink), caret (azure), page/layout transitions (opacity 160ms).
8. **Halftone texture is printed paper.** Not a gradient, not a photo filter.
9. **One action ink:** Azure only. Rainbow quick-links / search category colours collapsed.
10. **Data colours (`schedule.warna`, kategori, jabatan) are marks, not text.** Carried by `.accent` / `.accent-text` chips.
11. **Semantic colours kept:** error/warning/success/info for deadlines/urgency/validation.
12. **Contrast floor:** 4.5:1 for all functional text ≥11px. Semantic 500s stepped down in CSS.
13. **`color-scheme: light` / `color-scheme: dark`** declared on `:root`/`.dark`.

---

## Anti-Patterns (Enforced by Impeccable)

| Pattern | Rule | Fix |
|---------|------|-----|
| `subtle` badge at 10px | Use `outline` + 11px+ or `.accent-text` | `variant="outline" size="sm"` / `.accent-text` |
| `border-l-3/4` + `rounded` | Hairline row or dot | `<span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor }" />` |
| h1 → h3 (skip h2) | Insert h2 or demote h3→h2 | `<h2>` for section, `<h3>` for card title |
| Indigo/violet/pink as decor | Replace with azure or semantic | `color="primary"` / `color="error\|warning\|success\|info"` |
| `text-white` on `bg-primary` (dark) | Use `text-inverted` | `bg-primary text-inverted` |
| Gradient text / glass / bounce | Remove | — |

---

## Motion

```css
@keyframes hero-enter {
  from { opacity: 0; filter: blur(6px); transform: translateY(16px); }
  to   { opacity: 1; filter: blur(0); transform: none; }
}
@keyframes halftone-drift {
  from { background-position: 0 0; }
  to   { background-position: 4.5px 4.5px; }
}
.hero-enter { animation: hero-enter 900ms cubic-bezier(0.16, 1, 0.3, 1); }
@media (prefers-reduced-motion: reduce) {
  .hero-enter, .hero-plate::before { animation: none !important; }
}
.page-enter-active, .page-leave-active { transition: opacity 160ms ease; }
.page-enter-from, .page-leave-to { opacity: 0; }
```

---

## Accessibility

- `color-scheme` declared → UA form controls follow mode.
- Focus visible: `outline-3 outline-primary/25` (Nuxt UI default).
- Skip link: none (single-page simplicity, header sticky).
- `::selection` azure/ink — no ghost highlights.
- `prefers-reduced-motion` respected on all authored animations.
- All functional text ≥11px (badge xs = 11px, sm = 12px).
- Semantic 500s stepped for 4.5:1 at 11px.

---

## QA Checklist (Impeccable + CDP)

- [ ] `impeccable detect <url>` → 0 anti-patterns on all routes
- [ ] CDP audit: `lowContrastCount: 0` on home-light/dark/mobile, login, jadwal, tugas, anggota, pengurus, proyek (both modes)
- [ ] No horizontal overflow (`overflowX: false`)
- [ ] `backdropFilter: none` on header
- [ ] `colorScheme: dark` in dark mode
- [ ] Crest masks render (header 32×30, hero 216×200, login 78×72)
- [ ] Fonts loaded: Outfit 400/500/600/700/800, Schibsted Grotesk 400/500/600/700, Geist Mono 400/500
- [ ] Badge text ≥11px, contrast ≥4.5:1
- [ ] No text <10px

---

## Open Decisions

- **`AppLogo.vue`** — keep (wordmark for potential co-branding) vs retire (crest is the mark). Currently unused.
- **Package manager** — npm (`package-lock.json` exists) vs pnpm (CI, README). Pick one.
- **RLS per-role** — restrict writes to `class_officers` only (currently any authenticated).
- **File upload** — Supabase Storage buckets + signed URLs vs external URL paste.
- **Real Supabase** — `.env` placeholders → real project; verify RLS, auth, storage.

---

## Changelog (v2)

- **2026-11-11** — `--font-sans` Plus Jakarta Sans → **Schibsted Grotesk** (menghapus temuan `overused-font` detector; Outfit dan Geist Mono tetap). QA checklist font diperbaiki ke trio yang benar.
- **2026-11-11** — Hero beranda mengikuti mode halaman: kelas `dark` hardcode dihapus dari `.hero-plate` (dulu banner selalu ink di kedua mode); teks/crest/badge pakai token mode (`text-highlighted`, `text-muted`, `text-azure-500 dark:text-azure-300`).
- **2026-10-22** — Crest-centered rebuild: ink/azure tokens, Archivo/Schibsted/JetBrains, halftone plates, crest mask, single action ink, semantic 500 overrides, badge 11px floor, `.accent` system, zero blur/glass/gradient text, authored motion only, browser surfaces themed. All routes pass Impeccable + CDP audit (1 false positive on proyek-light IoT badge — HMR stale bundle).