export default function Dashboard() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "1rem 2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b" }}>LinkStream Dashboard</h1>
          <a href="/" style={{ padding: "0.5rem 1rem", background: "#ef4444", color: "white", textDecoration: "none", borderRadius: "4px", fontWeight: "bold" }}>Sign Out</a>
        </div>
      </div>
      
      <div style={{ padding: "2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b", marginBottom: "1rem" }}>Upload Your LinkedIn Data</h2>
          <p style={{ color: "#64748b", marginBottom: "2rem" }}>Upload your LinkedIn data export to analyze your network and activity.</p>
          
          <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "2rem" }}>
            <div style={{ textAlign: "center", border: "2px dashed #d1d5db", borderRadius: "8px", padding: "3rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📁</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Upload LinkedIn Data</h3>
              <p style={{ color: "#64748b", marginBottom: "1rem" }}>Select your LinkedIn data export ZIP file</p>
              <button style={{ padding: "0.75rem 1.5rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Choose File</button>
            </div>
          </div>
          
          <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>How to Export Your LinkedIn Data</h3>
            <ol style={{ color: "#64748b", lineHeight: "1.6", paddingLeft: "1.5rem" }}>
              <li>Go to LinkedIn Settings & Privacy</li>
              <li>Click on Data Privacy in the left sidebar</li>
              <li>Select Get a copy of your data</li>
              <li>Choose the data types you want</li>
              <li>Click Request archive and wait for the email</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
