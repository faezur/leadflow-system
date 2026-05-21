import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LeadFlow System',
  description: 'Mini Lead Distribution System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav style={{
          background: '#1e40af',
          padding: '14px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '20px' }}>
            🚀 LeadFlow System
          </span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="/" style={{ color: '#bfdbfe', textDecoration: 'none', fontSize: '14px' }}>Home</a>
            <a href="/request-service" style={{ color: '#bfdbfe', textDecoration: 'none', fontSize: '14px' }}>Request Service</a>
            <a href="/dashboard" style={{ color: '#bfdbfe', textDecoration: 'none', fontSize: '14px' }}>Dashboard</a>
            <a href="/test-tools" style={{ color: '#bfdbfe', textDecoration: 'none', fontSize: '14px' }}>Test Tools</a>
          </div>
        </nav>
        <main style={{ minHeight: 'calc(100vh - 56px)' }}>
          {children}
        </main>
      </body>
    </html>
  )
}