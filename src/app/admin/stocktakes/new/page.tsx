'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewStocktakePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [loading, setLoading] = useState(false)
  const [pulling, setPulling] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stocktakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, datapelWarehouseId: warehouseId }),
      })
      
      if (!res.ok) throw new Error('Failed to create stocktake')
      
      const data = await res.json()
      router.push(`/admin/stocktakes/${data.id}`)
    } catch {
      setError('Failed to create stocktake. Please try again.')
      setLoading(false)
    }
  }

  const handlePullFromDatapel = async () => {
    if (!warehouseId) {
      setError('Please enter a warehouse ID first')
      return
    }
    
    setPulling(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/stocktakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || `Stocktake - ${new Date().toLocaleDateString()}`, datapelWarehouseId: warehouseId }),
      })
      
      if (!res.ok) throw new Error('Failed to create stocktake')
      
      const stocktake = await res.json()
      
      const pullRes = await fetch(`/api/stocktakes/${stocktake.id}/pull`, {
        method: 'POST',
      })
      
      if (!pullRes.ok) {
        const pullData = await pullRes.json()
        setMessage(pullData.message || 'Datapel unavailable. Stocktake created without items.')
        router.push(`/admin/stocktakes/${stocktake.id}`)
        return
      }
      
      router.push(`/admin/stocktakes/${stocktake.id}`)
    } catch {
      setError('Failed to pull from Datapel. Please try again.')
    } finally {
      setPulling(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/stocktakes" className="text-blue-600 hover:underline text-sm">
          ← Back to Stocktakes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Create New Stocktake</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stocktake Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g. Monthly Stocktake - January 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datapel Warehouse ID
            </label>
            <input
              type="text"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g. WH001"
            />
            <p className="text-xs text-gray-500 mt-1">
              Required to pull stock data from Datapel WMS
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading || pulling}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create (Add Items Manually)'}
            </button>
            <button
              type="button"
              onClick={handlePullFromDatapel}
              disabled={loading || pulling}
              className="flex-1 py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
            >
              {pulling ? 'Pulling from Datapel...' : 'Create & Pull from Datapel'}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">How it works</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Create the stocktake, then add items manually from the detail page</li>
            <li>Or use &quot;Pull from Datapel&quot; to automatically import current stock levels</li>
            <li>If Datapel is unavailable, the stocktake is created empty for manual item entry</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
