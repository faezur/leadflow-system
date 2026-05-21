export default function Home() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '80px auto',
      padding: '0 24px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '42px', fontWeight: 800, color: '#1e40af', marginBottom: '16px' }}>
        LeadFlow System
      </h1>
      <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '48px' }}>
        Automated lead distribution platform for service providers
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <a href="/request-service" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px 24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '2px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📝</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              Request Service
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Submit a new service enquiry
            </p>
          </div>
        </a>

        <a href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px 24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '2px solid #e2e8f0',
            cursor: 'pointer'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              Provider Dashboard
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              View real-time lead assignments
            </p>
          </div>
        </a>

        <a href="/test-tools" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px 24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '2px solid #e2e8f0',
            cursor: 'pointer'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔧</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              Test Tools
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Webhook & concurrency testing
            </p>
          </div>
        </a>
      </div>
    </div>
  )
}