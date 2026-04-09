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
