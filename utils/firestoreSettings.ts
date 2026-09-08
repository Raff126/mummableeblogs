'use client';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirebaseDb, ensureFirebaseAuth } from './firebase';
import {
  HomepageContent,
  AboutPageContent,
  DiscountCode,
  InstagramPost,
  WorkWithUsPageContent,
  SiteSettings,
} from '../data/store';

const SETTINGS_COLLECTION = 'settings';
const HOMEPAGE_DOC = 'homepage';
const ABOUT_DOC = 'about';
const DEALS_DOC = 'deals';
const INSTAGRAM_DOC = 'instagram';
const WORK_WITH_US_DOC = 'work-with-us';
const SITE_DOC = 'site';

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
        if (data && typeof data === 'object' && (data.heroHeadline || data.heroImage)) {
          return data;
        }
      }
      return null;
    } catch (err) {
      console.warn('Error fetching homepage from Firestore:', err);
      return null;
    }
  };

  return withTimeout(fetchTask(), 4000, null);
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

  return withTimeout(saveTask(), 5000, false);
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
