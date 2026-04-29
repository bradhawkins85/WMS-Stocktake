'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Stocktake {
  id: string
  status: string
}

export function StocktakeActions({ stocktake }: { stocktake: Stocktake }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const updateStatus = async (status: string) => {
    setLoading(true)
    try {
      await fetch(`/api/stocktakes/${stocktake.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {stocktake.status === 'DRAFT' && (
        <button
          onClick={() => updateStatus('ACTIVE')}
          disabled={loading}
          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          Activate
        </button>
      )}
      {stocktake.status === 'ACTIVE' && (
        <button
          onClick={() => updateStatus('COMPLETED')}
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          Mark Complete
        </button>
      )}
      {stocktake.status === 'COMPLETED' && (
        <Link
          href={`/admin/stocktakes/${stocktake.id}/upload`}
          className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700"
        >
          Upload to Datapel
        </Link>
      )}
    </div>
  )
}
