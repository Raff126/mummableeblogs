'use client';

import { useState, useEffect } from 'react';
import { ARTICLES, Article } from './articles';
import { CATEGORIES, CategoryInfo } from './categories';

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
  INSTAGRAM: 'mummabee_instagram',
  INQUIRIES: 'mummabee_inquiries',
  SUBSCRIBERS: 'mummabee_subscribers',
  DEALS: 'mummabee_deals',
  MEDIA: 'mummabee_media',
  SETTINGS: 'mummabee_settings',
  HOMEPAGE: 'mummabee_homepage',
  ABOUT: 'mummabee_about',
  WORK_WITH_US: 'mummabee_work_with_us',
  CATEGORIES: 'mummabee_categories',
  AUTH: 'mummabee_auth',
  GOOD_TO_KNOW: 'mummabee_gtk_visibility',
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

export function getInitialArticles(): Article[] {
  if (typeof window === 'undefined') return ARTICLES;
  const saved = localStorage.getItem(STORAGE_KEYS.ARTICLES);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const savedIds = new Set(parsed.map((a: Article) => a.id));
        const savedSlugs = new Set(parsed.map((a: Article) => a.slug));
        const missing = ARTICLES.filter((a) => !savedIds.has(a.id) && !savedSlugs.has(a.slug));
        return [...parsed, ...missing];
      }
    } catch (e) {}
  }
  return ARTICLES;
}

export async function saveArticles(articles: Article[]): Promise<boolean> {
  if (typeof window !== 'undefined') {
    safeSetLocalStorage(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
    window.dispatchEvent(new CustomEvent('mummabee_content_updated', { detail: { key: STORAGE_KEYS.ARTICLES, data: articles } }));

    // Only attempt server sync if running locally on development server
    const isLocalhost = Boolean(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0'
    );
    if (isLocalhost) {
      try {
        const response = await fetch('/api/articles/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(articles),
        });
        return response.ok;
      } catch (err) {
        // Silently skip if endpoint unavailable
        return true;
      }
    }
  }
  return true;
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

export function saveInstagramPosts(posts: InstagramPost[]): void {
  safeSetLocalStorage(STORAGE_KEYS.INSTAGRAM, JSON.stringify(posts));
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

export function getInitialDeals(): DiscountCode[] {
  if (typeof window === 'undefined') return DEFAULT_DEALS;
  const saved = localStorage.getItem(STORAGE_KEYS.DEALS);
  try {
    return saved ? JSON.parse(saved) : DEFAULT_DEALS;
  } catch (e) {
    return DEFAULT_DEALS;
  }
}

export async function saveDeals(deals: DiscountCode[]): Promise<boolean> {
  safeSetLocalStorage(STORAGE_KEYS.DEALS, JSON.stringify(deals));
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      try {
        await fetch('/api/deals/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deals),
        });
      } catch (e) {
        console.warn('Could not sync deals with API:', e);
      }
    }
    window.dispatchEvent(new CustomEvent('mummabee_content_updated', { detail: { key: STORAGE_KEYS.DEALS, data: deals } }));
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

export function saveSettings(settings: SiteSettings): void {
  safeSetLocalStorage(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
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
  safeSetLocalStorage(STORAGE_KEYS.HOMEPAGE, JSON.stringify(hp));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mummabee_content_updated', { detail: { key: STORAGE_KEYS.HOMEPAGE, data: hp } }));
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      try {
        await fetch('/api/homepage/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(hp),
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
  safeSetLocalStorage(STORAGE_KEYS.ABOUT, JSON.stringify(about));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mummabee_content_updated', { detail: { key: STORAGE_KEYS.ABOUT, data: about } }));
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      try {
        await fetch('/api/about/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(about),
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
    window.dispatchEvent(new CustomEvent('mummabee_content_updated', { detail: { key: STORAGE_KEYS.WORK_WITH_US, data: content } }));
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
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

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
}

export async function loginWithFirebase(emailInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = emailInput.trim();
  const auth = getFirebaseAuth();

  if (!auth) {
    return { success: false, error: 'Firebase Auth is not available. Please try again.' };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
    if (userCredential?.user) {
      setAuthenticated(true);
      return { success: true };
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
