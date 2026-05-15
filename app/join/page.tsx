'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PinInput } from '@/components/PinInput';
import { ChevronLeft } from 'lucide-react';

type Step = 'password' | 'account';

export default function JoinPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('password');
  const [challengePassword, setChallengePassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinStage, setPinStage] = useState<'enter' | 'confirm'>('enter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Step 1: verify challenge password ────────────────────────────────────
  const handleVerifyPassword = async () => {
    if (!challengePassword.trim()) {
      setError('Enter the challenge password to continue.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: challengePassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }
      setStep('account');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: create account ────────────────────────────────────────────────
  const handlePinEntry = (val: string) => {
    if (pinStage === 'enter') {
      setPin(val);
    } else {
      setPinConfirm(val);
    }
  };

  const handlePinNext = () => {
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits.');
      return;
    }
    setError('');
    setPinStage('confirm');
  };

  const handleRegister = async () => {
    if (pinConfirm !== pin) {
      setError("PINs don't match — try again.");
      setPinConfirm('');
      setPinStage('confirm');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          nickname: nickname || undefined,
          pin,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }
      router.replace('/home');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 sub-stages: names → pin → confirm ──────────────────────────────
  const [accountStage, setAccountStage] = useState<'names' | 'pin' | 'confirm_pin'>('names');

  const handleNamesNext = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.');
      return;
    }
    setError('');
    setAccountStage('pin');
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
        <p className="font-display text-sw-pink text-5xl leading-none">JOIN</p>
        <p className="font-display text-white text-3xl leading-none">THE CHALLENGE</p>
      </div>

      <div className="flex-1 px-6 py-8">

        {/* ── Step 1: challenge password ─────────────────────────────────── */}
        {step === 'password' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-4xl mb-2">🔑</p>
              <p className="font-display text-navy text-2xl">ENTER THE PASSWORD</p>
              <p className="font-body text-sm text-gray-500 mt-1">
                Sue sent you the password to join. Don't have it? Text Sue!
              </p>
            </div>

            <div>
              <input
                type="text"
                placeholder="Challenge password..."
                value={challengePassword}
                onChange={(e) => setChallengePassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 font-body text-navy text-lg text-center focus:outline-none focus:border-sw-pink"
                autoCapitalize="none"
                autoComplete="off"
              />
              {error && <p className="font-body text-sm text-sw-pink mt-2 text-center">{error}</p>}
            </div>

            <Button onClick={handleVerifyPassword} loading={loading} size="lg">
              Let's Go! 🏃
            </Button>

            <p className="font-body text-xs text-gray-400 text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-sw-pink font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        )}

        {/* ── Step 2: account creation ───────────────────────────────────── */}
        {step === 'account' && (
          <div className="space-y-6">

            {accountStage === 'names' && (
              <>
                <div className="text-center">
                  <p className="text-4xl mb-2">👋</p>
                  <p className="font-display text-navy text-2xl">WHO ARE YOU?</p>
                  <p className="font-body text-sm text-gray-500 mt-1">
                    This is how you'll appear on the leaderboard.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-body text-sm font-semibold text-navy block mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sue"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-body text-navy focus:outline-none focus:border-sw-pink"
                    />
                  </div>

                  <div>
                    <label className="font-body text-sm font-semibold text-navy block mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Smith"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-body text-navy focus:outline-none focus:border-sw-pink"
                    />
                  </div>

                  <div>
                    <label className="font-body text-sm font-semibold text-navy block mb-1">
                      Fun Nickname{' '}
                      <span className="font-normal text-gray-400">(optional — shows on leaderboard)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. The Pacer, Speedy, etc."
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-body text-navy focus:outline-none focus:border-sw-pink"
                    />
                  </div>

                  {error && <p className="font-body text-sm text-sw-pink text-center">{error}</p>}
                </div>

                <Button onClick={handleNamesNext} size="lg">
                  Next: Set My PIN →
                </Button>
              </>
            )}

            {accountStage === 'pin' && (
              <>
                <div className="text-center">
                  <p className="text-4xl mb-2">🔢</p>
                  <p className="font-display text-navy text-2xl">SET YOUR PIN</p>
                  <p className="font-body text-sm text-gray-500 mt-1">
                    4–6 digits. You'll use this to sign back in.
                  </p>
                </div>

                <PinInput
                  value={pin}
                  onChange={setPin}
                  label="Choose a PIN"
                  error={error || undefined}
                />

                <Button onClick={() => {
                  if (pin.length < 4) { setError('PIN must be at least 4 digits.'); return; }
                  setError('');
                  setAccountStage('confirm_pin');
                }} size="lg" disabled={pin.length < 4}>
                  Next: Confirm PIN →
                </Button>
              </>
            )}

            {accountStage === 'confirm_pin' && (
              <>
                <div className="text-center">
                  <p className="text-4xl mb-2">✅</p>
                  <p className="font-display text-navy text-2xl">CONFIRM YOUR PIN</p>
                  <p className="font-body text-sm text-gray-500 mt-1">
                    Enter your PIN one more time to confirm.
                  </p>
                </div>

                <PinInput
                  value={pinConfirm}
                  onChange={setPinConfirm}
                  label="Re-enter PIN"
                  error={error || undefined}
                />

                <Button
                  onClick={handleRegister}
                  loading={loading}
                  disabled={pinConfirm.length < 4}
                  size="lg"
                >
                  Create My Account! 🎉
                </Button>

                <button
                  onClick={() => { setPinConfirm(''); setAccountStage('pin'); setError(''); }}
                  className="w-full font-body text-sm text-gray-500 py-2"
                >
                  ← Change PIN
                </button>
              </>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
