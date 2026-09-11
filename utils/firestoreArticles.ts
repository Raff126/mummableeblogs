'use client';

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import { getFirebaseDb, ensureFirebaseAuth } from './firebase';

const ARTICLES_COLLECTION = 'articles';
const DELETED_COLLECTION = 'deleted_articles';

export interface FirestoreArticle {
  id: string;
  slug: string;
  category: string;
  subcategory?: string;
  title: string;
  excerpt: string;
  answerSummary?: string;
  content: string;
  author: string;
  publishedAt: string;
  lastUpdated?: string;
  readTime: string;
  featuredImage: string;
  heroImage?: string;
  thumbnailImage?: string;
  imageAlt: string;
  imageCaption?: string;
  location?: string;
  ageGroup?: string;
  indoorOutdoor?: string;
  budget?: string;
  tags: string[];
  featured?: boolean;
  quickFacts?: {
    location?: string;
    bestFor?: string;
    timeNeeded?: string;
    budget?: string;
    indoorOutdoor?: string;
    parking?: string;
  };
  mummaBeeTip?: string;
  quickAnswer?: string;
  goodToKnow?: string[];
  seoTitle?: string;
  seoDescription?: string;
  isDraft?: boolean;
  status?: 'published' | 'draft';
  goodToKnowEnabled?: boolean;
  showGoodToKnow?: boolean;
}

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

/**
 * Fetch all articles from Firestore with safety timeout.
 * Returns [] if Firestore unavailable (e.g. SSR or network issue).
 */
export async function fetchArticlesFromFirestore(): Promise<FirestoreArticle[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  const fetchTask = async (): Promise<FirestoreArticle[]> => {
    try {
      const q = query(collection(db, ARTICLES_COLLECTION));
      const snapshot = await getDocs(q);
      const articles: FirestoreArticle[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as FirestoreArticle;
        const isDraft = Boolean(data.isDraft ?? (data.status === 'draft'));
        const rawSlug = data.slug || data.id || docSnap.id;
        const cleanSlug = rawSlug
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          .slice(0, 80)
          .replace(/-+$/, '');

        articles.push({
          ...data,
          id: data.id || docSnap.id,
          slug: cleanSlug || docSnap.id,
          isDraft,
          status: isDraft ? 'draft' : 'published',
          lastUpdated: data.lastUpdated || undefined,
        });
      });
      return articles;
    } catch (err) {
      console.warn('Error fetching articles from Firestore:', err);
      return [];
    }
  };

  return withTimeout(fetchTask(), 6000, []);
}

/**
 * Save a single article to Firestore (upsert by id) with safety timeout.
 */
export async function saveOneArticleToFirestore(article: FirestoreArticle): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const saveTask = async (): Promise<boolean> => {
    try {
      await ensureFirebaseAuth();
      const docId = article.id || article.slug;
      if (!docId) return false;
      const docRef = doc(db, ARTICLES_COLLECTION, docId);
      const isDraft = Boolean(article.isDraft ?? (article.status === 'draft'));
      const rawSlug = article.slug || article.id;
      const cleanSlug = rawSlug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 80)
        .replace(/-+$/, '');

      const toSave = {
        ...article,
        id: docId,
        slug: cleanSlug || docId,
        isDraft,
        status: (isDraft ? 'draft' : 'published') as 'published' | 'draft',
        lastUpdated: article.lastUpdated || new Date().toISOString(),
      };
      const cleaned = JSON.parse(JSON.stringify(toSave));
      await setDoc(docRef, cleaned, { merge: true });
      return true;
    } catch (err) {
      console.warn('Error saving article to Firestore:', err);
      return false;
    }
  };

  return withTimeout(saveTask(), 8000, false);
}

/**
 * Batch-save all articles to Firestore with safety timeout.
 * Used for full sync operations.
 */
export async function saveArticlesToFirestore(articles: FirestoreArticle[]): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db || articles.length === 0) return false;

  const batchTask = async (): Promise<boolean> => {
    try {
      await ensureFirebaseAuth();
      const nowIso = new Date().toISOString();
      // Firestore batches are limited to 500 ops. Split if needed.
      const BATCH_SIZE = 450;
      for (let i = 0; i < articles.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = articles.slice(i, i + BATCH_SIZE);
        for (const article of chunk) {
          const docId = article.id || article.slug;
          if (!docId) continue;
          const docRef = doc(db, ARTICLES_COLLECTION, docId);
          const isDraft = Boolean(article.isDraft ?? (article.status === 'draft'));
          const toSave = {
            ...article,
            id: docId,
            isDraft,
            status: (isDraft ? 'draft' : 'published') as 'published' | 'draft',
            lastUpdated: article.lastUpdated || nowIso,
          };
          const cleaned = JSON.parse(JSON.stringify(toSave));
          batch.set(docRef, cleaned, { merge: true });
        }
        await batch.commit();
      }
      return true;
    } catch (err) {
      console.warn('Error batch-saving articles to Firestore:', err);
      return false;
    }
  };

  return withTimeout(batchTask(), 10000, false);
}

/**
 * Delete an article from Firestore by id.
 * Also records the deletion in a separate collection to prevent resurrection.
 */
export async function deleteArticleFromFirestore(id: string, slug?: string): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const deleteTask = async (): Promise<boolean> => {
    try {
      await ensureFirebaseAuth();
      const batch = writeBatch(db);

      // Delete the article document
      batch.delete(doc(db, ARTICLES_COLLECTION, id));

      // Record deletion so it doesn't come back from static JSON
      batch.set(doc(db, DELETED_COLLECTION, id), {
        id,
        slug: slug || '',
        deletedAt: new Date().toISOString(),
      });
      if (slug) {
        batch.set(doc(db, DELETED_COLLECTION, slug), {
          id,
          slug,
          deletedAt: new Date().toISOString(),
        });
      }

      await batch.commit();
      return true;
    } catch (err) {
      console.warn('Error deleting article from Firestore:', err);
      return false;
    }
  };

  return withTimeout(deleteTask(), 6000, false);
}

/**
 * Fetch list of deleted article IDs from Firestore with safety timeout.
 */
export async function fetchDeletedIdsFromFirestore(): Promise<Set<string>> {
  const db = getFirebaseDb();
  if (!db) return new Set();

  const fetchDeletedTask = async (): Promise<Set<string>> => {
    try {
      const snapshot = await getDocs(collection(db, DELETED_COLLECTION));
      const ids = new Set<string>();
      snapshot.forEach((docSnap) => {
        ids.add(docSnap.id);
        const data = docSnap.data();
        if (data.id) ids.add(data.id);
        if (data.slug) ids.add(data.slug);
      });
      return ids;
    } catch (err) {
      console.warn('Error fetching deleted IDs from Firestore:', err);
      return new Set();
    }
  };

  return withTimeout(fetchDeletedTask(), 4000, new Set());
}

/**
 * Recover a deleted article in Firestore:
 * Deletes the deletion tombstone document from DELETED_COLLECTION,
 * and saves the recovered article back into ARTICLES_COLLECTION.
 */
export async function recoverArticleInFirestore(
  id: string,
  slug?: string,
  article?: FirestoreArticle
): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  const recoverTask = async (): Promise<boolean> => {
    try {
      await ensureFirebaseAuth();
      const batch = writeBatch(db);

      // Remove from DELETED_COLLECTION
      batch.delete(doc(db, DELETED_COLLECTION, id));
      if (slug) {
        batch.delete(doc(db, DELETED_COLLECTION, slug));
      }

      // If article provided, restore to ARTICLES_COLLECTION
      if (article) {
        batch.set(doc(db, ARTICLES_COLLECTION, id), article);
      }

      await batch.commit();
      return true;
    } catch (err) {
      console.warn('Error recovering article in Firestore:', err);
      return false;
    }
  };

  return withTimeout(recoverTask(), 6000, false);
}

/**
 * Seed Firestore with articles from a source array.
 * Only adds articles that don't already exist.
 * Called once on first admin load to populate Firestore from the static JSON.
 */
export async function seedFirestoreIfEmpty(sourceArticles: FirestoreArticle[]): Promise<void> {
  const db = getFirebaseDb();
  if (!db || sourceArticles.length === 0) return;

  try {
    const existing = await fetchArticlesFromFirestore();
    const existingIds = new Set(existing.map((a) => a.id));
    const existingSlugs = new Set(existing.filter((a) => a.slug).map((a) => a.slug));

    // Find any source articles that are NOT yet in Firestore
    const missing = sourceArticles.filter(
      (a) => !existingIds.has(a.id) && (!a.slug || !existingSlugs.has(a.slug))
    );

    if (missing.length === 0) return; // All already present

    console.log('[Firestore] Seeding', missing.length, 'missing articles...');
    await saveArticlesToFirestore(missing);
    console.log('[Firestore] Seed complete.');
  } catch (err) {
    console.error('Error seeding Firestore:', err);
  }
}
