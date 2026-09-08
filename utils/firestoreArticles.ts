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
import { getFirebaseDb } from './firebase';

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
  goodToKnowEnabled?: boolean;
  showGoodToKnow?: boolean;
}

/**
 * Fetch all articles from Firestore.
 * Returns [] if Firestore unavailable (e.g. SSR).
 */
export async function fetchArticlesFromFirestore(): Promise<FirestoreArticle[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(collection(db, ARTICLES_COLLECTION));
    const snapshot = await getDocs(q);
    const articles: FirestoreArticle[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as FirestoreArticle;
      articles.push({ ...data, id: data.id || docSnap.id });
    });
    return articles;
  } catch (err) {
    console.error('Error fetching articles from Firestore:', err);
    return [];
  }
}

/**
 * Save a single article to Firestore (upsert by id).
 */
export async function saveOneArticleToFirestore(article: FirestoreArticle): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const docRef = doc(db, ARTICLES_COLLECTION, article.id);
    // Clean undefined values — Firestore doesn't accept undefined
    const cleaned = JSON.parse(JSON.stringify(article));
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving article to Firestore:', err);
    return false;
  }
}

/**
 * Batch-save all articles to Firestore.
 * Used for full sync operations.
 */
export async function saveArticlesToFirestore(articles: FirestoreArticle[]): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    // Firestore batches are limited to 500 ops. Split if needed.
    const BATCH_SIZE = 450;
    for (let i = 0; i < articles.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = articles.slice(i, i + BATCH_SIZE);
      for (const article of chunk) {
        const docRef = doc(db, ARTICLES_COLLECTION, article.id);
        const cleaned = JSON.parse(JSON.stringify(article));
        batch.set(docRef, cleaned, { merge: true });
      }
      await batch.commit();
    }
    return true;
  } catch (err) {
    console.error('Error batch-saving articles to Firestore:', err);
    return false;
  }
}

/**
 * Delete an article from Firestore by id.
 * Also records the deletion in a separate collection to prevent resurrection.
 */
export async function deleteArticleFromFirestore(id: string, slug?: string): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
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
    console.error('Error deleting article from Firestore:', err);
    return false;
  }
}

/**
 * Fetch list of deleted article IDs from Firestore.
 */
export async function fetchDeletedIdsFromFirestore(): Promise<Set<string>> {
  const db = getFirebaseDb();
  if (!db) return new Set();

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
    console.error('Error fetching deleted IDs from Firestore:', err);
    return new Set();
  }
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
    if (existing.length > 0) return; // Already seeded

    console.log('[Firestore] Seeding', sourceArticles.length, 'articles...');
    await saveArticlesToFirestore(sourceArticles);
    console.log('[Firestore] Seed complete.');
  } catch (err) {
    console.error('Error seeding Firestore:', err);
  }
}
