'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getInitialDeals, saveDeals, isDealActive, DiscountCode, STORAGE_KEYS } from '../../../data/store';

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<DiscountCode[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [message, setMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [discountBadge, setDiscountBadge] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [showOnHomepage, setShowOnHomepage] = useState(true);
  const [showOnDealsPage, setShowOnDealsPage] = useState(true);

  const loadLatest = () => {
    const local = getInitialDeals();
    setDeals(local);
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const endpoint = isLocal ? `/api/deals/?t=${Date.now()}` : `/data/deals.json?t=${Date.now()}`;
    fetch(endpoint, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          setDeals(data);
        }
      })
      .catch((err) => console.error('Error loading deals:', err));
  };

  useEffect(() => {
    loadLatest();

    const handleUpdate = (e: any) => {
      if (e.detail?.key === STORAGE_KEYS.DEALS && Array.isArray(e.detail?.data)) {
        setDeals(e.detail.data);
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

  const resetForm = () => {
    setTitle('');
    setCode('');
    setDiscountBadge('');
    setDescription('');
    setLink('');
    setExpirationDate('');
    setShowOnHomepage(true);
    setShowOnDealsPage(true);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleStartEdit = (deal: DiscountCode) => {
    setEditingId(deal.id);
    setTitle(deal.title);
    setCode(deal.code);
    setDiscountBadge(deal.discountBadge || '');
    setDescription(deal.description || '');
    setLink(deal.link || '');
    setExpirationDate(deal.expirationDate || '');
    setShowOnHomepage(deal.showOnHomepage !== false);
    setShowOnDealsPage(deal.showOnDealsPage !== false);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanTitle || !cleanCode) {
      alert('Please enter both a title and a promo code.');
      return;
    }

    let updated: DiscountCode[];

    if (editingId) {
      updated = deals.map((d) => {
        if (d.id === editingId) {
          return {
            ...d,
            title: cleanTitle,
            code: cleanCode,
            discountBadge: discountBadge.trim(),
            description: description.trim(),
            link: link.trim(),
            expirationDate: expirationDate || undefined,
            showOnHomepage,
            showOnDealsPage,
          };
        }
        return d;
      });
      setMessage(`"${cleanTitle}" deal updated successfully!`);
    } else {
      const newDeal: DiscountCode = {
        id: `deal-${Date.now()}`,
        title: cleanTitle,
        code: cleanCode,
        discountBadge: discountBadge.trim(),
        description: description.trim(),
        link: link.trim(),
        expirationDate: expirationDate || undefined,
        showOnHomepage,
        showOnDealsPage,
        createdAt: new Date().toISOString().split('T')[0],
      };
      updated = [newDeal, ...deals];
      setMessage(`"${cleanTitle}" deal added successfully!`);
    }

    setDeals(updated);
    await saveDeals(updated);
    resetForm();
    setTimeout(() => setMessage(''), 3500);
  };

  const handleDelete = async (id: string, dealTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the deal "${dealTitle}"?`)) {
      const updated = deals.filter((d) => d.id !== id);
      setDeals(updated);
      await saveDeals(updated);
      setMessage(`"${dealTitle}" deleted.`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCleanExpired = async () => {
    const activeOnly = deals.filter((d) => isDealActive(d));
    const expiredCount = deals.length - activeOnly.length;

    if (expiredCount === 0) {
      alert('No expired deals found to clean.');
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete ${expiredCount} expired discount code(s)?`)) {
      setDeals(activeOnly);
      await saveDeals(activeOnly);
      setMessage(`Cleaned ${expiredCount} expired code(s) successfully.`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const filtered = deals.filter((d) => {
    const matchSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase());

    const active = isDealActive(d);
    if (statusFilter === 'ACTIVE') return matchSearch && active;
    if (statusFilter === 'EXPIRED') return matchSearch && !active;
    return matchSearch;
  });

  const activeCount = deals.filter((d) => isDealActive(d)).length;
  const expiredCount = deals.filter((d) => !isDealActive(d)).length;

  return (
    <div className="space-y-6 max-w-5xl font-sans pb-16">
      {/* Top Banner / Metrics */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#B75B70]/20 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏷️</span>
            <h1 className="font-serif text-3xl font-bold text-[#683846]">Discount Codes & Deals</h1>
          </div>
          <p className="text-xs text-[#332D2F] font-sans">
            Manage promo codes shown on the Homepage and UAE Deals page ({activeCount} active, {expiredCount} expired).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              if (isAdding) {
                resetForm();
              } else {
                setIsAdding(true);
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#683846] hover:bg-[#332D2F] text-white font-sans text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:-translate-y-0.5"
          >
            <span>{isAdding ? '✕ Close Form' : '➕ Add New Code'}</span>
          </button>

          {expiredCount > 0 && (
            <button
              onClick={handleCleanExpired}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#F8EDEF] hover:bg-red-50 text-red-700 font-sans text-xs font-bold border border-red-200 transition-all shadow-2xs"
            >
              <span>🗑️</span>
              <span>Clean {expiredCount} Expired</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="bg-green-50 text-green-800 text-xs font-semibold p-4 rounded-2xl border border-green-200 shadow-xs flex items-center gap-2 animate-fade-in">
          <span>✨</span>
          <span>{message}</span>
        </div>
      )}

      {/* Add / Edit Form Card */}
      {isAdding && (
        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#B75B70] shadow-card space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-serif text-xl font-bold text-[#683846]">
              {editingId ? 'Edit Discount Code' : 'Create New Discount Code'}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-bold text-gray-400 hover:text-[#332D2F]"
            >
              Cancel ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Deal Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. 20% Off Green Planet Dubai Family Tickets"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#683846] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Promo Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. MUMMABEE20"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-mono font-bold text-xs text-[#DF3E6B] tracking-wider focus:ring-2 focus:ring-[#B75B70] focus:outline-none uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Discount Badge</label>
              <input
                type="text"
                placeholder="e.g. 20% OFF, AED 50 OFF"
                value={discountBadge}
                onChange={(e) => setDiscountBadge(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Expiration Date (Optional)</label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
              <span className="text-[10px] text-gray-400 block mt-0.5">Auto-hides from website once passed</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Redeem / Booking Link</label>
              <input
                type="url"
                placeholder="https://partnerwebsite.com/book"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Description / Conditions</label>
            <textarea
              rows={2}
              placeholder="e.g. Valid on online family bookings. Cannot be combined with other offers."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Visibility Controls */}
          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-100">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#332D2F]">
              <input
                type="checkbox"
                checked={showOnHomepage}
                onChange={(e) => setShowOnHomepage(e.target.checked)}
                className="w-4 h-4 rounded text-[#B75B70] focus:ring-[#B75B70]"
              />
              <span>Display on Homepage (Bottom Section)</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#332D2F]">
              <input
                type="checkbox"
                checked={showOnDealsPage}
                onChange={(e) => setShowOnDealsPage(e.target.checked)}
                className="w-4 h-4 rounded text-[#B75B70] focus:ring-[#B75B70]"
              />
              <span>Display on UAE Deals Hub (/uae-deals)</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button type="submit" className="btn-primary py-2.5 px-7 text-xs uppercase font-bold shadow-md">
              {editingId ? 'Update Deal' : 'Publish Deal'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-semibold text-[#332D2F] hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-col md:flex-row gap-3">
        <input
          type="search"
          placeholder="Search by title, promo code, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-[#332D2F] bg-white focus:ring-2 focus:ring-[#B75B70]"
        >
          <option value="ALL">All Deals ({deals.length})</option>
          <option value="ACTIVE">Active Deals ({activeCount})</option>
          <option value="EXPIRED">Expired Deals ({expiredCount})</option>
        </select>
      </div>

      {/* Deals List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden divide-y divide-gray-100">
        {filtered.length > 0 ? (
          filtered.map((deal) => {
            const active = isDealActive(deal);
            return (
              <div
                key={deal.id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8EDEF]/20 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-[#F8EDEF] text-[#683846] border border-[#B75B70]/30 px-3 py-1 rounded-full uppercase tracking-wider">
                      {deal.code}
                    </span>

                    {deal.discountBadge && (
                      <span className="bg-[#DF3E6B] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {deal.discountBadge}
                      </span>
                    )}

                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {active ? 'Active' : 'Expired'}
                    </span>

                    {deal.expirationDate && (
                      <span className="text-[10px] text-gray-500 font-mono">
                        Expires: {deal.expirationDate}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#683846]">
                    {deal.title}
                  </h3>

                  {deal.description && (
                    <p className="text-xs text-[#332D2F]/80 max-w-2xl leading-relaxed">
                      {deal.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-gray-500 font-medium">
                    <span>Visibility:</span>
                    {deal.showOnHomepage && <span className="text-[#B75B70] bg-[#F8EDEF] px-2 py-0.5 rounded-md">✓ Homepage</span>}
                    {deal.showOnDealsPage && <span className="text-[#B75B70] bg-[#F8EDEF] px-2 py-0.5 rounded-md">✓ UAE Deals</span>}
                    {deal.link && (
                      <a href={deal.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Link ↗
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <button
                    onClick={() => handleStartEdit(deal)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#F8EDEF] hover:bg-[#B75B70] text-[#683846] hover:text-white text-xs font-bold transition-colors"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => handleDelete(deal.id, deal.title)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 text-xs"
                    title="Delete code"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-xs text-[#332D2F]/70">
            No discount codes found. Click <strong>Add New Code</strong> above to create your first promo code!
          </div>
        )}
      </div>
    </div>
  );
}
