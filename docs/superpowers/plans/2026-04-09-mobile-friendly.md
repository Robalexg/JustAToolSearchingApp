# Mobile-Friendly Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add CSS media queries to make the app usable on mobile phones without touching any JS or component files.

**Architecture:** Four existing CSS files each get an appended `@media` block. No new files are created. All breakpoints use `max-width` so desktop styles are unchanged. The sidebar hides entirely at ≤768px (only one nav item exists). Cards go single-column and modal grids stack at ≤540px.

**Tech Stack:** Plain CSS, Vite/React dev server for visual verification

---

> **Note on testing:** These are pure CSS layout changes with no JS logic. There is nothing to unit test. Each task is verified visually using Chrome DevTools responsive mode. The verification steps below describe exactly what to check.

---

### Task 1: Hide sidebar and collapse app grid on mobile

**Files:**
- Modify: `src/css/App.css`
- Modify: `src/css/nav.css`

- [ ] **Step 1: Open the dev server**

```bash
npm run dev
```

Open `http://localhost:5173` in Chrome. Open DevTools → Toggle Device Toolbar (Cmd+Shift+M). Set width to **375px** (iPhone SE). You should see the sidebar taking ~40% of the screen — this is the broken state we're fixing.

- [ ] **Step 2: Add mobile breakpoint to App.css**

Append to the end of `src/css/App.css`:

```css
@media (max-width: 768px) {
    .app {
        grid-template-columns: 1fr;
    }
}
```

- [ ] **Step 3: Add mobile breakpoint to nav.css**

Append to the end of `src/css/nav.css`:

```css
@media (max-width: 768px) {
    .sidebar {
        display: none;
    }
}
```

- [ ] **Step 4: Verify in browser at 375px**

In DevTools at 375px width:
- Sidebar should be gone
- Main content area fills full width
- Header, search bar, and cards fill the viewport edge-to-edge

At 800px width (above the breakpoint):
- Sidebar should reappear as normal
- Two-column grid layout is intact

- [ ] **Step 5: Commit**

```bash
git add src/css/App.css src/css/nav.css
git commit -m "feat: hide sidebar and collapse app grid on mobile"
```

---

### Task 2: Tighten padding and go single-column cards on mobile

**Files:**
- Modify: `src/css/main.css`

- [ ] **Step 1: Add mobile breakpoints to main.css**

Append to the end of `src/css/main.css`:

```css
@media (max-width: 768px) {
    .main .nav {
        padding: 0 16px;
    }

    .search-menu {
        padding: 14px 16px 12px;
    }

    .results-header {
        padding: 12px 16px 8px;
    }

    .card-container {
        padding: 0 16px 32px;
    }
}

@media (max-width: 540px) {
    .search-wrapper {
        max-width: 100%;
    }

    .card-container {
        grid-template-columns: 1fr;
    }
}
```

- [ ] **Step 2: Verify in browser at 375px**

In DevTools at 375px:
- Cards stack in a single column
- Search bar spans full width
- Left/right padding is 16px (not the original 24px) — content has breathing room but isn't cramped
- Header text ("Tool Search") and "SYSTEM ONLINE" are both visible and not clipped

At 600px (between the two breakpoints):
- Cards are still 2 columns (from the existing `max-width: 900px` rule)
- Padding is 16px (from the 768px rule)

At 950px (above all breakpoints):
- Cards are 4 columns, padding is 24px — desktop unchanged

- [ ] **Step 3: Commit**

```bash
git add src/css/main.css
git commit -m "feat: tighten padding and single-column cards on mobile"
```

---

### Task 3: Fix checkout modal grids on mobile

**Files:**
- Modify: `src/css/checkout.css`

- [ ] **Step 1: Add mobile breakpoint to checkout.css**

Append to the end of `src/css/checkout.css`:

```css
@media (max-width: 540px) {
    .modal-overlay {
        padding: 12px;
    }

    .modal-checkedout-grid {
        grid-template-columns: 1fr 1fr;
    }

    .modal-history-row {
        grid-template-columns: 1fr 1fr;
    }
}
```

- [ ] **Step 2: Verify in browser at 375px**

In DevTools at 375px:
- Click "Check Out" on any available tool to open the checkout modal
- Modal should fill most of the screen width with 12px margins on each side
- The checkout form fields (Employee ID, WBS Code) are full-width and easy to tap

To verify the checked-out grid, you need a tool that's already checked out. If none exist, temporarily open DevTools console and run:
```js
// In the browser console — just for visual testing, not permanent
document.querySelector('.modal-checkedout-grid') // check it renders as 2 cols
```

Alternatively, check out a tool then reopen the modal — the "Currently checked out" section with 3 fields (Employee, WBS, Date) should render as 2 columns instead of 3, preventing overflow.

The history rows (4-column grid: Out / In / Employee / WBS) should render as 2 columns on mobile.

At 600px (above the breakpoint):
- Modal grids revert to their original 3-column and 4-column layouts

- [ ] **Step 3: Commit**

```bash
git add src/css/checkout.css
git commit -m "feat: fix checkout modal grids on mobile"
```
