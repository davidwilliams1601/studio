export const dynamic = "force-dynamic";

export default function Loading() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f9fafb"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: "2rem",
          marginBottom: "1rem",
          animation: "pulse 1.5s ease-in-out infinite"
        }}>
          ⚙️
        </div>
        <p style={{ color: "#6b7280" }}>Loading...</p>
      </div>
    </div>
  );
}
