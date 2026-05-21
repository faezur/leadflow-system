import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  await prisma.webhookEvent.deleteMany()
  await prisma.leadAssignment.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.allocationState.deleteMany()
  await prisma.provider.deleteMany()

  await prisma.provider.createMany({
    data: [
      { id: 1, name: 'Provider 1', monthlyQuota: 10, leadsReceivedThisMonth: 0 },
      { id: 2, name: 'Provider 2', monthlyQuota: 10, leadsReceivedThisMonth: 0 },
      { id: 3, name: 'Provider 3', monthlyQuota: 10, leadsReceivedThisMonth: 0 },
      { id: 4, name: 'Provider 4', monthlyQuota: 10, leadsReceivedThisMonth: 0 },
      { id: 5, name: 'Provider 5', monthlyQuota: 10, leadsReceivedThisMonth: 0 },
      { id: 6, name: 'Provider 6', monthlyQuota: 10, leadsReceivedThisMonth: 0 },
      { id: 7, name: 'Provider 7', monthlyQuota: 10, leadsReceivedThisMonth: 0 },
      { id: 8, name: 'Provider 8', monthlyQuota: 10, leadsReceivedThisMonth: 0 },
    ],
  })

  await prisma.allocationState.createMany({
    data: [
      { serviceId: 1, roundRobinIndex: 0 },
      { serviceId: 2, roundRobinIndex: 0 },
      { serviceId: 3, roundRobinIndex: 0 },
    ],
  })

  console.log('✅ Seeding complete!')
  console.log('   - 8 Providers created')
  console.log('   - 3 AllocationState records created')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })