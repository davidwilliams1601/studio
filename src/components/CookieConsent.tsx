"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const CONSENT_KEY = 'linkstream_cookie_consent';

interface CookieConsentProps {
  onConsent: (accepted: boolean) => void;
}

export default function CookieConsent({ onConsent }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(CONSENT_KEY);

    if (consent === null) {
      // No consent recorded, show banner after a brief delay
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Consent already recorded, notify parent
      onConsent(consent === 'accepted');
    }
  }, [onConsent]);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setShowBanner(false);
    onConsent(true);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setShowBanner(false);
    onConsent(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm text-gray-700">
          <p className="font-medium mb-1">We use cookies to improve your experience</p>
          <p className="text-gray-600">
            We use analytics cookies to understand how you use our site and improve your experience.
            By clicking "Accept", you consent to our use of cookies.{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Learn more
            </a>
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button
            onClick={handleDecline}
            variant="outline"
            className="min-w-[100px]"
          >
            Decline
          </Button>
          <Button
            onClick={handleAccept}
            className="min-w-[100px] bg-blue-600 hover:bg-blue-700"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
