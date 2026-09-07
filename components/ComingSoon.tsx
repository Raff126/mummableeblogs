'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/subscribers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, source: 'Coming Soon Page' }),
      });
      const data = await res.json();
      setMessage(data.message || 'Thank you for subscribing, look out for our exciting updates in your inbox soon');
      setIsSuccess(true);
      setEmail('');
    } catch (err) {
      setMessage('Thank you for subscribing, look out for our exciting updates in your inbox soon');
      setIsSuccess(true);
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF4F5] text-[#332D2F] font-sans flex flex-col justify-between items-center p-6 sm:p-10 relative overflow-hidden text-center selection:bg-[#EFAEB9] selection:text-[#683846]">
      {/* Soft Ambient Background Glows */}
      <div
        className="absolute -top-28 -right-24 w-[450px] sm:w-[550px] h-[450px] sm:h-[550px] rounded-full pointer-events-none blur-3xl opacity-70"
        style={{
          background: 'radial-gradient(circle, rgba(235, 175, 189, 0.4) 0%, rgba(251, 244, 245, 0) 70%)',
        }}
      />
      <div
        className="absolute -bottom-28 -left-28 w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full pointer-events-none blur-3xl opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(240, 190, 202, 0.35) 0%, rgba(251, 244, 245, 0) 70%)',
        }}
      />

      {/* Top Spacer */}
      <div className="w-full flex justify-end items-center max-w-4xl pt-2">
        <Link
          href="/admin/login"
          className="text-[11px] font-medium text-[#B75B70]/60 hover:text-[#683846] transition-colors px-3 py-1.5 rounded-full hover:bg-white/60"
        >
          Staff / Admin Login →
        </Link>
      </div>

      {/* Main Card */}
      <main className="max-w-[680px] w-full my-auto flex flex-col items-center relative z-10 px-4">
        {/* Brand Logo Badge */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-white shadow-lg border border-[#DF2A64]/20 mb-6 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
          <img
            src="/images/mama-logo.png"
            alt="MummaBeeBlog Logo"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        {/* Brand Title */}
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#9E4A5C] tracking-wide mb-3 leading-tight">
          MummaBeeBlog
        </h1>

        {/* Coming Soon Pill */}
        <div className="mb-6">
          <span className="inline-block text-[10px] font-bold tracking-[0.18em] uppercase text-[#683846] bg-[#F4E2E6] px-4 py-1.5 rounded-full border border-[#B75B70]/20 shadow-xs">
            COMING SOON
          </span>
        </div>

        {/* Tagline */}
        <h2 className="font-serif text-2xl sm:text-4xl italic font-normal text-[#5C4B4F] leading-snug mb-4">
          Something beautiful is coming.
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#7E7073] leading-relaxed max-w-md mx-auto mb-8 font-normal">
          We&apos;re currently working behind the scenes to give MummaBeeBlog a fresh new home. Sign up below to be the first to know when we launch and get our weekly UAE family guide.
        </p>

        {/* Newsletter Signup Box */}
        <div className="w-full max-w-md mx-auto mb-8">
          <form
            onSubmit={handleSubmit}
            className="flex bg-white border border-[#B75B70]/30 rounded-full p-1.5 shadow-sm hover:border-[#B75B70]/60 transition-colors gap-2"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-transparent border-none px-4 py-2 text-xs sm:text-sm text-[#332D2F] placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#DF2A64] hover:bg-[#B75B70] text-white text-[11px] font-bold tracking-wider uppercase px-5 sm:px-6 py-2 rounded-full transition-all duration-200 cursor-pointer disabled:opacity-60 shadow-xs shrink-0"
            >
              {submitting ? 'Submitting...' : 'Get Notified'}
            </button>
          </form>

          {message && (
            <div
              className={`text-xs mt-3.5 py-2.5 px-4 rounded-2xl border transition-all ${
                isSuccess
                  ? 'bg-[#F4E2E6] text-[#8C4052] border-[#B75B70]/30'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-12 h-0.5 bg-[#E8BFC9] mx-auto mb-8 rounded-full" />

        {/* Social Media Links */}
        <div className="flex items-center justify-center gap-3.5">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/mummabeeblog/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-[#F3DEE3] text-[#8C4052] flex items-center justify-center hover:bg-[#DF2A64] hover:text-white hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
            title="Instagram"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://facebook.com/mummabeeblog"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-[#F3DEE3] text-[#8C4052] flex items-center justify-center hover:bg-[#DF2A64] hover:text-white hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
            title="Facebook"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>

          {/* TikTok */}
          <a
            href="https://tiktok.com/@mummabee.blog"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-[#F3DEE3] text-[#8C4052] flex items-center justify-center hover:bg-[#DF2A64] hover:text-white hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
            title="TikTok"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.94-4.52V8.47a8.28 8.28 0 0 0 4.83 1.54V6.69h-1z"/>
            </svg>
          </a>

          {/* Pinterest */}
          <a
            href="https://ph.pinterest.com/mummabeeblog/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-[#F3DEE3] text-[#8C4052] flex items-center justify-center hover:bg-[#DF2A64] hover:text-white hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
            title="Pinterest"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.357-.053.225-.177.268-.407.161-1.523-.708-2.472-2.934-2.472-4.721 0-3.844 2.793-7.375 8.058-7.375 4.232 0 7.521 3.016 7.521 7.047 0 4.204-2.651 7.589-6.331 7.589-1.236 0-2.399-.643-2.796-1.402l-.761 2.898c-.276 1.063-1.022 2.396-1.524 3.208C9.539 23.827 10.743 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </main>

      {/* Footer Copyright */}
      <footer className="relative z-10 text-[11px] text-[#9C8F92] tracking-wide mt-6">
        © 2026 MummaBeeBlog · All rights reserved
      </footer>
    </div>
  );
}
