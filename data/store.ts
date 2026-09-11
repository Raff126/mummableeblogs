'use client';

import { useState, useEffect } from 'react';
import { ARTICLES, Article } from './articles';
import { CATEGORIES, CategoryInfo } from './categories';
import {
  fetchArticlesFromFirestore,
  saveArticlesToFirestore,
  saveOneArticleToFirestore,
  deleteArticleFromFirestore,
  recoverArticleInFirestore,
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
  saveHistoryToFirestore,
  fetchHistoryFromFirestore,
  saveMediaToFirestore,
  fetchMediaFromFirestore,
  saveUsersToFirestore,
  fetchUsersFromFirestore,
  fetchGiveawayFromFirestore,
  saveGiveawayToFirestore,
  fetchGiveawayEntriesFromFirestore,
  saveGiveawayEntryToFirestore,
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
  saveHistoryToFirestore,
  fetchHistoryFromFirestore,
  saveMediaToFirestore,
  fetchMediaFromFirestore,
  saveUsersToFirestore,
  fetchUsersFromFirestore,
  fetchGiveawayFromFirestore,
  saveGiveawayToFirestore,
  fetchGiveawayEntriesFromFirestore,
  saveGiveawayEntryToFirestore,
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
  // Hero Proof Stats Strip
  heroStat1Number?: string;
  heroStat1Label?: string;
  heroStat2Number?: string;
  heroStat2Label?: string;
  heroStat3Number?: string;
  heroStat3Label?: string;
  // Discovery Section ("What are you looking for?")
  discoveryEyebrow?: string;
  discoveryHeadline?: string;
  discoveryCard1Desc?: string;
  discoveryCard2Desc?: string;
  discoveryCard3Desc?: string;
  discoveryCard4Desc?: string;
  // Explore by Topic or Location
  exploreEyebrow?: string;
  exploreHeadline?: string;
  // The Expat Edit Section
  expatEyebrow?: string;
  expatHeadline?: string;
  expatDescription?: string;
  // Credibility Highlight Section
  credibilityBadge?: string;
  credibilityHeadline?: string;
  credibilityDescription?: string;
  // Donne & Newsletter
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

export interface GiveawayCampaign {
  id: string;
  isActive: boolean;
  showOnHomepage?: boolean;
  pageActive?: boolean;
  badge: string;
  title: string;
  subtitle: string;
  prizeTitle: string;
  prizeDescription: string;
  prizeImage: string;
  entriesCloseText: string;
  step1Text: string;
  step2Text: string;
  step3Text: string;
  termsText: string;
  termsUrl?: string;
  thankYouHeading: string;
  thankYouMessage: string;
  closedHeading?: string;
  closedMessage?: string;
  relatedGuideLinkText?: string;
  relatedGuideUrl?: string;
  updatedAt?: string;
}

export interface GiveawayEntry {
  id: string;
  giveawayId: string;
  fullName: string;
  socialHandle: string;
  email: string;
  phone?: string;
  agreeTerms: boolean;
  optInNewsletter: boolean;
  submittedAt: string;
}

export const STORAGE_KEYS = {
  ARTICLES: 'mummabee_articles',
  DELETED_ARTICLES: 'mummabee_deleted_articles',
  DELETED_ARTICLES_ARCHIVE: 'mummabee_deleted_articles_archive',
  INSTAGRAM: 'mummabee_instagram',
  INQUIRIES: 'mummabee_inquiries',
  SUBSCRIBERS: 'mummabee_subscribers',
  DEALS: 'mummabee_deals',
  DELETED_DEALS: 'mummabee_deleted_deals',
  MEDIA: 'mummabee_media',
  DELETED_MEDIA: 'mummabee_deleted_media_ids',
  SETTINGS: 'mummabee_settings',
  HOMEPAGE: 'mummabee_homepage',
  ABOUT: 'mummabee_about',
  WORK_WITH_US: 'mummabee_work_with_us',
  CATEGORIES: 'mummabee_categories',
  AUTH: 'mummabee_auth',
  GOOD_TO_KNOW: 'mummabee_gtk_visibility',
  ADMIN_EMAILS: 'mummabee_admin_emails',
  GIVEAWAY: 'mummabee_giveaway',
  GIVEAWAY_ENTRIES: 'mummabee_giveaway_entries',
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
  // Hero Proof Stats
  heroStat1Number: '100+',
  heroStat1Label: 'TESTED GUIDES',
  heroStat2Number: '2 Cities',
  heroStat2Label: 'DUBAI & ABU DHABI',
  heroStat3Number: '100%',
  heroStat3Label: 'HONEST REVIEWS',
  // Discovery Section
  discoveryEyebrow: 'START EXPLORING',
  discoveryHeadline: 'What are you looking for?',
  discoveryCard1Desc: 'Activities, attractions and family days out',
  discoveryCard2Desc: 'Family-friendly places worth trying',
  discoveryCard3Desc: 'Tips, stays and practical itineraries',
  discoveryCard4Desc: 'School, motherhood and growing together',
  // Explore by Topic or Location
  exploreEyebrow: 'DISCOVER GUIDES',
  exploreHeadline: 'Explore by Topic or Location',
  // The Expat Edit
  expatEyebrow: 'CURATED ESSENTIALS FOR UAE FAMILIES',
  expatHeadline: 'The Expat Edit',
  expatDescription: 'Practical guides, school choices & community wisdom for raising kids in the Emirates',
  // Credibility Section
  credibilityBadge: 'AUTHENTIC UAE RECOMMENDATIONS',
  credibilityHeadline: 'Real experiences from a UAE family living between Dubai and Abu Dhabi.',
  credibilityDescription: 'Every guide is built on authentic parent perspective, practical timing advice, and genuine recommendations designed to help busy families make the most of life in the Emirates.',
  // Donne & Newsletter
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
  profileBadgeText: 'DONNE, ROB & THE GIRLS',
  profileHeading: 'How MummaBeeBlog Began',
  profileStory: "Hi, I'm Donne, the mum behind MummaBeeBlog.\n\nI'm a South African mum, content creator and wife to my Aussie husband, Rob. I have called the UAE home for more than 13 years, and we now live in Abu Dhabi with my two daughters, Leila and Luna.\n\nI started MummaBeeBlog 10 years ago as a place where I could share my experiences of motherhood and connect with other women going through the same joys, challenges and wonderfully messy moments. I wanted to create an honest space that showed real family life, not a perfectly edited version of it.\n\nA lot has changed since then. I have experienced divorce, raised my girls through major life changes and learned how to rebuild a life when things do not go according to plan. I later met Rob, my second husband, who became not only my partner in life but also a loving stepdad to Leila and Luna.\n\nTogether, we are building our beautifully blended family. Our life is full, busy, sometimes chaotic and always changing, which means there is rarely a dull moment in our home.\n\nOver the years, both the blog and I have grown. MummaBeeBlog has followed me through different stages of motherhood, divorce, new beginnings, remarriage, raising children, life as an expat and the everyday adventures that come with building a home away from home.\nToday, MummaBeeBlog is about much more than motherhood. It is a window into our family life in the UAE, with stories about parenting, relationships, blended family life, travel, food, lifestyle, personal growth and all the moments in between. It is a place where I can share what we love, what we are learning and the things that make family life a little easier, happier or more meaningful.\n\nAfter 10 years, my reason for sharing remains the same: to be real, to connect and to remind other women that none of us has everything figured out. Life can take us in directions we never expected, but there is always space to grow, begin again and create something beautiful.\n\nThank you for being part of our story. Whether you have followed MummaBeeBlog from the beginning or have only just found us, I'm so happy you're here.\n\nWelcome to MummaBeeBlog. Welcome to our life in the UAE.",
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

export const DEFAULT_GIVEAWAY: GiveawayCampaign = {
  id: 'giveaway-family-day-out-2026',
  isActive: true,
  showOnHomepage: true,
  pageActive: true,
  badge: 'MUMMABEE GIVEAWAY',
  title: 'Win a family day out in the UAE',
  subtitle: 'Enter below for your chance to win. Full details and terms apply.',
  prizeTitle: 'The prize',
  prizeDescription: 'A family experience to enjoy together. One winner will be selected after the giveaway closes.',
  prizeImage: '/images/358792494_661391199240576_3424351230899219709_n.jpg',
  entriesCloseText: 'Sunday 11:59 PM',
  step1Text: 'Fill in the form below',
  step2Text: 'Follow the giveaway details',
  step3Text: 'Wait for winner announcement',
  termsText: 'I have read and agree to the giveaway terms and privacy notice.',
  termsUrl: '/about',
  thankYouHeading: 'Thank you for entering!',
  thankYouMessage: "We've received your entry. Best of luck! The winner will be contacted directly via email and announced on our Instagram.",
  closedHeading: 'This Giveaway Has Ended',
  closedMessage: 'Thank you to everyone who entered! Entries are now closed while the winner is selected. Follow our Instagram @mummabeeblog for winner announcements and upcoming UAE family giveaways.',
  relatedGuideLinkText: 'Discover Tested UAE Family Days Out',
  relatedGuideUrl: '/uae-with-kids',
  updatedAt: '2026-09-11T00:00:00Z',
};

export function getInitialGiveaway(): GiveawayCampaign {
  if (typeof window === 'undefined') return DEFAULT_GIVEAWAY;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GIVEAWAY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_GIVEAWAY, ...parsed };
      }
    }
  } catch (_) {}
  return DEFAULT_GIVEAWAY;
}

export function saveGiveaway(campaign: GiveawayCampaign): void {
  if (typeof window === 'undefined') return;
  safeSetLocalStorage(STORAGE_KEYS.GIVEAWAY, JSON.stringify(campaign));
  window.dispatchEvent(new CustomEvent('mummabee_giveaway_updated', { detail: campaign }));

  import('../utils/firestoreSettings')
    .then(({ saveGiveawayToFirestore }) => {
      saveGiveawayToFirestore(campaign).catch((err) => {
        console.warn('Background saveGiveawayToFirestore error:', err);
      });
    })
    .catch(() => {});
}

export function getGiveawayEntries(): GiveawayEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GIVEAWAY_ENTRIES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (_) {}
  return [];
}

export function addGiveawayEntry(entryData: Omit<GiveawayEntry, 'id' | 'submittedAt'>): GiveawayEntry {
  const newEntry: GiveawayEntry = {
    ...entryData,
    id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    submittedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    const current = getGiveawayEntries();
    const updated = [newEntry, ...current];
    safeSetLocalStorage(STORAGE_KEYS.GIVEAWAY_ENTRIES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('mummabee_giveaway_entries_updated', { detail: updated }));

    if (entryData.optInNewsletter && entryData.email) {
      try {
        const subscribers = getInitialSubscribers();
        const cleanEmail = entryData.email.trim().toLowerCase();
        if (!subscribers.some((s) => s.email.toLowerCase() === cleanEmail)) {
          saveSubscribers([
            {
              id: `sub-${Date.now()}`,
              email: cleanEmail,
              date: new Date().toISOString().split('T')[0],
              source: 'Giveaway Entry',
              status: 'Active',
            },
            ...subscribers,
          ]);
        }
      } catch (_) {}
    }

    import('../utils/firestoreSettings')
      .then(({ saveGiveawayEntryToFirestore }) => {
        saveGiveawayEntryToFirestore(newEntry).catch((err) => {
          console.warn('Background saveGiveawayEntryToFirestore error:', err);
        });
      })
      .catch(() => {});
  }

  return newEntry;
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

export function unmarkArticleDeleted(idOrSlug: string): void {
  if (typeof window === 'undefined' || !idOrSlug) return;
  try {
    const deleted = getDeletedArticleIds();
    deleted.delete(idOrSlug);
    safeSetLocalStorage(
      STORAGE_KEYS.DELETED_ARTICLES || 'mummabee_deleted_articles',
      JSON.stringify(Array.from(deleted))
    );
  } catch (_) {}
}

export function saveToDeletedArchive(article: Article): void {
  if (typeof window === 'undefined' || !article) return;
  try {
    const archive = getArchivedDeletedArticles();
    const existingIdx = archive.findIndex((a) => a.id === article.id || (article.slug && a.slug === article.slug));
    let updated: Article[];
    if (existingIdx !== -1) {
      updated = archive.map((a, i) => (i === existingIdx ? article : a));
    } else {
      updated = [article, ...archive];
    }
    safeSetLocalStorage(STORAGE_KEYS.DELETED_ARTICLES_ARCHIVE, JSON.stringify(updated.slice(0, 100)));
  } catch (_) {}
}

export function getArchivedDeletedArticles(): Article[] {
  if (typeof window === 'undefined') return [];
  const deleted = getDeletedArticleIds();
  let archived: Article[] = [];
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DELETED_ARTICLES_ARCHIVE);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        archived = parsed;
      }
    }
  } catch (_) {}

  // Merge any articles from static ARTICLES or saved ARTICLES that are in deleted set
  const savedAll = localStorage.getItem(STORAGE_KEYS.ARTICLES);
  let allPool: Article[] = ARTICLES;
  if (savedAll) {
    try {
      const parsed = JSON.parse(savedAll);
      if (Array.isArray(parsed)) {
        allPool = [...parsed, ...ARTICLES];
      }
    } catch (_) {}
  }

  // Include any deleted article from allPool if not already in archived
  deleted.forEach((delKey) => {
    const exists = archived.some((a) => a.id === delKey || a.slug === delKey);
    if (!exists) {
      const found = allPool.find((a) => a.id === delKey || a.slug === delKey);
      if (found) {
        archived.push(found);
      }
    }
  });

  return archived;
}

export function getArticleByIdOrSlug(idOrSlug: string, includeDeleted = true): Article | undefined {
  if (!idOrSlug) return undefined;
  const current = getInitialArticles();
  const found = current.find((a) => a.id === idOrSlug || a.slug === idOrSlug);
  if (found) return found;

  if (includeDeleted) {
    const archived = getArchivedDeletedArticles();
    const foundArchived = archived.find((a) => a.id === idOrSlug || a.slug === idOrSlug);
    if (foundArchived) return foundArchived;

    const foundStatic = ARTICLES.find((a) => a.id === idOrSlug || a.slug === idOrSlug);
    if (foundStatic) return foundStatic;
  }
  return undefined;
}

export async function recoverArticle(idOrSlug: string): Promise<Article | null> {
  if (typeof window === 'undefined' || !idOrSlug) return null;

  // 1. Locate the article from archive or static database
  const target = getArticleByIdOrSlug(idOrSlug, true);
  if (!target) return null;

  // 2. Unmark deletion in localStorage
  unmarkArticleDeleted(target.id);
  if (target.slug) {
    unmarkArticleDeleted(target.slug);
  }

  // 3. Remove tombstone from Firestore & restore document (in background)
  recoverArticleInFirestore(target.id, target.slug, target as any).catch((err) => {
    console.warn('Firestore recoverArticle notice:', err);
  });

  // 4. Save article into active list as Draft (or original status) so user can safely review & edit
  const recovered: Article = {
    ...target,
    isDraft: true,
    status: 'draft',
    lastUpdated: new Date().toISOString(),
  };

  const current = getInitialArticles();
  const exists = current.some((a) => a.id === recovered.id || (recovered.slug && a.slug === recovered.slug));
  const updated = exists
    ? current.map((a) => (a.id === recovered.id || (recovered.slug && a.slug === recovered.slug) ? recovered : a))
    : [recovered, ...current];

  await saveArticles(updated);

  // 5. Remove from archive
  try {
    const archive = getArchivedDeletedArticles().filter(
      (a) => a.id !== target.id && (!target.slug || a.slug !== target.slug)
    );
    safeSetLocalStorage(STORAGE_KEYS.DELETED_ARTICLES_ARCHIVE, JSON.stringify(archive));
  } catch (_) {}

  // 6. Record recovery audit log in History and resolve past deletion entries
  try {
    const { recordContentChange, resolveArticleDeletionInHistory } = await import('./history');
    resolveArticleDeletionInHistory(recovered.id, recovered.slug, recovered.title, true);

    const catFormatted = recovered.category
      ? recovered.category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      : 'General';

    recordContentChange({
      id: `rec-art-${recovered.id}-${Date.now()}`,
      type: 'draft',
      action: 'drafted',
      title: `Recovered: ${recovered.title}`,
      summary: `Successfully recovered deleted article "${recovered.title}" from trash archive and restored to Drafts.`,
      category: catFormatted,
      author: recovered.author || 'Donne',
      status: 'Draft',
      badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      editLink: `/admin/articles/${recovered.id}`,
    });
  } catch (_) {}

  // 7. Dispatch events
  window.dispatchEvent(new CustomEvent('mummabee_content_updated', { detail: { key: STORAGE_KEYS.ARTICLES, data: updated } }));
  window.dispatchEvent(new CustomEvent('mummabee_history_updated'));

  return recovered;
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
  const target = currentArticles.find((a) => a.id === id || (slug && a.slug === slug)) || ARTICLES.find((a) => a.id === id || (slug && a.slug === slug));
  const finalSlug = slug || target?.slug;

  if (target) {
    saveToDeletedArchive(target);
  }

  markArticleDeleted(id);
  if (finalSlug) markArticleDeleted(finalSlug);

  // Also clean up and remove the article's picture from the Media Library so it doesn't linger
  if (target?.featuredImage) {
    try {
      const currentMedia = getInitialMedia();
      const targetImg = target.featuredImage;
      const updatedMedia = currentMedia.filter((m) => {
        if (m.url === targetImg) return false;
        // For base64 images, compare first 100 chars to handle minor encoding differences
        if (targetImg.startsWith('data:image/') && m.url.startsWith('data:image/') && targetImg.length > 200 && m.url.length > 200) {
          return m.url.slice(0, 100) !== targetImg.slice(0, 100);
        }
        return true;
      });
      if (updatedMedia.length !== currentMedia.length) {
        saveMedia(updatedMedia);
      }
    } catch (_) {}
  }

  // Record deletion in content history with clean archive log
  try {
    const { recordContentChange } = await import('./history');
    const targetTitle = target?.title || id;
    const targetCategory = target?.category 
      ? target.category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) 
      : 'General';

    recordContentChange({
      id: `del-art-${id}-${Date.now()}`,
      type: 'article',
      action: 'deleted',
      title: `Deleted: ${targetTitle}`,
      summary: target 
        ? `Permanently removed article "${targetTitle}" from category "${targetCategory}".` 
        : `Removed article record (${id}).`,
      category: targetCategory,
      author: target?.author || 'Donne',
      status: 'Deleted',
      badgeColor: 'bg-rose-100 text-rose-800 border border-rose-300',
      editLink: `/admin/articles/${id}`,
    });
  } catch (_) {}

  // Delete from Firestore for persistent cross-device deletion (in background)
  deleteArticleFromFirestore(id, finalSlug).catch((err) => {
    console.warn('Firestore delete failed (will rely on localStorage):', err);
  });

  const current = currentArticles.filter(
    (a) => a.id !== id && (!finalSlug || a.slug !== finalSlug)
  );
  return saveArticles(current);
}

export async function saveArticles(articles: Article[]): Promise<boolean> {
  if (typeof window !== 'undefined') {
    const nowIso = new Date().toISOString();
    // 1. Strictly synchronize isDraft and status, and sanitize slug length across all articles
    const normalizedArticles = articles.map((a) => {
      const isDraft = Boolean(a.isDraft ?? (a.status === 'draft'));
      const rawSlug = a.slug || a.id;
      const cleanSlug = rawSlug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 80)
        .replace(/-+$/, '');

      return {
        ...a,
        slug: cleanSlug || a.id,
        isDraft,
        status: (isDraft ? 'draft' : 'published') as 'published' | 'draft',
        lastUpdated: a.lastUpdated || nowIso,
        showGoodToKnow: a.showGoodToKnow ?? true,
        goodToKnowEnabled: a.goodToKnowEnabled ?? true,
      };
    });

    // 2. Save to localStorage immediately for instant UI feedback
    safeSetLocalStorage(STORAGE_KEYS.ARTICLES, JSON.stringify(normalizedArticles));
    window.dispatchEvent(new CustomEvent('mummabee_content_updated', { detail: { key: STORAGE_KEYS.ARTICLES, data: normalizedArticles } }));

    // 3. Sync to Firestore with await for cross-device consistency
    try {
      await saveArticlesToFirestore(normalizedArticles as FirestoreArticle[]);
    } catch (err) {
      console.warn('Firestore sync background notice (localStorage preserved):', err);
    }

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
 * Fast direct save for a single article document to Firestore and localStorage.
 * Automatically computes Before & After diffs and records to Content History.
 */
export async function saveOneArticle(article: Article): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const isDraft = Boolean(article.isDraft ?? (article.status === 'draft'));
  const rawSlug = article.slug || article.id;
  const cleanSlug = rawSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');

  const nowIso = new Date().toISOString();
  const normalized: Article = {
    ...article,
    slug: cleanSlug || article.id,
    isDraft,
    status: isDraft ? 'draft' : 'published',
    lastUpdated: article.lastUpdated || nowIso,
    showGoodToKnow: article.showGoodToKnow ?? true,
    goodToKnowEnabled: article.goodToKnowEnabled ?? true,
  };

  const current = getInitialArticles();
  const idx = current.findIndex((a) => a.id === normalized.id || (normalized.slug && a.slug === normalized.slug));
  const prevArticle = idx !== -1 ? current[idx] : undefined;

  let updated: Article[];
  if (idx !== -1) {
    updated = current.map((a, i) => (i === idx ? normalized : a));
  } else {
    updated = [normalized, ...current];
  }

  // Record Before & After history changes automatically
  try {
    const { computeArticleChanges, recordContentChange } = await import('./history');
    const changes = computeArticleChanges(prevArticle, normalized);

    let action: 'published' | 'drafted' | 'updated' | 'created' = 'updated';
    let status: 'Published' | 'Draft' | 'Updated' = normalized.isDraft ? 'Draft' : 'Published';
    let historyTitle = '';

    const prevIsDraft = prevArticle ? Boolean(prevArticle.isDraft || prevArticle.status === 'draft') : false;
    if (!prevArticle) {
      action = normalized.isDraft ? 'drafted' : 'published';
      historyTitle = normalized.isDraft ? `Draft Created: ${normalized.title}` : `Article Published: ${normalized.title}`;
    } else if (prevIsDraft && !normalized.isDraft) {
      action = 'published';
      status = 'Published';
      historyTitle = `Published: ${normalized.title}`;
    } else if (!prevIsDraft && normalized.isDraft) {
      action = 'drafted';
      status = 'Draft';
      historyTitle = `Unpublished to Draft: ${normalized.title}`;
    } else if (normalized.isDraft) {
      action = 'drafted';
      status = 'Draft';
      historyTitle = `Draft Updated: ${normalized.title}`;
    } else {
      action = 'updated';
      status = 'Updated';
      historyTitle = `Article Updated: ${normalized.title}`;
    }

    const catFormatted = normalized.category
      ? normalized.category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      : 'General';

    recordContentChange({
      id: `art-chg-${normalized.id}-${Date.now()}`,
      type: normalized.isDraft ? 'draft' : 'article',
      action,
      title: historyTitle,
      summary: normalized.excerpt
        ? (normalized.excerpt.length > 130 ? normalized.excerpt.slice(0, 130) + '...' : normalized.excerpt)
        : `${historyTitle} in category ${catFormatted}.`,
      category: catFormatted,
      author: normalized.author || 'Donne',
      status,
      badgeColor: normalized.isDraft
        ? 'bg-amber-100 text-amber-900 border border-amber-300'
        : 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      viewLink: normalized.isDraft ? undefined : `/${normalized.category}/${normalized.slug}`,
      editLink: `/admin/articles/${normalized.id}`,
      changes,
    });
  } catch (_) {}

  // Update localStorage immediately
  safeSetLocalStorage(STORAGE_KEYS.ARTICLES, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('mummabee_content_updated', { detail: { key: STORAGE_KEYS.ARTICLES, data: updated } }));

  // Save single document directly to Firestore with await
  try {
    await saveOneArticleToFirestore(normalized as FirestoreArticle);
  } catch (err) {
    console.warn('Firestore saveOneArticle notice:', err);
  }

  const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
  if (isLocalhost) {
    fetch('/api/articles/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {});
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

      const localMap = new Map<string, Article>();
      const localSlugMap = new Map<string, Article>();
      for (const a of localArticles) {
        if (a.id) localMap.set(a.id, a);
        if (a.slug) localSlugMap.set(a.slug, a);
      }

      // Map to hold merged articles keyed by id
      const mergedMap = new Map<string, FirestoreArticle>();

      // Process Firestore articles with timestamp comparison
      for (const fsArt of firestoreArticles) {
        const local = localMap.get(fsArt.id) || (fsArt.slug ? localSlugMap.get(fsArt.slug) : undefined);
        if (local) {
          const fsTime = fsArt.lastUpdated ? new Date(fsArt.lastUpdated).getTime() : 0;
          const localTime = local.lastUpdated ? new Date(local.lastUpdated).getTime() : 0;
          // If local has a newer timestamp or was updated within the last 5 minutes, preserve local!
          const isRecentLocal = localTime > 0 && (Date.now() - localTime < 300000);
          if (localTime > fsTime || (isRecentLocal && localTime >= fsTime)) {
            mergedMap.set(fsArt.id, local as FirestoreArticle);
            // Asynchronously sync local to Firestore so cloud catches up
            saveOneArticleToFirestore(local as FirestoreArticle).catch(() => {});
            continue;
          }
        }
        mergedMap.set(fsArt.id, fsArt);
      }

      // Preserve any locally created / updated articles that aren't in Firestore yet
      for (const localArt of localArticles) {
        if (!mergedMap.has(localArt.id) && (!localArt.slug || !firestoreArticles.some((f) => f.slug === localArt.slug))) {
          const isDeleted = deleted.has(localArt.id) || (localArt.slug && deleted.has(localArt.slug));
          if (!isDeleted) {
            mergedMap.set(localArt.id, localArt as FirestoreArticle);
          }
        }
      }

      // Add any static JSON articles that aren't in Firestore, aren't local, and aren't deleted
      for (const staticArt of ARTICLES) {
        if (!mergedMap.has(staticArt.id) && (!staticArt.slug || !firestoreArticles.some((f) => f.slug === staticArt.slug))) {
          const isDeleted = deleted.has(staticArt.id) || (staticArt.slug && deleted.has(staticArt.slug));
          if (!isDeleted) {
            mergedMap.set(staticArt.id, staticArt as FirestoreArticle);
          }
        }
      }

      const merged = Array.from(mergedMap.values());
      const filtered = merged.filter(
        (a) => !deleted.has(a.id) && (!a.slug || !deleted.has(a.slug))
      );

      // Strictly normalize status and isDraft property
      const finalArticles = filtered.map((a) => {
        const isDraft = Boolean(a.isDraft ?? (a.status === 'draft'));
        return {
          ...a,
          isDraft,
          status: (isDraft ? 'draft' : 'published') as 'published' | 'draft',
        };
      }) as Article[];

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
        const finalArticles = filtered.map((a: Article) => {
          const isDraft = Boolean(a.isDraft ?? (a.status === 'draft'));
          return {
            ...a,
            isDraft,
            status: (isDraft ? 'draft' : 'published') as 'published' | 'draft',
          };
        });
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
  const prevVal = current[idOrSlug] ?? true;
  current[idOrSlug] = visible;
  safeSetLocalStorage(STORAGE_KEYS.GOOD_TO_KNOW, JSON.stringify(current));
  window.dispatchEvent(new CustomEvent('mummabee_content_updated', {
    detail: { key: STORAGE_KEYS.GOOD_TO_KNOW, data: current, target: idOrSlug, visible }
  }));

  try {
    import('./history').then(({ recordContentChange }) => {
      recordContentChange({
        id: `gtk-${idOrSlug}-${Date.now()}`,
        type: 'article',
        action: 'updated',
        title: `Good-to-Know Tip Box: ${visible ? 'Enabled' : 'Hidden'}`,
        summary: `${visible ? 'Turned ON' : 'Turned OFF'} the MummaBee Good-to-Know parent box for article "${idOrSlug}".`,
        category: 'Article Settings',
        author: 'Donne',
        status: 'Updated',
        badgeColor: 'bg-[#683846] text-white',
        changes: [
          {
            field: 'goodToKnowEnabled',
            label: 'Good to Know Tips Box',
            before: prevVal ? 'Visible' : 'Hidden',
            after: visible ? 'Visible' : 'Hidden',
          },
        ],
      });
    }).catch(() => {});
  } catch (_) {}
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
  const prevDeals = getInitialDeals();
  if (deletedId) {
    if (Array.isArray(deletedId)) {
      deletedId.forEach((id) => markDealDeleted(id));
    } else {
      markDealDeleted(deletedId);
    }

    try {
      const { recordContentChange } = await import('./history');
      const deletedIds = Array.isArray(deletedId) ? deletedId : [deletedId];
      deletedIds.forEach((id) => {
        const targetDeal = prevDeals.find((d) => d.id === id);
        recordContentChange({
          id: `del-deal-${id}-${Date.now()}`,
          type: 'deal',
          action: 'deleted',
          title: `Deal Removed: ${targetDeal?.title || id}`,
          summary: targetDeal ? `Removed promo code ${targetDeal.code} for ${targetDeal.title}.` : `Deleted promo code ${id}.`,
          category: 'Deals',
          author: 'Donne',
          status: 'Deleted',
          badgeColor: 'bg-rose-100 text-rose-800 border border-rose-300',
        });
      });
    } catch (_) {}
  }
  const deleted = getDeletedDealIds();
  const filtered = deals.filter((d) => !deleted.has(d.id));

  // Log newly added or edited deals
  if (!deletedId && filtered.length > 0) {
    try {
      const { recordContentChange } = await import('./history');
      filtered.forEach((deal) => {
        const prev = prevDeals.find((d) => d.id === deal.id);
        if (!prev) {
          recordContentChange({
            id: `add-deal-${deal.id}-${Date.now()}`,
            type: 'deal',
            action: 'created',
            title: `New Promo Code: ${deal.title} (${deal.code})`,
            summary: `Added ${deal.discountBadge || ''} discount code ${deal.code} for ${deal.title}.`,
            category: 'Deals',
            author: 'Donne',
            status: 'Published',
            badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
            viewLink: '/uae-deals',
            editLink: '/admin/deals',
            changes: [
              { field: 'code', label: 'Promo Code', before: 'None', after: deal.code },
              { field: 'discountBadge', label: 'Discount', before: 'None', after: deal.discountBadge || 'Standard Offer' },
              { field: 'title', label: 'Partner / Brand', before: 'None', after: deal.title },
            ],
          });
        } else if (prev.code !== deal.code || prev.title !== deal.title || prev.discountBadge !== deal.discountBadge || prev.link !== deal.link) {
          recordContentChange({
            id: `chg-deal-${deal.id}-${Date.now()}`,
            type: 'deal',
            action: 'updated',
            title: `Updated Promo Code: ${deal.title} (${deal.code})`,
            summary: `Updated discount code details for ${deal.title}.`,
            category: 'Deals',
            author: 'Donne',
            status: 'Updated',
            badgeColor: 'bg-[#D79A30] text-white',
            viewLink: '/uae-deals',
            editLink: '/admin/deals',
            changes: [
              ...(prev.code !== deal.code ? [{ field: 'code', label: 'Promo Code', before: prev.code, after: deal.code }] : []),
              ...(prev.discountBadge !== deal.discountBadge ? [{ field: 'discountBadge', label: 'Discount', before: prev.discountBadge || 'None', after: deal.discountBadge || 'None' }] : []),
              ...(prev.title !== deal.title ? [{ field: 'title', label: 'Brand Name', before: prev.title, after: deal.title }] : []),
              ...(prev.link !== deal.link ? [{ field: 'link', label: 'Target Link', before: prev.link || 'None', after: deal.link || 'None' }] : []),
            ],
          });
        }
      });
    } catch (_) {}
  }

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

export function getDeletedMediaIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_MEDIA);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (_) {}
  return new Set();
}

export function markMediaDeleted(idOrUrl: string): void {
  if (typeof window === 'undefined' || !idOrUrl) return;
  const set = getDeletedMediaIds();
  set.add(idOrUrl);
  safeSetLocalStorage(STORAGE_KEYS.DELETED_MEDIA, JSON.stringify(Array.from(set)));
}

export function getInitialMedia(): MediaItem[] {
  if (typeof window === 'undefined') return DEFAULT_MEDIA;
  const deleted = getDeletedMediaIds();
  const saved = localStorage.getItem(STORAGE_KEYS.MEDIA);
  try {
    const parsed = saved ? JSON.parse(saved) : DEFAULT_MEDIA;
    return Array.isArray(parsed)
      ? parsed.filter((m: MediaItem) => !deleted.has(m.id) && !deleted.has(m.url))
      : DEFAULT_MEDIA.filter((m: MediaItem) => !deleted.has(m.id) && !deleted.has(m.url));
  } catch (e) {
    return DEFAULT_MEDIA.filter((m: MediaItem) => !deleted.has(m.id) && !deleted.has(m.url));
  }
}

export async function saveMedia(items: MediaItem[], deletedId?: string | string[]): Promise<boolean> {
  const prevMedia = getInitialMedia();
  if (deletedId) {
    if (Array.isArray(deletedId)) {
      deletedId.forEach((id) => markMediaDeleted(id));
    } else {
      markMediaDeleted(deletedId);
    }

    try {
      const { recordContentChange } = await import('./history');
      const deletedIds = Array.isArray(deletedId) ? deletedId : [deletedId];
      deletedIds.forEach((id) => {
        const target = prevMedia.find((m) => m.id === id || m.url === id);
        const cleanName = target?.filename && !target.filename.startsWith('data:')
          ? target.filename
          : (id.startsWith('data:') ? 'Pasted Photo' : id);
        recordContentChange({
          id: `del-media-${id.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`,
          type: 'media',
          action: 'deleted',
          title: `Image Deleted: ${cleanName}`,
          summary: `Deleted media file "${cleanName}" from library.`,
          category: 'Media',
          author: 'Donne',
          status: 'Deleted',
          badgeColor: 'bg-rose-100 text-rose-800 border border-rose-300',
        });
      });
    } catch (_) {}
  }

  const deleted = getDeletedMediaIds();
  const filtered = items.filter((m) => !deleted.has(m.id) && !deleted.has(m.url));
  const trimmed = filtered.slice(0, 40);
  safeSetLocalStorage(STORAGE_KEYS.MEDIA, JSON.stringify(trimmed));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mummabee_content_updated', {
        detail: { key: STORAGE_KEYS.MEDIA, data: trimmed },
      })
    );

    // Sync to Firestore without blocking caller
    saveMediaToFirestore(trimmed, Array.from(deleted)).catch((e) => {
      console.warn('Could not sync media with Firestore:', e);
    });
  }
  return true;
}

export async function deleteMediaItem(id: string, url?: string): Promise<boolean> {
  markMediaDeleted(id);
  if (url) markMediaDeleted(url);
  const current = getInitialMedia();
  const remaining = current.filter((m) => m.id !== id && (!url || m.url !== url));
  return await saveMedia(remaining, url ? [id, url] : id);
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
  const prevSettings = getInitialSettings();
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

    try {
      const { computeSettingsChanges, recordContentChange } = await import('./history');
      const changes = computeSettingsChanges(prevSettings, settings);
      recordContentChange({
        id: `chg-settings-${Date.now()}`,
        type: 'settings',
        action: 'updated',
        title: 'Site Settings & SEO Updated',
        summary: 'Updated website settings, social links, or SEO configuration.',
        category: 'Settings',
        author: 'Donne',
        status: 'Updated',
        badgeColor: 'bg-[#683846] text-white',
        editLink: '/admin/settings',
        changes,
      });
    } catch (_) {}

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
  const prevHp = getInitialHomepage();
  const withTime: HomepageContent = {
    ...hp,
    updatedAt: new Date().toISOString(),
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

    // Record in history log with granular Before & After diffs
    try {
      const { computeHomepageChanges, recordContentChange } = await import('./history');
      const changes = computeHomepageChanges(prevHp, hp);
      recordContentChange({
        id: `chg-home-${Date.now()}`,
        type: 'homepage',
        action: 'updated',
        title: 'Homepage Layout & Content Updated',
        summary: hp.heroHeadline ? `Updated hero headline: "${hp.heroHeadline.slice(0, 50)}"` : 'Updated homepage sections and Donne introduction.',
        category: 'Homepage',
        author: 'Donne',
        status: 'Updated',
        badgeColor: 'bg-[#683846] text-white',
        viewLink: '/',
        editLink: '/admin/homepage',
        changes,
      });
    } catch (_) {}

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
  const prevAbout = getInitialAbout();
  const withTime: AboutPageContent = {
    ...about,
    updatedAt: new Date().toISOString(),
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

    // Record in history log with granular Before & After diffs
    try {
      const { computeAboutChanges, recordContentChange } = await import('./history');
      const changes = computeAboutChanges(prevAbout, about);
      recordContentChange({
        id: `chg-about-${Date.now()}`,
        type: 'page',
        action: 'updated',
        title: 'About Page Content Updated',
        summary: about.headline ? `Updated About Page: "${about.headline.slice(0, 50)}"` : 'Updated About Us story, family introduction and core trust pillars.',
        category: 'About Us',
        author: 'Donne',
        status: 'Updated',
        badgeColor: 'bg-[#B75B70] text-white',
        viewLink: '/about',
        editLink: '/admin/about',
        changes,
      });
    } catch (_) {}

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
  const prevContent = getInitialWorkWithUs();
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

    try {
      const { computeWorkWithUsChanges, recordContentChange } = await import('./history');
      const changes = computeWorkWithUsChanges(prevContent, content);
      recordContentChange({
        id: `chg-wwu-${Date.now()}`,
        type: 'page',
        action: 'updated',
        title: 'Work With Us Page Updated',
        summary: 'Updated brand collaboration statistics, media kit information, or offerings.',
        category: 'Work With Us',
        author: 'Donne',
        status: 'Updated',
        badgeColor: 'bg-[#B75B70] text-white',
        viewLink: '/work-with-us',
        editLink: '/admin/work-with-us',
        changes,
      });
    } catch (_) {}

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
  const prevCats = getInitialCategories();
  safeSetLocalStorage(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mummabee_content_updated', { detail: { key: STORAGE_KEYS.CATEGORIES, data: cats } }));
    try {
      import('./history').then(({ recordContentChange }) => {
        const catKeys = Object.keys(cats);
        catKeys.forEach((key) => {
          const prev = prevCats[key];
          const curr = cats[key];
          if (!prev) {
            recordContentChange({
              id: `add-cat-${key}-${Date.now()}`,
              type: 'category',
              action: 'created',
              title: `Category Created: ${curr.name}`,
              summary: `Created new category hub ${curr.name} (slug: ${key}).`,
              category: 'Categories',
              author: 'Donne',
              status: 'Published',
              badgeColor: 'bg-[#4D7987] text-white',
              viewLink: `/${key}`,
              editLink: '/admin/categories',
              changes: [
                { field: 'name', label: 'Category Name', before: 'None', after: curr.name },
                { field: 'slug', label: 'Slug Route', before: 'None', after: key },
              ],
            });
          } else if (prev.name !== curr.name || prev.description !== curr.description) {
            recordContentChange({
              id: `chg-cat-${key}-${Date.now()}`,
              type: 'category',
              action: 'updated',
              title: `Category Updated: ${curr.name}`,
              summary: `Updated title or description for category hub ${curr.name}.`,
              category: 'Categories',
              author: 'Donne',
              status: 'Updated',
              badgeColor: 'bg-[#4D7987] text-white',
              viewLink: `/${key}`,
              editLink: '/admin/categories',
              changes: [
                ...(prev.name !== curr.name ? [{ field: 'name', label: 'Category Name', before: prev.name, after: curr.name }] : []),
                ...(prev.description !== curr.description ? [{ field: 'description', label: 'Description', before: prev.description || 'None', after: curr.description || 'None' }] : []),
              ],
            });
          }
        });
      }).catch(() => {});
    } catch (_) {}
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
    const { verifyCredentials, setCurrentUser, syncUsersFromFirestore, findUserByEmail } = await import('./users');
    let localCheck = verifyCredentials(cleanEmail, passwordInput);

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

    // If user is not found locally, fetch latest accounts from Cloud Firestore (for incognito or other browser sessions)
    if (!findUserByEmail(cleanEmail)) {
      await syncUsersFromFirestore();
      localCheck = verifyCredentials(cleanEmail, passwordInput);
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
    }

    // If account is recognized in our system but failed (e.g. suspended or wrong password), return exact error
    if (findUserByEmail(cleanEmail)) {
      return {
        success: false,
        error: localCheck.error || 'Incorrect password for this account.',
      };
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
