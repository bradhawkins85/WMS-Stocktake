'use client'

import { useState } from 'react'

interface Product {
  id: string
  code: string
  name: string
  unit: string
  qrCode: string | null
}

export function ProductCard({ product }: { product: Product }) {
  const [qrData, setQrData] = useState<string | null>(product.qrCode)
  const [generating, setGenerating] = useState(false)

  const generateQR = async () => {
    setGenerating(true)
    try {
      const res = await fetch(`/api/products/${product.code}/qr`, {
        method: 'POST',
      })
      const data = await res.json()
      setQrData(data.qrCode)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-mono text-sm font-semibold text-gray-700">{product.code}</div>
          <div className="text-gray-900 font-medium mt-0.5">{product.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">Unit: {product.unit}</div>
        </div>
        {qrData && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrData} alt={`QR Code for ${product.code}`} className="w-16 h-16" />
        )}
      </div>
      <div className="flex gap-2">
        {!qrData ? (
          <button
            onClick={generateQR}
            disabled={generating}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate QR Code'}
          </button>
        ) : (
          <>
            <a
              href={qrData}
              download={`qr-${product.code}.png`}
              className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded font-medium hover:bg-gray-200"
            >
              Download QR
            </a>
            <a
              href={`/scan/${product.code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 px-3 py-1.5 rounded font-medium hover:bg-blue-50"
            >
              View Scan Page
            </a>
          </>
        )}
      </div>
    </div>
  )
}
