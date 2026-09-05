'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { recordPageView } from '../data/analytics';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastRecordedPath = useRef<string | null>(null);

  useEffect(() => {
    // Only track public website pages (do not skew analytics with admin dashboard edits)
    if (!pathname || pathname.startsWith('/admin')) {
      return;
    }

    // Debounce duplicate tracking on the same path within a brief moment
    if (lastRecordedPath.current === pathname) {
      return;
    }
    lastRecordedPath.current = pathname;

    // Small delay to ensure document.title is populated
    const timer = setTimeout(async () => {
      try {
        // Visitor ID
        let vid = localStorage.getItem('mummabee_vid');
        if (!vid) {
          vid = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
          localStorage.setItem('mummabee_vid', vid);
        }

        // Session ID
        let sid = sessionStorage.getItem('mummabee_sid');
        if (!sid) {
          sid = `ses-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          sessionStorage.setItem('mummabee_sid', sid);
        }

        // Device detection
        const ua = navigator.userAgent;
        const width = window.innerWidth;
        let device: 'Mobile' | 'Desktop' | 'Tablet' = 'Desktop';
        if (/Mobi|Android/i.test(ua) || width < 768) {
          device = 'Mobile';
        } else if (/iPad|Tablet/i.test(ua) || (width >= 768 && width < 1024)) {
          device = 'Tablet';
        }

        // OS detection
        let os = 'Unknown OS';
        if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
        else if (/Android/i.test(ua)) os = 'Android';
        else if (/Windows NT 10.0/i.test(ua)) os = 'Windows 10/11';
        else if (/Windows/i.test(ua)) os = 'Windows';
        else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
        else if (/Linux/i.test(ua)) os = 'Linux';

        // Browser detection
        let browser = 'Browser';
        if (/Edg/i.test(ua)) browser = 'Edge';
        else if (/Chrome/i.test(ua)) browser = 'Chrome';
        else if (/Safari/i.test(ua)) browser = 'Safari';
        else if (/Firefox/i.test(ua)) browser = 'Firefox';

        // Country Resolution (with fast session cache)
        let countryInfo = { country: 'United Arab Emirates', code: 'AE', flag: '🇦🇪' };
        const cachedGeo = sessionStorage.getItem('mummabee_geo');

        if (cachedGeo) {
          try {
            countryInfo = JSON.parse(cachedGeo);
          } catch (_) {}
        } else {
          // Attempt fast lookup or fallback to timezone
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
              const data = await res.json();
              if (data && data.country_name) {
                countryInfo = {
                  country: data.country_name,
                  code: data.country_code || 'AE',
                  flag: getFlagEmoji(data.country_code || 'AE'),
                };
                sessionStorage.setItem('mummabee_geo', JSON.stringify(countryInfo));
              }
            }
          } catch (_) {
            // Timezone fallback if offline or blocked
            countryInfo = getFallbackCountry();
            sessionStorage.setItem('mummabee_geo', JSON.stringify(countryInfo));
          }
        }

        recordPageView({
          path: pathname,
          title: document.title || 'MummaBeeBlog',
          country: countryInfo.country,
          countryCode: countryInfo.code,
          flag: countryInfo.flag,
          device,
          os,
          browser,
          referrer: document.referrer ? new URL(document.referrer, window.location.origin).hostname : 'Direct',
          visitorId: vid,
          sessionId: sid,
        });
      } catch (err) {
        console.error('Analytics record error:', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function getFallbackCountry() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Dubai') || tz.includes('Abu_Dhabi')) return { country: 'United Arab Emirates', code: 'AE', flag: '🇦🇪' };
    if (tz.includes('Manila')) return { country: 'Philippines', code: 'PH', flag: '🇵🇭' };
    if (tz.includes('Bahrain')) return { country: 'Bahrain', code: 'BH', flag: '🇧🇭' };
    if (tz.includes('New_York') || tz.includes('Los_Angeles')) return { country: 'United States', code: 'US', flag: '🇺🇸' };
    if (tz.includes('London')) return { country: 'United Kingdom', code: 'GB', flag: '🇬🇧' };
    if (tz.includes('Toronto')) return { country: 'Canada', code: 'CA', flag: '🇨🇦' };
  } catch (_) {}
  return { country: 'United Arab Emirates', code: 'AE', flag: '🇦🇪' };
}
