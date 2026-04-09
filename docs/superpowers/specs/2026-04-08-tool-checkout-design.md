# Tool Check-Out / Check-In System — Design Spec
**Date:** 2026-04-08  
**Status:** Approved

---

## Overview

Add a check-out / check-in system to the Tool Search app so that shop staff can record who has a tool, which Repair Order it's on, and view a full checkout history per tool. All data is stored in `localStorage` — no backend required.

---

## Data Model

Each tool's history is stored in `localStorage` under the key `checkout_<toolId>` (e.g. `checkout_100-001`).

The value is a JSON array of checkout records, newest last:

```json
[
  {
    "roNumber": "RO-47100",
    "techName": "M. Chen",
    "checkoutDate": "2026-03-15T09:00:00.000Z",
    "returnDate": "2026-03-15T16:45:00.000Z"
  },
  {
    "roNumber": "RO-48291",
    "techName": "J. Rivera",
    "checkoutDate": "2026-04-08T14:32:00.000Z",
    "returnDate": null
  }
]
```

- `returnDate: null` means the tool is currently checked out.
- A tool is **checked out** if its latest record has `returnDate: null`.
- A tool is **available** if the array is empty or the latest record has a non-null `returnDate`.

---

## Components

### `useCheckout.js` (custom hook)
All localStorage logic lives here. Components never touch localStorage directly.

**API:**
```js
const { getHistory, checkOut, checkIn } = useCheckout()

getHistory(toolId)              // → array of records (may be empty)
checkOut(toolId, { roNumber, techName })  // appends new record with returnDate: null
checkIn(toolId)                 // sets returnDate on the latest record to now
```

Internally, the hook reads/writes `localStorage` on every call. No global state needed — each `ToolCard` reads its own key.

### `CheckoutModal.jsx` (new component)
Receives `tool` as a prop. Uses `useCheckout` to drive all state.

**When tool is available:**
- Form with two fields: RO Number, Technician Name (both required)
- "Confirm Check Out" button is **disabled** until both fields are non-empty
- On submit — calls `checkOut`, modal immediately reflects the checked-out state

**When tool is checked out:**
- Amber info panel showing current RO #, technician, and date checked out
- "Check In" button — calls `checkIn`, updates display immediately

**Always shown (bottom of modal):**
- History list of all past (completed) checkouts
- Columns: RO, Technician, Date Out, Date In
- "No previous checkouts" empty state when history is empty

**Modal structure:**
- Ford blue header with tool number, name, and location
- Close (✕) button dismisses modal
- Clicking outside the modal dismisses it

### `ToolCard.jsx` (updated)
- Reads current checkout status via `useCheckout`
- Displays a status badge:
  - **Green "● AVAILABLE"** when tool is available
  - **Amber "● CHECKED OUT"** when tool is checked out
- Button opens `CheckoutModal`:
  - "Check Out" when available
  - "Details" when checked out

---

## UI / UX Flow

1. User sees tool card with status badge
2. User clicks button → `CheckoutModal` opens
3. **If available:** user fills in RO # and tech name → clicks "Confirm Check Out" → modal updates to checked-out state
4. **If checked out:** user sees current checkout info → clicks "Check In" → modal updates to available state; record gains a `returnDate`
5. Modal can be dismissed at any time via ✕ or clicking outside

---

## Styling

- Modal uses existing Ford blue (`#003594`) for the header, matching the app's current palette
- Available badge: green background (`#d4edda`), green text (`#276D36`)
- Checked-out badge: amber background (`#fff3cd`), amber text (`#856404`)
- Input fields: white background, black text, existing border style
- History rows: light gray background, 4-column grid (RO, Tech, Date Out, Date In)

---

## Out of Scope

- Authentication / login — any user can check out any tool
- Multi-device sync — localStorage is per-browser
- Search or filter within history
- Notifications or overdue alerts
