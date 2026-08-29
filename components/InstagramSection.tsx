'use client';

import { useState, useEffect } from 'react';
import { getInitialInstagramPosts, InstagramPost } from '../data/store';

export default function InstagramSection() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);

  const loadPosts = () => {
    const allPosts = getInitialInstagramPosts();
    setPosts(allPosts.filter((p) => p.visible).slice(0, 6));
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
              <img
                src={post.image || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&auto=format&fit=crop&q=80'}
                alt={post.caption}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&auto=format&fit=crop&q=80';
                }}
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
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

