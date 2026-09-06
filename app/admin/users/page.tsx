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

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Assistant');
  const [newPassword, setNewPassword] = useState('');
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
    setIsSubmitting(true);

    const res = createUser({
      name: newName,
      email: newEmail,
      role: newRole,
      password: newPassword || undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      setMessage(`Successfully created ${newRole} account for ${newEmail}!`);
      setIsAddModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('Assistant');
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

  const adminCount = users.filter((u) => u.role === 'Admin').length;
  const assistantCount = users.filter((u) => u.role === 'Assistant').length;

  return (
    <div className="space-y-6 max-w-5xl font-sans pb-16">
      
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#683846]">User Management &amp; Access Control</h1>
          <p className="text-xs text-[#332D2F]/70 mt-1">
            Manage admin credentials, create Assistant accounts, and assign system permissions.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMessage('');
            setIsAddModalOpen(true);
          }}
          className="px-5 py-2.5 bg-[#683846] hover:bg-[#522b37] text-white text-xs font-bold rounded-2xl shadow-soft hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span>➕</span>
          <span>Add New User</span>
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div className="bg-green-50 text-green-800 text-xs font-semibold p-4 rounded-2xl border border-green-200 shadow-2xs flex items-center gap-2 animate-fade-in">
          <span>✨</span>
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 text-red-700 text-xs font-semibold p-4 rounded-2xl border border-red-200 shadow-2xs flex items-center gap-2 animate-fade-in">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#332D2F]/60 uppercase tracking-wider block">
              Total Accounts
            </span>
            <span className="font-serif text-3xl font-bold text-[#683846] mt-0.5 block">
              {users.length}
            </span>
          </div>
          <span className="text-2xl p-2.5 bg-[#F8EDEF] rounded-xl">👥</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#332D2F]/60 uppercase tracking-wider block">
              Administrators (Full Access)
            </span>
            <span className="font-serif text-3xl font-bold text-[#683846] mt-0.5 block">
              {adminCount}
            </span>
          </div>
          <span className="text-2xl p-2.5 bg-purple-50 text-purple-600 rounded-xl">👑</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#332D2F]/60 uppercase tracking-wider block">
              Assistants (Restricted)
            </span>
            <span className="font-serif text-3xl font-bold text-[#B75B70] mt-0.5 block">
              {assistantCount}
            </span>
          </div>
          <span className="text-2xl p-2.5 bg-amber-50 text-amber-600 rounded-xl">🛡️</span>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#683846]">Authorized Accounts</h2>
            <p className="text-xs text-[#332D2F]/70">
              Users with assigned roles for MummaBee CMS administration.
            </p>
          </div>

          <input
            type="search"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#332D2F]">
            <thead className="bg-[#F8EDEF]/50 text-[10px] font-bold text-[#683846] uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Auth Method</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isPrimary = user.email === 'raffyolaivar25@gmail.com';
                  const isCurrent = currentAdmin?.email?.toLowerCase() === user.email.toLowerCase();

                  return (
                    <tr key={user.id} className="hover:bg-[#F8EDEF]/20 transition-colors">
                      {/* Name & Email */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                            user.role === 'Admin'
                              ? 'bg-[#683846] text-white'
                              : 'bg-[#B75B70]/15 text-[#B75B70]'
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-[#332D2F] flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.2 rounded-md">
                                  You
                                </span>
                              )}
                              {isPrimary && (
                                <span className="text-[9px] font-bold bg-[#F8EDEF] text-[#683846] border border-[#D7BB91] px-1.5 py-0.2 rounded-md">
                                  Primary
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#332D2F]/65 font-mono block">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {user.role === 'Admin' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#683846]/10 text-[#683846] border border-[#683846]/20">
                            <span>👑</span>
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span>🛡️</span>
                            <span>Assistant</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          user.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span>{user.status}</span>
                        </span>
                      </td>

                      {/* Auth Method */}
                      <td className="py-4 px-4 whitespace-nowrap text-[#332D2F]/70">
                        {user.authMethod === 'google'
                          ? 'Google Auth'
                          : user.authMethod === 'password'
                          ? 'Email & Password'
                          : 'Both (Google & Password)'}
                      </td>

                      {/* Last Active */}
                      <td className="py-4 px-4 whitespace-nowrap text-[11px] text-[#332D2F]/65">
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
                      <td className="py-4 px-5 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => {
                            setErrorMessage('');
                            setEditingUser(user);
                            setEditRole(user.role);
                            setEditStatus(user.status);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#683846] hover:bg-[#F8EDEF] rounded-lg transition-colors cursor-pointer"
                          title="Change role or status"
                        >
                          Edit Role
                        </button>

                        <button
                          onClick={() => {
                            setErrorMessage('');
                            setPasswordResetUser(user);
                            setResetPassValue('');
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Reset password"
                        >
                          Password
                        </button>

                        {!isPrimary && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="px-2 py-1 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete user"
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
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No users matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions Reference Box */}
      <div className="bg-[#F8EDEF]/60 border border-[#B75B70]/20 rounded-3xl p-6 space-y-3">
        <h3 className="font-serif text-base font-bold text-[#683846]">
          Role Permissions Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#332D2F]/80">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-[#683846] font-bold">
              <span>👑</span>
              <span>Administrator (Full Access)</span>
            </div>
            <ul className="space-y-1 text-[11px] list-disc list-inside text-[#332D2F]/75">
              <li>Manage all blog posts, categories, media, and discount codes</li>
              <li>Add, edit, suspend, and delete user accounts</li>
              <li>Reset passwords and assign roles (Admin / Assistant)</li>
              <li>View System Analytics &amp; live visitor telemetry</li>
              <li>Access and edit Site Settings &amp; Authorized Google accounts</li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 font-bold">
              <span>🛡️</span>
              <span>Assistant (Restricted Content Role)</span>
            </div>
            <ul className="space-y-1 text-[11px] list-disc list-inside text-[#332D2F]/75">
              <li>Create, edit, and publish blog articles &amp; guides</li>
              <li>Upload images to Media Library &amp; manage Categories</li>
              <li>Update Instagram feed, Deals, and Page contents</li>
              <li className="text-red-600 font-semibold">❌ CANNOT view System Analytics (API &amp; UI blocked)</li>
              <li className="text-red-600 font-semibold">❌ CANNOT manage users, roles, or reset passwords</li>
              <li className="text-red-600 font-semibold">❌ CANNOT modify site-level settings</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal: Add New User */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-[#683846]">
                Add New User
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded-xl border border-red-200">
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah@mummabeeblog.com or gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
                />
              </div>

              {/* Role Selector: Required by User */}
              <div>
                <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">
                  Role &amp; Permissions
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewRole('Assistant')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      newRole === 'Assistant'
                        ? 'border-amber-400 bg-amber-50/70 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                      <span>🛡️</span>
                      <span>Assistant</span>
                    </div>
                    <p className="text-[10px] text-amber-700/80 mt-1">
                      Content management only. No analytics or user controls.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewRole('Admin')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      newRole === 'Admin'
                        ? 'border-[#683846] bg-[#F8EDEF] shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#683846]">
                      <span>👑</span>
                      <span>Admin</span>
                    </div>
                    <p className="text-[10px] text-[#683846]/80 mt-1">
                      Full access to users, settings, and analytics.
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">
                  Password (Optional for Google accounts)
                </label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Leave blank if the user will sign in with Google.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#683846] hover:bg-[#522b37] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : `Create ${newRole}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User Role & Status */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#683846]">
                  Edit Role &amp; Status
                </h3>
                <span className="text-xs text-gray-500">{editingUser.email}</span>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded-xl border border-red-200">
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">
                  Assign Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditRole('Assistant')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      editRole === 'Assistant'
                        ? 'border-amber-400 bg-amber-50/70 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                      <span>🛡️</span>
                      <span>Assistant</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditRole('Admin')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      editRole === 'Admin'
                        ? 'border-[#683846] bg-[#F8EDEF] shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#683846]">
                      <span>👑</span>
                      <span>Admin</span>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">
                  Account Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
                >
                  <option value="Active">Active (Can log in)</option>
                  <option value="Suspended">Suspended (Access blocked)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#683846] hover:bg-[#522b37] text-white text-xs font-bold shadow-xs cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#683846]">
                  Reset Password
                </h3>
                <span className="text-xs text-gray-500">{passwordResetUser.email}</span>
              </div>
              <button
                onClick={() => setPasswordResetUser(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded-xl border border-red-200">
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password (min 6 chars)"
                  value={resetPassValue}
                  onChange={(e) => setResetPassValue(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPasswordResetUser(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#683846] hover:bg-[#522b37] text-white text-xs font-bold shadow-xs cursor-pointer"
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
