import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash,
      role: 'ADMIN',
    },
  })

  const staffHash = await bcrypt.hash('staff123', 12)
  
  const staff = await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      email: 'staff@example.com',
      name: 'Staff User',
      passwordHash: staffHash,
      role: 'STAFF',
    },
  })

  const products = [
    { code: 'PROD001', name: 'Widget Type A', unit: 'EA' },
    { code: 'PROD002', name: 'Widget Type B', unit: 'EA' },
    { code: 'PROD003', name: 'Bolt M8x20', unit: 'PKT' },
    { code: 'PROD004', name: 'Safety Gloves Medium', unit: 'PKT' },
    { code: 'PROD005', name: 'Industrial Lubricant', unit: 'L' },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { code: product.code },
      update: {},
      create: product,
    })
  }

  const stocktake = await prisma.stocktake.upsert({
    where: { id: 'sample-stocktake-1' },
    update: {},
    create: {
      id: 'sample-stocktake-1',
      name: 'Sample Stocktake - Demo',
      status: 'ACTIVE',
      datapelWarehouseId: 'WH001',
      items: {
        create: [
          { productCode: 'PROD001', productName: 'Widget Type A', expectedQty: 100, unit: 'EA' },
          { productCode: 'PROD002', productName: 'Widget Type B', expectedQty: 50, unit: 'EA' },
          { productCode: 'PROD003', productName: 'Bolt M8x20', expectedQty: 200, unit: 'PKT' },
          { productCode: 'PROD004', productName: 'Safety Gloves Medium', expectedQty: 25, unit: 'PKT' },
          { productCode: 'PROD005', productName: 'Industrial Lubricant', expectedQty: 10, unit: 'L' },
        ],
      },
    },
  })

  console.log('Seed data created:', { admin: admin.email, staff: staff.email, stocktake: stocktake.name })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
