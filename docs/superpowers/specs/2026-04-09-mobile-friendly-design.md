# Mobile-Friendly Design Spec

**Date:** 2026-04-09
**Status:** Approved

## Problem

The app uses a fixed two-column CSS grid (`230px sidebar + 1fr main`). On a ~375px phone screen the sidebar consumes ~40% of the viewport, leaving almost no room for content. The card grid only goes down to 2 columns at 900px with no single-column breakpoint. The checkout modal contains multi-column grids that overflow on small screens.

## Approach

CSS-only media queries added to the four existing CSS files. No new dependencies, no JS changes, no new files. Existing desktop layout is untouched.

## Breakpoints

| Breakpoint | Affects |
|---|---|
| `max-width: 768px` | App grid, sidebar visibility |
| `max-width: 540px` | Card grid, padding, modal grids |

768px covers tablets and phones. 540px targets phones specifically where single-column cards and stacked modal grids are needed.

## Changes Per File

### App.css — Layout grid

At `≤ 768px`: collapse `.app` from `grid-template-columns: var(--sidebar-w) 1fr` to a single-column layout so the main content fills the full viewport.

### nav.css — Sidebar

At `≤ 768px`: set `.sidebar` to `display: none`. The app currently has one nav item ("Tool Search") so hiding the sidebar on mobile loses no navigation — the user is already on the only page. No hamburger menu needed.

### main.css — Content area

At `≤ 768px`:
- Reduce horizontal padding on `.search-menu`, `.results-header`, and `.card-container` from `24px` to `16px` to reclaim space on small viewports.

At `≤ 540px`:
- `.card-container` → `grid-template-columns: 1fr` (single column)
- Search wrapper `max-width` removed so it fills the container

### checkout.css — Modal grids

At `≤ 540px`:
- `.modal-checkedout-grid` → `grid-template-columns: 1fr 1fr` (was 3 columns)
- `.modal-history-row` → `grid-template-columns: 1fr 1fr` (was 4 columns)
- Modal overlay padding reduced to `12px` so the modal doesn't feel cramped on small screens

## What Does Not Change

- Desktop layout (all breakpoints use `max-width`, so anything above 768px is unaffected)
- Component structure and JSX
- All existing CSS rules — only additive `@media` blocks are appended
- The `index.html` viewport meta tag already exists via Vite's default template

## Out of Scope

- Hamburger/drawer navigation (not needed with single nav item)
- Touch-specific interactions (tap targets are already adequate at current sizes)
- Landscape-specific breakpoints
