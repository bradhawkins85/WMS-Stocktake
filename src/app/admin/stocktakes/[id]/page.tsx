import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { StocktakeActions } from '@/components/StocktakeActions'
import { StocktakeItemRow } from '@/components/StocktakeItemRow'

export default async function StocktakeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const stocktake = await prisma.stocktake.findUnique({
    where: { id },
    include: {
      items: {
        include: { countedBy: true },
        orderBy: { productCode: 'asc' },
      },
    },
  })

  if (!stocktake) notFound()

  const counted = stocktake.items.filter((i) => i.countedQty !== null).length
  const total = stocktake.items.length
  const progress = total > 0 ? Math.round((counted / total) * 100) : 0

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    ACTIVE: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
    UPLOADED: 'bg-purple-100 text-purple-700',
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/stocktakes" className="text-blue-600 hover:underline text-sm">
          ← Back to Stocktakes
        </Link>
        <div className="flex justify-between items-start mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{stocktake.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[stocktake.status] || ''}`}>
                {stocktake.status}
              </span>
              {stocktake.datapelWarehouseId && (
                <span className="text-sm text-gray-500">Warehouse: {stocktake.datapelWarehouseId}</span>
              )}
            </div>
          </div>
          <StocktakeActions stocktake={stocktake} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Total Items</div>
          <div className="text-2xl font-bold text-gray-900">{total}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Counted</div>
          <div className="text-2xl font-bold text-green-600">{counted}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Remaining</div>
          <div className="text-2xl font-bold text-orange-500">{total - counted}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Progress</div>
          <div className="text-2xl font-bold text-blue-600">{progress}%</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-500">{counted} of {total} items</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Stock Items</h2>
        </div>
        {stocktake.items.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No items in this stocktake. Add items manually or pull from Datapel.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Counted</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Counted By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {stocktake.items.map((item) => (
                  <StocktakeItemRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
