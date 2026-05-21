import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assignLead } from '@/lib/allocate'

interface LeadData {
  name: string
  phone: string
  city: string
  serviceId: number
  serviceName: string
  description: string
}

export async function POST() {
  try {
    const leads: LeadData[] = Array(10).fill(null).map((_, i) => ({
      name: `Concurrent User ${i + 1}`,
      phone: `99000${String(i).padStart(5, '0')}`,
      city: 'Test City',
      serviceId: (i % 3) + 1,
      serviceName: `Service ${(i % 3) + 1}`,
      description: `Concurrency test lead ${i + 1}`,
    }))

    const results = await Promise.all(
      leads.map(async (lead: LeadData) => {
        const created = await prisma.lead.upsert({
          where: {
            phone_serviceId: {
              phone: lead.phone,
              serviceId: lead.serviceId,
            },
          },
          create: {
            name: lead.name,
            phone: lead.phone,
            city: lead.city,
            serviceId: lead.serviceId,
            serviceName: lead.serviceName,
            description: lead.description,
          },
          update: {},
        })

        const assignedProviderIds = await assignLead(created.id, lead.serviceId)
        return { lead: created, assignedProviderIds }
      })
    )

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Generate leads error:', error)
    return NextResponse.json({ error: 'Failed to generate leads' }, { status: 500 })
  }
}