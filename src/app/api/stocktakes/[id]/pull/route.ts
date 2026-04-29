import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { datapelService } from '@/lib/datapel'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const stocktake = await prisma.stocktake.findUnique({
      where: { id },
    })

    if (!stocktake) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (!datapelService.isConfigured()) {
      return NextResponse.json(
        { message: 'Datapel API not configured. Add items manually.' },
        { status: 503 }
      )
    }

    const stockLevels = await datapelService.getStockLevels(stocktake.datapelWarehouseId || undefined)

    await prisma.stocktakeItem.createMany({
      data: stockLevels.map((sl) => ({
        stocktakeId: id,
        productCode: sl.productCode,
        productName: sl.productName,
        expectedQty: sl.quantity,
        unit: sl.unit,
      })),
    })

    return NextResponse.json({ message: 'Items pulled from Datapel successfully' })
  } catch {
    return NextResponse.json(
      { message: 'Failed to pull from Datapel' },
      { status: 503 }
    )
  }
}
