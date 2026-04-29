import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [totalStocktakes, activeStocktakes, recentStocktakes, todayCount] = await Promise.all([
    prisma.stocktake.count(),
    prisma.stocktake.count({ where: { status: 'ACTIVE' } }),
    prisma.stocktake.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    }),
    prisma.stocktakeItem.count({
      where: {
        countedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ])

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    ACTIVE: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
    UPLOADED: 'bg-purple-100 text-purple-700',
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of stocktake operations</p>
        </div>
        <Link
          href="/admin/stocktakes/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          New Stocktake
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500">Total Stocktakes</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{totalStocktakes}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500">Active Stocktakes</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{activeStocktakes}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm font-medium text-gray-500">Items Counted Today</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{todayCount}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Recent Stocktakes</h2>
          <Link href="/admin/stocktakes" className="text-blue-600 text-sm hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentStocktakes.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No stocktakes yet.{' '}
              <Link href="/admin/stocktakes/new" className="text-blue-600 hover:underline">
                Create one
              </Link>
            </div>
          ) : (
            recentStocktakes.map((st) => {
              const counted = st.items.filter((i) => i.countedQty !== null).length
              const total = st.items.length
              const progress = total > 0 ? Math.round((counted / total) * 100) : 0
              return (
                <Link
                  key={st.id}
                  href={`/admin/stocktakes/${st.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium text-gray-900">{st.name}</div>
                    <div className="text-sm text-gray-500">
                      {counted}/{total} items counted
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500">{progress}%</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[st.status] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {st.status}
                    </span>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
