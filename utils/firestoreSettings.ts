'use client';

import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb, ensureFirebaseAuth } from './firebase';
import {
  HomepageContent,
  AboutPageContent,
  DiscountCode,
  InstagramPost,
  WorkWithUsPageContent,
  SiteSettings,
  MediaItem,
  GiveawayCampaign,
  GiveawayEntry,
} from '../data/store';

import type { UserAccount } from '../data/users';

const SETTINGS_COLLECTION = 'settings';
const HOMEPAGE_DOC = 'homepage';
const ABOUT_DOC = 'about';
const DEALS_DOC = 'deals';
const INSTAGRAM_DOC = 'instagram';
const WORK_WITH_US_DOC = 'work-with-us';
const SITE_DOC = 'site';
const MEDIA_DOC = 'media_library';
const USERS_DOC = 'users';
const GIVEAWAY_DOC = 'giveaway';
const GIVEAWAY_ENTRIES_DOC = 'giveaway_entries';

/** Helper to ensure Firestore async operations never hang indefinitely */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      resolve(fallback);
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

// -------------------------------------------------------------
// 1. HOMEPAGE
// -------------------------------------------------------------
export async function fetchHomepageFromFirestore(): Promise<HomepageContent | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const fetchTask = async (): Promise<HomepageContent | null> => {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, HOMEPAGE_DOC);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as HomepageContent;
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          return data;
        }
      }
      return null;
    } catch (err) {
      console.warn('Error fetching homepage from Firestore:', err);
      return null;
    }
  };

  return withTimeout(fetchTask(), 6000, null);
}

export async function saveHomepageToFirestore(content: HomepageContent): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const saveTask = async (): Promise<boolean> => {
    try {
      await ensureFirebaseAuth();
      const docRef = doc(db, SETTINGS_COLLECTION, HOMEPAGE_DOC);
      const cleaned = JSON.parse(JSON.stringify(content));
      await setDoc(
        docRef,
        {
          ...cleaned,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      console.warn('Error saving homepage to Firestore:', err);
      return false;
    }
  };

  return withTimeout(saveTask(), 8000, false);
}

// -------------------------------------------------------------
// 2. ABOUT PAGE
// -------------------------------------------------------------
export async function fetchAboutFromFirestore(): Promise<AboutPageContent | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const fetchTask = async (): Promise<AboutPageContent | null> => {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, ABOUT_DOC);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as AboutPageContent;
        if (data && typeof data === 'object') {
          return data;
        }
      }
      return null;
    } catch (err) {
      console.warn('Error fetching about page from Firestore:', err);
      return null;
    }
  };

  return withTimeout(fetchTask(), 4000, null);
}

export async function saveAboutToFirestore(content: AboutPageContent): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const saveTask = async (): Promise<boolean> => {
    try {
      await ensureFirebaseAuth();
      const docRef = doc(db, SETTINGS_COLLECTION, ABOUT_DOC);
      const cleaned = JSON.parse(JSON.stringify(content));
      await setDoc(
        docRef,
        {
          ...cleaned,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      console.warn('Error saving about page to Firestore:', err);
      return false;
    }
  };

  return withTimeout(saveTask(), 5000, false);
}

// -------------------------------------------------------------
// 3. UAE DEALS
// -------------------------------------------------------------
export interface FirestoreDealsResult {
  deals: DiscountCode[];
  deletedIds: string[];
}

export async function fetchDealsFromFirestore(): Promise<FirestoreDealsResult | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const fetchTask = async (): Promise<FirestoreDealsResult | null> => {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, DEALS_DOC);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && typeof data === 'object') {
          return {
            deals: Array.isArray(data.items) ? (data.items as DiscountCode[]) : [],
            deletedIds: Array.isArray(data.deletedIds) ? (data.deletedIds as string[]) : [],
          };
        }
      }
      return null;
    } catch (err) {
      console.warn('Error fetching deals from Firestore:', err);
      return null;
    }
  };

  return withTimeout(fetchTask(), 4000, null);
}

export async function saveDealsToFirestore(deals: DiscountCode[], deletedIds?: string[]): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const saveTask = async (): Promise<boolean> => {
    try {
      await ensureFirebaseAuth();
      const docRef = doc(db, SETTINGS_COLLECTION, DEALS_DOC);
      const cleaned = JSON.parse(JSON.stringify(deals));
      const payload: any = {
        items: cleaned,
        updatedAt: new Date().toISOString(),
      };
      if (Array.isArray(deletedIds)) {
        payload.deletedIds = deletedIds;
      }
      await setDoc(docRef, payload, { merge: true });
      return true;
    } catch (err) {
      console.warn('Error saving deals to Firestore:', err);
      return false;
    }
  };

  return withTimeout(saveTask(), 5000, false);
}

// -------------------------------------------------------------
// 4. INSTAGRAM POSTS
// -------------------------------------------------------------
export async function fetchInstagramFromFirestore(): Promise<InstagramPost[] | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const fetchTask = async (): Promise<InstagramPost[] | null> => {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, INSTAGRAM_DOC);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.items)) {
          return data.items as InstagramPost[];
        }
      }
      return null;
    } catch (err) {
      console.warn('Error fetching instagram from Firestore:', err);
      return null;
    }
  };

  return withTimeout(fetchTask(), 4000, null);
}

export async function saveInstagramToFirestore(posts: InstagramPost[]): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const saveTask = async (): Promise<boolean> => {
    try {
      await ensureFirebaseAuth();
      const docRef = doc(db, SETTINGS_COLLECTION, INSTAGRAM_DOC);
      const cleaned = JSON.parse(JSON.stringify(posts));
      await setDoc(
        docRef,
        {
          items: cleaned,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      console.warn('Error saving instagram to Firestore:', err);
      return false;
    }
  };

  return withTimeout(saveTask(), 5000, false);
}

// -------------------------------------------------------------
// 5. WORK WITH US
// -------------------------------------------------------------
export async function fetchWorkWithUsFromFirestore(): Promise<WorkWithUsPageContent | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const fetchTask = async (): Promise<WorkWithUsPageContent | null> => {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, WORK_WITH_US_DOC);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as WorkWithUsPageContent;
        if (data && typeof data === 'object' && data.headline) {
          return data;
        }
      }
      return null;
    } catch (err) {
      console.warn('Error fetching work-with-us from Firestore:', err);
      return null;
    }
  };

  return withTimeout(fetchTask(), 4000, null);
}

export async function saveWorkWithUsToFirestore(content: WorkWithUsPageContent): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const saveTask = async (): Promise<boolean> => {
    try {
      await ensureFirebaseAuth();
      const docRef = doc(db, SETTINGS_COLLECTION, WORK_WITH_US_DOC);
      const cleaned = JSON.parse(JSON.stringify(content));
      await setDoc(
        docRef,
        {
          ...cleaned,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      console.warn('Error saving work-with-us to Firestore:', err);
      return false;
    }
  };

  return withTimeout(saveTask(), 5000, false);
}

// -------------------------------------------------------------
// 6. SITE SETTINGS
// -------------------------------------------------------------
export async function fetchSettingsFromFirestore(): Promise<SiteSettings | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const fetchTask = async (): Promise<SiteSettings | null> => {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, SITE_DOC);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteSettings;
        if (data && typeof data === 'object' && data.siteName) {
          return data;
        }
      }
      return null;
    } catch (err) {
      console.warn('Error fetching site settings from Firestore:', err);
      return null;
    }
  };

  return withTimeout(fetchTask(), 4000, null);
}

export async function saveSettingsToFirestore(settings: SiteSettings): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const saveTask = async (): Promise<boolean> => {
    try {
      await ensureFirebaseAuth();
      const docRef = doc(db, SETTINGS_COLLECTION, SITE_DOC);
      const cleaned = JSON.parse(JSON.stringify(settings));
      await setDoc(
        docRef,
        {
          ...cleaned,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      console.warn('Error saving site settings to Firestore:', err);
      return false;
    }
  };

  return withTimeout(saveTask(), 5000, false);
}

// -------------------------------------------------------------
// 7. CONTENT HISTORY AUDIT LOG
// -------------------------------------------------------------
const HISTORY_DOC = 'history_audit';

export async function fetchHistoryFromFirestore(): Promise<any[] | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const fetchTask = async (): Promise<any[] | null> => {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, HISTORY_DOC);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.items)) {
          return data.items;
        }
      }
      return null;
    } catch (err) {
      console.warn('Error fetching history from Firestore:', err);
      return null;
    }
  };

  return withTimeout(fetchTask(), 4000, null);
}

export async function saveHistoryToFirestore(items: any[]): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const saveTask = async (): Promise<boolean> => {
    try {
      await ensureFirebaseAuth();
      const docRef = doc(db, SETTINGS_COLLECTION, HISTORY_DOC);
      // Clean undefined and retain max 150 items to keep doc size optimal
      const cleaned = JSON.parse(JSON.stringify(items.slice(0, 150)));
      await setDoc(
        docRef,
        {
          items: cleaned,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      console.warn('Error saving history to Firestore:', err);
      return false;
    }
  };

  return withTimeout(saveTask(), 5000, false);
}

// -------------------------------------------------------------
// 8. MEDIA LIBRARY
// -------------------------------------------------------------
export interface FirestoreMediaResult {
  items: MediaItem[];
  deletedIds: string[];
}

export async function fetchMediaFromFirestore(): Promise<FirestoreMediaResult | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const fetchTask = async (): Promise<FirestoreMediaResult | null> => {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, MEDIA_DOC);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && (Array.isArray(data.items) || Array.isArray(data.deletedIds))) {
          return {
            items: Array.isArray(data.items) ? data.items : [],
            deletedIds: Array.isArray(data.deletedIds) ? data.deletedIds : [],
          };
        }
      }
      return null;
    } catch (err) {
      console.warn('Error fetching media from Firestore:', err);
      return null;
    }
  };

  return withTimeout(fetchTask(), 4000, null);
}

export async function saveMediaToFirestore(items: MediaItem[], deletedIds: string[] = []): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const saveTask = async (): Promise<boolean> => {
    try {
      await ensureFirebaseAuth();
      const docRef = doc(db, SETTINGS_COLLECTION, MEDIA_DOC);
      // Clean undefined and retain max 40 items
      const cleaned = JSON.parse(JSON.stringify(items.slice(0, 40)));
      await setDoc(
        docRef,
        {
          items: cleaned,
          deletedIds: Array.from(new Set(deletedIds)),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      console.warn('Error saving media to Firestore:', err);
      return false;
    }
  };

  return withTimeout(saveTask(), 5000, false);
}

// -------------------------------------------------------------
// 9. USERS MANAGEMENT
// -------------------------------------------------------------
export async function fetchUsersFromFirestore(): Promise<UserAccount[] | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const fetchTask = async (): Promise<UserAccount[] | null> => {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, USERS_DOC);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.users)) {
          return data.users as UserAccount[];
        }
      }
      return null;
    } catch (err) {
      console.warn('Error fetching users from Firestore:', err);
      return null;
    }
  };

  return withTimeout(fetchTask(), 4000, null);
}

export async function saveUsersToFirestore(users: UserAccount[]): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const saveTask = async (): Promise<boolean> => {
    try {
      await ensureFirebaseAuth();
      const docRef = doc(db, SETTINGS_COLLECTION, USERS_DOC);
      const cleaned = JSON.parse(JSON.stringify(users));
      await setDoc(
        docRef,
        {
          users: cleaned,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      console.warn('Error saving users to Firestore:', err);
      return false;
    }
  };

  return withTimeout(saveTask(), 5000, false);
}

// -------------------------------------------------------------
// 10. GIVEAWAY CAMPAIGN & ENTRIES
// -------------------------------------------------------------
export async function fetchGiveawayFromFirestore(): Promise<GiveawayCampaign | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const fetchTask = async (): Promise<GiveawayCampaign | null> => {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, GIVEAWAY_DOC);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.campaign) {
          return data.campaign as GiveawayCampaign;
        }
      }
      return null;
    } catch (err) {
      console.warn('Error fetching giveaway from Firestore:', err);
      return null;
    }
  };

  return withTimeout(fetchTask(), 4000, null);
}

/**
 * Real-time listener for Giveaway campaign updates across all devices & visitors.
 */
export function subscribeToGiveaway(callback: (campaign: GiveawayCampaign) => void): (() => void) | null {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, GIVEAWAY_DOC);
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && data.campaign && typeof data.campaign === 'object') {
            callback(data.campaign as GiveawayCampaign);
          }
        }
      },
      (err) => {
        console.warn('Firestore giveaway snapshot listener warning:', err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Error subscribing to giveaway in Firestore:', err);
    return null;
  }
}

export async function saveGiveawayToFirestore(campaign: GiveawayCampaign): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const saveTask = async (): Promise<boolean> => {
    try {
      await ensureFirebaseAuth();
      const docRef = doc(db, SETTINGS_COLLECTION, GIVEAWAY_DOC);
      const cleaned = JSON.parse(JSON.stringify(campaign));
      await setDoc(
        docRef,
        {
          campaign: cleaned,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      console.warn('Error saving giveaway to Firestore:', err);
      return false;
    }
  };

  return withTimeout(saveTask(), 5000, false);
}

export async function fetchGiveawayEntriesFromFirestore(): Promise<GiveawayEntry[] | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const fetchTask = async (): Promise<GiveawayEntry[] | null> => {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, GIVEAWAY_ENTRIES_DOC);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.entries)) {
          return data.entries as GiveawayEntry[];
        }
      }
      return null;
    } catch (err) {
      console.warn('Error fetching giveaway entries from Firestore:', err);
      return null;
    }
  };

  return withTimeout(fetchTask(), 4000, null);
}

export async function saveGiveawayEntryToFirestore(entry: GiveawayEntry): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const saveTask = async (): Promise<boolean> => {
    try {
      await ensureFirebaseAuth();
      const docRef = doc(db, SETTINGS_COLLECTION, GIVEAWAY_ENTRIES_DOC);
      const snap = await getDoc(docRef);
      let existingEntries: GiveawayEntry[] = [];
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.entries)) {
          existingEntries = data.entries;
        }
      }
      const updated = [entry, ...existingEntries.filter((e) => e.id !== entry.id)].slice(0, 1000);
      await setDoc(
        docRef,
        {
          entries: JSON.parse(JSON.stringify(updated)),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      console.warn('Error saving giveaway entry to Firestore:', err);
      return false;
    }
  };

  return withTimeout(saveTask(), 5000, false);
}




