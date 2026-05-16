'use client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 active:scale-[0.88] transition-all duration-100 disabled:opacity-50 shrink-0"
      aria-label="Sign out"
    >
      <LogOut size={15} />
    </button>
  );
}
