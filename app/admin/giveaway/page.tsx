'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GiveawayCampaign,
  GiveawayEntry,
  DEFAULT_GIVEAWAY,
  getInitialGiveaway,
  saveGiveaway,
  getGiveawayEntries,
  STORAGE_KEYS,
} from '../../../data/store';

export default function AdminGiveawayPage() {
  const [campaign, setCampaign] = useState<GiveawayCampaign>(DEFAULT_GIVEAWAY);
  const [entries, setEntries] = useState<GiveawayEntry[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Random winner modal state
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<GiveawayEntry | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Active tab: 'settings' or 'entries'
  const [activeTab, setActiveTab] = useState<'settings' | 'entries'>('settings');

  const loadData = () => {
    setCampaign(getInitialGiveaway());
    setEntries(getGiveawayEntries());

    // Live sync from Firestore
    import('../../../utils/firestoreSettings')
      .then(async ({ fetchGiveawayFromFirestore, fetchGiveawayEntriesFromFirestore }) => {
        const [fsCampaign, fsEntries] = await Promise.all([
          fetchGiveawayFromFirestore(),
          fetchGiveawayEntriesFromFirestore(),
        ]);

        if (fsCampaign && typeof fsCampaign === 'object') {
          setCampaign(fsCampaign);
          try {
            localStorage.setItem(STORAGE_KEYS.GIVEAWAY, JSON.stringify(fsCampaign));
          } catch (_) {}
        }

        if (fsEntries && Array.isArray(fsEntries)) {
          setEntries(fsEntries);
          try {
            localStorage.setItem(STORAGE_KEYS.GIVEAWAY_ENTRIES, JSON.stringify(fsEntries));
          } catch (_) {}
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('mummabee_giveaway_updated', handleUpdate);
    window.addEventListener('mummabee_giveaway_entries_updated', handleUpdate);

    return () => {
      window.removeEventListener('mummabee_giveaway_updated', handleUpdate);
      window.removeEventListener('mummabee_giveaway_entries_updated', handleUpdate);
    };
  }, []);

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated: GiveawayCampaign = {
      ...campaign,
      updatedAt: new Date().toISOString(),
    };

    saveGiveaway(updated);
    setCampaign(updated);
    setIsSaving(false);
    setMessage('Giveaway campaign updated and synced successfully!');
    setTimeout(() => setMessage(''), 4000);
  };

  const handlePickWinner = () => {
    if (entries.length === 0) {
      alert('No entries available to pick from yet.');
      return;
    }

    setIsDrawing(true);
    setWinnerModalOpen(true);
    setSelectedWinner(null);

    // Fun lottery draw effect
    let counter = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * entries.length);
      setSelectedWinner(entries[randomIndex]);
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        const finalWinner = entries[Math.floor(Math.random() * entries.length)];
        setSelectedWinner(finalWinner);
        setIsDrawing(false);
      }
    }, 100);
  };

  const handleExportCSV = () => {
    if (entries.length === 0) {
      alert('No entries to export.');
      return;
    }

    const headers = ['ID', 'Full Name', 'Social Handle', 'Email', 'Phone', 'Newsletter Opt-in', 'Submitted Date'];
    const rows = entries.map((entry) => [
      entry.id,
      `"${entry.fullName.replace(/"/g, '""')}"`,
      `"${entry.socialHandle.replace(/"/g, '""')}"`,
      `"${entry.email.replace(/"/g, '""')}"`,
      `"${(entry.phone || '').replace(/"/g, '""')}"`,
      entry.optInNewsletter ? 'Yes' : 'No',
      entry.submittedAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mummabee_giveaway_entries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEntries = entries.filter(
    (e) =>
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.socialHandle.toLowerCase().includes(search.toLowerCase()) ||
      (e.phone && e.phone.includes(search))
  );

  return (
    <div className="w-full bg-white text-[#332D2F] rounded-3xl p-5 sm:p-8 shadow-card border border-[#B75B70]/15 font-sans space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#B75B70]/15">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#B75B70] bg-[#F8EDEF] px-2.5 py-0.5 rounded-full border border-[#B75B70]/20">
            Campaign Engine
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#683846] mt-1">
            Giveaway Manager
          </h1>
          <p className="text-xs text-[#332D2F]/70">
            Configure the live giveaway template, manage prize copy, and draw campaign winners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/giveaway"
            target="_blank"
            className="px-4 py-2 bg-[#F8EDEF] hover:bg-[#edd4db] text-[#683846] font-bold text-xs rounded-xl transition-all border border-[#B75B70]/20 inline-flex items-center gap-1.5"
          >
            <span>🎁</span>
            <span>View Public Page</span>
          </Link>

          <button
            type="button"
            onClick={handlePickWinner}
            className="px-4 py-2 bg-[#683846] hover:bg-[#522b37] text-white font-bold text-xs rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>🎲</span>
            <span>Pick Winner ({entries.length})</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold p-4 rounded-2xl flex items-center gap-2 animate-fade-in shadow-xs">
          <span>✨</span>
          <span>{message}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#B75B70]/15 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#683846] text-white shadow-xs'
              : 'text-[#683846] hover:bg-[#F8EDEF]'
          }`}
        >
          ⚙️ Campaign Settings
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('entries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'entries'
              ? 'bg-[#683846] text-white shadow-xs'
              : 'text-[#683846] hover:bg-[#F8EDEF]'
          }`}
        >
          <span>📋 Submissions</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-current font-mono">
            {entries.length}
          </span>
        </button>
      </div>

      {/* TAB 1: CAMPAIGN SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveCampaign} className="space-y-6">
          {/* Visibility Controls */}
          <div className="bg-[#FAF7F7] border border-[#B75B70]/15 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="font-serif text-base font-bold text-[#683846]">
                Campaign Visibility &amp; Display Toggles
              </h3>
              <p className="text-xs text-[#332D2F]/70">
                Turn the giveaway on or off independently across the homepage and the dedicated page.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* Toggle 1: Master Status */}
              <div className="bg-white border border-[#B75B70]/20 rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-[#B75B70] uppercase tracking-wider block">
                    Master Campaign
                  </span>
                  <h4 className="font-serif text-sm font-bold text-[#683846]">Overall Status</h4>
                  <p className="text-[11px] text-[#332D2F]/70 mt-1">
                    Master switch. When paused, entries close and homepage section hides.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                  <span className={`text-xs font-bold ${campaign.isActive ? 'text-emerald-700' : 'text-stone-500'}`}>
                    {campaign.isActive ? '🟢 Active (Live)' : '⏸️ Paused'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={campaign.isActive}
                      onChange={(e) => setCampaign({ ...campaign, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#B75B70]"></div>
                  </label>
                </div>
              </div>

              {/* Toggle 2: Homepage Placement */}
              <div className="bg-white border border-[#B75B70]/20 rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-[#B75B70] uppercase tracking-wider block">
                    Homepage Section
                  </span>
                  <h4 className="font-serif text-sm font-bold text-[#683846]">Show Below Deals</h4>
                  <p className="text-[11px] text-[#332D2F]/70 mt-1">
                    Toggle to show or hide the giveaway banner on the homepage.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                  <span className={`text-xs font-bold ${(campaign.showOnHomepage !== false) ? 'text-emerald-700' : 'text-stone-500'}`}>
                    {(campaign.showOnHomepage !== false) ? '👁️ Shown on Home' : '🚫 Hidden on Home'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={campaign.showOnHomepage !== false}
                      onChange={(e) => setCampaign({ ...campaign, showOnHomepage: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#B75B70]"></div>
                  </label>
                </div>
              </div>

              {/* Toggle 3: Standalone /giveaway Page Entries */}
              <div className="bg-white border border-[#B75B70]/20 rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-[#B75B70] uppercase tracking-wider block">
                    Giveaway Page Entries
                  </span>
                  <h4 className="font-serif text-sm font-bold text-[#683846]">Accept Submissions</h4>
                  <p className="text-[11px] text-[#332D2F]/70 mt-1">
                    When off, the /giveaway page displays the Closed notice instead of the form.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                  <span className={`text-xs font-bold ${(campaign.pageActive !== false) ? 'text-emerald-700' : 'text-stone-500'}`}>
                    {(campaign.pageActive !== false) ? '✍️ Accepting' : '🔒 Closed State'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={campaign.pageActive !== false}
                      onChange={(e) => setCampaign({ ...campaign, pageActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#B75B70]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="bg-[#FAF7F7] border border-[#B75B70]/15 rounded-2xl p-5 space-y-4">
            <h3 className="font-serif text-base font-bold text-[#683846]">
              Header &amp; Headline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#683846] uppercase mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={campaign.badge}
                  onChange={(e) => setCampaign({ ...campaign, badge: e.target.value })}
                  placeholder="MUMMABEE GIVEAWAY"
                  className="w-full px-4 py-2.5 bg-white border border-[#B75B70]/25 rounded-xl text-xs text-[#332D2F] focus:outline-none focus:border-[#683846]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#683846] uppercase mb-1">
                  Entries Close Notice
                </label>
                <input
                  type="text"
                  value={campaign.entriesCloseText}
                  onChange={(e) => setCampaign({ ...campaign, entriesCloseText: e.target.value })}
                  placeholder="Sunday 11:59 PM"
                  className="w-full px-4 py-2.5 bg-white border border-[#B75B70]/25 rounded-xl text-xs text-[#332D2F] focus:outline-none focus:border-[#683846]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#683846] uppercase mb-1">
                Main Headline
              </label>
              <input
                type="text"
                value={campaign.title}
                onChange={(e) => setCampaign({ ...campaign, title: e.target.value })}
                placeholder="Win a family day out in the UAE"
                className="w-full px-4 py-2.5 bg-white border border-[#B75B70]/25 rounded-xl text-xs text-[#332D2F] font-semibold focus:outline-none focus:border-[#683846]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#683846] uppercase mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={campaign.subtitle}
                onChange={(e) => setCampaign({ ...campaign, subtitle: e.target.value })}
                placeholder="Enter below for your chance to win. Full details and terms apply."
                className="w-full px-4 py-2.5 bg-white border border-[#B75B70]/25 rounded-xl text-xs text-[#332D2F] focus:outline-none focus:border-[#683846]"
              />
            </div>
          </div>

          {/* Prize Details & Visual */}
          <div className="bg-[#FAF7F7] border border-[#B75B70]/15 rounded-2xl p-5 space-y-4">
            <h3 className="font-serif text-base font-bold text-[#683846]">
              Prize Showcase &amp; Visual
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#683846] uppercase mb-1">
                  Prize Title
                </label>
                <input
                  type="text"
                  value={campaign.prizeTitle}
                  onChange={(e) => setCampaign({ ...campaign, prizeTitle: e.target.value })}
                  placeholder="The prize"
                  className="w-full px-4 py-2.5 bg-white border border-[#B75B70]/25 rounded-xl text-xs text-[#332D2F] focus:outline-none focus:border-[#683846]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#683846] uppercase mb-1">
                  Prize Image URL
                </label>
                <input
                  type="text"
                  value={campaign.prizeImage}
                  onChange={(e) => setCampaign({ ...campaign, prizeImage: e.target.value })}
                  placeholder="/images/your-giveaway-photo.jpg"
                  className="w-full px-4 py-2.5 bg-white border border-[#B75B70]/25 rounded-xl text-xs text-[#332D2F] focus:outline-none focus:border-[#683846]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#683846] uppercase mb-1">
                Prize Description
              </label>
              <textarea
                rows={3}
                value={campaign.prizeDescription}
                onChange={(e) => setCampaign({ ...campaign, prizeDescription: e.target.value })}
                placeholder="A family experience to enjoy together. One winner will be selected after the giveaway closes."
                className="w-full px-4 py-2.5 bg-white border border-[#B75B70]/25 rounded-xl text-xs text-[#332D2F] focus:outline-none focus:border-[#683846]"
              />
            </div>
          </div>

          {/* Stepper Instructions */}
          <div className="bg-[#FAF7F7] border border-[#B75B70]/15 rounded-2xl p-5 space-y-4">
            <h3 className="font-serif text-base font-bold text-[#683846]">
              &ldquo;How to enter&rdquo; 3-Step Instructions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#683846] uppercase mb-1">
                  Step 01
                </label>
                <input
                  type="text"
                  value={campaign.step1Text}
                  onChange={(e) => setCampaign({ ...campaign, step1Text: e.target.value })}
                  placeholder="Fill in the form below"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#B75B70]/25 rounded-xl text-xs text-[#332D2F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#683846] uppercase mb-1">
                  Step 02
                </label>
                <input
                  type="text"
                  value={campaign.step2Text}
                  onChange={(e) => setCampaign({ ...campaign, step2Text: e.target.value })}
                  placeholder="Follow the giveaway details"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#B75B70]/25 rounded-xl text-xs text-[#332D2F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#683846] uppercase mb-1">
                  Step 03
                </label>
                <input
                  type="text"
                  value={campaign.step3Text}
                  onChange={(e) => setCampaign({ ...campaign, step3Text: e.target.value })}
                  placeholder="Wait for winner announcement"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#B75B70]/25 rounded-xl text-xs text-[#332D2F]"
                />
              </div>
            </div>
          </div>

          {/* Confirmation Screen & Terms */}
          <div className="bg-[#FAF7F7] border border-[#B75B70]/15 rounded-2xl p-5 space-y-4">
            <h3 className="font-serif text-base font-bold text-[#683846]">
              Post-Submission &amp; Terms
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#683846] uppercase mb-1">
                  Terms Agreement Text
                </label>
                <input
                  type="text"
                  value={campaign.termsText}
                  onChange={(e) => setCampaign({ ...campaign, termsText: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#B75B70]/25 rounded-xl text-xs text-[#332D2F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#683846] uppercase mb-1">
                  Terms Link URL
                </label>
                <input
                  type="text"
                  value={campaign.termsUrl || ''}
                  onChange={(e) => setCampaign({ ...campaign, termsUrl: e.target.value })}
                  placeholder="/about"
                  className="w-full px-4 py-2.5 bg-white border border-[#B75B70]/25 rounded-xl text-xs text-[#332D2F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#683846] uppercase mb-1">
                  Thank You Headline
                </label>
                <input
                  type="text"
                  value={campaign.thankYouHeading}
                  onChange={(e) => setCampaign({ ...campaign, thankYouHeading: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#B75B70]/25 rounded-xl text-xs text-[#332D2F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#683846] uppercase mb-1">
                  Related Guide URL
                </label>
                <input
                  type="text"
                  value={campaign.relatedGuideUrl || ''}
                  onChange={(e) => setCampaign({ ...campaign, relatedGuideUrl: e.target.value })}
                  placeholder="/uae-with-kids"
                  className="w-full px-4 py-2.5 bg-white border border-[#B75B70]/25 rounded-xl text-xs text-[#332D2F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#683846] uppercase mb-1">
                Thank You Message
              </label>
              <textarea
                rows={2}
                value={campaign.thankYouMessage}
                onChange={(e) => setCampaign({ ...campaign, thankYouMessage: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[#B75B70]/25 rounded-xl text-xs text-[#332D2F]"
              />
            </div>
          </div>

          {/* Concluded / Closed Announcement Copy */}
          <div className="bg-[#FAF7F7] border border-[#B75B70]/15 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="font-serif text-base font-bold text-[#683846]">
                Concluded / Closed Campaign Notice
              </h3>
              <p className="text-xs text-[#332D2F]/70">
                Shown to visitors on the /giveaway page when entries are closed or paused.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#683846] uppercase mb-1">
                  Closed Notice Headline
                </label>
                <input
                  type="text"
                  value={campaign.closedHeading || ''}
                  onChange={(e) => setCampaign({ ...campaign, closedHeading: e.target.value })}
                  placeholder="This Giveaway Has Ended"
                  className="w-full px-4 py-2.5 bg-white border border-[#B75B70]/25 rounded-xl text-xs text-[#332D2F] focus:outline-none focus:border-[#683846]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#683846] uppercase mb-1">
                  Closed Notice Message
                </label>
                <textarea
                  rows={2}
                  value={campaign.closedMessage || ''}
                  onChange={(e) => setCampaign({ ...campaign, closedMessage: e.target.value })}
                  placeholder="Thank you to everyone who entered! Entries are now closed while our winner is selected. Follow our Instagram @mummabeeblog for winner announcements and upcoming UAE family giveaways."
                  className="w-full px-4 py-2.5 bg-white border border-[#B75B70]/25 rounded-xl text-xs text-[#332D2F] focus:outline-none focus:border-[#683846]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 bg-[#683846] hover:bg-[#522b37] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSaving ? 'Saving Changes...' : 'Save & Sync Giveaway Campaign'}
          </button>
        </form>
      )}

      {/* TAB 2: ENTRIES TABLE */}
      {activeTab === 'entries' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#683846]">
                Entrant Submissions ({entries.length})
              </h2>
              <p className="text-xs text-[#332D2F]/70">
                Verified entries collected via the homepage and /giveaway form.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="search"
                placeholder="Search entrants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3.5 py-2 bg-white border border-[#B75B70]/25 rounded-xl text-xs text-[#332D2F] placeholder-stone-400 focus:outline-none focus:border-[#683846]"
              />

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-[#F8EDEF] hover:bg-[#edd4db] text-[#683846] font-bold text-xs rounded-xl transition-all border border-[#B75B70]/20 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>📥</span>
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl border border-[#B75B70]/15 shadow-2xs">
            <table className="w-full text-left text-xs text-[#332D2F]">
              <thead className="bg-[#F8EDEF] text-[11px] font-bold text-[#683846] uppercase tracking-wider border-b border-[#B75B70]/20">
                <tr>
                  <th className="py-3.5 px-4">Entrant</th>
                  <th className="py-3.5 px-4">Social Handle</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Newsletter</th>
                  <th className="py-3.5 px-4">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredEntries.length > 0 ? (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-[#F8EDEF]/25 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#332D2F]">{entry.fullName}</div>
                        <span className="text-[11px] text-stone-500 font-mono block">
                          {entry.email}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-[#B75B70]">
                        {entry.socialHandle}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-stone-600 font-mono text-[11px]">
                        {entry.phone || '—'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {entry.optInNewsletter ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span>✓</span>
                            <span>Subscribed</span>
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[10px]">No</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-stone-500 text-[11px]">
                        {new Date(entry.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-400">
                      {search ? 'No entrants matching your search.' : 'No entries submitted yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WINNER DRAW MODAL */}
      {winnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#B75B70]/20 space-y-5 animate-fade-in text-center text-[#332D2F]">
            <div className="w-16 h-16 rounded-full bg-[#F8EDEF] border border-[#B75B70]/30 flex items-center justify-center mx-auto text-3xl">
              🏆
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B75B70] bg-[#F8EDEF] px-2.5 py-0.5 rounded-full border border-[#B75B70]/20">
                Official Draw
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#683846] mt-2">
                {isDrawing ? 'Selecting Winner...' : 'Congratulations to our Winner!'}
              </h3>
            </div>

            {selectedWinner && (
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isDrawing
                    ? 'bg-stone-50 border-stone-200 opacity-80'
                    : 'bg-[#F8EDEF]/50 border-[#B75B70]/30 shadow-sm scale-105'
                }`}
              >
                <div className="font-serif text-xl font-bold text-[#683846]">
                  {selectedWinner.fullName}
                </div>
                <div className="text-xs text-[#B75B70] font-semibold mt-1">
                  {selectedWinner.socialHandle}
                </div>
                <div className="text-xs text-stone-500 font-mono mt-1">
                  {selectedWinner.email}
                </div>
                {selectedWinner.phone && (
                  <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                    {selectedWinner.phone}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWinnerModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 text-xs font-bold text-stone-600 hover:bg-stone-200 cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                disabled={isDrawing}
                onClick={handlePickWinner}
                className="px-5 py-2.5 rounded-xl bg-[#683846] hover:bg-[#522b37] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDrawing ? 'Drawing...' : 'Draw Again'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
