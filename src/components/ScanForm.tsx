'use client'

import { useState } from 'react'

export function ScanForm({ itemId, unit }: { itemId: string; unit: string }) {
  const [countedQty, setCountedQty] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!countedQty) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/stocktake-items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countedQty: parseFloat(countedQty),
          notes,
        }),
      })

      if (!res.ok) throw new Error('Failed to save count')

      setSubmitted(true)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="px-6 py-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Count Recorded!</h2>
        <p className="text-gray-600 mb-1">
          Counted: <span className="font-bold text-gray-900">{countedQty} {unit}</span>
        </p>
        <p className="text-gray-500 text-sm mt-4">Scan the next product to continue.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Counted Quantity ({unit})
        </label>
        <input
          type="number"
          value={countedQty}
          onChange={(e) => setCountedQty(e.target.value)}
          required
          min="0"
          step="0.01"
          inputMode="decimal"
          className="w-full text-4xl font-bold text-center px-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
          placeholder="0"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          placeholder="Any discrepancies or comments..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !countedQty}
        className="w-full py-4 bg-blue-600 text-white rounded-xl text-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Saving...' : 'Submit Count'}
      </button>
    </form>
  )
}
