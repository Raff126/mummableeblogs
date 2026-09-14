'use client';

import { useState, useEffect } from 'react';
import { getInitialInstagramPosts, getInstagramUpdatedAt, InstagramPost, STORAGE_KEYS } from '../data/store';

export default function InstagramSection() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);

  const loadPosts = async () => {
    const allPosts = getInitialInstagramPosts();
    setPosts(allPosts.filter((p) => p.visible).slice(0, 6));

    // Query live Firestore for cross-device updates
    try {
      const { fetchInstagramFromFirestore } = await import('../utils/firestoreSettings');
      const fsPosts = await fetchInstagramFromFirestore();
      if (Array.isArray(fsPosts) && fsPosts.length > 0) {
        // Only overwrite local data if Firestore data is actually newer
        // This prevents stale Firestore data from overwriting fresh local edits
        const localUpdatedAt = getInstagramUpdatedAt();
        const firestoreUpdatedAt = (fsPosts as any).__updatedAt || null;

        // If we have a local timestamp and Firestore data is older, keep local data
        if (localUpdatedAt && firestoreUpdatedAt && new Date(localUpdatedAt) > new Date(firestoreUpdatedAt)) {
          // Local data is newer — don't overwrite
          return;
        }

        setPosts(fsPosts.filter((p) => p.visible).slice(0, 6));
        try {
          localStorage.setItem(STORAGE_KEYS.INSTAGRAM, JSON.stringify(fsPosts));
        } catch (_) {}
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadPosts();

    const handleUpdate = () => loadPosts();
    window.addEventListener('mummabee_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('mummabee_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 text-center sm:text-left">
          <div>
            <span className="text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block mb-1">
              SUPPORTING BRAND MOMENTS
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#683846]">
              Follow @mummabeeblog
            </h2>
          </div>
          <a
            href="https://www.instagram.com/mummabeeblog/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Follow on Instagram →
          </a>
        </div>

        {/* 3x2 Grid on Desktop, 2-Column on Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative h-48 sm:h-64 rounded-2xl overflow-hidden shadow-soft border border-gray-100 block bg-[#F8EDEF]"
            >
              {post.image ? (
                <>
                  <img
                    src={post.image}
                    alt={post.caption}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-[#683846]/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 text-white">
                    <span className="text-xl self-end">📷</span>
                    <p className="text-xs font-medium line-clamp-3 leading-snug text-white">
                      {post.caption}
                    </p>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#F8EDEF]">
                      View on Instagram →
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full p-5 flex flex-col justify-between bg-gradient-to-br from-[#683846] via-[#874558] to-[#B75B70] text-white transition-all group-hover:from-[#562d3a] group-hover:to-[#9c4c5e]">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[10px] font-bold tracking-wider uppercase">
                      <span>📸</span> Instagram
                    </span>
                    <span className="text-base opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform">↗</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium line-clamp-4 leading-snug text-white/95">
                    {post.caption || 'Recent update from MummaBeeBlog'}
                  </p>
                  <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#F8EDEF]/80 group-hover:text-white">
                    <span>{post.displayDate || 'Moments'}</span>
                    <span>View Post →</span>
                  </div>
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

