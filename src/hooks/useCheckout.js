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

    const lastRecord = history.at(-1)
    const currentCheckout = lastRecord?.returnDate === null ? lastRecord : null

    const isCheckedOut = currentCheckout !== null

    const checkOut = (roNumber, techName) => {
        setHistory((prev) => {
            const updated = [
                ...prev,
                {
                    roNumber,
                    techName,
                    checkoutDate: new Date().toISOString(),
                    returnDate: null,
                },
            ]
            save(toolId, updated)
            return updated
        })
    }

    const checkIn = () => {
        if (!currentCheckout) return
        setHistory((prev) => {
            const updated = prev.map((r, i) =>
                i === prev.length - 1 ? { ...r, returnDate: new Date().toISOString() } : r
            )
            save(toolId, updated)
            return updated
        })
    }

    return { history, isCheckedOut, currentCheckout, checkOut, checkIn }
}
