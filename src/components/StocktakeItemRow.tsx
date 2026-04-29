'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Item {
  id: string
  productCode: string
  productName: string
  expectedQty: number
  countedQty: number | null
  unit: string
  countedBy: { name: string } | null
  countedAt: Date | null
  notes: string | null
}

export function StocktakeItemRow({ item }: { item: Item }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [countedQty, setCountedQty] = useState(item.countedQty?.toString() || '')
  const [notes, setNotes] = useState(item.notes || '')
  const [saving, setSaving] = useState(false)

  const handleCancel = () => {
    setEditing(false)
    setCountedQty(item.countedQty?.toString() || '')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`/api/stocktake-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countedQty: countedQty ? parseFloat(countedQty) : null,
          notes,
        }),
      })
      setEditing(false)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-mono text-gray-700">{item.productCode}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {item.expectedQty} {item.unit}
      </td>
      <td className="px-4 py-3 text-sm">
        {editing ? (
          <input
            type="number"
            value={countedQty}
            onChange={(e) => setCountedQty(e.target.value)}
            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
            step="0.01"
          />
        ) : (
          <span className={item.countedQty !== null ? 'text-gray-900' : 'text-gray-400'}>
            {item.countedQty !== null ? `${item.countedQty} ${item.unit}` : 'Not counted'}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm">
        {variance !== null ? (
          <span
            className={
              variance === 0
                ? 'text-green-600 font-medium'
                : variance > 0
                ? 'text-blue-600 font-medium'
                : 'text-red-600 font-medium'
            }
          >
            {variance > 0 ? '+' : ''}{variance}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {item.countedBy?.name || '—'}
        {item.countedAt && (
          <div className="text-xs text-gray-400">
            {new Date(item.countedAt).toLocaleDateString()}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-sm">
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Edit
          </button>
        )}
      </td>
    </tr>
  )
}
