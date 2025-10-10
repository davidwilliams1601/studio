export const dynamic = "force-dynamic";

export default function Loading() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center" 
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔄</div>
        <h3>Loading...</h3>
      </div>
    </div>
  );
}
