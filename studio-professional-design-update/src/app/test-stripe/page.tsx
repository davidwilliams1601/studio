"use client";

export default function TestStripe() {
  const testStripe = async () => {
    try {
      console.log('Testing Stripe API...');
      
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: 'price_1RrErpIpQXRH010BG7mAhEqD' }),
      });

      const data = await response.json();
      console.log('Stripe response:', data);
      
      if (data.success) {
        alert('✅ Stripe API working! Checkout URL: ' + data.url);
      } else {
        alert('❌ Stripe API error: ' + data.error);
      }
    } catch (error) {
      console.error('Test error:', error);
      alert('❌ Request failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Stripe Integration Test</h1>
      <button 
        onClick={testStripe}
        style={{ 
          padding: '1rem 2rem', 
          background: '#3b82f6', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px', 
          cursor: 'pointer' 
        }}
      >
        🧪 Test Stripe API
      </button>
      <p>Click the button and check the console (F12) for results.</p>
    </div>
  );
}
