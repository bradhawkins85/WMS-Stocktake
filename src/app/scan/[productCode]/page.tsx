import { prisma } from '@/lib/prisma'
import { ScanForm } from '@/components/ScanForm'

export default async function ScanPage({
  params,
}: {
  params: Promise<{ productCode: string }>
}) {
  const { productCode: rawCode } = await params
  const productCode = decodeURIComponent(rawCode)
  
  const activeItem = await prisma.stocktakeItem.findFirst({
    where: {
      productCode,
      stocktake: { status: 'ACTIVE' },
    },
    include: {
      stocktake: true,
    },
    orderBy: {
      stocktake: { createdAt: 'desc' },
    },
  })

  const product = await prisma.product.findUnique({
    where: { code: productCode },
  })

  if (!activeItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Product Not in Active Stocktake</h1>
          <p className="text-gray-600 text-sm mb-2">
            Product code: <span className="font-mono font-semibold">{productCode}</span>
          </p>
          {product && (
            <p className="text-gray-700 font-medium mb-4">{product.name}</p>
          )}
          <p className="text-gray-500 text-sm">
            This product is not part of any active stocktake. Please contact your supervisor.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <div className="text-blue-100 text-sm font-medium">{activeItem.stocktake.name}</div>
            <h1 className="text-white text-2xl font-bold mt-1">{activeItem.productName}</h1>
            <div className="text-blue-200 font-mono text-sm mt-1">{activeItem.productCode}</div>
          </div>
          
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex justify-between">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Expected Qty</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {activeItem.expectedQty}
                  <span className="text-lg text-gray-500 ml-1">{activeItem.unit}</span>
                </div>
              </div>
              {activeItem.countedQty !== null && (
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Previously Counted</div>
                  <div className="text-2xl font-bold text-gray-600 mt-1">
                    {activeItem.countedQty}
                    <span className="text-base text-gray-400 ml-1">{activeItem.unit}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <ScanForm itemId={activeItem.id} unit={activeItem.unit} />
        </div>
      </div>
    </div>
  )
}
