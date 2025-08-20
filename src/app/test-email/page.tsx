"use client";

import { useState } from 'react';

export default function TestEmail() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testEmail = async () => {
    if (!email) {
      setResult('Please enter an email address');
      return;
    }

    setLoading(true);
    setResult('Testing...');

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      setResult(`Response Status: ${response.status}\n\n` + JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const testWelcomeEmail = async () => {
    if (!email) {
      setResult('Please enter an email address');
      return;
    }

    setLoading(true);
    setResult('Testing welcome email...');

    try {
      const response = await fetch('/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          name: email.split('@')[0] || 'Test User'
        })
      });

      const data = await response.json();
      setResult(`Welcome Email Response Status: ${response.status}\n\n` + JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#1e293b', marginBottom: '2rem' }}>🧪 LinkStream Email Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <input
          type="email"
          placeholder="your-email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ 
            padding: '0.75rem', 
            width: '300px', 
            marginRight: '1rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '16px'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={testEmail}
          disabled={loading}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: '#3b82f6', 
            color: 'white', 
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Testing...' : '🧪 Test Email API'}
        </button>

        <button 
          onClick={testWelcomeEmail}
          disabled={loading}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: '#10b981', 
            color: 'white', 
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Testing...' : '📧 Test Welcome Email'}
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>📋 Debug Information:</h3>
        <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '6px', fontSize: '14px' }}>
          <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
          <p><strong>Test API endpoint:</strong> /api/email/test</p>
          <p><strong>Welcome API endpoint:</strong> /api/email/welcome</p>
        </div>
      </div>

      <div>
        <h3>📊 Results:</h3>
        <pre style={{ 
          background: '#f8fafc', 
          padding: '1rem', 
          borderRadius: '6px',
          whiteSpace: 'pre-wrap',
          border: '1px solid #e5e7eb',
          fontSize: '14px',
          minHeight: '200px'
        }}>
          {result || 'No results yet. Click a test button above.'}
        </pre>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fef3c7', borderRadius: '6px', border: '1px solid #f59e0b' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>💡 How to Use:</h4>
        <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#92400e' }}>
          <li>Enter your email address above</li>
          <li>Click "🧪 Test Email API" to test the basic email functionality</li>
          <li>Click "📧 Test Welcome Email" to test the welcome email template</li>
          <li>Check the results below and your email inbox</li>
        </ol>
      </div>
    </div>
  );
}
