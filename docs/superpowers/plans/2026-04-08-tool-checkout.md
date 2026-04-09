# Tool Check-Out / Check-In Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a localStorage-backed check-out/check-in system to each tool card, recording RO number, technician name, and dates, with a full history displayed in a modal dialog.

**Architecture:** A `useCheckout` hook encapsulates all localStorage reads and writes and exposes reactive state via `useState`. `CheckoutModal` renders the form (available state), current checkout info + check-in button (checked-out state), and a history list. `ToolCard` uses the hook to show a status badge and open the modal.

**Tech Stack:** React 19, Vite, plain CSS, localStorage (no additional libraries)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/hooks/useCheckout.js` | All localStorage logic; exposes `history`, `isCheckedOut`, `currentCheckout`, `checkOut(roNumber, techName)`, `checkIn()` |
| Create | `src/Components/CheckoutModal.jsx` | Modal UI — form, checked-out panel, history list |
| Create | `src/css/checkout.css` | Styles for modal overlay, modal body, badge, history rows |
| Modify | `src/Components/ToolCard.jsx` | Add status badge, checkout button, and render `CheckoutModal` |

---

### Task 1: `useCheckout` hook

**Files:**
- Create: `src/hooks/useCheckout.js`

This project has no test runner configured — verify each task manually in the browser with `npm run dev`.

- [ ] **Step 1: Create `src/hooks/useCheckout.js`**

```js
import { useState } from 'react'

const storageKey = (toolId) => `checkout_${toolId}`

const load = (toolId) => {
    try {
        return JSON.parse(localStorage.getItem(storageKey(toolId))) ?? []
    } catch {
        return []
    }
}

const save = (toolId, records) => {
    localStorage.setItem(storageKey(toolId), JSON.stringify(records))
}

export const useCheckout = (toolId) => {
    const [history, setHistory] = useState(() => load(toolId))

    const currentCheckout = history.at(-1)?.returnDate === null
        ? history.at(-1)
        : null

    const isCheckedOut = currentCheckout !== null

    const checkOut = (roNumber, techName) => {
        const updated = [
            ...history,
            {
                roNumber,
                techName,
                checkoutDate: new Date().toISOString(),
                returnDate: null,
            },
        ]
        save(toolId, updated)
        setHistory(updated)
    }

    const checkIn = () => {
        const updated = history.map((r, i) =>
            i === history.length - 1 ? { ...r, returnDate: new Date().toISOString() } : r
        )
        save(toolId, updated)
        setHistory(updated)
    }

    return { history, isCheckedOut, currentCheckout, checkOut, checkIn }
}
```

- [ ] **Step 2: Verify the hook loads without errors**

Run `npm run dev`, open the browser console — confirm no import errors. No visible UI change yet.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCheckout.js
git commit -m "feat: add useCheckout hook with localStorage persistence"
```

---

### Task 2: Checkout modal styles

**Files:**
- Create: `src/css/checkout.css`

- [ ] **Step 1: Create `src/css/checkout.css`**

```css
/* ── Overlay ─────────────────────────────────────────────── */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 20px;
}

/* ── Modal box ───────────────────────────────────────────── */
.modal {
    background: white;
    border-radius: 6px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.22);
    width: 100%;
    max-width: 480px;
    max-height: 90vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.modal-header {
    background: #003594;
    color: white;
    padding: 16px 18px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-shrink: 0;
}

.modal-header-title {
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 2px;
}

.modal-header-sub {
    font-size: 11px;
    opacity: 0.7;
}

.modal-close {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    opacity: 0.8;
    line-height: 1;
    padding: 0;
    margin-left: 12px;
    flex-shrink: 0;
}

.modal-close:hover {
    opacity: 1;
}

/* ── Checkout form (available state) ─────────────────────── */
.modal-form {
    padding: 18px;
    border-bottom: 1px solid #eee;
}

.modal-section-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: #666;
    letter-spacing: 0.06em;
    margin-bottom: 12px;
}

.modal-fields {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.modal-field label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #444;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.modal-field input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 13px;
    font-family: inherit;
    background: white;
    color: #111;
    outline: none;
    transition: border-color 0.15s ease;
}

.modal-field input:focus {
    border-color: #003594;
    box-shadow: 0 0 0 2px rgba(0, 53, 148, 0.12);
}

.modal-submit {
    margin-top: 14px;
    width: 100%;
    background: #003594;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s ease;
}

.modal-submit:hover:not(:disabled) {
    background: #002778;
}

.modal-submit:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

/* ── Checked-out panel ───────────────────────────────────── */
.modal-checkedout {
    padding: 16px 18px;
    background: #fffbf0;
    border-bottom: 1px solid #ffe082;
}

.modal-checkedout .modal-section-label {
    color: #856404;
}

.modal-checkedout-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    margin-bottom: 14px;
}

.modal-checkedout-field span:first-child {
    display: block;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: #999;
    letter-spacing: 0.06em;
    margin-bottom: 2px;
}

.modal-checkedout-field span:last-child {
    font-size: 13px;
    font-weight: 700;
    color: #333;
}

.modal-checkin {
    width: 100%;
    background: white;
    color: #856404;
    border: 1px solid #f0ad4e;
    padding: 9px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s ease;
}

.modal-checkin:hover {
    background: #fff8e1;
}

/* ── History list ────────────────────────────────────────── */
.modal-history {
    padding: 14px 18px;
}

.modal-history-empty {
    font-size: 12px;
    color: #bbb;
    text-align: center;
    padding: 8px 0;
}

.modal-history-rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 10px;
}

.modal-history-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 8px;
    background: #f7f7f7;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 8px 10px;
    font-size: 12px;
}

.modal-history-row span:first-child {
    display: block;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: #999;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
}

/* ── Card status badge ───────────────────────────────────── */
.tool-status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 4px;
}

.badge {
    font-size: 10.5px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 10px;
    letter-spacing: 0.04em;
}

.badge-available {
    background: #d4edda;
    color: #276D36;
}

.badge-checkedout {
    background: #fff3cd;
    color: #856404;
}

.tool-action-btn {
    font-size: 11.5px;
    font-weight: 600;
    font-family: inherit;
    padding: 4px 10px;
    border-radius: 3px;
    border: none;
    background: #003594;
    color: white;
    cursor: pointer;
    transition: background 0.15s ease;
}

.tool-action-btn:hover {
    background: #002778;
}
```

- [ ] **Step 2: Verify file saved, no syntax errors**

No visible change yet — CSS is not imported anywhere. Check there are no typos by skimming the file.

- [ ] **Step 3: Commit**

```bash
git add src/css/checkout.css
git commit -m "feat: add checkout modal and badge CSS"
```

---

### Task 3: `CheckoutModal` component

**Files:**
- Create: `src/Components/CheckoutModal.jsx`

- [ ] **Step 1: Create `src/Components/CheckoutModal.jsx`**

`CheckoutModal` receives checkout state as props from `ToolCard` (which owns the hook) — this avoids two separate hook instances getting out of sync.

```jsx
import { useState } from 'react'
import '../css/checkout.css'

const fmt = (isoString) => {
    if (!isoString) return '—'
    return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    })
}

const CheckoutModal = ({ tool, onClose, history, isCheckedOut, currentCheckout, checkOut, checkIn }) => {
    const [roNumber, setRoNumber] = useState('')
    const [techName, setTechName] = useState('')

    const handleCheckOut = () => {
        checkOut(roNumber.trim(), techName.trim())
        setRoNumber('')
        setTechName('')
    }

    const completedHistory = history.filter(r => r.returnDate !== null)

    return (
        <div className='modal-overlay' onClick={onClose}>
            <div className='modal' onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className='modal-header'>
                    <div>
                        <div className='modal-header-title'>{tool.tool} — {tool.name}</div>
                        <div className='modal-header-sub'>Location: {tool.location}</div>
                    </div>
                    <button className='modal-close' onClick={onClose}>✕</button>
                </div>

                {/* Available: checkout form */}
                {!isCheckedOut && (
                    <div className='modal-form'>
                        <div className='modal-section-label'>Check Out This Tool</div>
                        <div className='modal-fields'>
                            <div className='modal-field'>
                                <label>RO Number</label>
                                <input
                                    type='text'
                                    placeholder='e.g. RO-48291'
                                    value={roNumber}
                                    onChange={e => setRoNumber(e.target.value)}
                                />
                            </div>
                            <div className='modal-field'>
                                <label>Technician Name</label>
                                <input
                                    type='text'
                                    placeholder='e.g. J. Rivera'
                                    value={techName}
                                    onChange={e => setTechName(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            className='modal-submit'
                            disabled={!roNumber.trim() || !techName.trim()}
                            onClick={handleCheckOut}
                        >
                            Confirm Check Out
                        </button>
                    </div>
                )}

                {/* Checked out: current info + check-in */}
                {isCheckedOut && (
                    <div className='modal-checkedout'>
                        <div className='modal-section-label'>Currently Checked Out</div>
                        <div className='modal-checkedout-grid'>
                            <div className='modal-checkedout-field'>
                                <span>RO Number</span>
                                <span>{currentCheckout.roNumber}</span>
                            </div>
                            <div className='modal-checkedout-field'>
                                <span>Technician</span>
                                <span>{currentCheckout.techName}</span>
                            </div>
                            <div className='modal-checkedout-field'>
                                <span>Date Out</span>
                                <span>{fmt(currentCheckout.checkoutDate)}</span>
                            </div>
                        </div>
                        <button className='modal-checkin' onClick={checkIn}>
                            ✓ Check In
                        </button>
                    </div>
                )}

                {/* History */}
                <div className='modal-history'>
                    <div className='modal-section-label'>
                        History ({completedHistory.length} {completedHistory.length === 1 ? 'record' : 'records'})
                    </div>
                    {completedHistory.length === 0 ? (
                        <div className='modal-history-empty'>No previous checkouts</div>
                    ) : (
                        <div className='modal-history-rows'>
                            {[...completedHistory].reverse().map((r, i) => (
                                <div className='modal-history-row' key={i}>
                                    <div><span>RO</span>{r.roNumber}</div>
                                    <div><span>Tech</span>{r.techName}</div>
                                    <div><span>Out</span>{fmt(r.checkoutDate)}</div>
                                    <div><span>In</span>{fmt(r.returnDate)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default CheckoutModal
```

- [ ] **Step 2: Verify file saved, no import errors**

`npm run dev` — no console errors. Modal not visible yet (nothing renders it).

- [ ] **Step 3: Commit**

```bash
git add src/Components/CheckoutModal.jsx
git commit -m "feat: add CheckoutModal component"
```

---

### Task 4: Wire up `ToolCard`

**Files:**
- Modify: `src/Components/ToolCard.jsx`

- [ ] **Step 1: Replace `src/Components/ToolCard.jsx` with the updated version**

```jsx
import { useState } from 'react'
import { useCheckout } from '../hooks/useCheckout'
import CheckoutModal from './CheckoutModal'
import '../css/toolcard.css'

const PinIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
    </svg>
)

const ToolCard = ({ tool }) => {
    const [modalOpen, setModalOpen] = useState(false)
    // ToolCard owns the hook — state is passed as props to CheckoutModal
    // so both share the same instance and the badge updates immediately.
    const { history, isCheckedOut, currentCheckout, checkOut, checkIn } = useCheckout(tool.tool)

    return (
        <>
            <div className='tool-card'>
                <div className='tool-number'>
                    <span className='tool-number-badge'>{tool.tool}</span>
                    <span className='tool-tag'>Ford</span>
                </div>

                <div className='tool-img-container'>
                    <img src={`.${tool.image}`} alt={tool.name} />
                </div>

                <div className='tool-text'>
                    <p className='tool-name'>{tool.name}</p>
                </div>

                <div className='tool-location'>
                    <PinIcon />
                    <span className='tool-location-text'>{tool.location}</span>
                </div>

                <div className='tool-status-row'>
                    <span className={`badge ${isCheckedOut ? 'badge-checkedout' : 'badge-available'}`}>
                        ● {isCheckedOut ? 'CHECKED OUT' : 'AVAILABLE'}
                    </span>
                    <button className='tool-action-btn' onClick={() => setModalOpen(true)}>
                        {isCheckedOut ? 'Details' : 'Check Out'}
                    </button>
                </div>
            </div>

            {modalOpen && (
                <CheckoutModal
                    tool={tool}
                    onClose={() => setModalOpen(false)}
                    history={history}
                    isCheckedOut={isCheckedOut}
                    currentCheckout={currentCheckout}
                    checkOut={checkOut}
                    checkIn={checkIn}
                />
            )}
        </>
    )
}

export default ToolCard
```

- [ ] **Step 2: Verify the cards render with badge and button**

`npm run dev` — each card should show a green "● AVAILABLE" badge and a "Check Out" button at the bottom.

- [ ] **Step 3: Test the full flow**

  1. Click "Check Out" on any card → modal opens with Ford blue header, two empty input fields, empty history
  2. Leave fields blank → "Confirm Check Out" button is disabled (greyed out)
  3. Fill in RO number and technician name → button enables
  4. Click "Confirm Check Out" → modal switches to amber "Currently Checked Out" panel, card badge turns amber "CHECKED OUT"
  5. Close modal, reopen → state persists (localStorage saved)
  6. Refresh page → badge still shows "CHECKED OUT" (localStorage survives refresh)
  7. Click "Details" → modal opens showing current checkout
  8. Click "✓ Check In" → modal switches back to checkout form, card badge turns green
  9. Reopen modal → completed checkout appears in history list

- [ ] **Step 4: Commit**

```bash
git add src/Components/ToolCard.jsx
git commit -m "feat: add checkout status badge and modal trigger to ToolCard"
```

---

### Task 5: Add `.superpowers` to `.gitignore`

**Files:**
- Modify: `.gitignore` (create if absent)

- [ ] **Step 1: Add `.superpowers/` to `.gitignore`**

Open `.gitignore` (or create it at the project root) and add:

```
.superpowers/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore .superpowers brainstorm directory"
```
