'use client';

import { useState, useEffect } from 'react';
import { getInitialSubscribers, saveSubscribers, Subscriber, STORAGE_KEYS } from '../../../data/store';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [message, setMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newSource, setNewSource] = useState('Manual Entry');

  const loadLatest = () => {
    const local = getInitialSubscribers();
    setSubscribers(local);
    fetch(`/api/subscribers?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSubscribers(data);
        }
      })
      .catch((err) => console.error('Error fetching subscribers:', err));
  };

  useEffect(() => {
    loadLatest();

    const handleUpdate = (e: any) => {
      if (e.detail?.key === STORAGE_KEYS.SUBSCRIBERS && Array.isArray(e.detail?.data)) {
        setSubscribers(e.detail.data);
      } else {
        loadLatest();
      }
    };

    window.addEventListener('mummabee_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('mummabee_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleToggleStatus = async (id: string) => {
    const updated = subscribers.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          status: (s.status === 'Active' ? 'Unsubscribed' : 'Active') as Subscriber['status'],
        };
      }
      return s;
    });

    setSubscribers(updated);
    await saveSubscribers(updated);
    setMessage('Subscriber status updated successfully.');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = async (id: string, email: string) => {
    if (window.confirm(`Are you sure you want to remove "${email}" from the subscriber list?`)) {
      const updated = subscribers.filter((s) => s.id !== id);
      setSubscribers(updated);
      await saveSubscribers(updated);
      setMessage('Subscriber removed successfully.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    if (subscribers.some((s) => s.email.toLowerCase() === cleanEmail)) {
      alert('This email is already in your subscriber list.');
      return;
    }

    const newSub: Subscriber = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      date: new Date().toISOString().split('T')[0],
      source: newSource || 'Manual Entry',
      status: 'Active',
    };

    const updated = [newSub, ...subscribers];
    setSubscribers(updated);
    await saveSubscribers(updated);
    setNewEmail('');
    setIsAdding(false);
    setMessage(`Added ${cleanEmail} to subscribers!`);
    setTimeout(() => setMessage(''), 3500);
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      alert('No subscribers to export.');
      return;
    }

    const headers = ['Email', 'Date Subscribed', 'Source', 'Status'];
    const rows = subscribers.map((s) => [
      `"${s.email}"`,
      `"${s.date}"`,
      `"${s.source}"`,
      `"${s.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mummabee_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = subscribers.filter((s) => {
    const matchSearch =
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.source.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = subscribers.filter((s) => s.status === 'Active').length;
  const unsubscribedCount = subscribers.filter((s) => s.status === 'Unsubscribed').length;

  return (
    <div className="space-y-6 max-w-5xl font-sans pb-16">
      {/* Top Banner / Metrics */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#B75B70]/20 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💌</span>
            <h1 className="font-serif text-3xl font-bold text-[#683846]">Newsletter Subscribers</h1>
          </div>
          <p className="text-xs text-[#332D2F] font-sans">
            You have <strong className="text-[#683846]">{activeCount} active readers</strong> receiving the Friday UAE family digest ({subscribers.length} total signups).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#F8EDEF] hover:bg-[#B75B70] text-[#683846] hover:text-white font-sans text-xs font-bold transition-all shadow-2xs"
          >
            <span>➕</span>
            <span>{isAdding ? 'Close Form' : 'Add Subscriber'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#683846] hover:bg-[#332D2F] text-white font-sans text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:-translate-y-0.5"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 text-green-800 text-xs font-semibold p-4 rounded-2xl border border-green-200 shadow-xs flex items-center gap-2 animate-fade-in">
          <span>✨</span>
          <span>{message}</span>
        </div>
      )}

      {/* Manual Add Subscriber Form Modal / Inline */}
      {isAdding && (
        <div className="bg-white p-6 rounded-3xl border-2 border-[#B75B70] shadow-soft space-y-4 animate-fade-in">
          <h2 className="font-serif text-lg font-bold text-[#683846]">Add New Subscriber Manually</h2>
          <form onSubmit={handleManualAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-[10px] font-bold text-[#332D2F] uppercase mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="parent@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#332D2F] uppercase mb-1">Source / Note</label>
              <input
                type="text"
                placeholder="e.g. Instagram DM, In-person event"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="btn-primary flex-1 py-2 text-xs uppercase"
              >
                Save Subscriber
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#332D2F] hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-col md:flex-row gap-3">
        <input
          type="search"
          placeholder="Search by email address or source page..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-[#332D2F] bg-white focus:ring-2 focus:ring-[#B75B70]"
        >
          <option value="ALL">All Statuses ({subscribers.length})</option>
          <option value="Active">Active ({activeCount})</option>
          <option value="Unsubscribed">Unsubscribed ({unsubscribedCount})</option>
        </select>
      </div>

      {/* Subscribers Table Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8EDEF]/60 border-b border-gray-100 text-[10px] font-bold text-[#683846] uppercase tracking-wider">
                <th className="p-4 sm:px-6">Subscriber Email</th>
                <th className="p-4 sm:px-6">Source Page</th>
                <th className="p-4 sm:px-6">Signup Date</th>
                <th className="p-4 sm:px-6">Status</th>
                <th className="p-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-[#332D2F]">
              {filtered.length > 0 ? (
                filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#F8EDEF]/30 transition-colors">
                    <td className="p-4 sm:px-6 font-semibold text-[#683846]">
                      {sub.email}
                    </td>
                    <td className="p-4 sm:px-6">
                      <span className="inline-block bg-[#F8EDEF] px-2.5 py-1 rounded-full text-[10px] font-bold text-[#B75B70]">
                        {sub.source || 'Website'}
                      </span>
                    </td>
                    <td className="p-4 sm:px-6 text-gray-500 font-mono text-[11px]">
                      {sub.date}
                    </td>
                    <td className="p-4 sm:px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          sub.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 sm:px-6 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(sub.id)}
                        className="px-2.5 py-1 rounded-lg border border-gray-200 text-[10px] font-semibold hover:bg-gray-50 text-[#332D2F]"
                        title={sub.status === 'Active' ? 'Mark as Unsubscribed' : 'Mark as Active'}
                      >
                        {sub.status === 'Active' ? 'Unsubscribe' : 'Reactivate'}
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id, sub.email)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        title="Delete subscriber"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400 text-xs">
                    No subscribers found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
