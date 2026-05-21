import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assignLead } from '@/lib/allocate'

export async function POST() {
  try {
    const promises = []

    for (let i = 0; i < 10; i++) {
      promises.push(
        prisma.lead.create({
          data: {
            name: `Test User ${i}`,
            phone: `99999${i}${Date.now()}`,
            city: 'Test City',
            serviceId: 1,
            serviceName: 'Service 1',
            description: 'Bulk test',
          },
        })
      )
    }

    const leads = await Promise.all(promises)

    // Assign leads
    await Promise.all(
      leads.map((lead) => assignLead(lead.id, lead.serviceId))
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}