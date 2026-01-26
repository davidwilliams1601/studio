// Google Analytics 4 Event Tracking Utilities

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

// Initialize GA4
export const initGA = (measurementId: string) => {
  if (typeof window === 'undefined' || !measurementId) return;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };

  (window.gtag as any)('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false, // We'll manually send page views via router
  });
};

// Check if GA is loaded
export const isGALoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Page view tracking
export const trackPageView = (url: string, title?: string) => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'page_view', {
    page_path: url,
    page_title: title || document.title,
  });
};

// User signup event
export const trackSignup = (method: 'email' | 'google') => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'sign_up', {
    method,
  });
};

// User login event
export const trackLogin = (method: 'email' | 'google') => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'login', {
    method,
  });
};

// Begin checkout (when user views pricing or clicks upgrade)
export const trackBeginCheckout = (tier: string, value: number) => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'begin_checkout', {
    currency: 'GBP',
    value,
    items: [
      {
        item_id: `subscription_${tier.toLowerCase()}`,
        item_name: `${tier} Plan`,
        item_category: 'Subscription',
        price: value,
        quantity: 1,
      },
    ],
  });
};

// Purchase event (successful subscription)
export const trackPurchase = (
  transactionId: string,
  tier: string,
  value: number,
  isUpgrade: boolean = false
) => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'purchase', {
    transaction_id: transactionId,
    currency: 'GBP',
    value,
    items: [
      {
        item_id: `subscription_${tier.toLowerCase()}`,
        item_name: `${tier} Plan`,
        item_category: 'Subscription',
        price: value,
        quantity: 1,
      },
    ],
    // Custom parameter
    is_upgrade: isUpgrade,
  });
};

// Subscription cancellation
export const trackCancelSubscription = (tier: string, reason?: string) => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'cancel_subscription', {
    subscription_tier: tier,
    cancellation_reason: reason || 'not_specified',
  });
};

// Feature usage events
export const trackBackupUpload = (fileType: string, connectionCount?: number) => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'backup_upload', {
    file_type: fileType,
    connection_count: connectionCount,
  });
};

export const trackAIInsightsGenerated = (tier: string) => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'ai_insights_generated', {
    subscription_tier: tier,
  });
};

export const trackExport = (exportType: 'pdf' | 'csv', tier: string) => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'export_report', {
    export_type: exportType,
    subscription_tier: tier,
  });
};

// Feature view tracking
export const trackFeatureView = (featureName: string, tier: string) => {
  if (!isGALoaded()) return;

  window.gtag?.('event', 'feature_viewed', {
    feature_name: featureName,
    subscription_tier: tier,
  });
};

// Set user properties (call after login)
export const setUserProperties = (userId: string, tier: string) => {
  if (!isGALoaded()) return;

  window.gtag?.('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
    user_id: userId,
    user_properties: {
      subscription_tier: tier,
    },
  });
};

// Generic custom event tracking
export const trackCustomEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  if (!isGALoaded()) return;

  window.gtag?.('event', eventName, params);
};
