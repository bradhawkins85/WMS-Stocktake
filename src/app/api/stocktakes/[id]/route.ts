import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

    if (!stocktake) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(stocktake)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const stocktake = await prisma.stocktake.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.status && { status: body.status }),
        ...(body.datapelWarehouseId !== undefined && { datapelWarehouseId: body.datapelWarehouseId }),
      },
    })

    return NextResponse.json(stocktake)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
