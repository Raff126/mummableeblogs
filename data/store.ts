'use client';

import { useState, useEffect } from 'react';
import { ARTICLES, Article } from './articles';
import { CATEGORIES, CategoryInfo } from './categories';
import {
  fetchArticlesFromFirestore,
  saveArticlesToFirestore,
  saveOneArticleToFirestore,
  deleteArticleFromFirestore,
  fetchDeletedIdsFromFirestore,
  seedFirestoreIfEmpty,
  FirestoreArticle,
} from '../utils/firestoreArticles';
import {
  saveHomepageToFirestore,
  fetchHomepageFromFirestore,
  saveAboutToFirestore,
  fetchAboutFromFirestore,
  saveDealsToFirestore,
  fetchDealsFromFirestore,
  saveInstagramToFirestore,
  fetchInstagramFromFirestore,
  saveWorkWithUsToFirestore,
  fetchWorkWithUsFromFirestore,
  saveSettingsToFirestore,
  fetchSettingsFromFirestore,
} from '../utils/firestoreSettings';

export {
  saveHomepageToFirestore,
  fetchHomepageFromFirestore,
  saveAboutToFirestore,
  fetchAboutFromFirestore,
  saveDealsToFirestore,
  fetchDealsFromFirestore,
  saveInstagramToFirestore,
  fetchInstagramFromFirestore,
  saveWorkWithUsToFirestore,
  fetchWorkWithUsFromFirestore,
  saveSettingsToFirestore,
  fetchSettingsFromFirestore,
};

export type { Article };

export interface InstagramPost {
  id: string;
  url: string;
  image?: string;
  caption: string;
  displayDate: string;
  visible: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  date: string;
  source: string;
  status: 'Active' | 'Unsubscribed';
}

export interface Inquiry {
  id: string;
  name: string;
  company: string;
  email: string;
  message: string;
  date: string;
  status: 'New' | 'In Progress' | 'Responded' | 'Closed';
}

export interface DiscountCode {
  id: string;
  title: string;
  code: string;
  discountBadge?: string;
  description?: string;
  link: string;
  expirationDate?: string; // e.g. "2026-10-31"
  showOnHomepage: boolean;
  showOnDealsPage: boolean;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  uploadDate: string;
  dimensions: string;
}

export interface SiteSettings {
  siteName: string;
  contactEmail: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  pinterestUrl: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  comingSoonMode?: boolean;
}

export interface HomepageContent {
  heroEyebrow: string;
  heroHeadline: string;
  heroDescription: string;
  heroPrimaryCtaText: string;
  heroPrimaryCtaUrl: string;
  heroSecondaryCtaText: string;
  heroSecondaryCtaUrl: string;
  heroImage: string;
  donneHeadline: string;
  donneDescription: string;
  donneImage: string;
  newsletterHeadline: string;
  newsletterSubtext: string;
  updatedAt?: string;
}

export interface AboutPageContent {
  eyebrow: string;
  headline: string;
  leadText: string;
  profileBadgeText: string;
  profileHeading: string;
  profileStory: string;
  profileImage: string;
  pillar1Title: string;
  pillar1Text: string;
  pillar2Title: string;
  pillar2Text: string;
  privacyNote: string;
  updatedAt?: string;
}

export interface WorkWithUsPageContent {
  eyebrow: string;
  headline: string;
  leadText: string;
  ctaButtonText: string;
  ctaEmail: string;
  stats1Number: string;
  stats1Label: string;
  stats2Number: string;
  stats2Label: string;
  stats3Number: string;
  stats3Label: string;
  audienceTitle: string;
  audienceText: string;
  format1Title: string;
  format1Desc: string;
  format2Title: string;
  format2Desc: string;
  format3Title: string;
  format3Desc: string;
  format4Title: string;
  format4Desc: string;
  mediaKitNote: string;
}

export const STORAGE_KEYS = {
  ARTICLES: 'mummabee_articles',
  DELETED_ARTICLES: 'mummabee_deleted_articles',
  INSTAGRAM: 'mummabee_instagram',
  INQUIRIES: 'mummabee_inquiries',
  SUBSCRIBERS: 'mummabee_subscribers',
  DEALS: 'mummabee_deals',
  DELETED_DEALS: 'mummabee_deleted_deals',
  MEDIA: 'mummabee_media',
  SETTINGS: 'mummabee_settings',
  HOMEPAGE: 'mummabee_homepage',
  ABOUT: 'mummabee_about',
  WORK_WITH_US: 'mummabee_work_with_us',
  CATEGORIES: 'mummabee_categories',
  AUTH: 'mummabee_auth',
  GOOD_TO_KNOW: 'mummabee_gtk_visibility',
  ADMIN_EMAILS: 'mummabee_admin_emails',
};

// Default Fallbacks
export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'MummaBeeBlog',
  contactEmail: 'donne@mummabeeblog.com',
  instagramUrl: 'https://instagram.com/mummabeeblog',
  facebookUrl: 'https://facebook.com/mummabeeblog',
  tiktokUrl: 'https://tiktok.com/@mummabee.blog',
  pinterestUrl: 'https://ph.pinterest.com/mummabeeblog/',
  defaultSeoTitle: 'MummaBeeBlog | UAE Family Life, Kids Activities & Honest Guides',
  defaultSeoDescription: 'Tested UAE family guides, weekend activities, child-friendly dining, and practical parenting advice from a mum raising two girls across Dubai and Abu Dhabi.',
  comingSoonMode: false,
};

export const DEFAULT_HOMEPAGE: HomepageContent = {
  heroEyebrow: 'UAE FAMILY LIFE • FOOD • TRAVEL • ACTIVITIES',
  heroHeadline: 'Your guide to family life in the UAE.',
  heroDescription: 'Discover family-friendly places, practical guides, honest recommendations and real experiences between Dubai and Abu Dhabi.',
  heroPrimaryCtaText: 'EXPLORE UAE GUIDES',
  heroPrimaryCtaUrl: '/uae-with-kids',
  heroSecondaryCtaText: 'MEET MUMMA BEE',
  heroSecondaryCtaUrl: '/about',
  heroImage: '/uploads/donne_about_us-1787911834686.jpg',
  donneHeadline: "Hi, I'm Donne.",
  donneDescription: "I'm a South African mum living in the UAE with my husband and two daughters. MummaBeeBlog is where I share real, tested family guides — from weekend days out in Dubai to road trips across the Emirates, honest dining reviews, and the everyday adventures of raising kids in the desert.",
  donneImage: '/uploads/donne_about_us-1787911839557.jpg',
  newsletterHeadline: 'UAE family finds, every Friday.',
  newsletterSubtext: 'Weekend ideas, practical guides and honest recommendations.',
};

export const DEFAULT_ABOUT: AboutPageContent = {
  eyebrow: 'MUM, WRITER & UAE EXPLORER',
  headline: 'The Mum Behind MummaBeeBlog',
  leadText: 'Raising two girls between Dubai and Abu Dhabi, sharing honest reviews, tested itineraries, and the beautiful chaos of UAE family life.',
  profileBadgeText: 'DONNE & HER GIRLS',
  profileHeading: 'How MummaBeeBlog Began',
  profileStory: "When we moved to the UAE with our two young daughters, every weekend started with the same question: 'Where can we go today that everyone will actually enjoy?' We found endless generic tourism listicles, but very few honest, detailed reviews written from a parent's perspective.\n\nSo I started MummaBeeBlog to document our real family adventures across the Emirates — the hidden gems, the places with clean changing tables and stroller-friendly pathways, the cafes where kids are genuinely welcomed, and the weekend escapes that are truly worth the drive.\n\nEvery guide on this site is tested with my own two daughters. If a place was overcrowded, overpriced, or not as advertised, I'll tell you honestly. And when we find somewhere truly magical, you'll be the first to know!",
  profileImage: '/images/358792494_661391199240576_3424351230899219709_n.jpg',
  pillar1Title: 'Family-Tested Standards',
  pillar1Text: 'We visit places as a real family before writing about them. No sponsored sugarcoating — only recommendations we would give to our closest mum friends.',
  pillar2Title: 'Practical UAE Living',
  pillar2Text: 'From beating the summer heat indoors to school routines, dining with picky eaters, and family road trips across all 7 Emirates.',
  privacyNote: 'While I share our family adventures to help other parents navigate UAE life, I protect my daughters\' privacy by keeping their school names and daily schedules private.',
};

export const DEFAULT_WORK_WITH_US: WorkWithUsPageContent = {
  eyebrow: 'COLLABORATIONS & PARTNERSHIPS',
  headline: 'Partner With MummaBeeBlog',
  leadText: 'Connect your family-friendly brand, destination, or venue with thousands of highly engaged parents living across Dubai, Abu Dhabi, and the wider UAE.',
  ctaButtonText: 'Discuss a Partnership',
  ctaEmail: 'donne@mummabeeblog.com',
  stats1Number: '25K+',
  stats1Label: 'Monthly UAE Readers',
  stats2Number: '85%',
  stats2Label: 'UAE-Based Parents',
  stats3Number: '4.8%',
  stats3Label: 'Average Engagement',
  audienceTitle: 'Who Reads MummaBeeBlog?',
  audienceText: 'Our audience consists primarily of UAE resident parents (75% Dubai, 20% Abu Dhabi, 5% Northern Emirates) actively searching for weekend activities, family dining, children\'s education, seasonal events, and staycations.',
  format1Title: 'Sponsored Destination & Venue Reviews',
  format1Desc: 'Comprehensive, search-optimized editorial reviews featuring genuine photography, practical visiting tips, and honest family feedback.',
  format2Title: 'Integrated Content & Social Campaigns',
  format2Desc: 'Multi-platform storytelling combining long-form blog guides with Instagram reels, stories, and newsletter features.',
  format3Title: 'Seasonal Guides & Curated Inclusions',
  format3Desc: 'Prominent inclusion in our highly anticipated seasonal roundups (Summer Camps, Winter Activities, Back-to-School, Ramadan Dining).',
  format4Title: 'Brand Ambassadorships',
  format4Desc: 'Long-term partnerships representing quality family brands, products, and services that align with our authentic editorial voice.',
  mediaKitNote: 'Download our complete Media Kit & Rate Card with detailed demographic breakdowns by emailing us directly.',
};

export const DEFAULT_INSTAGRAM: InstagramPost[] = [
  {
    id: 'post-1',
    url: 'https://instagram.com/p/C9v8X9yyy1',
    image: '/images/358792494_661391199240576_3424351230899219709_n.jpg',
    caption: 'Saturday morning coffee & playground exploring in Dubai Hills ☕✨',
    displayDate: '2 days ago',
    visible: true,
  },
  {
    id: 'post-2',
    url: 'https://instagram.com/p/C9v8X9yyy2',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&auto=format&fit=crop&q=80',
    caption: 'Beating the afternoon heat with pottery painting! 🎨 Highly recommend for kids aged 4+.',
    displayDate: '4 days ago',
    visible: true,
  },
  {
    id: 'post-3',
    url: 'https://instagram.com/p/C9v8X9yyy3',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
    caption: 'Desert sunset picnic with the girls 🌅 The best part about winter in the UAE.',
    displayDate: '1 week ago',
    visible: true,
  },
  {
    id: 'post-4',
    url: 'https://instagram.com/p/C9v8X9yyy4',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    caption: 'Found our new favourite weekend breakfast spot with a dedicated kids corner 🥞💛',
    displayDate: '2 weeks ago',
    visible: true,
  },
  {
    id: 'post-5',
    url: 'https://instagram.com/p/C9v8X9yyy5',
    image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop&q=80',
    caption: 'Water play & pool afternoons are a summer survival essential here! 💦☀️',
    displayDate: '3 weeks ago',
    visible: true,
  },
  {
    id: 'post-6',
    url: 'https://instagram.com/p/C9v8X9yyy6',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80',
    caption: 'Organized mornings make ex-pat school days so much smoother. Uniforms ready the night before! 🎒✏️',
    displayDate: '4 weeks ago',
    visible: true,
  },
];

export const DEFAULT_MEDIA: MediaItem[] = [
  {
    id: 'med-1',
    url: '/images/358792494_661391199240576_3424351230899219709_n.jpg',
    filename: 'donne-and-daughters.jpg',
    uploadDate: '2026-08-20',
    dimensions: '1080x1350',
  },
  {
    id: 'med-2',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&auto=format&fit=crop&q=80',
    filename: 'family-dubai-activity.jpg',
    uploadDate: '2026-08-22',
    dimensions: '1080x1080',
  },
  {
    id: 'med-3',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
    filename: 'desert-family-adventure.jpg',
    uploadDate: '2026-08-24',
    dimensions: '1080x1350',
  },
  {
    id: 'med-4',
    url: '/images/mama-logo.png',
    filename: 'mummabee-brand-logo.png',
    uploadDate: '2026-08-01',
    dimensions: '500x500',
  },
];

export const DEFAULT_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-1',
    name: 'Sarah Jenkins',
    company: 'Dubai Family Festival',
    email: 'sarah@dubaifestivals.ae',
    message: 'Hi Donne, we would love to invite you and your daughters to the VIP preview of the Winter Family Festival at Dubai Creek Harbour.',
    date: '2026-08-25',
    status: 'New',
  },
];

export const DEFAULT_SUBSCRIBERS: Subscriber[] = [
  {
    id: 'sub-1',
    email: 'sarah.jenkins@example.com',
    date: '2026-08-25',
    source: 'Homepage',
    status: 'Active',
  },
  {
    id: 'sub-2',
    email: 'emma.familydubai@gmail.com',
    date: '2026-08-27',
    source: 'Dubai with Kids',
    status: 'Active',
  },
];

export const DEFAULT_DEALS: DiscountCode[] = [
  {
    id: 'deal-1788019887315',
    title: 'Trendyol',
    code: 'MUMMA',
    discountBadge: '10% off',
    description: '10% off your entire fashion, home, and kids collection on Trendyol UAE.',
    link: 'https://www.trendyol.com/en',
    expirationDate: '2026-12-31',
    showOnHomepage: true,
    showOnDealsPage: true,
    createdAt: '2026-08-29',
  },
  {
    id: 'deal-1788019418765',
    title: 'Justhype',
    code: 'BEE15',
    discountBadge: '15% off',
    description: '15% off trendy kids streetwear, backpacks, and casual family wear across the UAE.',
    link: 'https://justhype.ae/',
    expirationDate: '2026-12-31',
    showOnHomepage: true,
    showOnDealsPage: true,
    createdAt: '2026-08-29',
  },
];

export function isDealActive(deal: DiscountCode): boolean {
  if (!deal.expirationDate) return true;
  const exp = new Date(deal.expirationDate);
  // Set end of day if only YYYY-MM-DD
  if (deal.expirationDate.length <= 10) {
    exp.setHours(23, 59, 59, 999);
  }
  return exp.getTime() >= Date.now();
}

// Helper to safely write to localStorage without quota errors
function safeSetLocalStorage(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`LocalStorage quota reached when saving ${key}. Pruning old media to recover space...`, err);
    try {
      // Prune old media items to recover quota
      const media = getInitialMedia();
      if (media.length > 5) {
        localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(media.slice(0, 5)));
      }
      localStorage.setItem(key, value);
      return true;
    } catch (secondErr) {
      console.error(`Failed to save ${key} even after pruning.`, secondErr);
      return false;
    }
  }
}

// -------------------------------------------------------------
// STORE GETTERS & SETTERS
// -------------------------------------------------------------

export function getDeletedArticleIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DELETED_ARTICLES || 'mummabee_deleted_articles');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch (_) {
    return new Set();
  }
}

export function markArticleDeleted(idOrSlug: string): void {
  if (typeof window === 'undefined' || !idOrSlug) return;
  try {
    const deleted = getDeletedArticleIds();
    deleted.add(idOrSlug);
    safeSetLocalStorage(
      STORAGE_KEYS.DELETED_ARTICLES || 'mummabee_deleted_articles',
      JSON.stringify(Array.from(deleted))
    );
  } catch (_) {}
}

export function getInitialArticles(): Article[] {
  if (typeof window === 'undefined') return ARTICLES;
  const deleted = getDeletedArticleIds();
  const saved = localStorage.getItem(STORAGE_KEYS.ARTICLES);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Return user saved list without resurrecting deleted articles
        return parsed.filter((a: Article) => !deleted.has(a.id) && !deleted.has(a.slug));
      }
    } catch (e) {}
  }
  return ARTICLES.filter((a) => !deleted.has(a.id) && !deleted.has(a.slug));
}

export async function deleteArticle(id: string, slug?: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const currentArticles = getInitialArticles();
  const target = currentArticles.find((a) => a.id === id || (slug && a.slug === slug));
  const finalSlug = slug || target?.slug;

  markArticleDeleted(id);
  if (finalSlug) markArticleDeleted(finalSlug);

  // Delete from Firestore for persistent cross-device deletion
  try {
    await deleteArticleFromFirestore(id, finalSlug);
  } catch (err) {
    console.warn('Firestore delete failed (will rely on localStorage):', err);
  }

  const current = currentArticles.filter(
    (a) => a.id !== id && (!finalSlug || a.slug !== finalSlug)
  );
  return saveArticles(current);
}

export async function saveArticles(articles: Article[]): Promise<boolean> {
  if (typeof window !== 'undefined') {
    // 1. Ensure all articles have explicit status field matching isDraft
    const normalizedArticles = articles.map((a) => ({
      ...a,
      status: (a.status || (a.isDraft ? 'draft' : 'published')) as 'published' | 'draft',
      showGoodToKnow: a.showGoodToKnow ?? true,
      goodToKnowEnabled: a.goodToKnowEnabled ?? true,
    }));

    // 2. Save to localStorage immediately for instant UI feedback
    safeSetLocalStorage(STORAGE_KEYS.ARTICLES, JSON.stringify(normalizedArticles));
    window.dispatchEvent(new CustomEvent('mummabee_content_updated', { detail: { key: STORAGE_KEYS.ARTICLES, data: normalizedArticles } }));

    // 3. Sync to Firestore in background with timeout safety (does not block local saving)
    saveArticlesToFirestore(normalizedArticles as FirestoreArticle[]).catch((err) => {
      console.warn('Firestore sync background notice (localStorage preserved):', err);
    });

    // 4. Also sync to local API on dev server for file-based persistence
    const isLocalhost = Boolean(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0'
    );
    if (isLocalhost) {
      try {
        fetch('/api/articles/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(normalizedArticles),
        }).catch(() => {});
      } catch (err) {
        // Silently skip if endpoint unavailable
      }
    }
  }
  return true;
}

/**
 * Load articles from Firestore (production) or API (localhost).
 * Merges with local articles and static JSON as fallback.
 * Guarantees locally created / updated articles are never wiped out.
 */
export async function loadArticlesFromServer(): Promise<Article[]> {
  if (typeof window === 'undefined') return ARTICLES;

  const deleted = getDeletedArticleIds();
  const localArticles = getInitialArticles();

  // Try Firestore first (works on all environments)
  try {
    const firestoreArticles = await fetchArticlesFromFirestore();
    if (firestoreArticles.length > 0) {
      // Merge Firestore deleted IDs into local deleted set
      try {
        const fsDeleted = await fetchDeletedIdsFromFirestore();
        fsDeleted.forEach((id) => {
          deleted.add(id);
          markArticleDeleted(id);
        });
      } catch (_) {}

      const fsMap = new Map(firestoreArticles.map((a) => [a.id, a]));
      const fsSlugMap = new Map(firestoreArticles.filter((a) => a.slug).map((a) => [a.slug, a]));

      // Start with Firestore articles
      const merged: FirestoreArticle[] = [...firestoreArticles];

      // CRITICAL FIX: Preserve any locally created / updated articles that aren't in Firestore yet
      for (const localArt of localArticles) {
        const inFs = fsMap.has(localArt.id) || (localArt.slug && fsSlugMap.has(localArt.slug));
        const isDeleted = deleted.has(localArt.id) || (localArt.slug && deleted.has(localArt.slug));
        if (!inFs && !isDeleted) {
          merged.unshift(localArt as FirestoreArticle);
        }
      }

      // Add any static JSON articles that aren't in Firestore, aren't local, and aren't deleted
      const mergedIdSet = new Set(merged.map((a) => a.id));
      const mergedSlugSet = new Set(merged.filter((a) => a.slug).map((a) => a.slug));
      for (const staticArt of ARTICLES) {
        const exists = mergedIdSet.has(staticArt.id) || (staticArt.slug && mergedSlugSet.has(staticArt.slug));
        const isDeleted = deleted.has(staticArt.id) || (staticArt.slug && deleted.has(staticArt.slug));
        if (!exists && !isDeleted) {
          merged.push(staticArt as FirestoreArticle);
        }
      }

      const filtered = merged.filter(
        (a) => !deleted.has(a.id) && (!a.slug || !deleted.has(a.slug))
      );

      // Normalize status property
      const finalArticles = filtered.map((a) => ({
        ...a,
        status: (a.status || (a.isDraft ? 'draft' : 'published')) as 'published' | 'draft',
      })) as Article[];

      // Update localStorage cache
      safeSetLocalStorage(STORAGE_KEYS.ARTICLES, JSON.stringify(finalArticles));

      return finalArticles;
    }
  } catch (err) {
    console.warn('Firestore fetch failed, falling back:', err);
  }

  // Fallback: try API / static JSON
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const endpoint = isLocal ? `/api/articles/?t=${Date.now()}` : `/data/articles.json?t=${Date.now()}`;
  try {
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (res.ok) {
      const serverArticles = await res.json();
      if (Array.isArray(serverArticles) && serverArticles.length > 0) {
        const serverIdSet = new Set(serverArticles.map((a: Article) => a.id));
        const serverSlugSet = new Set(serverArticles.filter((a: Article) => a.slug).map((a: Article) => a.slug));

        // Start with server articles
        const merged = [...serverArticles];

        // Merge any local articles not yet on server
        for (const localArt of localArticles) {
          const inServer = serverIdSet.has(localArt.id) || (localArt.slug && serverSlugSet.has(localArt.slug));
          const isDeleted = deleted.has(localArt.id) || (localArt.slug && deleted.has(localArt.slug));
          if (!inServer && !isDeleted) {
            merged.unshift(localArt);
          }
        }

        const filtered = merged.filter(
          (a: Article) => !deleted.has(a.id) && (!a.slug || !deleted.has(a.slug))
        );
        const finalArticles = filtered.map((a: Article) => ({
          ...a,
          status: (a.status || (a.isDraft ? 'draft' : 'published')) as 'published' | 'draft',
        }));
        safeSetLocalStorage(STORAGE_KEYS.ARTICLES, JSON.stringify(finalArticles));
        return finalArticles;
      }
    }
  } catch (_) {}

  // Final fallback: return localStorage or static articles
  return getInitialArticles();
}

// -------------------------------------------------------------
// GOOD TO KNOW VISIBILITY CONTROLS
// -------------------------------------------------------------

export function getGoodToKnowVisibilityMap(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GOOD_TO_KNOW);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

export function setGoodToKnowVisibility(idOrSlug: string, visible: boolean): void {
  if (typeof window === 'undefined') return;
  const current = getGoodToKnowVisibilityMap();
  current[idOrSlug] = visible;
  safeSetLocalStorage(STORAGE_KEYS.GOOD_TO_KNOW, JSON.stringify(current));
  window.dispatchEvent(new CustomEvent('mummabee_content_updated', {
    detail: { key: STORAGE_KEYS.GOOD_TO_KNOW, data: current, target: idOrSlug, visible }
  }));
}

export function isGoodToKnowVisibleForArticle(article?: { id?: string; slug?: string; goodToKnowEnabled?: boolean; showGoodToKnow?: boolean } | null): boolean {
  if (!article) return false;
  const map = getGoodToKnowVisibilityMap();
  
  // 1. Check explicit override by ID or Slug in localStorage
  if (article.id && typeof map[article.id] === 'boolean') {
    return map[article.id];
  }
  if (article.slug && typeof map[article.slug] === 'boolean') {
    return map[article.slug];
  }

  // 2. Default: Visible unless explicitly false in article data
  const isExplicitlyDisabled = (
    article.goodToKnowEnabled === false ||
    (article as any).showGoodToKnow === false ||
    String(article.goodToKnowEnabled) === 'false' ||
    String((article as any).showGoodToKnow) === 'false'
  );

  return !isExplicitlyDisabled;
}

export function getInitialInstagramPosts(): InstagramPost[] {
  if (typeof window === 'undefined') return DEFAULT_INSTAGRAM;
  const saved = localStorage.getItem(STORAGE_KEYS.INSTAGRAM);
  try {
    return saved ? JSON.parse(saved) : DEFAULT_INSTAGRAM;
  } catch (e) {
    return DEFAULT_INSTAGRAM;
  }
}

export async function saveInstagramPosts(posts: InstagramPost[]): Promise<boolean> {
  safeSetLocalStorage(STORAGE_KEYS.INSTAGRAM, JSON.stringify(posts));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mummabee_content_updated', {
        detail: { key: STORAGE_KEYS.INSTAGRAM, data: posts },
      })
    );
    try {
      await saveInstagramToFirestore(posts);
    } catch (e) {
      console.warn('Could not sync instagram with Firestore:', e);
    }
  }
  return true;
}

export function getInitialInquiries(): Inquiry[] {
  if (typeof window === 'undefined') return DEFAULT_INQUIRIES;
  const saved = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
  try {
    return saved ? JSON.parse(saved) : DEFAULT_INQUIRIES;
  } catch (e) {
    return DEFAULT_INQUIRIES;
  }
}

export function saveInquiries(inquiries: Inquiry[]): void {
  safeSetLocalStorage(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
}

export function getInitialSubscribers(): Subscriber[] {
  if (typeof window === 'undefined') return DEFAULT_SUBSCRIBERS;
  const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS);
  try {
    return saved ? JSON.parse(saved) : DEFAULT_SUBSCRIBERS;
  } catch (e) {
    return DEFAULT_SUBSCRIBERS;
  }
}

export async function saveSubscribers(subscribers: Subscriber[]): Promise<boolean> {
  safeSetLocalStorage(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(subscribers));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mummabee_content_updated', { detail: { key: STORAGE_KEYS.SUBSCRIBERS, data: subscribers } }));
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      try {
        await fetch('/api/subscribers/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscribers }),
        });
      } catch (e) {
        console.warn('Could not sync subscribers with API:', e);
      }
    }
  }
  return true;
}

export function getDeletedDealIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_DEALS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (_) {}
  return new Set();
}

export function markDealDeleted(id: string): void {
  if (typeof window === 'undefined') return;
  const set = getDeletedDealIds();
  set.add(id);
  safeSetLocalStorage(STORAGE_KEYS.DELETED_DEALS, JSON.stringify(Array.from(set)));
}

export function getInitialDeals(): DiscountCode[] {
  if (typeof window === 'undefined') return DEFAULT_DEALS;
  const deleted = getDeletedDealIds();
  const saved = localStorage.getItem(STORAGE_KEYS.DEALS);
  try {
    const parsed = saved ? JSON.parse(saved) : DEFAULT_DEALS;
    return Array.isArray(parsed)
      ? parsed.filter((d: DiscountCode) => !deleted.has(d.id))
      : DEFAULT_DEALS.filter((d: DiscountCode) => !deleted.has(d.id));
  } catch (e) {
    return DEFAULT_DEALS.filter((d: DiscountCode) => !deleted.has(d.id));
  }
}

export async function saveDeals(deals: DiscountCode[], deletedId?: string | string[]): Promise<boolean> {
  if (deletedId) {
    if (Array.isArray(deletedId)) {
      deletedId.forEach((id) => markDealDeleted(id));
    } else {
      markDealDeleted(deletedId);
    }
  }
  const deleted = getDeletedDealIds();
  const filtered = deals.filter((d) => !deleted.has(d.id));

  safeSetLocalStorage(STORAGE_KEYS.DEALS, JSON.stringify(filtered));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mummabee_content_updated', {
        detail: { key: STORAGE_KEYS.DEALS, data: filtered },
      })
    );

    try {
      await saveDealsToFirestore(filtered, Array.from(deleted));
    } catch (e) {
      console.warn('Could not sync deals with Firestore:', e);
    }

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      try {
        await fetch('/api/deals/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filtered),
        });
      } catch (e) {
        console.warn('Could not sync deals with API:', e);
      }
    }
  }
  return true;
}

export function getInitialMedia(): MediaItem[] {
  if (typeof window === 'undefined') return DEFAULT_MEDIA;
  const saved = localStorage.getItem(STORAGE_KEYS.MEDIA);
  try {
    return saved ? JSON.parse(saved) : DEFAULT_MEDIA;
  } catch (e) {
    return DEFAULT_MEDIA;
  }
}

export function saveMedia(items: MediaItem[]): void {
  // Retain only latest 20 items to prevent filling localStorage
  const trimmed = items.slice(0, 20);
  safeSetLocalStorage(STORAGE_KEYS.MEDIA, JSON.stringify(trimmed));
}

export function getInitialSettings(): SiteSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  try {
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: SiteSettings): Promise<boolean> {
  safeSetLocalStorage(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mummabee_content_updated', {
        detail: { key: STORAGE_KEYS.SETTINGS, data: settings },
      })
    );

    try {
      await saveSettingsToFirestore(settings);
    } catch (e) {
      console.warn('Could not sync settings with Firestore:', e);
    }

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      try {
        await fetch('/api/settings/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        });
      } catch (e) {
        console.warn('Could not sync settings with API:', e);
      }
    }
  }
  return true;
}

export function getInitialHomepage(): HomepageContent {
  if (typeof window === 'undefined') return DEFAULT_HOMEPAGE;
  const saved = localStorage.getItem(STORAGE_KEYS.HOMEPAGE);
  try {
    return saved ? { ...DEFAULT_HOMEPAGE, ...JSON.parse(saved) } : DEFAULT_HOMEPAGE;
  } catch (e) {
    return DEFAULT_HOMEPAGE;
  }
}

export async function saveHomepage(hp: HomepageContent): Promise<boolean> {
  const withTime: HomepageContent = {
    ...hp,
    updatedAt: hp.updatedAt || new Date().toISOString(),
  };
  safeSetLocalStorage(STORAGE_KEYS.HOMEPAGE, JSON.stringify(withTime));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mummabee_content_updated', {
        detail: { key: STORAGE_KEYS.HOMEPAGE, data: withTime },
      })
    );

    // Save to Firestore so it syncs across all devices & live production visitors
    try {
      await saveHomepageToFirestore(withTime);
    } catch (fsErr) {
      console.warn('Firestore homepage save error:', fsErr);
    }

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      try {
        await fetch('/api/homepage/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(withTime),
        });
      } catch (e) {
        console.warn('Could not sync homepage with API:', e);
      }
    }
  }
  return true;
}

export function getInitialAbout(): AboutPageContent {
  if (typeof window === 'undefined') return DEFAULT_ABOUT;
  const saved = localStorage.getItem(STORAGE_KEYS.ABOUT);
  try {
    return saved ? { ...DEFAULT_ABOUT, ...JSON.parse(saved) } : DEFAULT_ABOUT;
  } catch (e) {
    return DEFAULT_ABOUT;
  }
}

export async function saveAbout(about: AboutPageContent): Promise<boolean> {
  const withTime: AboutPageContent = {
    ...about,
    updatedAt: about.updatedAt || new Date().toISOString(),
  };
  safeSetLocalStorage(STORAGE_KEYS.ABOUT, JSON.stringify(withTime));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mummabee_content_updated', {
        detail: { key: STORAGE_KEYS.ABOUT, data: withTime },
      })
    );

    // Save to Firestore so it syncs across all devices & live production visitors
    try {
      await saveAboutToFirestore(withTime);
    } catch (fsErr) {
      console.warn('Firestore about save error:', fsErr);
    }

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      try {
        await fetch('/api/about/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(withTime),
        });
      } catch (e) {
        console.warn('Could not sync about with API:', e);
      }
    }
  }
  return true;
}

export function getInitialWorkWithUs(): WorkWithUsPageContent {
  if (typeof window === 'undefined') return DEFAULT_WORK_WITH_US;
  const saved = localStorage.getItem(STORAGE_KEYS.WORK_WITH_US);
  try {
    return saved ? { ...DEFAULT_WORK_WITH_US, ...JSON.parse(saved) } : DEFAULT_WORK_WITH_US;
  } catch (e) {
    return DEFAULT_WORK_WITH_US;
  }
}

export async function saveWorkWithUs(content: WorkWithUsPageContent): Promise<boolean> {
  safeSetLocalStorage(STORAGE_KEYS.WORK_WITH_US, JSON.stringify(content));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mummabee_content_updated', {
        detail: { key: STORAGE_KEYS.WORK_WITH_US, data: content },
      })
    );

    try {
      await saveWorkWithUsToFirestore(content);
    } catch (e) {
      console.warn('Could not sync work-with-us with Firestore:', e);
    }

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      try {
        await fetch('/api/work-with-us/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(content),
        });
      } catch (e) {
        console.warn('Could not sync work-with-us with API:', e);
      }
    }
  }
  return true;
}

export function getInitialCategories(): Record<string, CategoryInfo> {
  if (typeof window === 'undefined') return CATEGORIES;
  const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  try {
    return saved ? JSON.parse(saved) : CATEGORIES;
  } catch (e) {
    return CATEGORIES;
  }
}

export function saveCategories(cats: Record<string, CategoryInfo>): void {
  safeSetLocalStorage(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mummabee_content_updated', { detail: { key: STORAGE_KEYS.CATEGORIES, data: cats } }));
  }
}

import { getFirebaseAuth } from '../utils/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

export const DEFAULT_ADMIN_EMAILS: string[] = [
  'raffyolaivar25@gmail.com',
  'olaivarkathrine@gmail.com',
  'donne@mummabeeblog.com',
];

export function getAuthorizedAdminEmails(): string[] {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_EMAILS;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_EMAILS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return Array.from(
          new Set([...DEFAULT_ADMIN_EMAILS, ...parsed.map((e: string) => e.trim().toLowerCase())])
        );
      }
    }
  } catch (_) {}
  return DEFAULT_ADMIN_EMAILS;
}

export function saveAuthorizedAdminEmails(emails: string[]): void {
  if (typeof window === 'undefined') return;
  const clean = Array.from(
    new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))
  );
  safeSetLocalStorage(STORAGE_KEYS.ADMIN_EMAILS, JSON.stringify(clean));
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
}

export function setAuthenticated(status: boolean): void {
  if (typeof window !== 'undefined') {
    if (status) {
      safeSetLocalStorage(STORAGE_KEYS.AUTH, 'true');
      window.dispatchEvent(new CustomEvent('mummabee_auth_changed', { detail: { authenticated: true } }));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      window.dispatchEvent(new CustomEvent('mummabee_auth_changed', { detail: { authenticated: false } }));
    }
  }
}

export async function logout(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) {
    try {
      await signOut(auth);
    } catch (_) {}
  }
  setAuthenticated(false);
  try {
    const { setCurrentUser } = await import('./users');
    setCurrentUser(null);
  } catch (_) {}
}

export async function loginWithGoogle(): Promise<{ success: boolean; email?: string; role?: string; error?: string }> {
  const auth = getFirebaseAuth();
  if (!auth) {
    return { success: false, error: 'Firebase Auth is not available. Please try again.' };
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const userEmail = result.user?.email?.trim().toLowerCase();

    if (!userEmail) {
      await signOut(auth);
      setAuthenticated(false);
      return { success: false, error: 'Could not retrieve email from Google account.' };
    }

    const { getUsersList, findUserByEmail, resolveRoleForEmail, setCurrentUser } = await import('./users');
    const allUsers = getUsersList();
    const existingUser = findUserByEmail(userEmail);
    const authorizedAdmins = getAuthorizedAdminEmails().map((e) => e.trim().toLowerCase());

    const isAuthorized = existingUser || authorizedAdmins.includes(userEmail);

    if (!isAuthorized) {
      await signOut(auth);
      setAuthenticated(false);
      return {
        success: false,
        error: `Access Denied: The Google account "${userEmail}" is not registered in MummaBee CMS. Please contact the Administrator for an invite.`,
      };
    }

    if (existingUser && existingUser.status === 'Suspended') {
      await signOut(auth);
      setAuthenticated(false);
      return {
        success: false,
        error: `Access Denied: Your account (${userEmail}) is suspended. Please contact the Administrator.`,
      };
    }

    const role = existingUser ? existingUser.role : resolveRoleForEmail(userEmail);

    setCurrentUser({
      id: existingUser ? existingUser.id : `usr-g-${Date.now()}`,
      name: existingUser?.name || result.user.displayName || userEmail.split('@')[0],
      email: userEmail,
      role,
      authMethod: 'google',
    });

    setAuthenticated(true);
    return { success: true, email: userEmail, role };
  } catch (err: any) {
    console.error('Firebase Google sign-in error:', err?.code, err?.message);
    let errorMsg = err?.message || 'Google sign-in failed. Please try again.';
    if (err?.code === 'auth/popup-closed-by-user') {
      errorMsg = 'Sign-in cancelled. The Google popup was closed before completing.';
    } else if (err?.code === 'auth/popup-blocked') {
      errorMsg = 'The Google sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
    } else if (err?.code === 'auth/unauthorized-domain') {
      errorMsg = 'This domain is not authorized in Firebase Console. Please ensure mummabeeblog.com is added to Authorized Domains in Firebase Authentication.';
    } else if (err?.code === 'auth/cancelled-popup-request') {
      errorMsg = 'Another sign-in attempt is already in progress.';
    }
    return { success: false, error: errorMsg };
  }
}

export async function loginWithFirebase(emailInput: string, passwordInput: string): Promise<{ success: boolean; role?: string; error?: string }> {
  const cleanEmail = emailInput.trim().toLowerCase();

  // First, check local registered users (including newly created Assistant/Admin accounts)
  try {
    const { verifyCredentials, setCurrentUser } = await import('./users');
    const localCheck = verifyCredentials(cleanEmail, passwordInput);
    if (localCheck.success && localCheck.user) {
      setCurrentUser({
        id: localCheck.user.id,
        name: localCheck.user.name,
        email: localCheck.user.email,
        role: localCheck.user.role,
        authMethod: 'password',
      });
      setAuthenticated(true);
      return { success: true, role: localCheck.user.role };
    }
  } catch (_) {}

  const auth = getFirebaseAuth();

  if (!auth) {
    return { success: false, error: 'Authentication service is not available. Please try again.' };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
    if (userCredential?.user) {
      const { resolveRoleForEmail, findUserByEmail, setCurrentUser } = await import('./users');
      const existingUser = findUserByEmail(cleanEmail);
      const role = existingUser ? existingUser.role : resolveRoleForEmail(cleanEmail);

      setCurrentUser({
        id: existingUser ? existingUser.id : `usr-fb-${Date.now()}`,
        name: existingUser?.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        role,
        authMethod: 'password',
      });

      setAuthenticated(true);
      return { success: true, role };
    }
    return { success: false, error: 'Authentication failed. Please check your credentials.' };
  } catch (err: any) {
    console.error('Firebase Auth sign-in error:', err?.code, err?.message);
    let errorMsg = 'Invalid email or password. Please try again.';
    if (
      err?.code === 'auth/user-not-found' ||
      err?.code === 'auth/wrong-password' ||
      err?.code === 'auth/invalid-credential' ||
      err?.code === 'auth/invalid-email'
    ) {
      errorMsg = 'Incorrect email or password.';
    } else if (err?.code === 'auth/too-many-requests') {
      errorMsg = 'Too many failed attempts. Please wait a few minutes before trying again.';
    } else if (err?.code === 'auth/network-request-failed') {
      errorMsg = 'Network error. Please check your internet connection.';
    } else if (err?.code === 'auth/operation-not-allowed') {
      errorMsg = 'Email/Password sign-in provider is not enabled in Firebase Console (Authentication > Sign-in method).';
    }
    return { success: false, error: errorMsg };
  }
}
