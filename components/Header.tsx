'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRIMARY_NAV, SOCIAL_LINKS } from '../data/nav';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-xs">
      {/* Top Announcement Bar: Date Burgundy */}
      <div className="bg-[#683846] text-white py-2 text-[10px] sm:text-[11px] font-medium tracking-widest uppercase">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex items-center justify-center">
          {/* Centered Main Banner Text */}
          <span className="text-center font-sans tracking-widest">
            REAL UAE FAMILY GUIDES • HONEST RECOMMENDATIONS • WEEKEND IDEAS
          </span>

          {/* Right Aligned Social Links */}
          <div className="hidden lg:flex items-center space-x-3 text-[10px] text-[#F8EDEF] absolute right-4 sm:right-6 lg:right-8">
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Instagram
            </a>
            <span>/</span>
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Facebook
            </a>
            <span>/</span>
            <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              TikTok
            </a>
            <span>/</span>
            <a href={SOCIAL_LINKS.pinterest} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Pinterest
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-0.5 bg-[#F8EDEF] border border-[#B75B70]/30 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
            <img
              src="/images/mama-logo.png"
              alt="MummaBeeBlog logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#683846] block leading-none">
              MummaBeeBlog
            </span>
            <span className="text-[9px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block mt-0.5">
              A Mum's Journey in the UAE
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links: Primary Nav Items */}
        <nav className="hidden lg:flex items-center space-x-3 xl:space-x-4.5">
          {PRIMARY_NAV.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`text-[11px] xl:text-xs font-bold tracking-wide transition-colors py-1 relative whitespace-nowrap ${
                  isActive ? 'text-[#683846]' : 'text-[#332D2F] hover:text-[#B75B70]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#B75B70] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Header Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-[#332D2F] hover:bg-[#F8EDEF] hover:border-[#B75B70]/40 hover:text-[#683846] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-[#332D2F] hover:bg-[#F8EDEF]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-6 space-y-1 shadow-md">
          {PRIMARY_NAV.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl font-serif text-base font-bold transition-colors ${
                  isActive ? 'bg-[#F8EDEF] text-[#683846]' : 'text-[#332D2F] hover:bg-[#F8EDEF] hover:text-[#683846]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-[#332D2F]/60 backdrop-blur-xs flex items-start justify-center pt-24 px-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#332D2F] text-lg"
            >
              ✕
            </button>
            <h3 className="font-serif text-xl font-bold text-[#683846] mb-3">Search MummaBeeBlog</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  setSearchOpen(false);
                  window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
                }
              }}
              className="flex gap-2"
            >
              <input
                type="search"
                placeholder="e.g. Dubai indoor play, brunch, packing list..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] font-sans text-xs text-[#332D2F]"
              />
              <button type="submit" className="btn-primary">
                Search
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
