'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, loginWithFirebase, loginWithGoogle } from '../../../data/store';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/admin');
    }
  }, [router]);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      const result = await loginWithGoogle();
      if (result.success) {
        setTimeout(() => {
          router.push('/admin');
        }, 300);
      } else {
        setIsGoogleLoading(false);
        setError(result.error || 'Google sign-in failed. Please try again.');
      }
    } catch (err: any) {
      setIsGoogleLoading(false);
      setError(err?.message || 'An unexpected error occurred during Google sign-in.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginWithFirebase(email, password);

      if (result.success) {
        setTimeout(() => {
          router.push('/admin');
        }, 400);
      } else {
        setIsLoading(false);
        setError(result.error || 'Invalid email or password. Please try again.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'An unexpected error occurred during login.');
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
            <span className="text-sm shrink-0 mt-0.5">⚠️</span>
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-3 px-4 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 rounded-xl shadow-xs text-xs font-bold text-[#332D2F] flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
          >
            {isGoogleLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#B75B70] border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in with Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-3 text-[10px] uppercase font-bold text-gray-400 tracking-wider relative shrink-0">
              Or sign in with email
            </span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider mb-1.5">
              Staff Email
            </label>
            <input
              type="email"
              required
              placeholder="Enter your email"
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
            <span className="text-[11px] text-[#B75B70] font-semibold">Admin &amp; Assistant Access</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#683846] hover:bg-[#332D2F] disabled:opacity-75 text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In to CMS</span>
            )}
          </button>

          {/* Quick Demo Test Accounts Box */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block text-center">
              Quick Role Testing Shortcuts:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('donne@mummabeeblog.com');
                  setPassword('MummaBee2026!');
                  setError('');
                }}
                className="p-2 bg-[#F8EDEF] hover:bg-[#683846] hover:text-white text-[#683846] rounded-xl text-[10px] font-bold transition-all text-center border border-[#B75B70]/20 cursor-pointer"
              >
                👑 Admin (Full Access)
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('assistant@mummabeeblog.com');
                  setPassword('Assistant2026!');
                  setError('');
                }}
                className="p-2 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-800 rounded-xl text-[10px] font-bold transition-all text-center border border-amber-200 cursor-pointer"
              >
                🛡️ Assistant (Restricted)
              </button>
            </div>
          </div>
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
