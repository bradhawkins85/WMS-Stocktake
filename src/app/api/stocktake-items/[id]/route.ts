import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { countedQty, notes } = body

    const userId = (session.user as { id?: string })?.id

    const item = await prisma.stocktakeItem.update({
      where: { id },
      data: {
        countedQty: countedQty !== undefined ? countedQty : undefined,
        notes: notes !== undefined ? notes : undefined,
        countedById: userId || null,
        countedAt: new Date(),
      },
    })

    return NextResponse.json(item)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
