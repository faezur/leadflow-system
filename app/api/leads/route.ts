import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assignLead } from '@/lib/allocate'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, city, serviceId, serviceName, description } = body

    if (!name || !phone || !city || !serviceId || !serviceName || !description) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Duplicate check — same phone + same service
    const existing = await prisma.lead.findUnique({
      where: {
        phone_serviceId: {
          phone: phone.trim(),
          serviceId: Number(serviceId),
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'You have already submitted a request for this service with this phone number.' },
        { status: 409 }
      )
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        serviceId: Number(serviceId),
        serviceName,
        description: description.trim(),
      },
    })

    // Assign providers
    const assignedProviderIds = await assignLead(lead.id, Number(serviceId))

    return NextResponse.json({
      success: true,
      lead,
      assignedProviderIds,
    })
  } catch (error) {
    console.error('Lead creation error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        assignments: {
          include: { provider: true },
        },
      },
    })
    return NextResponse.json(leads)
  } catch (error) {
    console.error('Fetch leads error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}