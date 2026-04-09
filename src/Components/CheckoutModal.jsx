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
