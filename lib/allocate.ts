import { prisma } from '@/lib/prisma'
import { notifyClients } from '@/lib/sse'

const MANDATORY: Record<number, number[]> = {
  1: [1],
  2: [5],
  3: [1, 4],
}

const POOL: Record<number, number[]> = {
  1: [2, 3, 4],
  2: [6, 7, 8],
  3: [2, 3, 5, 6, 7, 8],
}

export async function assignLead(leadId: number, serviceId: number) {
  const mandatory = MANDATORY[serviceId] || []
  const pool = POOL[serviceId] || []
  const totalNeeded = 3
  const remainingNeeded = totalNeeded - mandatory.length

  // Step 1: Check mandatory providers
  const mandatoryProviders = await prisma.provider.findMany({
    where: {
      id: { in: mandatory },
      leadsReceivedThisMonth: { lt: 10 },
    },
  })
  const availableMandatory = mandatoryProviders.map((p) => p.id)

  // Step 2: Get round-robin state
  let state = await prisma.allocationState.findUnique({
    where: { serviceId },
  })

  if (!state) {
    state = await prisma.allocationState.create({
      data: { serviceId, roundRobinIndex: 0 },
    })
  }

  let currentIndex = state.roundRobinIndex

  // Step 3: Get eligible pool providers
  const eligiblePool = await prisma.provider.findMany({
    where: {
      id: { in: pool },
      leadsReceivedThisMonth: { lt: 10 },
    },
    orderBy: { id: 'asc' },
  })

  console.log('Available mandatory:', availableMandatory)
  console.log('Eligible pool:', eligiblePool.map(p => p.id))
  console.log('Current index:', currentIndex)

  // Step 4: Round-robin pick
  const picked: number[] = []
  const poolLength = eligiblePool.length

  if (poolLength > 0) {
    for (let i = 0; i < poolLength && picked.length < remainingNeeded; i++) {
      const index = (currentIndex + i) % poolLength
      const provider = eligiblePool[index]
      if (!availableMandatory.includes(provider.id)) {
        picked.push(provider.id)
      }
    }
    currentIndex = (currentIndex + remainingNeeded) % poolLength
  }

  // Step 5: Update round-robin pointer
  await prisma.allocationState.update({
    where: { serviceId },
    data: { roundRobinIndex: currentIndex },
  })

  // Step 6: Combine all providers
  const allProviderIds = [...availableMandatory, ...picked]

  console.log('Final assigned providers:', allProviderIds)

  if (allProviderIds.length === 0) {
    console.warn(`⚠️ No providers available for lead ${leadId}`)
    return []
  }

  // Step 7: Create assignments one by one
  for (const pid of allProviderIds) {
    await prisma.leadAssignment.upsert({
      where: {
        leadId_providerId: {
          leadId,
          providerId: pid,
        },
      },
      create: {
        leadId,
        providerId: pid,
      },
      update: {},
    })

    await prisma.provider.update({
      where: { id: pid },
      data: {
        leadsReceivedThisMonth: { increment: 1 },
      },
    })
  }

  // Step 8: Notify SSE
  notifyClients({ type: 'new_lead', leadId, assignedProviderIds: allProviderIds })

  return allProviderIds
}