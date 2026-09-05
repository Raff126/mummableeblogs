'use client';

import { useState, useEffect } from 'react';
import {
  getInitialSettings,
  saveSettings,
  SiteSettings,
  getAuthorizedAdminEmails,
  saveAuthorizedAdminEmails,
} from '../../../data/store';

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
      saveSettings(settings);
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
          Configure site information, contact emails, social channels, and default SEO settings.
        </p>
      </div>

      {message && (
        <div className="bg-green-50 text-green-800 text-xs font-semibold p-3.5 rounded-xl border border-green-200 shadow-xs flex items-center gap-2">
          <span>✨</span>
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-6 font-sans">
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
