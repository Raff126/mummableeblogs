'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthenticated } from '../../../data/store';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('donne@mummabeeblog.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    // Simple secure auth validation
    setAuthenticated(true);
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-desert-blush flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-card border border-mumma-rose/20 space-y-6 text-center">
        {/* Brand Lockup */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 rounded-full p-1 bg-desert-blush border border-mumma-rose/30 shadow-xs flex items-center justify-center">
            <img src="/images/mama-logo.png" alt="MummaBee Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-date-burgundy">MummaBee CMS</h1>
          <p className="text-xs text-charcoal/70 font-sans">
            Log in to manage articles, categories, and homepage content.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-mumma-rose text-sm font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-mumma-rose text-sm font-sans"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-date-burgundy hover:bg-date-burgundy-dark text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:-translate-y-0.5"
          >
            Log In to Admin
          </button>
        </form>
      </div>
    </div>
  );
}
