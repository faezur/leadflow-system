import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyClients } from '@/lib/sse'

export async function POST(req: NextRequest) {
  try {
    const idempotencyKey = req.headers.get('x-idempotency-key')

    if (!idempotencyKey) {
      return NextResponse.json(
        { error: 'Missing x-idempotency-key header' },
        { status: 400 }
      )
    }

    // Already processed check
    const existing = await prisma.webhookEvent.findUnique({
      where: { id: idempotencyKey },
    })

    if (existing) {
      return NextResponse.json({
        status: 'already_processed',
        processedAt: existing.processedAt,
        message: 'Webhook already processed. No changes made.',
      })
    }

    // Atomically record + reset quotas
    await prisma.$transaction([
      prisma.webhookEvent.create({
        data: {
          id: idempotencyKey,
          action: 'quota_reset',
        },
      }),
      prisma.provider.updateMany({
        data: {
          leadsReceivedThisMonth: 0,
          monthlyQuota: 10,
        },
      }),
    ])

    // Notify dashboard
    notifyClients({ type: 'quota_reset' })

    return NextResponse.json({
      status: 'processed',
      message: 'Provider quotas reset successfully.',
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}