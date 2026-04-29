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
      include: { items: true },
    })

    if (!stocktake) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (!datapelService.isConfigured()) {
      await prisma.stocktake.update({
        where: { id },
        data: { status: 'UPLOADED' },
      })
      return NextResponse.json({
        message: 'Datapel not configured. Stocktake marked as uploaded locally.',
      })
    }

    const items = stocktake.items.map((item) => ({
      productCode: item.productCode,
      productName: item.productName,
      expectedQty: item.expectedQty,
      countedQty: item.countedQty ?? undefined,
      unit: item.unit,
    }))

    let datapelId = stocktake.datapelStocktakeId

    if (!datapelId) {
      const created = await datapelService.createStocktake(stocktake.datapelWarehouseId || 'DEFAULT')
      datapelId = created.id
    }

    await datapelService.uploadStocktake(datapelId, items)

    await prisma.stocktake.update({
      where: { id },
      data: { status: 'UPLOADED', datapelStocktakeId: datapelId },
    })

    return NextResponse.json({ message: 'Successfully uploaded to Datapel' })
  } catch {
    return NextResponse.json(
      { message: 'Upload failed' },
      { status: 500 }
    )
  }
}
