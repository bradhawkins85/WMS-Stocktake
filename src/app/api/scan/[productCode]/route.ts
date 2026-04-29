import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productCode: string }> }
) {
  try {
    const { productCode: rawCode } = await params
    const productCode = decodeURIComponent(rawCode)
    
    const activeItem = await prisma.stocktakeItem.findFirst({
      where: {
        productCode,
        stocktake: { status: 'ACTIVE' },
      },
      include: { stocktake: true },
      orderBy: { stocktake: { createdAt: 'desc' } },
    })

    if (!activeItem) {
      return NextResponse.json({ error: 'Product not found in active stocktake' }, { status: 404 })
    }

    return NextResponse.json(activeItem)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
