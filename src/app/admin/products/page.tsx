import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/ProductCard'
import { AddProductForm } from '@/components/AddProductForm'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { code: 'asc' },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-500 text-sm mt-1">Manage products and QR codes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AddProductForm />
        </div>
        <div className="lg:col-span-2">
          {products.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              No products yet. Add your first product.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
