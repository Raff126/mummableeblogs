// System & Activity History Engine for MummaBee CMS

export interface HistoryEvent {
  id: string;
  timestamp: string; // ISO string
  type: 'article' | 'settings' | 'deal' | 'media' | 'homepage' | 'system' | 'user';
  action: 'create' | 'update' | 'publish' | 'draft' | 'delete' | 'deploy' | 'sync' | 'login';
  title: string;
  description: string;
  user: string;
  role?: string;
  badge: string;
  link?: string;
  details?: Record<string, any>;
}

const HISTORY_STORAGE_KEY = 'mummabee_admin_history';

const INITIAL_HISTORY: HistoryEvent[] = [
  {
    id: 'hist-1',
    timestamp: '2026-09-09T16:44:23Z',
    type: 'system',
    action: 'deploy',
    title: 'Firebase Hosting Deployed',
    description: 'Successfully deployed 255 production files to Firebase Hosting (mummabeeblogss.web.app).',
    user: 'Donne',
    role: 'Admin',
    badge: '🚀 DEPLOYMENT',
    link: 'https://mummabeeblogss.web.app',
  },
  {
    id: 'hist-2',
    timestamp: '2026-09-09T16:31:41Z',
    type: 'system',
    action: 'sync',
    title: 'Database Synchronized',
    description: 'Synchronized 37 articles from Firestore into static data cache (data/articles.json).',
    user: 'System',
    role: 'Admin',
    badge: '🔄 DB SYNC',
  },
  {
    id: 'hist-3',
    timestamp: '2026-09-09T16:28:44Z',
    type: 'article',
    action: 'publish',
    title: 'Moving to the UAE: Everything You Need to Know Before You Go',
    description: 'Published new comprehensive relocation guide under The Expat Edit category.',
    user: 'Donne',
    role: 'Admin',
    badge: '📝 PUBLISHED',
    link: '/the-expat-edit/moving-to-the-uae-everything-you-need-to-know-before-you-go',
  },
  {
    id: 'hist-4',
    timestamp: '2026-09-09T15:50:12Z',
    type: 'article',
    action: 'publish',
    title: 'The Real Cost of Living in the UAE',
    description: 'Published detailed 13-point family budgeting breakdown for UAE expats.',
    user: 'Donne',
    role: 'Admin',
    badge: '📝 PUBLISHED',
    link: '/family-life/the-real-cost-of-living-in-the-uae',
  },
  {
    id: 'hist-5',
    timestamp: '2026-09-09T15:35:04Z',
    type: 'article',
    action: 'publish',
    title: 'Our Favourite Family Money-Saving Apps in the UAE',
    description: 'Published top tested money-saving and discount applications for Dubai and Abu Dhabi families.',
    user: 'Donne',
    role: 'Admin',
    badge: '📝 PUBLISHED',
    link: '/family-life/our-favourite-family-money-saving-apps-in-the-uae',
  },
  {
    id: 'hist-6',
    timestamp: '2026-09-09T15:15:22Z',
    type: 'article',
    action: 'publish',
    title: 'Dubai or Abu Dhabi: Which Is Better for Your Family?',
    description: 'Published comparative relocation & lifestyle analysis for families choosing between emirates.',
    user: 'Donne',
    role: 'Admin',
    badge: '📝 PUBLISHED',
    link: '/travel/dubai-or-abu-dhabi-which-is-better-for-your-family-8076',
  },
  {
    id: 'hist-7',
    timestamp: '2026-09-09T00:14:06Z',
    type: 'system',
    action: 'update',
    title: 'Publish & Draft Status Consistency Fix',
    description: 'Hardened status toggling across admin tables, edit screens, and live cloud database.',
    user: 'Admin',
    role: 'Admin',
    badge: '⚙️ SYSTEM FIX',
  },
  {
    id: 'hist-8',
    timestamp: '2026-09-08T23:42:11Z',
    type: 'article',
    action: 'update',
    title: 'Editorial Typography & Content Formatter Cleaned',
    description: 'MS Word pasted styles stripped, transparent text eliminated, and comparison tables auto-spaced.',
    user: 'Admin',
    role: 'Admin',
    badge: '✍️ FORMATTING',
  },
  {
    id: 'hist-9',
    timestamp: '2026-09-08T22:46:10Z',
    type: 'homepage',
    action: 'update',
    title: 'The Expat Edit Homepage Section Updated',
    description: 'Connected dynamic article resolver for curated UAE expat family guides.',
    user: 'Donne',
    role: 'Admin',
    badge: '🏡 HOMEPAGE',
  },
  {
    id: 'hist-10',
    timestamp: '2026-09-08T21:56:00Z',
    type: 'system',
    action: 'update',
    title: 'Draft Isolation & Security Verified',
    description: 'Verified draft articles remain strictly inaccessible to public visitors on live site.',
    user: 'Admin',
    role: 'Admin',
    badge: '🔒 SECURITY',
  },
];

export function getHistoryEvents(): HistoryEvent[] {
  if (typeof window === 'undefined') {
    return INITIAL_HISTORY;
  }

  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(INITIAL_HISTORY));
      return INITIAL_HISTORY;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (_) {}

  return INITIAL_HISTORY;
}

export function recordHistoryEvent(
  event: Omit<HistoryEvent, 'id' | 'timestamp'> & { timestamp?: string }
): HistoryEvent {
  const newEvent: HistoryEvent = {
    ...event,
    id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const current = getHistoryEvents();
      const updated = [newEvent, ...current].slice(0, 200); // keep up to 200 most recent logs
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('mummabee_history_updated', { detail: newEvent }));
    } catch (_) {}
  }

  return newEvent;
}

export function clearHistoryEvents(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([]));
      window.dispatchEvent(new CustomEvent('mummabee_history_updated'));
    } catch (_) {}
  }
}

export function resetHistoryToDefault(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(INITIAL_HISTORY));
      window.dispatchEvent(new CustomEvent('mummabee_history_updated'));
    } catch (_) {}
  }
}
