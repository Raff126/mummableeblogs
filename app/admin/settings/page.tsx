'use client';

import { useState, useEffect } from 'react';
import {
  getInitialSettings,
  saveSettings,
  SiteSettings,
  getAuthorizedAdminEmails,
  saveAuthorizedAdminEmails,
} from '../../../data/store';
import { isAdmin } from '../../../data/users';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSettings(getInitialSettings());
    setAdminEmails(getAuthorizedAdminEmails());
  }, []);

  if (!isAdmin()) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6 font-sans">
        <div className="bg-white max-w-md w-full rounded-3xl p-8 border border-red-200 shadow-card text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto text-2xl">
            🚫
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
              HTTP 403 Forbidden
            </span>
            <h1 className="font-serif text-2xl font-bold text-[#683846] mt-2">
              Settings Restricted
            </h1>
            <p className="text-xs text-[#332D2F]/75 leading-relaxed">
              Site Settings and Administrator configurations are restricted to full Administrators. As an <strong>Assistant</strong>, you do not have permission to modify site configuration.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/admin"
              className="inline-block px-6 py-2.5 bg-[#683846] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#522b37] transition-all"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  const handleAddEmail = () => {
    setEmailError('');
    const clean = newEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (adminEmails.includes(clean)) {
      setEmailError('This email is already in the authorized list.');
      return;
    }
    const updated = [...adminEmails, clean];
    setAdminEmails(updated);
    saveAuthorizedAdminEmails(updated);
    setNewEmail('');
    setMessage(`Added ${clean} to authorized Google accounts!`);
    setTimeout(() => setMessage(''), 3500);
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    if (adminEmails.length <= 1) {
      setEmailError('You must keep at least one authorized administrator email.');
      return;
    }
    const updated = adminEmails.filter((e) => e !== emailToRemove);
    setAdminEmails(updated);
    saveAuthorizedAdminEmails(updated);
    setMessage(`Removed ${emailToRemove} from authorized accounts.`);
    setTimeout(() => setMessage(''), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveSettings(settings);
      saveAuthorizedAdminEmails(adminEmails);
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3500);
    } catch (err) {
      console.error('Save settings error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl font-sans pb-16">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#683846]">Site Settings</h1>
        <p className="text-xs text-[#332D2F]/70 font-sans mt-0.5">
          Configure site information, maintenance / coming soon status, social channels, and default SEO settings.
        </p>
      </div>

      {message && (
        <div className="bg-green-50 text-green-800 text-xs font-semibold p-3.5 rounded-xl border border-green-200 shadow-xs flex items-center gap-2">
          <span>✨</span>
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-6 font-sans">
        {/* Website Public Status / Coming Soon Mode */}
        <div className="bg-[#FBF4F5] border border-[#B75B70]/20 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">
                  {settings.comingSoonMode ? '🚧' : '🌐'}
                </span>
                <h2 className="font-serif text-lg font-bold text-[#683846]">
                  Website Status: {settings.comingSoonMode ? 'Coming Soon Mode (Active)' : 'Live Public Website'}
                </h2>
              </div>
              <p className="text-xs text-[#332D2F]/75 mt-1 leading-relaxed max-w-md">
                {settings.comingSoonMode
                  ? 'Public visitors will see the Coming Soon landing page with email signup. Admin and CMS routes remain fully accessible to you and your team.'
                  : 'The website is publicly live. All articles, categories, and homepage sections are visible to everyone.'}
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, comingSoonMode: !settings.comingSoonMode })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.comingSoonMode ? 'bg-[#DF2A64]' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={settings.comingSoonMode}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    settings.comingSoonMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-xs font-bold text-[#683846]">
                {settings.comingSoonMode ? 'Coming Soon ON' : 'Live ON'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#B75B70]/15 flex items-center justify-between text-[11px]">
            <span className="text-[#332D2F]/70">
              Preview how visitors see the Coming Soon page:
            </span>
            <Link
              href="/coming-soon"
              target="_blank"
              className="font-bold text-[#B75B70] hover:text-[#DF2A64] underline flex items-center gap-1"
            >
              <span>View Coming Soon Page ↗</span>
            </Link>
          </div>
        </div>

        {/* General Info */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#683846] border-b border-gray-100 pb-2">
            General Website Information
          </h2>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Site Title</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Contact Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>
        </div>

        {/* Social Accounts */}
        <div className="space-y-4 pt-2">
          <h2 className="font-serif text-xl font-bold text-[#683846] border-b border-gray-100 pb-2">
            Social Media Profiles
          </h2>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Instagram URL</label>
            <input
              type="text"
              value={settings.instagramUrl}
              onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Facebook URL</label>
            <input
              type="text"
              value={settings.facebookUrl}
              onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">TikTok URL</label>
            <input
              type="text"
              value={settings.tiktokUrl}
              onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Pinterest URL</label>
            <input
              type="text"
              value={settings.pinterestUrl || ''}
              onChange={(e) => setSettings({ ...settings, pinterestUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Default SEO */}
        <div className="space-y-4 pt-2">
          <h2 className="font-serif text-xl font-bold text-[#683846] border-b border-gray-100 pb-2">
            Global SEO Defaults
          </h2>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Default Meta Title</label>
            <input
              type="text"
              value={settings.defaultSeoTitle}
              onChange={(e) => setSettings({ ...settings, defaultSeoTitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Default Meta Description</label>
            <textarea
              rows={2}
              value={settings.defaultSeoDescription}
              onChange={(e) => setSettings({ ...settings, defaultSeoDescription: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>
        </div>

        {/* Authorized Admin Google Accounts */}
        <div className="space-y-4 pt-2">
          <div className="border-b border-gray-100 pb-2">
            <h2 className="font-serif text-xl font-bold text-[#683846]">
              Authorized Admin Google Accounts
            </h2>
            <p className="text-xs text-[#332D2F]/70 mt-0.5">
              Only these Google email addresses can sign into the MummaBee Admin CMS. Add or remove accounts safely anytime.
            </p>
          </div>

          {emailError && (
            <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded-xl border border-red-200 flex items-center gap-2">
              <span>⚠️</span>
              <span>{emailError}</span>
            </div>
          )}

          {/* Add New Email Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="email"
              placeholder="e.g. client@gmail.com"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddEmail();
                }
              }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none bg-white"
            />
            <button
              type="button"
              onClick={handleAddEmail}
              className="px-4 py-2.5 bg-[#683846] hover:bg-[#332D2F] text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
            >
              + Add Admin Email
            </button>
          </div>

          {/* Current Authorized Emails List */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-[#332D2F]/80 uppercase tracking-wider block">
              Active Authorized Emails ({adminEmails.length}):
            </span>
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50">
              {adminEmails.map((emailItem) => (
                <div key={emailItem} className="flex items-center justify-between px-4 py-3 bg-white">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="text-xs font-semibold text-[#332D2F]">{emailItem}</span>
                    {emailItem === 'raffyolaivar25@gmail.com' && (
                      <span className="text-[10px] bg-[#F8EDEF] text-[#683846] font-bold px-2 py-0.5 rounded-full border border-[#D7BB91]">
                        Primary Admin
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(emailItem)}
                    className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    title={`Remove ${emailItem}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Save Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>💾</span>
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
          
          {message && (
            <div className="text-xs font-bold text-green-700 bg-green-50 px-4 py-2 rounded-xl border border-green-200 flex items-center gap-1.5 animate-fade-in">
              <span>✨</span>
              <span>{message}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
