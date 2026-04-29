import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const product = await prisma.product.findUnique({
      where: { code },
    })

    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
