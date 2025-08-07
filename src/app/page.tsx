export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          color: '#1e293b',
          marginBottom: '1rem'
        }}>
          LinkStream
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#64748b',
          marginBottom: '2rem'
        }}>
          Your LinkedIn data. Secured and Analyzed.
        </p>
        <div style={{
          padding: '1rem',
          background: '#10b981',
          color: 'white',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}>
          ✅ App is working! Ready for production deployment.
        </div>
      </div>
    </div>
  )
}
