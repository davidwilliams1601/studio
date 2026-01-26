"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import CookieConsent from '@/components/CookieConsent';
import { initGA, trackPageView } from '@/lib/analytics';

interface AnalyticsContextType {
  isAnalyticsEnabled: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  isAnalyticsEnabled: false,
});

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [isAnalyticsEnabled, setIsAnalyticsEnabled] = useState(false);
  const [consentHandled, setConsentHandled] = useState(false);
  const pathname = usePathname();

  const handleConsent = (accepted: boolean) => {
    setIsAnalyticsEnabled(accepted);
    setConsentHandled(true);

    if (accepted) {
      // Initialize GA4 if accepted
      const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
      if (measurementId) {
        initGA(measurementId);
        // Track initial page view
        trackPageView(pathname);
      }
    }
  };

  // Track page views on navigation
  useEffect(() => {
    if (isAnalyticsEnabled && consentHandled) {
      trackPageView(pathname);
    }
  }, [pathname, isAnalyticsEnabled, consentHandled]);

  return (
    <AnalyticsContext.Provider value={{ isAnalyticsEnabled }}>
      <CookieConsent onConsent={handleConsent} />
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  return useContext(AnalyticsContext);
}
