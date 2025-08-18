export default function Subscription() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1>Subscription Plans</h1>
        <div style={{ background: "white", padding: "2rem", borderRadius: "8px", marginBottom: "2rem" }}>
          <h2>Free Plan</h2>
          <p>1 analysis per month</p>
        </div>
        <div style={{ background: "white", padding: "2rem", borderRadius: "8px", marginBottom: "2rem" }}>
          <h2>Pro Plan - $19/month</h2>
          <p>Unlimited analyses + AI insights</p>
        </div>
        <div style={{ background: "white", padding: "2rem", borderRadius: "8px" }}>
          <h2>Enterprise Plan - $99/month</h2>
          <p>Everything + team features</p>
        </div>
      </div>
    </div>
  )
}
