'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'

export default function UploadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleUpload = async () => {
    setUploading(true)
    try {
      const res = await fetch(`/api/stocktakes/${id}/upload`, {
        method: 'POST',
      })
      const data = await res.json()
      setResult({ success: res.ok, message: data.message || (res.ok ? 'Upload successful' : 'Upload failed') })
      if (res.ok) {
        setTimeout(() => router.push(`/admin/stocktakes/${id}`), 2000)
      }
    } catch {
      setResult({ success: false, message: 'Upload failed. Please try again.' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/stocktakes/${id}`} className="text-blue-600 hover:underline text-sm">
          ← Back to Stocktake
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Upload to Datapel</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
        {result ? (
          <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {result.message}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Ready to Upload</h2>
              <p className="text-gray-600">
                This will upload the stocktake results to Datapel WMS. Make sure all items have been counted before proceeding.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> If Datapel API is not configured, this will mark the stocktake as uploaded locally.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload to Datapel'}
              </button>
              <Link
                href={`/admin/stocktakes/${id}`}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
