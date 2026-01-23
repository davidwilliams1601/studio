'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Mail, Loader2 } from 'lucide-react';

interface PageProps {
  params: {
    token: string;
  };
}

export default function UnsubscribePage({ params }: PageProps) {
  const [loading, setLoading] = useState(true);
  const [unsubscribing, setUnsubscribing] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [alreadyUnsubscribed, setAlreadyUnsubscribed] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    validateToken();
  }, []);

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/email/unsubscribe?token=${params.token}`);
      const data = await response.json();

      if (data.valid) {
        setTokenValid(true);
        setEmail(data.email);
        setAlreadyUnsubscribed(data.alreadyUnsubscribed);
        if (data.alreadyUnsubscribed) {
          setUnsubscribed(true);
        }
      } else {
        setError(data.reason || 'Invalid or expired link');
      }
    } catch (err: any) {
      setError('Failed to validate unsubscribe link');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setUnsubscribing(true);
    setError(null);

    try {
      const response = await fetch('/api/email/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: params.token }),
      });

      const data = await response.json();

      if (response.ok) {
        setUnsubscribed(true);
      } else {
        setError(data.error || 'Failed to unsubscribe');
      }
    } catch (err: any) {
      setError('Failed to unsubscribe. Please try again.');
    } finally {
      setUnsubscribing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
        <Card style={{ width: '100%', maxWidth: '500px', margin: '20px' }}>
          <CardContent style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Validating unsubscribe link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: '20px' }}>
      <Card style={{ width: '100%', maxWidth: '500px' }}>
        <CardHeader style={{ textAlign: 'center', paddingTop: '40px' }}>
          {unsubscribed ? (
            <div style={{ marginBottom: '20px' }}>
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <CardTitle style={{ fontSize: '24px', marginBottom: '8px' }}>
                Successfully Unsubscribed
              </CardTitle>
            </div>
          ) : error ? (
            <div style={{ marginBottom: '20px' }}>
              <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <CardTitle style={{ fontSize: '24px', marginBottom: '8px' }}>
                Unable to Unsubscribe
              </CardTitle>
            </div>
          ) : (
            <div style={{ marginBottom: '20px' }}>
              <Mail className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <CardTitle style={{ fontSize: '24px', marginBottom: '8px' }}>
                Unsubscribe from Marketing Emails
              </CardTitle>
            </div>
          )}
        </CardHeader>
        <CardContent style={{ paddingBottom: '40px' }}>
          {unsubscribed ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
                <strong>{email}</strong> has been unsubscribed from LinkStream marketing emails.
              </p>
              <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                <p style={{ color: '#1e40af', fontSize: '14px', margin: 0 }}>
                  <strong>Note:</strong> You'll still receive important account notifications and service updates.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <Link href="/login">
                  <Button variant="outline" fullWidth>
                    Go to Login
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost" fullWidth>
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                {error}
              </p>
              <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                <p style={{ color: '#991b1b', fontSize: '14px', margin: 0 }}>
                  This unsubscribe link may have expired or already been used. You can manage your email preferences from your account settings.
                </p>
              </div>
              <Link href="/login">
                <Button variant="outline" fullWidth>
                  Go to Login
                </Button>
              </Link>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#6b7280', marginBottom: '8px' }}>
                You're about to unsubscribe:
              </p>
              <p style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>
                {email}
              </p>
              <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'left' }}>
                <p style={{ color: '#92400e', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
                  <strong>What you'll stop receiving:</strong>
                  <br />• Product updates and new features
                  <br />• Tips and best practices
                  <br />• Special offers and promotions
                  <br /><br />
                  <strong>What you'll still receive:</strong>
                  <br />• Account security alerts
                  <br />• Backup reminders
                  <br />• Billing notifications
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <Button
                  onClick={handleUnsubscribe}
                  disabled={unsubscribing}
                  fullWidth
                  variant="destructive"
                >
                  {unsubscribing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Unsubscribing...
                    </>
                  ) : (
                    'Unsubscribe from Marketing Emails'
                  )}
                </Button>
                <Link href="/">
                  <Button variant="ghost" fullWidth>
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
