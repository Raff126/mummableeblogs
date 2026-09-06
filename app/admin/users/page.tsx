'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getUsersList,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getCurrentUser,
  isAdmin,
  UserAccount,
  UserRole,
} from '../../../data/users';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Inline "Create New User / Assistant" Form State (Matching Screenshot)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Assistant');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Role Modal State
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('Assistant');
  const [editStatus, setEditStatus] = useState<'Active' | 'Suspended'>('Active');

  // Reset Password Modal State
  const [passwordResetUser, setPasswordResetUser] = useState<UserAccount | null>(null);
  const [resetPassValue, setResetPassValue] = useState('');

  const loadData = () => {
    setUsers(getUsersList());
    setCurrentAdmin(getCurrentUser());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('mummabee_users_updated', handleUpdate);
    window.addEventListener('mummabee_current_user_changed', handleUpdate);

    return () => {
      window.removeEventListener('mummabee_users_updated', handleUpdate);
      window.removeEventListener('mummabee_current_user_changed', handleUpdate);
    };
  }, []);

  // Strict RBAC Guard: If not Admin, render 403 Forbidden Screen
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
              Access Restricted
            </h1>
            <p className="text-xs text-[#332D2F]/75 leading-relaxed">
              User Management is restricted to full-access Administrators. As an <strong>Assistant</strong>, you do not have permission to view, create, or manage user accounts.
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

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter the user name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    const res = createUser({
      name: name.trim(),
      email: email.trim(),
      role,
      password: password ? password.trim() : undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      setMessage(`Successfully created ${role} account for ${email}!`);
      setName('');
      setEmail('');
      setPassword('');
      setRole('Assistant');
      loadData();
      setTimeout(() => setMessage(''), 4000);
    } else {
      setErrorMessage(res.error || 'Failed to create user.');
    }
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setErrorMessage('');

    const res = updateUser(editingUser.id, {
      role: editRole,
      status: editStatus,
    });

    if (res.success) {
      setMessage(`Updated settings for ${editingUser.email}.`);
      setEditingUser(null);
      loadData();
      setTimeout(() => setMessage(''), 3500);
    } else {
      setErrorMessage(res.error || 'Failed to update user.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetUser) return;
    setErrorMessage('');

    const res = resetUserPassword(passwordResetUser.id, resetPassValue);

    if (res.success) {
      setMessage(`Password reset successfully for ${passwordResetUser.email}!`);
      setPasswordResetUser(null);
      setResetPassValue('');
      setTimeout(() => setMessage(''), 3500);
    } else {
      setErrorMessage(res.error || 'Failed to reset password.');
    }
  };

  const handleDeleteUser = (user: UserAccount) => {
    if (window.confirm(`Are you sure you want to delete user "${user.name}" (${user.email})? This cannot be undone.`)) {
      setErrorMessage('');
      const res = deleteUser(user.id);
      if (res.success) {
        setMessage(`Deleted user ${user.email}.`);
        loadData();
        setTimeout(() => setMessage(''), 3500);
      } else {
        setErrorMessage(res.error || 'Failed to delete user.');
      }
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full bg-[#0B111E] text-slate-100 rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-800/80 font-sans space-y-7">
      
      {/* Top Main Heading (Matching Screenshot: "Manage Users") */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Manage Users
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create Assistant or Admin accounts, manage credentials, and assign roles.
          </p>
        </div>

        {/* Current Admin Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">Admin:</span>
          <span className="font-semibold text-white">{currentAdmin?.name || 'Administrator'}</span>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold p-4 rounded-2xl flex items-center gap-2 animate-fade-in">
          <span>✨</span>
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold p-4 rounded-2xl flex items-center gap-2 animate-fade-in">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Inline Creation Form (Matching Screenshot Exact Layout) */}
      <div className="bg-[#131D2F] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-soft space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-white">
          Create New User / Assistant
        </h2>

        <form onSubmit={handleCreateUser} className="space-y-3.5">
          {/* Name Input */}
          <div>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#090D16] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Email Input */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#090D16] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Password Input */}
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#090D16] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* User Role Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              User Role
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-4 py-3 bg-[#090D16] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="Assistant" className="bg-[#090D16] text-white">
                  Assistant (Content-only access: blogs, media, deals)
                </option>
                <option value="Admin" className="bg-[#090D16] text-white">
                  Admin (Full access: users, analytics, settings)
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                ▼
              </div>
            </div>
          </div>

          {/* Full-Width Action Button (Matching Screenshot: "Create User") */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#6366F1] hover:bg-[#4F46E5] active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Creating User...' : 'Create User'}
          </button>
        </form>
      </div>

      {/* Existing Authorized Accounts Table */}
      <div className="bg-[#131D2F] border border-slate-800 rounded-2xl p-5 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">
              Authorized Accounts ({users.length})
            </h2>
            <p className="text-xs text-slate-400">
              Users with access to MummaBee CMS and their assigned roles.
            </p>
          </div>

          <input
            type="search"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-60 px-3.5 py-2 bg-[#090D16] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isPrimary = user.email === 'raffyolaivar25@gmail.com';
                  const isCurrent = currentAdmin?.email?.toLowerCase() === user.email.toLowerCase();

                  return (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              user.role === 'Admin'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-md">
                                  You
                                </span>
                              )}
                              {isPrimary && (
                                <span className="text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded-md">
                                  Primary
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono block">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {user.role === 'Admin' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            <span>👑</span>
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <span>🛡️</span>
                            <span>Assistant</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            user.status === 'Active'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          <span>{user.status}</span>
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-400">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Never'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => {
                            setErrorMessage('');
                            setEditingUser(user);
                            setEditRole(user.role);
                            setEditStatus(user.status);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          Edit Role
                        </button>

                        <button
                          onClick={() => {
                            setErrorMessage('');
                            setPasswordResetUser(user);
                            setResetPassValue('');
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          Password
                        </button>

                        {!isPrimary && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="px-2 py-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 rounded-lg transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No users matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit User Role & Status */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#131D2F] max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-5 animate-fade-in text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Edit Role &amp; Status
                </h3>
                <span className="text-xs text-slate-400 font-mono">{editingUser.email}</span>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assign Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 bg-[#090D16] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Assistant">Assistant (Restricted)</option>
                  <option value="Admin">Admin (Full Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-4 py-3 bg-[#090D16] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Active">Active (Can log in)</option>
                  <option value="Suspended">Suspended (Access blocked)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {passwordResetUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#131D2F] max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-5 animate-fade-in text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Reset Password
                </h3>
                <span className="text-xs text-slate-400 font-mono">{passwordResetUser.email}</span>
              </div>
              <button
                onClick={() => setPasswordResetUser(null)}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password (min 6 chars)"
                  value={resetPassValue}
                  onChange={(e) => setResetPassValue(e.target.value)}
                  className="w-full px-4 py-3 bg-[#090D16] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPasswordResetUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
