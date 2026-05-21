import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      orderBy: { id: 'asc' },
      include: {
        assignments: {
          include: {
            lead: true,
          },
          orderBy: {
            assignedAt: 'desc',
          },
        },
      },
    })

    return NextResponse.json(providers)
  } catch (error) {
    console.error('Fetch providers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    )
  }
}