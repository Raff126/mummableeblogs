'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { setAuthenticated, isAuthenticated, validateAdminCredentials } from '../../../data/store';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@mummamabeeblogs.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/admin');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);

    // Validate credentials
    const isValid = validateAdminCredentials(email, password);

    if (isValid) {
      setAuthenticated(true);
      setTimeout(() => {
        router.push('/admin');
      }, 500);
    } else {
      setIsLoading(false);
      setError('Invalid email or password. Please check your credentials and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8EDEF] flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 sm:p-10 shadow-card border border-[#B75B70]/20 space-y-6 text-center animate-fade-in">
        {/* Brand Lockup */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-full p-1 bg-[#F8EDEF] border border-[#B75B70]/30 shadow-xs flex items-center justify-center">
            <img src="/images/mama-logo.png" alt="MummaBee Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#683846]">MummaBee CMS</h1>
            <p className="text-xs text-[#332D2F]/70 font-sans mt-1">
              Sign in to manage articles, topic hubs, deals, and website content.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-2xl border border-red-200 text-left flex items-start gap-2 animate-fade-in">
            <span className="text-sm">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              required
              placeholder="admin@mummamabeeblogs.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs font-medium text-[#332D2F] transition-all bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs font-medium text-[#332D2F] transition-all bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#683846] p-1 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#332D2F]/80">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#B75B70] focus:ring-[#B75B70]"
              />
              <span>Remember session</span>
            </label>
            <span className="text-[11px] text-[#B75B70] font-semibold">Authorized Staff Only</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#683846] hover:bg-[#332D2F] disabled:opacity-75 text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In to Admin</span>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-gray-100">
          <Link
            href="/"
            className="text-xs font-bold text-[#B75B70] hover:text-[#683846] uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors"
          >
            <span>←</span>
            <span>Return to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
