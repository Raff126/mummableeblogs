'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  HistoryEvent,
  getHistoryEvents,
  recordHistoryEvent,
  resetHistoryToDefault,
  clearHistoryEvents,
} from '../../../data/history';
import { getAnalyticsSummary, AnalyticsSummary } from '../../../data/analytics';
import { getCurrentUser, isAdmin } from '../../../data/users';

export default function AdminHistoryPage() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'article' | 'system' | 'visitor'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDescription, setNoteDescription] = useState('');
  const [noteType, setNoteType] = useState<'system' | 'article' | 'settings'>('system');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin();

  const loadData = () => {
    setEvents(getHistoryEvents());
    try {
      const summary = getAnalyticsSummary('30d');
      setAnalyticsData(summary);
    } catch (_) {}
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('mummabee_history_updated', handleUpdate);
    window.addEventListener('mummabee_analytics_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('mummabee_history_updated', handleUpdate);
      window.removeEventListener('mummabee_analytics_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Tab filter
      if (activeFilter === 'article' && ev.type !== 'article' && ev.type !== 'homepage' && ev.type !== 'deal') {
        return false;
      }
      if (activeFilter === 'system' && ev.type !== 'system' && ev.type !== 'settings' && ev.type !== 'user') {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const evTime = new Date(ev.timestamp).getTime();
        const now = Date.now();
        if (dateFilter === 'today') {
          const startOfToday = new Date().setHours(0, 0, 0, 0);
          if (evTime < startOfToday) return false;
        } else if (dateFilter === '7d') {
          if (now - evTime > 7 * 24 * 60 * 60 * 1000) return false;
        } else if (dateFilter === '30d') {
          if (now - evTime > 30 * 24 * 60 * 60 * 1000) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchDesc = ev.description.toLowerCase().includes(q);
        const matchUser = ev.user.toLowerCase().includes(q);
        const matchBadge = ev.badge.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchUser || matchBadge;
      }

      return true;
    });
  }, [events, activeFilter, dateFilter, searchQuery]);

  const handleAddCustomEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    recordHistoryEvent({
      type: noteType,
      action: 'update',
      title: noteTitle.trim(),
      description: noteDescription.trim() || 'Manual admin note logged in history.',
      user: currentUser?.name || 'Admin',
      role: currentUser?.role || 'Admin',
      badge: noteType === 'article' ? '📝 EDITORIAL NOTE' : '⚙️ ADMIN NOTE',
    });

    setNoteTitle('');
    setNoteDescription('');
    setIsLogModalOpen(false);
    showFeedback('History event logged successfully!');
  };

  const handleExportCsv = () => {
    if (events.length === 0) return;
    const headers = ['Timestamp', 'Type', 'Action', 'Title', 'Description', 'User', 'Role', 'Link'];
    const rows = events.map((ev) => [
      ev.timestamp,
      ev.type,
      ev.action,
      `"${(ev.title || '').replace(/"/g, '""')}"`,
      `"${(ev.description || '').replace(/"/g, '""')}"`,
      ev.user,
      ev.role || '',
      ev.link || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mummabee_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback('History exported to CSV.');
  };

  // Badge stylings
  const getBadgeStyle = (action: string, type: string) => {
    if (action === 'publish') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action === 'deploy') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (action === 'sync') return 'bg-sky-50 text-sky-700 border-sky-200';
    if (action === 'draft') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (action === 'delete') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (type === 'homepage') return 'bg-[#F8EDEF] text-[#B75B70] border-[#B75B70]/20';
    return 'bg-purple-50 text-[#683846] border-[#683846]/20';
  };

  const formatEventDate = (iso: string) => {
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
          The System &amp; Activity History audit log is strictly restricted to full Administrators.
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#B75B70]/15 shadow-soft">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8EDEF] border border-[#B75B70]/20 text-[10px] font-bold text-[#B75B70] uppercase tracking-wider">
            <span>🕒</span>
            <span>AUDIT TRAIL &amp; TELEMETRY</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#683846]">
            System &amp; Activity History
          </h1>
          <p className="text-xs text-[#332D2F]/70 max-w-2xl leading-relaxed">
            Chronological audit log tracking content publishing, editorial modifications, deployments, database synchronizations, and visitor activity.
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
            <span>Total Logged Events</span>
            <span className="text-base">📋</span>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#683846]">
            {events.length}
          </div>
          <span className="text-[10px] text-[#B75B70] font-medium mt-1 block">Full chronological audit</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
          <div className="flex items-center justify-between text-[#332D2F]/50 text-xs mb-1">
            <span>Editorial Publishes</span>
            <span className="text-base">📝</span>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700">
            {events.filter((e) => e.action === 'publish').length}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Live articles published</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
          <div className="flex items-center justify-between text-[#332D2F]/50 text-xs mb-1">
            <span>Deployments &amp; Syncs</span>
            <span className="text-base">🚀</span>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-indigo-700">
            {events.filter((e) => e.action === 'deploy' || e.action === 'sync').length}
          </div>
          <span className="text-[10px] text-indigo-600 font-medium mt-1 block">Hosting releases &amp; cache syncs</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
          <div className="flex items-center justify-between text-[#332D2F]/50 text-xs mb-1">
            <span>Visitor Telemetry</span>
            <span className="text-base">📈</span>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#B75B70]">
            {analyticsData?.recentVisitors?.length || 0}
          </div>
          <span className="text-[10px] text-[#332D2F]/60 font-medium mt-1 block">Recent visitor sessions</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-soft space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Main Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F8EDEF] rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'all' ? 'bg-[#683846] text-white shadow-xs' : 'text-[#683846] hover:bg-white/60'
              }`}
            >
              All History ({events.length})
            </button>
            <button
              onClick={() => setActiveFilter('article')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'article' ? 'bg-[#683846] text-white shadow-xs' : 'text-[#683846] hover:bg-white/60'
              }`}
            >
              Content &amp; Editorial ({events.filter((e) => e.type === 'article' || e.type === 'homepage').length})
            </button>
            <button
              onClick={() => setActiveFilter('system')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'system' ? 'bg-[#683846] text-white shadow-xs' : 'text-[#683846] hover:bg-white/60'
              }`}
            >
              System &amp; Deployments ({events.filter((e) => e.type === 'system' || e.type === 'settings').length})
            </button>
            <button
              onClick={() => setActiveFilter('visitor')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'visitor' ? 'bg-[#683846] text-white shadow-xs' : 'text-[#683846] hover:bg-white/60'
              }`}
            >
              Visitor Telemetry ({analyticsData?.recentVisitors?.length || 0})
            </button>
          </div>

          {/* Date Filter */}
          {activeFilter !== 'visitor' && (
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-xs text-[#332D2F]/60 font-medium">Period:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="bg-[#F8EDEF] border border-[#B75B70]/20 text-[#683846] text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="all">All Dates</option>
                <option value="today">Today Only</option>
                <option value="7d">Past 7 Days</option>
                <option value="30d">Past 30 Days</option>
              </select>
            </div>
          )}
        </div>

        {/* Search Field */}
        {activeFilter !== 'visitor' && (
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history by keyword, title, author, or action..."
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
        )}
      </div>

      {/* Main History List (When Not Visitor Telemetry) */}
      {activeFilter !== 'visitor' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
          {filteredEvents.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-5 sm:p-6 hover:bg-[#F8EDEF]/30 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    {/* Top Row: Badge + Time + User */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getBadgeStyle(
                          event.action,
                          event.type
                        )}`}
                      >
                        {event.badge || event.action}
                      </span>
                      <span className="text-[#332D2F]/40">•</span>
                      <span className="text-[11px] font-mono text-[#332D2F]/50">
                        {formatEventDate(event.timestamp)}
                      </span>
                      <span className="text-[#332D2F]/40">•</span>
                      <span className="text-[11px] text-[#683846] font-semibold flex items-center gap-1">
                        <span>👤</span>
                        <span>{event.user}</span>
                        {event.role && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-gray-100 rounded text-[#332D2F]/60">
                            {event.role}
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#683846]">
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[#332D2F]/80 leading-relaxed font-sans">
                      {event.description}
                    </p>
                  </div>

                  {/* Actions (if link exists) */}
                  {event.link && (
                    <div className="self-start sm:self-center shrink-0 pt-2 sm:pt-0">
                      <Link
                        href={event.link}
                        target={event.link.startsWith('http') ? '_blank' : undefined}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F8EDEF] hover:bg-[#B75B70] hover:text-white text-[#683846] text-xs font-bold transition-all border border-[#B75B70]/20"
                      >
                        <span>View</span>
                        <span>→</span>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <span className="text-3xl">🔍</span>
              <h3 className="font-serif text-lg font-bold text-[#683846]">No Matching History Records</h3>
              <p className="text-xs text-[#332D2F]/60 max-w-sm mx-auto">
                No events matched your selected search or filters. Try adjusting your keywords or date range.
              </p>
            </div>
          )}

          {/* Bottom Actions Toolbar */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-[#332D2F]/60">
            <span>Showing {filteredEvents.length} of {events.length} logged events</span>
            <button
              onClick={() => {
                if (confirm('Reset history to initial sample records?')) {
                  resetHistoryToDefault();
                  showFeedback('History reset to defaults.');
                }
              }}
              className="text-[#B75B70] hover:underline cursor-pointer font-medium"
            >
              Reset to default history
            </button>
          </div>
        </div>
      )}

      {/* Visitor Telemetry Tab Stream */}
      {activeFilter === 'visitor' && analyticsData && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#683846]">
                Recent Visitor Telemetry Log
              </h3>
              <p className="text-xs text-[#332D2F]/60">
                Live stream of recent visitor sessions tracked across your blog.
              </p>
            </div>
            <Link
              href="/admin/analytics"
              className="px-3 py-1.5 bg-[#F8EDEF] hover:bg-[#B75B70] hover:text-white text-[#683846] text-xs font-bold rounded-full transition-all border border-[#B75B70]/20"
            >
              Open Full Analytics →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#332D2F]">
              <thead className="bg-[#F8EDEF] text-[11px] font-bold text-[#332D2F]/60 uppercase tracking-wider border-b border-[#B75B70]/10">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Page Visited</th>
                  <th className="py-3 px-4">Origin</th>
                  <th className="py-3 px-4">Device</th>
                  <th className="py-3 px-4">Browser &amp; OS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {analyticsData.recentVisitors.map((v) => {
                  const d = new Date(v.timestamp);
                  return (
                    <tr key={v.id} className="hover:bg-[#F8EDEF]/40 transition-colors">
                      <td className="py-3 px-4 text-[#332D2F]/50 font-mono text-[11px] whitespace-nowrap">
                        {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={v.path}
                          target="_blank"
                          className="font-bold text-[#683846] hover:text-[#B75B70] transition-colors block max-w-xs truncate"
                        >
                          {v.title || v.path}
                        </Link>
                        <span className="text-[10px] text-[#332D2F]/40 font-mono">{v.path}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="mr-1.5 text-base">{v.flag}</span>
                        <span className="font-semibold text-[#332D2F]">{v.country}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-[#683846]">
                        {v.device === 'Mobile' ? '📱 Mobile' : v.device === 'Tablet' ? '📟 Tablet' : '💻 Desktop'}
                      </td>
                      <td className="py-3 px-4 text-[#332D2F]/70 whitespace-nowrap">
                        {v.browser} ({v.os})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Log Custom Event Note */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-100 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#683846]">
                Log System or Editorial Note
              </h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#683846] mb-1">
                  Category
                </label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as any)}
                  className="w-full bg-[#F8EDEF] border border-[#B75B70]/20 rounded-xl px-3.5 py-2 text-xs font-semibold text-[#683846] focus:outline-none"
                >
                  <option value="system">⚙️ System / Infrastructure</option>
                  <option value="article">📝 Editorial / Content</option>
                  <option value="settings">🔧 Configuration / Settings</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#683846] mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Added partnership banner for Autumn campaign"
                  className="w-full bg-[#FEFAF9] border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-[#332D2F] focus:outline-none focus:border-[#B75B70]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#683846] mb-1">
                  Details &amp; Notes
                </label>
                <textarea
                  rows={3}
                  value={noteDescription}
                  onChange={(e) => setNoteDescription(e.target.value)}
                  placeholder="Describe the change, milestone, or reason for future reference..."
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
