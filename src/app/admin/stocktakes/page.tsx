import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function StocktakesPage() {
  const stocktakes = await prisma.stocktake.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
    },
  })

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    ACTIVE: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
    UPLOADED: 'bg-purple-100 text-purple-700',
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stocktakes</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all stocktake operations</p>
        </div>
        <Link
          href="/admin/stocktakes/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          New Stocktake
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {stocktakes.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <p className="text-lg font-medium text-gray-900 mb-2">No stocktakes found</p>
            <p className="mb-4">Create your first stocktake to get started.</p>
            <Link
              href="/admin/stocktakes/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Create Stocktake
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {stocktakes.map((st) => {
                const counted = st.items.filter((i) => i.countedQty !== null).length
                const total = st.items.length
                const progress = total > 0 ? Math.round((counted / total) * 100) : 0
                return (
                  <tr key={st.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{st.name}</div>
                      {st.datapelWarehouseId && (
                        <div className="text-xs text-gray-500">Warehouse: {st.datapelWarehouseId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[st.status] || ''}`}>
                        {st.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-sm text-gray-600">{counted}/{total}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(st.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/stocktakes/${st.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
