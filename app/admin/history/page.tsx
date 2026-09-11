'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ContentHistoryItem,
  getAllContentHistory,
  recordContentChange,
  resolveArticleDeletionInHistory,
} from '../../../data/history';
import {
  getInitialArticles,
  loadArticlesFromServer,
  getArticleByIdOrSlug,
  getArchivedDeletedArticles,
  getDeletedArticleIds,
  recoverArticle,
  Article,
} from '../../../data/store';
import { ArticleItem } from '../../../data/articles';
import { isAdmin } from '../../../data/users';

export default function AdminHistoryPage() {
  const [historyItems, setHistoryItems] = useState<ContentHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'edits' | 'published' | 'draft' | 'site' | 'deleted'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customSummary, setCustomSummary] = useState('');
  const [customCategory, setCustomCategory] = useState('Homepage');
  const [customBefore, setCustomBefore] = useState('');
  const [customAfter, setCustomAfter] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Article preview modal & recovery state
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
  const [recoveringId, setRecoveringId] = useState<string | null>(null);
  const isLoadingRef = useRef(false);

  const userIsAdmin = isAdmin();

  // Pre-index all articles and deletions into in-memory Maps/Sets once per render cycle
  // This avoids calling localStorage 1,000+ times during filtering and rendering!
  const articlesContext = useMemo(() => {
    const current = getInitialArticles();
    const archived = getArchivedDeletedArticles();
    const deletedIds = getDeletedArticleIds();

    const byIdOrSlug = new Map<string, Article>();
    const byTitle = new Map<string, Article>();

    // Index active articles
    for (const a of current) {
      if (a.id) byIdOrSlug.set(a.id.toLowerCase(), a);
      if (a.slug) byIdOrSlug.set(a.slug.toLowerCase(), a);
      if (a.title) byTitle.set(a.title.trim().toLowerCase(), a);
    }

    // Index archived articles
    for (const a of archived) {
      if (a.id && !byIdOrSlug.has(a.id.toLowerCase())) byIdOrSlug.set(a.id.toLowerCase(), a);
      if (a.slug && !byIdOrSlug.has(a.slug.toLowerCase())) byIdOrSlug.set(a.slug.toLowerCase(), a);
      if (a.title && !byTitle.has(a.title.trim().toLowerCase())) byTitle.set(a.title.trim().toLowerCase(), a);
    }

    return { byIdOrSlug, byTitle, deletedIds, current, archived };
  }, [historyItems]);

  const getArticleForItem = useCallback(
    (item: ContentHistoryItem): Article | undefined => {
      if (item.editLink) {
        const editId = item.editLink.replace('/admin/articles/', '').trim().toLowerCase();
        if (editId && articlesContext.byIdOrSlug.has(editId)) {
          return articlesContext.byIdOrSlug.get(editId);
        }
      }
      const customArticleId = (item as any).articleId;
      if (customArticleId && articlesContext.byIdOrSlug.has(String(customArticleId).toLowerCase())) {
        return articlesContext.byIdOrSlug.get(String(customArticleId).toLowerCase());
      }
      if (item.title) {
        const cleanTitle = item.title
          .replace(/^Deleted:\s*/i, '')
          .replace(/^(Article Published|Draft Created|Draft Updated|Article Updated|Published|Unpublished to Draft|Recovered|Restored):\s*/i, '')
          .trim()
          .toLowerCase();

        if (articlesContext.byTitle.has(cleanTitle)) {
          return articlesContext.byTitle.get(cleanTitle);
        }
      }
      return undefined;
    },
    [articlesContext]
  );

  const isItemCurrentlyDeleted = useCallback(
    (item: ContentHistoryItem, targetArticle?: Article): boolean => {
      const isDelType = item.status === 'Deleted' || item.action === 'deleted' || item.id.startsWith('del-art') || item.title.startsWith('Deleted:');
      if (!isDelType) return false;

      if (targetArticle) {
        return articlesContext.deletedIds.has(targetArticle.id) || Boolean(targetArticle.slug && articlesContext.deletedIds.has(targetArticle.slug));
      }

      if (item.editLink) {
        const editId = item.editLink.replace('/admin/articles/', '').trim();
        if (editId) {
          return articlesContext.deletedIds.has(editId);
        }
      }

      const cleanTitle = (item.title || '')
        .replace(/^Deleted:\s*/i, '')
        .replace(/^(Article Published|Draft Created|Draft Updated|Article Updated|Published|Unpublished to Draft|Recovered|Restored):\s*/i, '')
        .trim()
        .toLowerCase();

      const inActive = articlesContext.byTitle.get(cleanTitle);
      if (inActive) {
        return articlesContext.deletedIds.has(inActive.id) || Boolean(inActive.slug && articlesContext.deletedIds.has(inActive.slug));
      }

      return true;
    },
    [articlesContext]
  );

  const handleRecover = async (targetArticle: Article) => {
    setRecoveringId(targetArticle.id);
    try {
      resolveArticleDeletionInHistory(targetArticle.id, targetArticle.slug, targetArticle.title, true);
      const recovered = await recoverArticle(targetArticle.id);
      if (recovered) {
        showFeedback(`🎉 Article "${recovered.title}" has been successfully recovered and restored to Drafts!`);
        await loadAllHistory();
        if (viewingArticle && viewingArticle.id === targetArticle.id) {
          setViewingArticle(null);
        }
      } else {
        showFeedback('Could not recover article. Please try again.');
      }
    } catch (err) {
      showFeedback('Error recovering article.');
    } finally {
      setRecoveringId(null);
    }
  };

  const loadAllHistory = async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      // 1. Self-healing reconciliation: Resolve any history items for articles that are no longer in deletedIds (skip event dispatching to prevent loops)
      const local = getInitialArticles();
      const deletedIds = getDeletedArticleIds();
      local.forEach((a) => {
        if (!deletedIds.has(a.id) && (!a.slug || !deletedIds.has(a.slug))) {
          resolveArticleDeletionInHistory(a.id, a.slug, a.title, true);
        }
      });

      const items = getAllContentHistory(local);
      setHistoryItems(items);

      // 2. Fetch latest server/Firestore articles to ensure newly created drafts or publishes appear immediately
      try {
        const server = await loadArticlesFromServer();
        if (Array.isArray(server) && server.length > 0) {
          server.forEach((a) => {
            if (!deletedIds.has(a.id) && (!a.slug || !deletedIds.has(a.slug))) {
              resolveArticleDeletionInHistory(a.id, a.slug, a.title, true);
            }
          });
          const liveItems = getAllContentHistory(server);
          setHistoryItems(liveItems);
        }
      } catch (_) {}
    } finally {
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    loadAllHistory();

    let debounceTimer: any;
    const handleUpdate = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadAllHistory();
      }, 300);
    };

    window.addEventListener('mummabee_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener('mummabee_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const toggleItemExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleExpandAll = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    const newMap: Record<string, boolean> = {};
    historyItems.forEach((item) => {
      newMap[item.id] = nextState;
    });
    setExpandedItems(newMap);
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
      const target = getArticleForItem(item);
      const isDel = isItemCurrentlyDeleted(item, target);

      // Tab filter
      if (activeTab === 'edits') {
        const isEdit = (item.status === 'Updated' || item.action === 'updated' || (Array.isArray(item.changes) && item.changes.length > 0)) && !isDel;
        if (!isEdit) return false;
      }
      if (activeTab === 'published') {
        if (item.status !== 'Published' || isDel) return false;
      }
      if (activeTab === 'draft') {
        const isDraftLike = item.status === 'Draft' || item.title.startsWith('Restored:') || item.title.startsWith('Recovered:');
        if (!isDraftLike || isDel) return false;
      }
      if (activeTab === 'deleted') {
        if (!isDel) return false;
      }
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
        const matchDiffs = (item.changes || []).some(
          (c) =>
            (c.label || '').toLowerCase().includes(q) ||
            (c.before || '').toLowerCase().includes(q) ||
            (c.after || '').toLowerCase().includes(q)
        );
        return matchTitle || matchSummary || matchAuthor || matchCategory || matchDiffs;
      }

      return true;
    });
  }, [historyItems, activeTab, categoryFilter, dateFilter, searchQuery]);

  // Reset to page 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, categoryFilter, dateFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, validCurrentPage, pageSize]);

  const formatHistoryTitle = (title: string) => {
    if (!title) return 'Untitled Record';
    if (title.includes('data:image/') || title.includes('base64,') || (title.length > 80 && !title.includes(' '))) {
      return 'Image Deleted: Uploaded Photo';
    }
    return title;
  };

  const formatHistorySummary = (summary: string) => {
    if (!summary) return '';
    if (summary.includes('data:image/') || summary.includes('base64,')) {
      return 'Deleted media file from library.';
    }
    return summary;
  };

  const handleAddCustomChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const changes = [];
    if (customBefore.trim() || customAfter.trim()) {
      changes.push({
        field: 'custom',
        label: 'Field Value',
        before: customBefore.trim() || 'None',
        after: customAfter.trim() || 'None',
      });
    }

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
      changes: changes.length > 0 ? changes : undefined,
    });

    setCustomTitle('');
    setCustomSummary('');
    setCustomBefore('');
    setCustomAfter('');
    setIsLogModalOpen(false);
    showFeedback('Content change note logged successfully!');
  };

  const handleExportCsv = () => {
    if (historyItems.length === 0) return;
    const headers = ['Date', 'Status', 'Category', 'Title', 'Author', 'Summary', 'Before & After Changes', 'Link'];
    const rows = historyItems.map((item) => {
      const changesText = (item.changes || [])
        .map((c) => `${c.label}: [Before: ${c.before || 'None'} -> After: ${c.after || 'None'}]`)
        .join('; ');
      return [
        item.timestamp,
        item.status,
        `"${(item.category || '').replace(/"/g, '""')}"`,
        `"${(item.title || '').replace(/"/g, '""')}"`,
        item.author,
        `"${(item.summary || '').replace(/"/g, '""')}"`,
        `"${changesText.replace(/"/g, '""')}"`,
        item.viewLink || item.editLink || '',
      ];
    });

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

  const { editsCount, publishedCount, draftCount, siteEditsCount, deletedCount } = useMemo(() => {
    let edits = 0;
    let published = 0;
    let drafts = 0;
    let site = 0;
    let deleted = 0;

    for (const h of historyItems) {
      const target = getArticleForItem(h);
      const isDel = isItemCurrentlyDeleted(h, target);

      if (isDel) {
        deleted++;
      } else {
        if (h.status === 'Updated' || h.action === 'updated' || (Array.isArray(h.changes) && h.changes.length > 0)) {
          edits++;
        }
        if (h.status === 'Published') {
          published++;
        }
        const isDraftLike = h.status === 'Draft' || h.title.startsWith('Restored:') || h.title.startsWith('Recovered:');
        if (isDraftLike) {
          drafts++;
        }
        if (h.type === 'homepage' || h.type === 'deal' || h.type === 'category' || h.type === 'page') {
          site++;
        }
      }
    }

    return {
      editsCount: edits,
      publishedCount: published,
      draftCount: drafts,
      siteEditsCount: site,
      deletedCount: deleted,
    };
  }, [historyItems, getArticleForItem, isItemCurrentlyDeleted]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#B75B70]/15 shadow-soft">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8EDEF] border border-[#B75B70]/20 text-[10px] font-bold text-[#B75B70] uppercase tracking-wider">
            <span>📝</span>
            <span>SYSTEM AUDIT &amp; CONTENT HISTORY</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#683846]">
            Content, Edits &amp; Before/After History
          </h1>
          <p className="text-xs text-[#332D2F]/70 max-w-2xl leading-relaxed">
            Every update, draft, publishing action, deletion, and site modification is automatically tracked with exact before and after values.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={toggleExpandAll}
            className="px-4 py-2 bg-white hover:bg-[#F8EDEF] text-[#683846] border border-[#B75B70]/30 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{allExpanded ? '▲ Collapse Diffs' : '▼ Expand All Diffs'}</span>
          </button>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
          <div className="flex items-center justify-between text-[#332D2F]/50 text-xs mb-1">
            <span>Total Logged</span>
            <span className="text-base">📚</span>
          </div>
          <div className="font-serif text-2xl font-bold text-[#683846]">
            {historyItems.length}
          </div>
          <span className="text-[10px] text-[#B75B70] font-medium mt-1 block">Full activity log</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#B75B70]/20 bg-[#F8EDEF]/30 shadow-soft">
          <div className="flex items-center justify-between text-[#332D2F]/50 text-xs mb-1">
            <span>Content Edits</span>
            <span className="text-base">✏️</span>
          </div>
          <div className="font-serif text-2xl font-bold text-[#B75B70]">
            {editsCount}
          </div>
          <span className="text-[10px] text-[#B75B70] font-medium mt-1 block">With Before/After</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
          <div className="flex items-center justify-between text-[#332D2F]/50 text-xs mb-1">
            <span>Live Published</span>
            <span className="text-base">🟢</span>
          </div>
          <div className="font-serif text-2xl font-bold text-emerald-700">
            {publishedCount}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Active live</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
          <div className="flex items-center justify-between text-[#332D2F]/50 text-xs mb-1">
            <span>Active Drafts</span>
            <span className="text-base">📝</span>
          </div>
          <div className="font-serif text-2xl font-bold text-amber-700">
            {draftCount}
          </div>
          <span className="text-[10px] text-amber-600 font-medium mt-1 block">Drafts in progress</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
          <div className="flex items-center justify-between text-[#332D2F]/50 text-xs mb-1">
            <span>Site Edits</span>
            <span className="text-base">🏡</span>
          </div>
          <div className="font-serif text-2xl font-bold text-[#683846]">
            {siteEditsCount}
          </div>
          <span className="text-[10px] text-[#332D2F]/60 font-medium mt-1 block">Homepage &amp; pages</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
          <div className="flex items-center justify-between text-[#332D2F]/50 text-xs mb-1">
            <span>Deletions</span>
            <span className="text-base">🗑️</span>
          </div>
          <div className="font-serif text-2xl font-bold text-rose-700">
            {deletedCount}
          </div>
          <span className="text-[10px] text-rose-600 font-medium mt-1 block">Archived removals</span>
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
              All Events ({historyItems.length})
            </button>
            <button
              onClick={() => setActiveTab('edits')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'edits' ? 'bg-[#B75B70] text-white shadow-xs' : 'text-[#B75B70] hover:bg-white/60'
              }`}
            >
              ✏️ Latest Edits ({editsCount})
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
              🏡 Site &amp; Pages ({siteEditsCount})
            </button>
            <button
              onClick={() => setActiveTab('deleted')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'deleted' ? 'bg-rose-700 text-white shadow-xs' : 'text-rose-800 hover:bg-white/60'
              }`}
            >
              🗑️ Deletions ({deletedCount})
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
            placeholder="Search by title, category, summary, author, or before/after diffs..."
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
            {paginatedItems.map((item) => {
              const targetArticle = getArticleForItem(item);
              const isDeleted = isItemCurrentlyDeleted(item, targetArticle);
              const wasRecovered = (item.id.startsWith('del-art') || item.title.startsWith('Deleted:') || item.title.startsWith('Restored:')) && !isDeleted;
              const isDraft = item.status === 'Draft' || wasRecovered;
              const isItemExpanded = Boolean(expandedItems[item.id] || allExpanded);
              const hasChanges = Array.isArray(item.changes) && item.changes.length > 0;

              return (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 hover:bg-[#F8EDEF]/25 transition-colors space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      {/* Status Badge + Category + Timestamp + Author */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {isDeleted ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 uppercase tracking-wider">
                            🗑️ DELETED
                          </span>
                        ) : wasRecovered ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase tracking-wider">
                            🟢 RESTORED TO DRAFTS
                          </span>
                        ) : isDraft ? (
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
                      <h3 className={`font-serif text-base sm:text-lg font-bold ${isDeleted ? 'text-rose-900 line-through' : 'text-[#683846]'}`}>
                        {formatHistoryTitle(wasRecovered ? item.title.replace(/^Deleted:\s*/i, 'Restored to Drafts: ') : item.title)}
                      </h3>

                      {/* Summary / Excerpt */}
                      <p className="text-xs text-[#332D2F]/80 leading-relaxed font-sans max-w-4xl">
                        {formatHistorySummary(wasRecovered ? 'Article has been recovered from trash and is safely saved in your active Drafts.' : item.summary)}
                      </p>

                      {isDeleted && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 text-rose-800 text-[11px] font-medium border border-rose-200">
                          <span>🗑️</span>
                          <span>Archived deletion record &bull; Permanently removed from active catalog.</span>
                        </div>
                      )}
                    </div>

                    {/* Direct Actions: View on Site / Edit in CMS / Recover / See Whole Article */}
                    <div className="flex items-center gap-2 self-start md:self-center shrink-0 pt-2 md:pt-0 flex-wrap">
                      {isDeleted && targetArticle && (
                        <>
                          <button
                            type="button"
                            onClick={() => setViewingArticle(targetArticle)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#683846] hover:bg-[#522b37] text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
                          >
                            <span>📖</span>
                            <span>See Whole Article</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRecover(targetArticle)}
                            disabled={recoveringId === targetArticle.id}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer whitespace-nowrap"
                          >
                            <span>♻️</span>
                            <span>{recoveringId === targetArticle.id ? 'Recovering...' : 'Recover Article'}</span>
                          </button>

                          <Link
                            href={`/admin/articles/${targetArticle.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F8EDEF] hover:bg-[#B75B70] hover:text-white text-[#683846] text-xs font-bold transition-all border border-[#B75B70]/30 whitespace-nowrap"
                          >
                            <span>✎</span>
                            <span>Edit &amp; Restore</span>
                          </Link>
                        </>
                      )}

                      {wasRecovered && (
                        <>
                          {targetArticle && (
                            <button
                              type="button"
                              onClick={() => setViewingArticle(targetArticle)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#683846] hover:bg-[#522b37] text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
                            >
                              <span>📖</span>
                              <span>See Whole Article</span>
                            </button>
                          )}
                          <Link
                            href={targetArticle ? `/admin/articles/${targetArticle.id}` : (item.editLink || '/admin/articles')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs whitespace-nowrap"
                          >
                            <span>✎</span>
                            <span>Edit Restored Draft</span>
                          </Link>
                        </>
                      )}

                      {hasChanges && (
                        <button
                          onClick={() => toggleItemExpand(item.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F8EDEF] hover:bg-[#683846] hover:text-white text-[#683846] text-xs font-bold transition-all border border-[#B75B70]/20 cursor-pointer whitespace-nowrap"
                        >
                          <span>{isItemExpanded ? '▲ Hide Diff' : '▼ View Diff'}</span>
                          <span className="text-[10px] bg-white/80 px-1.5 py-0.2 rounded-full text-[#683846]">
                            {item.changes!.length}
                          </span>
                        </button>
                      )}

                      {!isDeleted && item.editLink && (
                        <Link
                          href={item.editLink}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#F8EDEF] hover:bg-[#683846] hover:text-white text-[#683846] text-xs font-bold transition-all border border-[#B75B70]/20 whitespace-nowrap"
                        >
                          <span>✎</span>
                          <span>Edit</span>
                        </Link>
                      )}

                      {!isDeleted && item.viewLink && (
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

                  {/* BEFORE & AFTER DIFF COMPARISON SECTION */}
                  {hasChanges && isItemExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-100 bg-[#FEFAF9] p-4 rounded-2xl border border-[#B75B70]/15 space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                        <span className="text-xs font-bold text-[#683846] flex items-center gap-1.5">
                          <span>🔍</span>
                          <span>Exact Before &amp; After Values ({item.changes!.length} {item.changes!.length === 1 ? 'field changed' : 'fields changed'})</span>
                        </span>
                        <span className="text-[10px] font-mono text-[#332D2F]/50">
                          Auto-Recorded Audit Diff
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-[10px] font-bold text-[#683846]/70 uppercase tracking-wider pb-1 hidden md:grid">
                        <div className="md:col-span-3">Field Changed</div>
                        <div className="md:col-span-4 text-rose-800">Before (Previous Value)</div>
                        <div className="md:col-span-1 text-center text-gray-400">Diff</div>
                        <div className="md:col-span-4 text-emerald-800">After (New Value)</div>
                      </div>

                      <div className="space-y-2">
                        {item.changes!.map((diff, dIdx) => (
                          <div
                            key={dIdx}
                            className="grid grid-cols-1 md:grid-cols-12 gap-2 text-xs py-2 items-start border-b border-gray-100 last:border-0"
                          >
                            <div className="md:col-span-3 font-bold text-[#683846] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#B75B70]"></span>
                              <span>{diff.label}</span>
                            </div>

                            {/* Before Value Box */}
                            <div className="md:col-span-4 space-y-1">
                              <span className="md:hidden font-bold text-[10px] text-rose-800 uppercase block">
                                Before:
                              </span>
                              <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-950 font-mono text-[11px] leading-relaxed break-words whitespace-pre-wrap shadow-2xs">
                                {diff.before || '<None>'}
                              </div>
                            </div>

                            {/* Arrow Divider */}
                            <div className="hidden md:flex md:col-span-1 items-center justify-center text-gray-400 text-base pt-3 font-bold">
                              →
                            </div>

                            {/* After Value Box */}
                            <div className="md:col-span-4 space-y-1">
                              <span className="md:hidden font-bold text-[10px] text-emerald-800 uppercase block">
                                After:
                              </span>
                              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-mono text-[11px] font-medium leading-relaxed break-words whitespace-pre-wrap shadow-2xs">
                                {diff.after || '<None>'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : activeTab === 'deleted' ? (
          <div className="p-12 text-center space-y-3">
            <span className="text-3xl">🎉</span>
            <h3 className="font-serif text-lg font-bold text-[#683846]">Trash is Empty</h3>
            <p className="text-xs text-[#332D2F]/70 max-w-sm mx-auto">
              All articles are active or safely saved in your Drafts catalog. No articles are currently in trash.
            </p>
            <button
              onClick={() => setActiveTab('draft')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#683846] hover:bg-[#522b37] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
            >
              <span>📝 View Recovered Drafts</span>
              <span>→</span>
            </button>
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

        {/* Pagination & Footer Controls */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#332D2F]/70">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium">
              Showing {filteredItems.length === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1}–{Math.min(validCurrentPage * pageSize, filteredItems.length)} of {filteredItems.length} items
            </span>
            <div className="flex items-center gap-1.5 ml-2 border-l border-gray-200 pl-3">
              <span className="text-[11px] text-gray-500">Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-[#683846] focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Numbered Pagination Buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                disabled={validCurrentPage === 1}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-[#683846] hover:bg-[#F8EDEF] disabled:opacity-30 disabled:hover:bg-white cursor-pointer transition-colors"
                title="Previous Page"
              >
                ‹ Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => {
                    setCurrentPage(pageNum);
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center ${
                    validCurrentPage === pageNum
                      ? 'bg-[#683846] text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-[#683846] hover:bg-[#F8EDEF]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                disabled={validCurrentPage === totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-[#683846] hover:bg-[#F8EDEF] disabled:opacity-30 disabled:hover:bg-white cursor-pointer transition-colors"
                title="Next Page"
              >
                Next ›
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
              setCategoryFilter('all');
              setDateFilter('all');
              setCurrentPage(1);
            }}
            className="text-[#B75B70] hover:underline cursor-pointer font-medium text-xs whitespace-nowrap"
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
                  rows={2}
                  value={customSummary}
                  onChange={(e) => setCustomSummary(e.target.value)}
                  placeholder="Details of what was added, modified, or drafted..."
                  className="w-full bg-[#FEFAF9] border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-[#332D2F] focus:outline-none focus:border-[#B75B70]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F8EDEF]/50 rounded-2xl border border-[#B75B70]/15">
                <div>
                  <label className="block text-[11px] font-bold text-rose-800 mb-1">
                    Before Value (Optional)
                  </label>
                  <input
                    type="text"
                    value={customBefore}
                    onChange={(e) => setCustomBefore(e.target.value)}
                    placeholder="e.g. 5 active discount codes"
                    className="w-full bg-white border border-rose-200 rounded-xl px-3 py-1.5 text-xs text-rose-950 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                    After Value (Optional)
                  </label>
                  <input
                    type="text"
                    value={customAfter}
                    onChange={(e) => setCustomAfter(e.target.value)}
                    placeholder="e.g. 8 verified active codes"
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs text-emerald-950 font-mono focus:outline-none"
                  />
                </div>
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

      {/* FULL ARTICLE PREVIEW & RECOVERY MODAL */}
      {viewingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-[#B75B70]/20 flex flex-col my-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 z-10">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 uppercase">
                    🗑️ Archived / Deleted Article
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-[#332D2F]/70">
                    {viewingArticle.category}
                  </span>
                </div>
                <h2 className="font-serif text-lg sm:text-2xl font-bold text-[#683846] truncate">
                  {viewingArticle.title}
                </h2>
              </div>
              <button
                onClick={() => setViewingArticle(null)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-[#332D2F] flex items-center justify-center font-bold text-sm cursor-pointer transition-all shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Action Toolbar */}
            <div className="px-6 py-3 bg-[#F8EDEF]/60 border-b border-[#B75B70]/15 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#683846]">
                Author: <strong>{viewingArticle.author || 'Donne'}</strong> &bull; Read Time: {viewingArticle.readTime || '4 min read'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRecover(viewingArticle)}
                  disabled={recoveringId === viewingArticle.id}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>♻️</span>
                  <span>{recoveringId === viewingArticle.id ? 'Recovering...' : 'Recover to Drafts'}</span>
                </button>
                <Link
                  href={`/admin/articles/${viewingArticle.id}`}
                  className="px-4 py-2 bg-[#683846] hover:bg-[#522b37] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>✎</span>
                  <span>Edit &amp; Restore</span>
                </Link>
              </div>
            </div>

            {/* Modal Body: Full Article Content */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
              {/* Cover Image */}
              {viewingArticle.featuredImage && (
                <div className="rounded-2xl overflow-hidden border border-gray-200 max-h-[340px] bg-gray-50 flex items-center justify-center">
                  <img
                    src={viewingArticle.featuredImage}
                    alt={viewingArticle.title}
                    className="w-full h-full object-cover max-h-[340px]"
                  />
                </div>
              )}

              {/* Excerpt */}
              {viewingArticle.excerpt && (
                <div className="p-4 rounded-2xl bg-[#FEFAF9] border border-[#B75B70]/15">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B75B70] block mb-1">
                    Summary / Excerpt
                  </span>
                  <p className="text-xs sm:text-sm text-[#332D2F]/85 leading-relaxed italic">
                    &ldquo;{viewingArticle.excerpt}&rdquo;
                  </p>
                </div>
              )}

              {/* MummaBee Mum Tip Box */}
              {viewingArticle.mummaBeeTip && (
                <div className="p-4 rounded-2xl bg-[#F8EDEF] border border-[#B75B70]/30 space-y-1">
                  <span className="text-xs font-bold text-[#683846] flex items-center gap-1.5">
                    <span>🐝</span>
                    <span>MummaBee Mum Tip</span>
                  </span>
                  <p className="text-xs text-[#332D2F]/85 leading-relaxed">
                    {viewingArticle.mummaBeeTip}
                  </p>
                </div>
              )}

              {/* Quick Facts */}
              {viewingArticle.quickFacts && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
                  {viewingArticle.quickFacts.location && (
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-semibold block">Location</span>
                      <span className="font-bold text-[#683846]">{viewingArticle.quickFacts.location}</span>
                    </div>
                  )}
                  {viewingArticle.quickFacts.bestFor && (
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-semibold block">Best For</span>
                      <span className="font-bold text-[#683846]">{viewingArticle.quickFacts.bestFor}</span>
                    </div>
                  )}
                  {viewingArticle.quickFacts.budget && (
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-semibold block">Budget</span>
                      <span className="font-bold text-[#683846]">{viewingArticle.quickFacts.budget}</span>
                    </div>
                  )}
                  {viewingArticle.quickFacts.timeNeeded && (
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-semibold block">Time Needed</span>
                      <span className="font-bold text-[#683846]">{viewingArticle.quickFacts.timeNeeded}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Full Article Content */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#683846] block border-b border-gray-100 pb-2">
                  Complete Article Body Content
                </span>
                <div
                  className="prose prose-sm max-w-none text-xs sm:text-sm text-[#332D2F] leading-relaxed font-sans space-y-3"
                  dangerouslySetInnerHTML={{ __html: viewingArticle.content }}
                />
              </div>

              {/* Tags */}
              {viewingArticle.tags && viewingArticle.tags.length > 0 && (
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-gray-500">Tags:</span>
                  {viewingArticle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setViewingArticle(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-[#332D2F] hover:bg-gray-100 transition-all cursor-pointer"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/articles/${viewingArticle.id}`}
                  className="px-4 py-2 bg-[#683846] hover:bg-[#522b37] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  ✎ Edit &amp; Restore
                </Link>
                <button
                  type="button"
                  onClick={() => handleRecover(viewingArticle)}
                  disabled={recoveringId === viewingArticle.id}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>♻️</span>
                  <span>{recoveringId === viewingArticle.id ? 'Recovering...' : 'Recover This Article'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
