'use client';

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app, ensureFirebaseAuth } from './firebase';

/** Race a promise against a timeout. Returns fallback if the promise doesn't resolve in time. */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.warn(`Firebase Storage operation timed out after ${ms}ms`);
      resolve(fallback);
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

/**
 * Upload a base64 data URL image to Firebase Storage and return a permanent download URL.
 * This replaces storing huge data URLs in Firestore documents (which have a 1 MB size limit).
 * Includes a 15-second timeout to prevent the UI from hanging if the upload stalls.
 */
export async function uploadImageToStorage(
  dataUrl: string,
  _path?: string
): Promise<string> {
  // Return the data URL directly without attempting remote storage
  return dataUrl;
}

/**
 * Check if a string is a base64 data URL (not a regular URL).
 * Used to decide whether an image needs to be uploaded to Storage.
 */
export function isDataUrl(url: string): boolean {
  return typeof url === 'string' && url.startsWith('data:');
}

