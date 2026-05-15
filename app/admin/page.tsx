'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError('Wrong password.');
        return;
      }
      router.replace('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-4xl mb-3">🔐</p>
          <p className="font-display text-white text-4xl">ADMIN</p>
          <p className="font-body text-white/50 text-sm mt-1">Step w Sue — Admin Panel</p>
        </div>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full bg-white/10 text-white placeholder-white/30 border border-white/20 rounded-2xl px-4 py-4 font-body focus:outline-none focus:border-sw-pink"
          />

          {error && <p className="font-body text-sw-pink text-sm text-center">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading || !password}
            className="w-full bg-sw-pink text-white font-display text-2xl py-4 rounded-2xl disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>ENTERING...</span>
              </>
            ) : 'ENTER'}
          </button>

          <Link href="/" className="flex items-center justify-center gap-2 text-white/40 font-body text-sm">
            <ChevronLeft size={16} />
            Back to app
          </Link>
        </div>
      </div>
    </div>
  );
}
