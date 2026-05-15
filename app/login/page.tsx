'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PinInput } from '@/components/PinInput';
import { Button } from '@/components/ui/Button';
import { ChevronLeft } from 'lucide-react';
import { clsx } from 'clsx';

interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
}

type Stage = 'pick' | 'pin';

export default function LoginPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selected, setSelected] = useState<Participant | null>(null);
  const [pin, setPin] = useState('');
  const [stage, setStage] = useState<Stage>('pick');
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/participants')
      .then((r) => r.json())
      .then((data) => setParticipants(data))
      .finally(() => setLoadingList(false));
  }, []);

  const handleSelect = (p: Participant) => {
    setSelected(p);
    setPin('');
    setError('');
    setStage('pin');
  };

  const handleLogin = async () => {
    if (!selected || pin.length < 4) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_id: selected.id, pin }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong');
        setPin('');
        return;
      }
      router.replace('/home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <div className="bg-navy px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="text-white/60 hover:text-white">
            <ChevronLeft size={24} />
          </Link>
          <p className="font-body text-white/60 text-sm">Step w Sue</p>
        </div>
        <p className="font-display text-sw-pink text-5xl leading-none">SIGN</p>
        <p className="font-display text-white text-3xl leading-none">BACK IN</p>
      </div>

      <div className="flex-1 px-6 py-8">

        {/* ── Stage: pick name ─────────────────────────────────────────── */}
        {stage === 'pick' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-4xl mb-2">👋</p>
              <p className="font-display text-navy text-2xl">WHO ARE YOU?</p>
              <p className="font-body text-sm text-gray-500 mt-1">Tap your name to continue.</p>
            </div>

            {loadingList ? (
              <div className="text-center py-8 text-gray-400 font-body text-sm">Loading...</div>
            ) : participants.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-body text-gray-500 text-sm">No accounts yet.</p>
                <Link href="/join" className="text-sw-pink font-semibold font-body text-sm">
                  Join the challenge →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {participants.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className="w-full bg-white rounded-2xl p-4 text-left border-2 border-transparent active:border-sw-pink active:bg-sw-pink/5 transition-colors shadow-sm"
                  >
                    <p className="font-body font-bold text-navy text-base">
                      {p.first_name} {p.last_name}
                    </p>
                    {p.nickname && (
                      <p className="font-body text-xs text-gray-400 mt-0.5">"{p.nickname}"</p>
                    )}
                  </button>
                ))}
              </div>
            )}

            <p className="font-body text-xs text-gray-400 text-center pt-2">
              Not on the list?{' '}
              <Link href="/join" className="text-sw-pink font-semibold">
                Join the challenge
              </Link>
            </p>
          </div>
        )}

        {/* ── Stage: enter PIN ─────────────────────────────────────────── */}
        {stage === 'pin' && selected && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-4xl mb-2">🔢</p>
              <p className="font-display text-navy text-2xl">ENTER YOUR PIN</p>
              <p className="font-body text-sm text-gray-600 mt-1">
                Welcome back,{' '}
                <span className="font-semibold">{selected.nickname ?? selected.first_name}!</span>
              </p>
            </div>

            <PinInput value={pin} onChange={setPin} error={error || undefined} />

            <Button onClick={handleLogin} loading={loading} disabled={pin.length < 4} size="lg">
              Sign In 👟
            </Button>

            <button
              onClick={() => { setStage('pick'); setPin(''); setError(''); }}
              className="w-full font-body text-sm text-gray-500 py-2"
            >
              ← That's not me
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
