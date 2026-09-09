// Website & Admin Content History Engine
// Tracks all editorial content updates, drafts, publications, homepage changes, and discount code updates.

import { ArticleItem } from './articles';
import articlesData from './articles.json';

export interface ContentHistoryItem {
  id: string;
  timestamp: string; // ISO string
  type: 'article' | 'draft' | 'homepage' | 'deal' | 'category' | 'page';
  action: 'published' | 'drafted' | 'updated' | 'created' | 'deleted';
  title: string;
  summary: string;
  category?: string;
  author: string;
  status: 'Published' | 'Draft' | 'Updated';
  badgeColor: string;
  viewLink?: string;
  editLink?: string;
}

const STORAGE_KEY = 'mummabee_content_history_custom';

// Manual/custom edits logged during CMS editing sessions
const SEED_MANUAL_CHANGES: ContentHistoryItem[] = [
  {
    id: 'chg-exp-edit',
    timestamp: '2026-09-09T08:31:00Z',
    type: 'homepage',
    action: 'updated',
    title: 'The Expat Edit Section Updated',
    summary: 'Configured dynamic article display on homepage for The Expat Edit category.',
    category: 'The Expat Edit',
    author: 'Donne',
    status: 'Updated',
    badgeColor: 'bg-[#B75B70] text-white',
    viewLink: '/#expat-edit',
    editLink: '/admin/homepage',
  },
  {
    id: 'chg-home-hero',
    timestamp: '2026-09-08T22:15:00Z',
    type: 'homepage',
    action: 'updated',
    title: 'Homepage Hero Headline & Proof Stats Updated',
    summary: 'Refined hero typography, subtitle, and tested guide statistics.',
    category: 'Homepage',
    author: 'Donne',
    status: 'Updated',
    badgeColor: 'bg-[#683846] text-white',
    viewLink: '/',
    editLink: '/admin/homepage',
  },
  {
    id: 'chg-deal-1',
    timestamp: '2026-09-08T18:30:00Z',
    type: 'deal',
    action: 'updated',
    title: 'Discount Codes & Deals Verified',
    summary: 'Checked discount codes and exclusive family offers for UAE brands.',
    category: 'Deals',
    author: 'Admin',
    status: 'Updated',
    badgeColor: 'bg-[#D79A30] text-white',
    viewLink: '/uae-deals',
    editLink: '/admin/deals',
  },
  {
    id: 'chg-cat-1',
    timestamp: '2026-09-08T14:10:00Z',
    type: 'category',
    action: 'updated',
    title: 'Category Hubs & Curated Slugs Organized',
    summary: 'Updated category descriptions and subcategories for The Expat Edit and Family Life.',
    category: 'Categories',
    author: 'Admin',
    status: 'Updated',
    badgeColor: 'bg-[#4D7987] text-white',
    viewLink: '/the-expat-edit',
    editLink: '/admin/categories',
  },
];

export function getCustomHistoryLogs(): ContentHistoryItem[] {
  if (typeof window === 'undefined') return SEED_MANUAL_CHANGES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_MANUAL_CHANGES));
      return SEED_MANUAL_CHANGES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {}
  return SEED_MANUAL_CHANGES;
}

export function recordContentChange(
  item: Omit<ContentHistoryItem, 'id' | 'timestamp'> & { timestamp?: string }
): ContentHistoryItem {
  const newItem: ContentHistoryItem = {
    ...item,
    id: `chg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: item.timestamp || new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const current = getCustomHistoryLogs();
      const updated = [newItem, ...current].slice(0, 150);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('mummabee_history_updated', { detail: newItem }));
    } catch (_) {}
  }

  return newItem;
}

/**
 * Builds the complete chronological list of all article publications, drafts, and site edits.
 */
export function getAllContentHistory(currentArticles?: ArticleItem[]): ContentHistoryItem[] {
  const articlesList: ArticleItem[] = currentArticles && currentArticles.length > 0 
    ? currentArticles 
    : (articlesData as ArticleItem[]);

  const articleHistoryItems: ContentHistoryItem[] = articlesList.map((art) => {
    const isDraft = Boolean(art.isDraft || art.status === 'draft');
    const categoryName = art.category ? art.category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'General';
    const cleanDate = art.lastUpdated || art.publishedAt || '2026-09-08T00:00:00Z';
    
    // Convert to ISO timestamp if needed
    let isoTimestamp: string;
    try {
      const parsedTime = new Date(cleanDate).getTime();
      isoTimestamp = !isNaN(parsedTime) && parsedTime > 0 ? new Date(cleanDate).toISOString() : new Date().toISOString();
    } catch (_) {
      isoTimestamp = new Date().toISOString();
    }

    if (isDraft) {
      return {
        id: `art-hist-${art.id}`,
        timestamp: isoTimestamp,
        type: 'draft',
        action: 'drafted',
        title: art.title,
        summary: art.excerpt ? (art.excerpt.length > 130 ? art.excerpt.slice(0, 130) + '...' : art.excerpt) : `Saved as draft under ${categoryName}.`,
        category: categoryName,
        author: art.author || 'Donne',
        status: 'Draft',
        badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
        viewLink: undefined,
        editLink: `/admin/articles/${art.id}`,
      };
    } else {
      return {
        id: `art-hist-${art.id}`,
        timestamp: isoTimestamp,
        type: 'article',
        action: 'published',
        title: art.title,
        summary: art.excerpt ? (art.excerpt.length > 130 ? art.excerpt.slice(0, 130) + '...' : art.excerpt) : `Published live in category ${categoryName}.`,
        category: categoryName,
        author: art.author || 'Donne',
        status: 'Published',
        badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
        viewLink: `/${art.category}/${art.slug}`,
        editLink: `/admin/articles/${art.id}`,
      };
    }
  });

  const manualLogs = getCustomHistoryLogs();

  // Combine and sort by timestamp descending
  const combined = [...manualLogs, ...articleHistoryItems];
  combined.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime() || 0;
    const timeB = new Date(b.timestamp).getTime() || 0;
    return timeB - timeA;
  });

  return combined;
}
