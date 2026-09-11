// Website & Admin Content History Engine
// Tracks all editorial content updates, drafts, publications, deletions, homepage changes, about page changes, and discount code updates.
// Provides granular Before & After diff tracking for complete system auditability.

import { ArticleItem } from './articles';
import articlesData from './articles.json';
import type {
  Article,
  HomepageContent,
  AboutPageContent,
  DiscountCode,
  WorkWithUsPageContent,
  SiteSettings,
} from './store';
import type { CategoryInfo } from './categories';

export interface HistoryChangeDetail {
  field: string;
  label: string;
  before: string | null;
  after: string | null;
}

export interface ContentHistoryItem {
  id: string;
  timestamp: string; // ISO string
  type: 'article' | 'draft' | 'homepage' | 'deal' | 'category' | 'page' | 'settings' | 'media';
  action: 'published' | 'drafted' | 'updated' | 'created' | 'deleted';
  title: string;
  summary: string;
  category?: string;
  author: string;
  status: 'Published' | 'Draft' | 'Updated' | 'Deleted';
  badgeColor: string;
  viewLink?: string;
  editLink?: string;
  changes?: HistoryChangeDetail[];
}

const STORAGE_KEY = 'mummabee_content_history_custom';

// Baseline editorial changes logged with rich Before & After values
const SEED_MANUAL_CHANGES: ContentHistoryItem[] = [
  {
    id: 'chg-about-sync-2026',
    timestamp: '2026-09-09T09:32:00Z',
    type: 'page',
    action: 'updated',
    title: 'About Us Story & Family Badge Synchronized',
    summary: 'Updated profile story to Donne\'s 10-year personal journey in the UAE, badge to "DONNE, ROB & THE GIRLS", and reinforced cloud sync.',
    category: 'About Us',
    author: 'Donne',
    status: 'Updated',
    badgeColor: 'bg-[#B75B70] text-white',
    viewLink: '/about',
    editLink: '/admin/about',
    changes: [
      {
        field: 'profileBadgeText',
        label: 'Badge Text',
        before: 'DONNE & HER GIRLS',
        after: 'DONNE, ROB & THE GIRLS',
      },
      {
        field: 'profileStory',
        label: 'Author Personal Story',
        before: 'When we moved to the UAE with our two young daughters, every weekend started with the same question: \'Where can we go today that everyone will actually enjoy?\'...',
        after: 'Hi, I\'m Donne, the mum behind MummaBeeBlog. I\'m a South African mum, content creator and wife to my Aussie husband, Rob. I have called the UAE home for more than 13 years...',
      },
      {
        field: 'updatedAt',
        label: 'Cloud Sync Timestamp',
        before: '2026-09-08T13:06:55.676Z (locked)',
        after: '2026-09-09T09:32:00.000Z (auto-refreshed on save)',
      },
    ],
  },
  {
    id: 'chg-exp-edit',
    timestamp: '2026-09-09T08:31:00Z',
    type: 'homepage',
    action: 'updated',
    title: 'The Expat Edit Section Integrated',
    summary: 'Configured dynamic article display on homepage for The Expat Edit category.',
    category: 'The Expat Edit',
    author: 'Donne',
    status: 'Updated',
    badgeColor: 'bg-[#B75B70] text-white',
    viewLink: '/#expat-edit',
    editLink: '/admin/homepage',
    changes: [
      {
        field: 'expatEditSection',
        label: 'Homepage Expat Edit Section',
        before: 'Static placeholder cards',
        after: 'Dynamic live article query (filter: the-expat-edit, limit: 6)',
      },
      {
        field: 'sectionHeading',
        label: 'Section Headline',
        before: 'Expat Life',
        after: 'THE EXPAT EDIT — Guides for Making the UAE Home',
      },
      {
        field: 'status',
        label: 'Display Status',
        before: 'Draft / Hidden',
        after: 'Published Live',
      },
    ],
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
    changes: [
      {
        field: 'heroHeadline',
        label: 'Hero Main Headline',
        before: 'UAE Family Guides & Advice',
        after: 'Real, tested UAE family guides for mums raising kids in the Emirates',
      },
      {
        field: 'heroDescription',
        label: 'Hero Description Copy',
        before: 'Honest reviews and family travel ideas across Dubai and Abu Dhabi.',
        after: 'Honest reviews, tested itineraries, and the everyday adventures of raising kids between Dubai and Abu Dhabi.',
      },
      {
        field: 'statsReaders',
        label: 'Monthly Readers Stat',
        before: '20K+',
        after: '25K+ UAE Parents',
      },
    ],
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
    changes: [
      {
        field: 'activePromoCodes',
        label: 'Verified Partner Codes',
        before: '5 verified codes',
        after: '8 verified active codes (Family dining, theme parks, baby gear)',
      },
      {
        field: 'expiryCheck',
        label: 'Expiry Verification',
        before: 'Pending check',
        after: 'Verified valid through Q4 2026',
      },
    ],
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
    changes: [
      {
        field: 'slugs',
        label: 'Category Routing URLs',
        before: 'Legacy query parameter paths (?cat=expat)',
        after: 'Clean semantic hub paths (/the-expat-edit, /family-life)',
      },
      {
        field: 'subcategories',
        label: 'Topic Subcategories',
        before: 'None',
        after: 'Schooling, Cost of Living, Relocation, Weekend Days Out',
      },
    ],
  },
];

/**
 * Strips base64 data URLs from a string value to prevent localStorage bloat.
 * Replaces them with a short human-readable label.
 */
function sanitizeBase64(val: string | null | undefined): string {
  if (!val) return val || '';
  if (typeof val === 'string' && val.startsWith('data:image/')) {
    return '[Uploaded Image]';
  }
  // Also catch any embedded base64 in longer strings
  if (typeof val === 'string' && val.includes('data:image/') && val.length > 500) {
    return val.replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]{100,}/g, '[Uploaded Image]');
  }
  return val;
}

/**
 * Prunes any existing base64 data from stored history entries to recover localStorage space.
 * Called once on page load to self-heal from previous bloated saves.
 */
function pruneHistoryOfBase64(items: ContentHistoryItem[]): ContentHistoryItem[] {
  let changed = false;
  const pruned = items.map((item) => {
    if (!item.changes || item.changes.length === 0) return item;
    const cleanChanges = item.changes.map((c) => {
      const cleanBefore = sanitizeBase64(c.before);
      const cleanAfter = sanitizeBase64(c.after);
      if (cleanBefore !== c.before || cleanAfter !== c.after) {
        changed = true;
        return { ...c, before: cleanBefore, after: cleanAfter };
      }
      return c;
    });
    // Also check if summary contains base64
    let cleanSummary = item.summary;
    if (item.summary && item.summary.includes('data:image/') && item.summary.length > 500) {
      cleanSummary = sanitizeBase64(item.summary);
      changed = true;
    }
    return { ...item, changes: cleanChanges, summary: cleanSummary };
  });
  if (changed) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned.slice(0, 80)));
    } catch (_) {}
  }
  return pruned;
}

export function getCustomHistoryLogs(): ContentHistoryItem[] {
  if (typeof window === 'undefined') return SEED_MANUAL_CHANGES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_MANUAL_CHANGES));
      return SEED_MANUAL_CHANGES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Self-heal: strip any base64 data from stored history
      return pruneHistoryOfBase64(parsed);
    }
  } catch (_) {
    // If localStorage is corrupted or too large, reset to seed
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_MANUAL_CHANGES));
    } catch (_) {}
  }
  return SEED_MANUAL_CHANGES;
}

/**
 * Records a content change with Before and After diffs.
 * Updates localStorage, dispatches window events, and syncs to Firestore.
 */
export function recordContentChange(
  item: Omit<ContentHistoryItem, 'id' | 'timestamp'> & { timestamp?: string; id?: string }
): ContentHistoryItem {
  const newItem: ContentHistoryItem = {
    ...item,
    id: item.id || `chg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: item.timestamp || new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const current = getCustomHistoryLogs();
      // Remove any existing duplicate by ID, then prepend
      const filtered = current.filter((c) => c.id !== newItem.id);
      // Sanitize any base64 data from the new item before storing
      if (newItem.changes) {
        newItem.changes = newItem.changes.map((c) => ({
          ...c,
          before: sanitizeBase64(c.before),
          after: sanitizeBase64(c.after),
        }));
      }
      if (newItem.summary) {
        newItem.summary = sanitizeBase64(newItem.summary);
      }
      const updated = [newItem, ...filtered].slice(0, 80);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('mummabee_history_updated', { detail: newItem }));

      // Asynchronously sync to Firestore if possible
      import('../utils/firestoreSettings')
        .then(({ saveHistoryToFirestore }) => {
          if (typeof saveHistoryToFirestore === 'function') {
            saveHistoryToFirestore(updated).catch(() => {});
          }
        })
        .catch(() => {});
    } catch (_) {}
  }

  return newItem;
}

/**
 * Resolves or updates past deletion records when an article is recovered or restored to Drafts.
 * Prevents restored articles from remaining trapped in the Deletions tab.
 */
export function resolveArticleDeletionInHistory(articleId: string, slug?: string, newTitle?: string, skipEvent = false): void {
  if (typeof window === 'undefined') return;
  try {
    const logs = getCustomHistoryLogs();
    let changed = false;
    const cleanId = articleId.trim().toLowerCase();
    const cleanSlug = slug ? slug.trim().toLowerCase() : '';

    const updated = logs.map((item) => {
      const matchEditLink = item.editLink && (item.editLink.includes(articleId) || (slug && item.editLink.includes(slug)));
      const matchId = item.id.includes(cleanId) || (cleanSlug ? item.id.includes(cleanSlug) : false);
      const matchTitle = newTitle && item.title.toLowerCase().includes(newTitle.toLowerCase().trim());
      
      const isTargetItem = matchEditLink || matchId || matchTitle;
      const wasDeleted = item.status === 'Deleted' || item.action === 'deleted' || item.id.startsWith('del-art');

      if (isTargetItem && wasDeleted) {
        changed = true;
        const displayTitle = newTitle || item.title.replace(/^Deleted:\s*/i, '');
        return {
          ...item,
          status: 'Draft' as const,
          action: 'drafted' as const,
          title: `Restored: ${displayTitle}`,
          summary: `Article was recovered from trash archive and restored to active Drafts.`,
          badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
        };
      }
      return item;
    });

    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (!skipEvent) {
        window.dispatchEvent(new CustomEvent('mummabee_history_updated'));
      }
      import('../utils/firestoreSettings')
        .then(({ saveHistoryToFirestore }) => {
          if (typeof saveHistoryToFirestore === 'function') {
            saveHistoryToFirestore(updated).catch(() => {});
          }
        })
        .catch(() => {});
    }
  } catch (_) {}
}

// -----------------------------------------------------------------------------
// BEFORE & AFTER DIFF COMPUTATION HELPERS
// -----------------------------------------------------------------------------

function truncateText(text: string | null | undefined, max = 90): string {
  if (!text) return 'None';
  const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max) + '...' : clean;
}

/**
 * Computes exact field-by-field differences between previous and updated article state.
 */
export function computeArticleChanges(
  prev: Article | undefined,
  curr: Article
): HistoryChangeDetail[] {
  const diffs: HistoryChangeDetail[] = [];

  if (!prev) {
    diffs.push({
      field: 'title',
      label: 'Article Title',
      before: 'New Article Creation',
      after: curr.title || 'Untitled',
    });
    diffs.push({
      field: 'status',
      label: 'Publication Status',
      before: 'Unpublished Draft',
      after: curr.isDraft || curr.status === 'draft' ? 'Draft' : 'Published Live',
    });
    diffs.push({
      field: 'category',
      label: 'Category',
      before: 'None',
      after: curr.category || 'General',
    });
    if (curr.excerpt) {
      diffs.push({
        field: 'excerpt',
        label: 'Summary / Excerpt',
        before: 'None',
        after: truncateText(curr.excerpt, 120),
      });
    }
    return diffs;
  }

  // 1. Compare Title
  if ((prev.title || '').trim() !== (curr.title || '').trim()) {
    diffs.push({
      field: 'title',
      label: 'Article Title',
      before: prev.title || 'Untitled',
      after: curr.title || 'Untitled',
    });
  }

  // 2. Compare Status / Draft
  const prevIsDraft = Boolean(prev.isDraft || prev.status === 'draft');
  const currIsDraft = Boolean(curr.isDraft || curr.status === 'draft');
  if (prevIsDraft !== currIsDraft) {
    diffs.push({
      field: 'status',
      label: 'Publication Status',
      before: prevIsDraft ? 'Draft' : 'Published Live',
      after: currIsDraft ? 'Draft' : 'Published Live',
    });
  }

  // 3. Compare Category
  if ((prev.category || '').trim() !== (curr.category || '').trim()) {
    diffs.push({
      field: 'category',
      label: 'Category',
      before: prev.category || 'None',
      after: curr.category || 'None',
    });
  }

  // 4. Compare Excerpt
  const prevExcerpt = (prev.excerpt || '').trim();
  const currExcerpt = (curr.excerpt || '').trim();
  if (prevExcerpt !== currExcerpt) {
    diffs.push({
      field: 'excerpt',
      label: 'Summary / Excerpt',
      before: truncateText(prevExcerpt, 140),
      after: truncateText(currExcerpt, 140),
    });
  }

  // 5. Compare MummaBee Mum Tip
  const prevTip = (prev.mummaBeeTip || '').trim();
  const currTip = (curr.mummaBeeTip || '').trim();
  if (prevTip !== currTip) {
    diffs.push({
      field: 'mummaBeeTip',
      label: 'MummaBee Mum Tip',
      before: truncateText(prevTip, 140),
      after: truncateText(currTip, 140),
    });
  }

  // 6. Compare Good to Know Box Enabled/Disabled
  const prevGtk = prev.goodToKnowEnabled ?? prev.showGoodToKnow ?? true;
  const currGtk = curr.goodToKnowEnabled ?? curr.showGoodToKnow ?? true;
  if (prevGtk !== currGtk) {
    diffs.push({
      field: 'goodToKnowEnabled',
      label: 'Good to Know Tips Box',
      before: prevGtk ? 'Visible / Enabled' : 'Hidden / Disabled',
      after: currGtk ? 'Visible / Enabled' : 'Hidden / Disabled',
    });
  }

  // 7. Compare Body Content (Text snippet comparison instead of raw char count)
  const prevBodyClean = (prev.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const currBodyClean = (curr.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (prevBodyClean !== currBodyClean) {
    diffs.push({
      field: 'content',
      label: 'Article Body Content',
      before: truncateText(prevBodyClean, 140),
      after: truncateText(currBodyClean, 140),
    });
  }

  // 8. Compare Location / Venue
  const prevLoc = (prev.location || prev.quickFacts?.location || '').trim();
  const currLoc = (curr.location || curr.quickFacts?.location || '').trim();
  if (prevLoc !== currLoc) {
    diffs.push({
      field: 'location',
      label: 'Location / Venue',
      before: prevLoc || 'None',
      after: currLoc || 'None',
    });
  }

  // 9. Compare Quick Facts (Budget, Best For)
  const prevBudget = (prev.quickFacts?.budget || '').trim();
  const currBudget = (curr.quickFacts?.budget || '').trim();
  if (prevBudget !== currBudget) {
    diffs.push({
      field: 'budget',
      label: 'Budget',
      before: prevBudget || 'None',
      after: currBudget || 'None',
    });
  }

  const prevBestFor = (prev.quickFacts?.bestFor || '').trim();
  const currBestFor = (curr.quickFacts?.bestFor || '').trim();
  if (prevBestFor !== currBestFor) {
    diffs.push({
      field: 'bestFor',
      label: 'Best For',
      before: prevBestFor || 'None',
      after: currBestFor || 'None',
    });
  }

  // 10. Compare Featured Cover Image (sanitize base64 data URLs to prevent localStorage bloat)
  const prevImg = sanitizeBase64((prev.featuredImage || '').trim());
  const currImg = sanitizeBase64((curr.featuredImage || '').trim());
  if (prevImg !== currImg) {
    diffs.push({
      field: 'featuredImage',
      label: 'Cover Image URL',
      before: truncateText(prevImg, 80),
      after: truncateText(currImg, 80),
    });
  }

  // 11. Compare Read Time
  if ((prev.readTime || '').trim() !== (curr.readTime || '').trim()) {
    diffs.push({
      field: 'readTime',
      label: 'Read Time',
      before: prev.readTime || 'None',
      after: curr.readTime || 'None',
    });
  }

  // 12. Compare Tags
  const prevTags = (prev.tags || []).join(', ').trim();
  const currTags = (curr.tags || []).join(', ').trim();
  if (prevTags !== currTags) {
    diffs.push({
      field: 'tags',
      label: 'Keywords & Tags',
      before: prevTags || 'None',
      after: currTags || 'None',
    });
  }

  // If no specific property change was caught, record general update
  if (diffs.length === 0) {
    diffs.push({
      field: 'updated',
      label: 'Article Revision',
      before: `Version at ${prev.lastUpdated ? new Date(prev.lastUpdated).toLocaleTimeString() : 'earlier'}`,
      after: 'Saved with latest changes',
    });
  }

  return diffs;
}

/**
 * Computes exact field-by-field differences between previous and updated homepage state.
 */
export function computeHomepageChanges(
  prev: HomepageContent | undefined,
  curr: HomepageContent
): HistoryChangeDetail[] {
  const diffs: HistoryChangeDetail[] = [];
  if (!prev) return diffs;

  const compare = (field: keyof HomepageContent, label: string) => {
    let valPrev = prev[field] as string | undefined;
    let valCurr = curr[field] as string | undefined;
    if (field === 'heroImage' || field === 'donneImage') {
      valPrev = sanitizeBase64(valPrev);
      valCurr = sanitizeBase64(valCurr);
    }
    if ((valPrev || '') !== (valCurr || '')) {
      diffs.push({
        field,
        label,
        before: truncateText(valPrev),
        after: truncateText(valCurr),
      });
    }
  };

  compare('heroEyebrow', 'Hero Eyebrow Text');
  compare('heroHeadline', 'Hero Main Headline');
  compare('heroDescription', 'Hero Description');
  compare('heroImage', 'Hero Photo');
  compare('heroPrimaryCtaText', 'Primary Button Label');
  compare('heroPrimaryCtaUrl', 'Primary Button Link');
  compare('heroSecondaryCtaText', 'Secondary Button Label');
  compare('heroSecondaryCtaUrl', 'Secondary Button Link');
  compare('credibilityBadge', 'Credibility Badge');
  compare('credibilityHeadline', 'Credibility Headline');
  compare('credibilityDescription', 'Credibility Description');
  compare('discoveryHeadline', 'Discovery Section Headline');
  compare('exploreHeadline', 'Explore Section Headline');
  compare('expatHeadline', 'Expat Edit Headline');
  compare('donneHeadline', 'Meet Donne Headline');
  compare('donneDescription', 'Meet Donne Bio');
  compare('donneImage', 'Donne Profile Photo');
  compare('newsletterHeadline', 'Newsletter Headline');
  compare('newsletterSubtext', 'Newsletter Subtext');

  if (diffs.length === 0) {
    diffs.push({
      field: 'homepage',
      label: 'Homepage Content',
      before: 'Previous layout state',
      after: 'Updated and saved to live site',
    });
  }

  return diffs;
}

/**
 * Computes exact field-by-field differences between previous and updated About page state.
 */
export function computeAboutChanges(
  prev: AboutPageContent | undefined,
  curr: AboutPageContent
): HistoryChangeDetail[] {
  const diffs: HistoryChangeDetail[] = [];
  if (!prev) return diffs;

  const compare = (field: keyof AboutPageContent, label: string) => {
    const valPrev = prev[field] as string | undefined;
    const valCurr = curr[field] as string | undefined;
    if ((valPrev || '') !== (valCurr || '')) {
      diffs.push({
        field,
        label,
        before: truncateText(valPrev),
        after: truncateText(valCurr),
      });
    }
  };

  compare('eyebrow', 'Hero Eyebrow');
  compare('headline', 'Main Headline');
  compare('leadText', 'Lead Subheading');
  compare('profileBadgeText', 'Family Badge Text');
  compare('profileHeading', 'Story Heading');
  compare('profileStory', 'Full Author Story');
  compare('pillar1Title', 'Pillar 1 Title');
  compare('pillar1Text', 'Pillar 1 Description');
  compare('pillar2Title', 'Pillar 2 Title');
  compare('pillar2Text', 'Pillar 2 Description');
  compare('privacyNote', 'Family Privacy Note');

  if (diffs.length === 0) {
    diffs.push({
      field: 'about',
      label: 'About Page',
      before: 'Previous story state',
      after: 'Updated with latest biography and trust pillars',
    });
  }

  return diffs;
}

/**
 * Computes exact differences for Work With Us page updates.
 */
export function computeWorkWithUsChanges(
  prev: WorkWithUsPageContent | undefined,
  curr: WorkWithUsPageContent
): HistoryChangeDetail[] {
  const diffs: HistoryChangeDetail[] = [];
  if (!prev) return diffs;

  const compare = (field: keyof WorkWithUsPageContent, label: string) => {
    const valPrev = prev[field] as string | undefined;
    const valCurr = curr[field] as string | undefined;
    if ((valPrev || '') !== (valCurr || '')) {
      diffs.push({
        field,
        label,
        before: truncateText(valPrev),
        after: truncateText(valCurr),
      });
    }
  };

  compare('headline', 'Partnership Headline');
  compare('leadText', 'Lead Subtext');
  compare('ctaEmail', 'Partnership Email');
  compare('stats1Number', 'Stat 1 Number');
  compare('stats2Number', 'Stat 2 Number');
  compare('stats3Number', 'Stat 3 Number');
  compare('audienceTitle', 'Audience Title');
  compare('audienceText', 'Audience Description');

  if (diffs.length === 0) {
    diffs.push({
      field: 'workWithUs',
      label: 'Work With Us Page',
      before: 'Previous partnership info',
      after: 'Updated partnership details',
    });
  }

  return diffs;
}

/**
 * Computes exact differences for Site Settings & SEO updates.
 */
export function computeSettingsChanges(
  prev: SiteSettings | undefined,
  curr: SiteSettings
): HistoryChangeDetail[] {
  const diffs: HistoryChangeDetail[] = [];
  if (!prev) return diffs;

  const compare = (field: keyof SiteSettings, label: string) => {
    const valPrev = String(prev[field] ?? '');
    const valCurr = String(curr[field] ?? '');
    if (valPrev !== valCurr) {
      diffs.push({
        field,
        label,
        before: truncateText(valPrev),
        after: truncateText(valCurr),
      });
    }
  };

  compare('siteName', 'Site Name');
  compare('contactEmail', 'Contact Email');
  compare('defaultSeoTitle', 'SEO Meta Title');
  compare('defaultSeoDescription', 'SEO Meta Description');
  compare('instagramUrl', 'Instagram URL');
  compare('tiktokUrl', 'TikTok URL');
  compare('comingSoonMode', 'Coming Soon Mode');

  if (diffs.length === 0) {
    diffs.push({
      field: 'settings',
      label: 'Site Settings',
      before: 'Previous settings',
      after: 'Updated site configuration',
    });
  }

  return diffs;
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
        changes: undefined,
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
        changes: undefined,
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

  // Clean deduplication: remove exact duplicate IDs and redundant identical actions within the same minute
  const seenIds = new Set<string>();
  const seenSignatures = new Set<string>();
  const deduplicated: ContentHistoryItem[] = [];

  for (const item of combined) {
    if (seenIds.has(item.id)) continue;
    seenIds.add(item.id);

    const minute = item.timestamp ? item.timestamp.slice(0, 16) : '';
    const sig = `${(item.title || '').trim().toLowerCase()}__${item.status}__${minute}`;
    if (seenSignatures.has(sig) && (!item.changes || item.changes.length === 0)) {
      continue;
    }
    seenSignatures.add(sig);

    deduplicated.push(item);
  }

  return deduplicated;
}
