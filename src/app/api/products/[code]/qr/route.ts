import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const scanUrl = `${baseUrl}/scan/${code}`
    
    const qrDataUrl = await QRCode.toDataURL(scanUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#1e40af',
        light: '#ffffff',
      },
    })

    await prisma.product.update({
      where: { code },
      data: { qrCode: qrDataUrl },
    })

    return NextResponse.json({ qrCode: qrDataUrl })
  } catch {
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 })
  }
}
