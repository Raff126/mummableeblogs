'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ContentHistoryItem,
  getAllContentHistory,
  recordContentChange,
} from '../../../data/history';
import { getInitialArticles, loadArticlesFromServer } from '../../../data/store';
import { ArticleItem } from '../../../data/articles';
import { isAdmin } from '../../../data/users';

export default function AdminHistoryPage() {
  const [historyItems, setHistoryItems] = useState<ContentHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'site'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customSummary, setCustomSummary] = useState('');
  const [customCategory, setCustomCategory] = useState('Homepage');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const userIsAdmin = isAdmin();

  const loadAllHistory = async () => {
    // 1. Load from local cache first
    const local = getInitialArticles();
    const items = getAllContentHistory(local);
    setHistoryItems(items);

    // 2. Fetch latest server/Firestore articles to ensure newly created drafts or publishes appear immediately
    try {
      const server = await loadArticlesFromServer();
      if (Array.isArray(server) && server.length > 0) {
        const liveItems = getAllContentHistory(server);
        setHistoryItems(liveItems);
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadAllHistory();

    const handleUpdate = () => loadAllHistory();
    window.addEventListener('mummabee_content_updated', handleUpdate);
    window.addEventListener('mummabee_history_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('mummabee_content_updated', handleUpdate);
      window.removeEventListener('mummabee_history_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Collect unique categories for filter dropdown
  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    historyItems.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats).sort();
  }, [historyItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    return historyItems.filter((item) => {
      // Tab filter
      if (activeTab === 'published' && item.status !== 'Published') return false;
      if (activeTab === 'draft' && item.status !== 'Draft') return false;
      if (activeTab === 'site' && item.type !== 'homepage' && item.type !== 'deal' && item.type !== 'category' && item.type !== 'page') {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const itemTime = new Date(item.timestamp).getTime();
        const now = Date.now();
        if (dateFilter === 'today') {
          const startOfToday = new Date().setHours(0, 0, 0, 0);
          if (itemTime < startOfToday) return false;
        } else if (dateFilter === '7d') {
          if (now - itemTime > 7 * 24 * 60 * 60 * 1000) return false;
        } else if (dateFilter === '30d') {
          if (now - itemTime > 30 * 24 * 60 * 60 * 1000) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchSummary = (item.summary || '').toLowerCase().includes(q);
        const matchAuthor = (item.author || '').toLowerCase().includes(q);
        const matchCategory = (item.category || '').toLowerCase().includes(q);
        return matchTitle || matchSummary || matchAuthor || matchCategory;
      }

      return true;
    });
  }, [historyItems, activeTab, categoryFilter, dateFilter, searchQuery]);

  const handleAddCustomChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    recordContentChange({
      type: 'homepage',
      action: 'updated',
      title: customTitle.trim(),
      summary: customSummary.trim() || 'Editorial modification logged.',
      category: customCategory,
      author: 'Donne',
      status: 'Updated',
      badgeColor: 'bg-[#683846] text-white',
      editLink: '/admin/homepage',
      viewLink: '/',
    });

    setCustomTitle('');
    setCustomSummary('');
    setIsLogModalOpen(false);
    showFeedback('Content change note logged successfully!');
  };

  const handleExportCsv = () => {
    if (historyItems.length === 0) return;
    const headers = ['Date', 'Status', 'Category', 'Title', 'Author', 'Summary', 'Link'];
    const rows = historyItems.map((item) => [
      item.timestamp,
      item.status,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      `"${(item.title || '').replace(/"/g, '""')}"`,
      item.author,
      `"${(item.summary || '').replace(/"/g, '""')}"`,
      item.viewLink || item.editLink || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mummabee_content_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback('Content history exported to CSV.');
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (_) {
      return iso;
    }
  };

  if (!userIsAdmin) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-2xl">
          🔒
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#683846]">Restricted Access</h2>
        <p className="text-xs text-[#332D2F]/70">
          The Content &amp; Draft History log is strictly restricted to full Administrators.
        </p>
        <Link
          href="/admin"
          className="inline-block px-5 py-2.5 bg-[#683846] text-white rounded-full text-xs font-bold uppercase tracking-wider"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const publishedCount = historyItems.filter((h) => h.status === 'Published').length;
  const draftCount = historyItems.filter((h) => h.status === 'Draft').length;
  const siteEditsCount = historyItems.filter((h) => h.type === 'homepage' || h.type === 'deal' || h.type === 'category').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#B75B70]/15 shadow-soft">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8EDEF] border border-[#B75B70]/20 text-[10px] font-bold text-[#B75B70] uppercase tracking-wider">
            <span>📝</span>
            <span>WEBSITE &amp; CMS HISTORY</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#683846]">
            Content &amp; Drafts History
          </h1>
          <p className="text-xs text-[#332D2F]/70 max-w-2xl leading-relaxed">
            Track all editorial updates, published articles, active drafts in progress, and homepage modifications across MummaBeeBlog.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-4 py-2 bg-[#683846] hover:bg-[#522b37] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>✍️</span>
            <span>Log Note</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-white hover:bg-[#F8EDEF] text-[#683846] border border-[#B75B70]/30 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <span>✓</span>
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
          <div className="flex items-center justify-between text-[#332D2F]/50 text-xs mb-1">
            <span>Total Content Items</span>
            <span className="text-base">📚</span>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#683846]">
            {historyItems.length}
          </div>
          <span className="text-[10px] text-[#B75B70] font-medium mt-1 block">Articles &amp; site sections</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
          <div className="flex items-center justify-between text-[#332D2F]/50 text-xs mb-1">
            <span>Live Published</span>
            <span className="text-base">🟢</span>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700">
            {publishedCount}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Visible to website visitors</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
          <div className="flex items-center justify-between text-[#332D2F]/50 text-xs mb-1">
            <span>Active Drafts</span>
            <span className="text-base">📝</span>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-amber-700">
            {draftCount}
          </div>
          <span className="text-[10px] text-amber-600 font-medium mt-1 block">Work-in-progress in admin</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
          <div className="flex items-center justify-between text-[#332D2F]/50 text-xs mb-1">
            <span>Homepage &amp; Site Edits</span>
            <span className="text-base">🏡</span>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#B75B70]">
            {siteEditsCount}
          </div>
          <span className="text-[10px] text-[#332D2F]/60 font-medium mt-1 block">Layout, deals &amp; categories</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-soft space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F8EDEF] rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'all' ? 'bg-[#683846] text-white shadow-xs' : 'text-[#683846] hover:bg-white/60'
              }`}
            >
              All Content ({historyItems.length})
            </button>
            <button
              onClick={() => setActiveTab('published')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'published' ? 'bg-emerald-700 text-white shadow-xs' : 'text-emerald-800 hover:bg-white/60'
              }`}
            >
              🟢 Published ({publishedCount})
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'draft' ? 'bg-amber-700 text-white shadow-xs' : 'text-amber-800 hover:bg-white/60'
              }`}
            >
              📝 Drafts ({draftCount})
            </button>
            <button
              onClick={() => setActiveTab('site')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'site' ? 'bg-[#683846] text-white shadow-xs' : 'text-[#683846] hover:bg-white/60'
              }`}
            >
              🏡 Homepage &amp; Deals ({siteEditsCount})
            </button>
          </div>

          {/* Category & Date Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#332D2F]/60 font-medium">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#F8EDEF] border border-[#B75B70]/20 text-[#683846] text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none max-w-[160px]"
              >
                <option value="all">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#332D2F]/60 font-medium">Period:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="bg-[#F8EDEF] border border-[#B75B70]/20 text-[#683846] text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="7d">Past 7 Days</option>
                <option value="30d">Past 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by article title, category, summary, or author..."
            className="w-full bg-[#FEFAF9] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#332D2F] placeholder-[#332D2F]/40 focus:outline-none focus:border-[#B75B70]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-[#332D2F]/40 hover:text-[#683846]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Content History Table / List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
        {filteredItems.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredItems.map((item) => {
              const isDraft = item.status === 'Draft';
              return (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 hover:bg-[#F8EDEF]/30 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    {/* Status Badge + Category + Timestamp + Author */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {isDraft ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
                          📝 DRAFT
                        </span>
                      ) : item.status === 'Published' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase tracking-wider">
                          🟢 PUBLISHED
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F8EDEF] text-[#B75B70] border border-[#B75B70]/20 uppercase tracking-wider">
                          ✏️ UPDATED
                        </span>
                      )}

                      {item.category && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-[#332D2F]/70 border border-gray-200">
                          {item.category}
                        </span>
                      )}

                      <span className="text-[#332D2F]/30">•</span>
                      <span className="text-[11px] font-mono text-[#332D2F]/50">
                        {formatDate(item.timestamp)}
                      </span>

                      <span className="text-[#332D2F]/30">•</span>
                      <span className="text-[11px] text-[#683846] font-semibold flex items-center gap-1">
                        <span>👤</span>
                        <span>{item.author}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#683846]">
                      {item.title}
                    </h3>

                    {/* Summary / Excerpt */}
                    <p className="text-xs text-[#332D2F]/80 leading-relaxed font-sans max-w-4xl">
                      {item.summary}
                    </p>
                  </div>

                  {/* Direct Actions: View on Site / Edit in CMS */}
                  <div className="flex items-center gap-2 self-start md:self-center shrink-0 pt-2 md:pt-0">
                    {item.editLink && (
                      <Link
                        href={item.editLink}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#F8EDEF] hover:bg-[#683846] hover:text-white text-[#683846] text-xs font-bold transition-all border border-[#B75B70]/20 whitespace-nowrap"
                      >
                        <span>✎</span>
                        <span>Edit</span>
                      </Link>
                    )}

                    {item.viewLink && (
                      <Link
                        href={item.viewLink}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#B75B70] hover:text-white text-[#B75B70] text-xs font-bold transition-all border border-[#B75B70]/30 shadow-2xs whitespace-nowrap"
                      >
                        <span>View</span>
                        <span>↗</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <span className="text-3xl">🔍</span>
            <h3 className="font-serif text-lg font-bold text-[#683846]">No Matching Changes Found</h3>
            <p className="text-xs text-[#332D2F]/60 max-w-sm mx-auto">
              No content records match your selected filters. Try switching tabs or clearing your search.
            </p>
          </div>
        )}

        {/* Footer info */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-[#332D2F]/60">
          <span>Showing {filteredItems.length} of {historyItems.length} total website content items</span>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
              setCategoryFilter('all');
              setDateFilter('all');
            }}
            className="text-[#B75B70] hover:underline cursor-pointer font-medium"
          >
            Clear all filters
          </button>
        </div>
      </div>

      {/* Modal: Log Editorial Note */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-100 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#683846]">
                Log Website / Editorial Change
              </h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#683846] mb-1">
                  Section / Area
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full bg-[#F8EDEF] border border-[#B75B70]/20 rounded-xl px-3.5 py-2 text-xs font-semibold text-[#683846] focus:outline-none"
                >
                  <option value="Homepage">🏡 Homepage</option>
                  <option value="The Expat Edit">🇦🇪 The Expat Edit</option>
                  <option value="Family Life">👨‍👩‍👧‍👧 Family Life</option>
                  <option value="UAE With Kids">🎡 UAE With Kids</option>
                  <option value="Food & Dining">🍽️ Food &amp; Dining</option>
                  <option value="Family Travel">✈️ Family Travel</option>
                  <option value="School & Activities">🎒 School &amp; Activities</option>
                  <option value="Deals">🏷️ Deals &amp; Codes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#683846] mb-1">
                  Change Summary / Title *
                </label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Updated hero banner for winter break guide"
                  className="w-full bg-[#FEFAF9] border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-[#332D2F] focus:outline-none focus:border-[#B75B70]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#683846] mb-1">
                  Description of Changes
                </label>
                <textarea
                  rows={3}
                  value={customSummary}
                  onChange={(e) => setCustomSummary(e.target.value)}
                  placeholder="Details of what was added, modified, or drafted..."
                  className="w-full bg-[#FEFAF9] border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-[#332D2F] focus:outline-none focus:border-[#B75B70]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#683846] hover:bg-[#522b37] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
