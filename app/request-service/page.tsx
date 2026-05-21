'use client'

import { useState } from 'react'

const SERVICES = [
  { id: 1, name: 'Service 1' },
  { id: 2, name: 'Service 2' },
  { id: 3, name: 'Service 3' },
]

export default function RequestService() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    serviceId: '',
    serviceName: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    if (name === 'serviceId') {
      const selected = SERVICES.find((s) => s.id === Number(value))
      setForm((prev) => ({
        ...prev,
        serviceId: value,
        serviceName: selected?.name || '',
      }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          serviceId: Number(form.serviceId),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
      } else {
        setSuccess(true)
        setForm({
          name: '',
          phone: '',
          city: '',
          serviceId: '',
          serviceName: '',
          description: '',
        })
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '560px', margin: '48px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e40af', marginBottom: '8px' }}>
        Request a Service
      </h1>
      <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '15px' }}>
        Fill in your details and we'll connect you with the right providers.
      </p>

      {success && (
        <div style={{
          background: '#dcfce7',
          border: '1px solid #86efac',
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '24px',
          color: '#166534',
          fontWeight: 600,
          fontSize: '15px'
        }}>
          ✅ Your request has been submitted! Providers will contact you soon.
        </div>
      )}

      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '24px',
          color: '#991b1b',
          fontWeight: 500,
          fontSize: '15px'
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px', color: '#374151' }}>
            Full Name *
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1.5px solid #d1d5db',
              fontSize: '15px',
              outline: 'none',
              color: '#1e293b'
            }}
          />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px', color: '#374151' }}>
            Phone Number *
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="Enter your phone number"
            maxLength={15}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1.5px solid #d1d5db',
              fontSize: '15px',
              outline: 'none',
              color: '#1e293b'
            }}
          />
        </div>

        {/* City */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px', color: '#374151' }}>
            City *
          </label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            required
            placeholder="Enter your city"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1.5px solid #d1d5db',
              fontSize: '15px',
              outline: 'none',
              color: '#1e293b'
            }}
          />
        </div>

        {/* Service */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px', color: '#374151' }}>
            Service Type *
          </label>
          <select
            name="serviceId"
            value={form.serviceId}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1.5px solid #d1d5db',
              fontSize: '15px',
              outline: 'none',
              color: '#1e293b',
              background: 'white'
            }}
          >
            <option value="">-- Select a service --</option>
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px', color: '#374151' }}>
            Description *
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            placeholder="Describe your service requirement..."
            rows={4}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1.5px solid #d1d5db',
              fontSize: '15px',
              outline: 'none',
              color: '#1e293b',
              resize: 'vertical'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '13px',
            background: loading ? '#93c5fd' : '#1e40af',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  )
}