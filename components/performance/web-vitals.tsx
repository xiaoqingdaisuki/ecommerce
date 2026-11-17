'use client';

import { useEffect } from 'react';
import { metricRoute } from '@/lib/utils/vitals';

/** Anonymous metric payloads contain no session identifiers, queries, or shopper details. */
export function WebVitals() {
  useEffect(() => {
    let active = true;
    void import('web-vitals').then(({ onTTFB, onFCP, onLCP, onCLS, onINP }) => {
      if (!active) return;
      const route = metricRoute(window.location.pathname);
      const report = ({ name, value, rating }: import('web-vitals').Metric) => {
        const body = JSON.stringify({
          name,
          value,
          rating,
          route,
          device: window.innerWidth < 1024 ? 'mobile' : 'desktop',
        });
        if (!navigator.sendBeacon('/api/vitals', new Blob([body], { type: 'application/json' })))
          void fetch('/api/vitals', {
            method: 'POST',
            body,
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
            credentials: 'omit',
          }).catch(() => {});
      };
      for (const observe of [onTTFB, onFCP, onLCP, onCLS, onINP]) observe(report);
    });
    return () => {
      active = false;
    };
  }, []);
  return null;
}
