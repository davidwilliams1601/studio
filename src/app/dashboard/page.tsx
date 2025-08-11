export default function Dashboard() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1e293b", marginBottom: "2rem" }}>LinkStream Dashboard</h1>
        
        <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Upload LinkedIn Data</h2>
          <p style={{ color: "#64748b", marginBottom: "2rem" }}>Upload your LinkedIn data export ZIP file to begin analysis.</p>
          
          <div style={{ textAlign: "center", border: "2px dashed #d1d5db", borderRadius: "8px", padding: "2rem" }}>
            <p style={{ fontSize: "2rem", marginBottom: "1rem" }}>📁</p>
            <p style={{ marginBottom: "1rem" }}>Drag and drop your file here</p>
            <button style={{ padding: "0.75rem 1.5rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px" }}>Choose File</button>
          </div>
        </div>
        
        <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>How to Export LinkedIn Data</h3>
          <p style={{ color: "#64748b" }}>Go to LinkedIn → Settings → Data Privacy → Get a copy of your data</p>
        </div>
      </div>
    </div>
  )
}
