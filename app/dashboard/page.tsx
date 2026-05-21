'use client'

import { useEffect, useState } from 'react'

interface Lead {
  id: number
  name: string
  phone: string
  city: string
  serviceName: string
  description: string
  createdAt: string
}

interface Assignment {
  id: number
  assignedAt: string
  lead: Lead
}

interface Provider {
  id: number
  name: string
  monthlyQuota: number
  leadsReceivedThisMonth: number
  assignments: Assignment[]
}

export default function Dashboard() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/providers')
      const data = await res.json()
      setProviders(data)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) {
      console.error('Failed to fetch providers:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProviders()

    // 🔥 POLLING (every 3 sec)
    const interval = setInterval(fetchProviders, 3000)

    return () => clearInterval(interval)
  }, [])

  const [selectedProvider, setSelectedProvider] = useState<number | null>(null)
  const selectedProviderData = providers.find((p) => p.id === selectedProvider)

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        Loading dashboard...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>
            Provider Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Live updates (Polling)
          </p>
        </div>

        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          Updated: {lastUpdated}
        </div>
      </div>

      {/* Provider Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px'
      }}>
        {providers.map((provider) => {
          const used = provider.leadsReceivedThisMonth
          const quota = provider.monthlyQuota
          const remaining = quota - used
          const percent = (used / quota) * 100

          return (
            <div
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              style={{
                background: 'white',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #ddd',
                cursor: 'pointer'
              }}
            >
              <h3>{provider.name}</h3>

              <div style={{
                background: '#eee',
                height: '8px',
                borderRadius: '4px',
                margin: '10px 0'
              }}>
                <div style={{
                  width: `${percent}%`,
                  height: '8px',
                  background: percent >= 100 ? 'red' : 'green',
                  borderRadius: '4px'
                }} />
              </div>

              <p>Leads: {used}</p>
              <p>Quota: {quota}</p>
            </div>
          )
        })}
      </div>

      {/* Provider Details */}
      {selectedProviderData && (
        <div style={{ marginTop: '40px' }}>
          <h2>{selectedProviderData.name} Leads</h2>

          {selectedProviderData.assignments.length === 0 ? (
            <p>No leads</p>
          ) : (
            <ul>
              {selectedProviderData.assignments.map((a) => (
                <li key={a.id}>
                  {a.lead.name} ({a.lead.phone})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}