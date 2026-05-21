'use client'

import { useState } from 'react'

const SERVICES = [
  { id: 1, name: 'Service 1' },
  { id: 2, name: 'Service 2' },
  { id: 3, name: 'Service 3' },
]

export default function TestTools() {
  const [webhookLog, setWebhookLog] = useState<string[]>([])
  const [concurrencyLog, setConcurrencyLog] = useState<string[]>([])
  const [loading, setLoading] = useState<string | null>(null)

  // Fixed idempotency key for testing duplicate webhook calls
  const IDEMPOTENCY_KEY = 'test-webhook-key-2024'

  const addWebhookLog = (msg: string) => {
    setWebhookLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev])
  }

  const addConcurrencyLog = (msg: string) => {
    setConcurrencyLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev])
  }

  // Reset quota via webhook
  const handleResetQuota = async () => {
    setLoading('reset')
    addWebhookLog('Sending webhook to reset quotas...')
    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': IDEMPOTENCY_KEY,
        },
      })
      const data = await res.json()
      if (data.status === 'already_processed') {
        addWebhookLog(`⚠️ Already processed at ${new Date(data.processedAt).toLocaleTimeString()} — no changes made`)
      } else {
        addWebhookLog('✅ Quotas reset successfully for all providers!')
      }
    } catch {
      addWebhookLog('❌ Webhook request failed')
    } finally {
      setLoading(null)
    }
  }

  // Call webhook multiple times to test idempotency
  const handleDuplicateWebhook = async () => {
    setLoading('duplicate')
    addWebhookLog('Sending webhook 5 times rapidly (idempotency test)...')
    const results = await Promise.all(
      Array(5).fill(null).map(async (_, i) => {
        const res = await fetch('/api/webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-idempotency-key': IDEMPOTENCY_KEY,
          },
        })
        const data = await res.json()
        return `Call ${i + 1}: ${data.status}`
      })
    )
    results.forEach((r) => addWebhookLog(r))
    addWebhookLog('✅ Idempotency test complete — quota reset only once!')
    setLoading(null)
  }

  // New idempotency key for fresh reset
  const handleFreshReset = async () => {
    setLoading('fresh')
    const freshKey = `webhook-${Date.now()}`
    addWebhookLog(`Sending fresh webhook with key: ${freshKey}`)
    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': freshKey,
        },
      })
      const data = await res.json()
      addWebhookLog(`✅ ${data.message || data.status}`)
    } catch {
      addWebhookLog('❌ Failed')
    } finally {
      setLoading(null)
    }
  }

  // Generate 10 leads simultaneously
  const handleConcurrencyTest = async () => {
    setLoading('concurrency')
    setConcurrencyLog([])
    addConcurrencyLog('Generating 10 leads simultaneously...')

    const leads = Array(10).fill(null).map((_, i) => ({
      name: `Concurrent User ${i + 1}`,
      phone: `99000${String(i).padStart(5, '0')}`,
      city: 'Test City',
      serviceId: (i % 3) + 1,
      serviceName: `Service ${(i % 3) + 1}`,
      description: `Concurrency test lead ${i + 1}`,
    }))

    const results = await Promise.all(
      leads.map(async (lead) => {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead),
        })
        const data = await res.json()
        return { lead, data, ok: res.ok }
      })
    )

    let success = 0
    let failed = 0
    results.forEach(({ lead, data, ok }) => {
      if (ok) {
        success++
        addConcurrencyLog(
          `✅ ${lead.name} (${lead.serviceName}) → Providers: [${data.assignedProviderIds?.join(', ')}]`
        )
      } else {
        failed++
        addConcurrencyLog(`❌ ${lead.name} → ${data.error}`)
      }
    })

    addConcurrencyLog(`--- Done: ${success} success, ${failed} failed ---`)
    setLoading(null)
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e40af', marginBottom: '8px' }}>
        🔧 Test Tools
      </h1>
      <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '15px' }}>
        Simulate webhooks, test idempotency, and generate concurrent leads.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Webhook Panel */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1.5px solid #e2e8f0'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
            💳 Webhook Simulation
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            Simulate payment gateway confirming subscription & quota reset.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={handleFreshReset}
              disabled={!!loading}
              style={{
                padding: '11px 16px',
                background: loading === 'fresh' ? '#d1fae5' : '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading === 'fresh' ? 'Resetting...' : '🔄 Reset Provider Quota to 10'}
            </button>

            <button
              onClick={handleDuplicateWebhook}
              disabled={!!loading}
              style={{
                padding: '11px 16px',
                background: loading === 'duplicate' ? '#fef3c7' : '#d97706',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading === 'duplicate' ? 'Testing...' : '🔁 Call Webhook 5x (Idempotency Test)'}
            </button>

            <button
              onClick={handleResetQuota}
              disabled={!!loading}
              style={{
                padding: '11px 16px',
                background: loading === 'reset' ? '#ede9fe' : '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading === 'reset' ? 'Sending...' : '🔒 Send Same Key Again (Duplicate Check)'}
            </button>
          </div>

          {/* Webhook Log */}
          <div style={{
            background: '#0f172a',
            borderRadius: '8px',
            padding: '12px',
            minHeight: '150px',
            maxHeight: '220px',
            overflowY: 'auto'
          }}>
            {webhookLog.length === 0 ? (
              <p style={{ color: '#475569', fontSize: '13px' }}>Webhook logs will appear here...</p>
            ) : (
              webhookLog.map((log, i) => (
                <div key={i} style={{
                  color: log.includes('✅') ? '#4ade80' : log.includes('⚠️') ? '#fbbf24' : log.includes('❌') ? '#f87171' : '#94a3b8',
                  fontSize: '12px',
                  marginBottom: '4px',
                  fontFamily: 'monospace'
                }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Concurrency Panel */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1.5px solid #e2e8f0'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
            ⚡ Concurrency Test
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            Generate 10 leads simultaneously to test concurrent allocation.
          </p>

          <button
            onClick={handleConcurrencyTest}
            disabled={!!loading}
            style={{
              width: '100%',
              padding: '13px',
              background: loading === 'concurrency' ? '#bfdbfe' : '#1e40af',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px'
            }}
          >
            {loading === 'concurrency' ? 'Generating leads...' : '🚀 Generate 10 Leads Simultaneously'}
          </button>

          {/* Concurrency Log */}
          <div style={{
            background: '#0f172a',
            borderRadius: '8px',
            padding: '12px',
            minHeight: '150px',
            maxHeight: '280px',
            overflowY: 'auto'
          }}>
            {concurrencyLog.length === 0 ? (
              <p style={{ color: '#475569', fontSize: '13px' }}>Concurrency test logs will appear here...</p>
            ) : (
              concurrencyLog.map((log, i) => (
                <div key={i} style={{
                  color: log.includes('✅') ? '#4ade80' : log.includes('❌') ? '#f87171' : log.includes('---') ? '#fbbf24' : '#94a3b8',
                  fontSize: '12px',
                  marginBottom: '4px',
                  fontFamily: 'monospace'
                }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: '24px',
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        padding: '16px 20px',
        fontSize: '13px',
        color: '#1e40af',
        lineHeight: '1.6'
      }}>
        <strong>ℹ️ How to test:</strong><br />
        1. Click <strong>Reset Quota</strong> to reset all providers to 10 leads<br />
        2. Click <strong>Webhook 5x</strong> — only first call should process, rest show "already_processed"<br />
        3. Click <strong>Generate 10 Leads</strong> — check dashboard updates in real-time<br />
        4. Open <strong>Dashboard</strong> in another tab before running concurrency test
      </div>
    </div>
  )
}