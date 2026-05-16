'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PinInput } from '@/components/PinInput';
import { ChevronLeft } from 'lucide-react';
import { clsx } from 'clsx';

type Step = 'mode' | 'password' | 'account';
type AccountStage = 'names' | 'pin' | 'confirm_pin';
type JoinMode = 'join' | 'observe';

const PROGRESS_STEPS = ['Mode', 'Password', 'Your Info', 'Set PIN'];

function progressIndex(step: Step, accountStage: AccountStage): number {
  if (step === 'mode') return 0;
  if (step === 'password') return 1;
  if (accountStage === 'names') return 2;
  return 3;
}

export default function JoinPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('mode');
  const [joinMode, setJoinMode] = useState<JoinMode | null>(null);
  const [challengePassword, setChallengePassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountStage, setAccountStage] = useState<AccountStage>('names');

  const currentProgress = progressIndex(step, accountStage);

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

  const handleNamesNext = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.');
      return;
    }
    setError('');
    setAccountStage('pin');
  };

  const handleRegister = async () => {
    if (pinConfirm !== pin) {
      setError("PINs don't match — try again.");
      setPinConfirm('');
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
          is_observer: joinMode === 'observe',
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

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <div className="bg-navy px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => {
              if (step === 'mode') router.push('/');
              else if (step === 'password') { setStep('mode'); setError(''); }
              else if (step === 'account') { setStep('password'); setError(''); }
            }}
            className="text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <p className="font-body text-white/60 text-sm">Step w Sue</p>
        </div>
        <p className="font-display text-sw-pink text-5xl leading-none">
          {joinMode === 'observe' ? 'OBSERVE' : 'JOIN'}
        </p>
        <p className="font-display text-white text-3xl leading-none">THE CHALLENGE</p>
      </div>

      {/* Progress indicator */}
      <div className="bg-navy/5 border-b border-navy/10 px-6 py-4">
        <div className="flex items-center justify-between max-w-xs mx-auto">
          {PROGRESS_STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-body font-bold transition-all duration-200',
                  i < currentProgress
                    ? 'bg-sw-teal text-white'
                    : i === currentProgress
                    ? 'bg-sw-pink text-white shadow-btn'
                    : 'bg-gray-200 text-gray-400'
                )}>
                  {i < currentProgress ? '✓' : i + 1}
                </div>
                <span className={clsx(
                  'text-xs font-body whitespace-nowrap',
                  i === currentProgress ? 'text-navy font-semibold' : 'text-gray-400'
                )}>
                  {label}
                </span>
              </div>
              {i < PROGRESS_STEPS.length - 1 && (
                <div className={clsx(
                  'w-10 h-0.5 mx-1 mb-5 transition-all duration-300',
                  i < currentProgress ? 'bg-sw-teal' : 'bg-gray-200'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-8">

        {/* ── Step 0: choose mode ─────────────────────────────────────────── */}
        {step === 'mode' && (
          <div className="space-y-5 animate-fade-up">
            <div className="text-center">
              <p className="text-4xl mb-2">🤔</p>
              <p className="font-display text-navy text-2xl">JOINING OR OBSERVING?</p>
              <p className="font-body text-sm text-gray-500 mt-1">
                You can compete for prizes — or just cheer from the sidelines.
              </p>
            </div>

            <button
              onClick={() => { setJoinMode('join'); setError(''); setStep('password'); }}
              className="w-full bg-white border-2 border-sw-pink rounded-2xl p-5 text-left shadow-card hover:shadow-card-hover transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🏃</span>
                <div className="flex-1">
                  <p className="font-display text-navy text-2xl leading-none">JOIN</p>
                  <p className="font-body text-xs text-sw-pink font-semibold mt-0.5">$40 buy-in · compete for prizes</p>
                </div>
              </div>
              <p className="font-body text-sm text-gray-500">
                Submit weekly steps, climb the leaderboard, win cash. The full experience.
              </p>
            </button>

            <button
              onClick={() => { setJoinMode('observe'); setError(''); setStep('password'); }}
              className="w-full bg-white border-2 border-navy/15 rounded-2xl p-5 text-left shadow-card hover:shadow-card-hover transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">👀</span>
                <div className="flex-1">
                  <p className="font-display text-navy text-2xl leading-none">OBSERVE</p>
                  <p className="font-body text-xs text-navy/50 font-semibold mt-0.5">Free · watch &amp; cheer only</p>
                </div>
              </div>
              <p className="font-body text-sm text-gray-500">
                Follow the standings without paying or stepping. Pure spectator mode.
              </p>
            </button>

            <p className="font-body text-xs text-gray-400 text-center pt-1">
              Already have an account?{' '}
              <Link href="/login" className="text-sw-pink font-semibold">Sign in here</Link>
            </p>
          </div>
        )}

        {/* ── Step 1: challenge password ─────────────────────────────────── */}
        {step === 'password' && (
          <div className="space-y-6 animate-fade-up">
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
                className="w-full border-2 border-gray-200 bg-white rounded-2xl px-4 py-4 font-body text-navy text-lg text-center focus:outline-none focus:border-sw-pink transition-colors"
                autoCapitalize="none"
                autoComplete="off"
              />
              {error && (
                <div className="mt-2 bg-sw-pink/8 border border-sw-pink/20 rounded-xl px-3 py-2 animate-fade-up">
                  <p className="font-body text-sm text-sw-pink text-center">{error}</p>
                </div>
              )}
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
              <div className="space-y-6 animate-fade-up">
                <div className="text-center">
                  <p className="text-4xl mb-2">👋</p>
                  <p className="font-display text-navy text-2xl">WHO ARE YOU?</p>
                  <p className="font-body text-sm text-gray-500 mt-1">
                    {joinMode === 'observe'
                      ? 'So we know who is watching the action.'
                      : "This is how you'll appear on the leaderboard."}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-body text-sm font-semibold text-navy block mb-1.5">
                      First Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sue"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="given-name"
                      className="w-full border-2 border-gray-200 bg-white rounded-2xl px-4 py-3 font-body text-navy focus:outline-none focus:border-sw-pink transition-colors"
                    />
                  </div>

                  <div>
                    <label className="font-body text-sm font-semibold text-navy block mb-1.5">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Smith"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      autoComplete="family-name"
                      className="w-full border-2 border-gray-200 bg-white rounded-2xl px-4 py-3 font-body text-navy focus:outline-none focus:border-sw-pink transition-colors"
                    />
                  </div>

                  <div>
                    <label className="font-body text-sm font-semibold text-navy block mb-1.5">
                      Fun Nickname{' '}
                      <span className="font-normal text-gray-400 text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. The Pacer, Speedy..."
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full border-2 border-gray-200 bg-white rounded-2xl px-4 py-3 font-body text-navy focus:outline-none focus:border-sw-pink transition-colors"
                    />
                    <p className="text-xs text-gray-400 mt-1 px-1">Shows on the leaderboard</p>
                  </div>

                  {error && (
                    <div className="bg-sw-pink/8 border border-sw-pink/20 rounded-xl px-3 py-2 animate-fade-up">
                      <p className="font-body text-sm text-sw-pink text-center">{error}</p>
                    </div>
                  )}
                </div>

                <Button onClick={handleNamesNext} size="lg">
                  Next: Set My PIN →
                </Button>
              </div>
            )}

            {accountStage === 'pin' && (
              <div className="space-y-6 animate-fade-up">
                <div className="text-center">
                  <p className="text-4xl mb-2">🔢</p>
                  <p className="font-display text-navy text-2xl">SET YOUR PIN</p>
                  <p className="font-body text-sm text-gray-500 mt-1">
                    4 digits. You'll use this to sign back in.
                  </p>
                </div>

                <PinInput value={pin} onChange={setPin} label="Choose a PIN" error={error || undefined} />

                <Button
                  onClick={() => {
                    if (pin.length < 4) { setError('PIN must be 4 digits.'); return; }
                    setError('');
                    setAccountStage('confirm_pin');
                  }}
                  size="lg"
                  disabled={pin.length < 4}
                >
                  Next: Confirm PIN →
                </Button>
              </div>
            )}

            {accountStage === 'confirm_pin' && (
              <div className="space-y-6 animate-fade-up">
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
                  className="w-full font-body text-sm text-gray-500 py-2 hover:text-navy transition-colors"
                >
                  ← Change PIN
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
