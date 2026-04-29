import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/SignOutButton'

export default async function StaffPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">W</span>
          </div>
          <span className="font-semibold text-gray-900">WMS Stocktake</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">{session.user?.name}</span>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.75M16.75 12l-4.75 0M12 12v1m0-1v-1" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ready to Count</h1>
          <p className="text-gray-600 mb-8">
            Scan a QR code on a product to start counting stock.
          </p>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left">
            <h2 className="font-semibold text-gray-900 mb-3">How to count stock:</h2>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2"><span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">1</span>Find a product with a QR code label</li>
              <li className="flex gap-2"><span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">2</span>Scan the QR code with your device camera</li>
              <li className="flex gap-2"><span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">3</span>Count the physical stock</li>
              <li className="flex gap-2"><span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">4</span>Enter the quantity and submit</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}
