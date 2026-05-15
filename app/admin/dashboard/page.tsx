'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { Trash2, RefreshCw, Lock, Unlock, Plus } from 'lucide-react';

type AdminTab = 'participants' | 'submissions' | 'weeks' | 'announcements';

interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  is_active: boolean;
  created_at: string;
  submissions: Array<{ week_number: number; total_steps: number; is_late: boolean; is_locked: boolean; submitted_at: string }>;
}

interface Submission {
  id: string;
  participant_id: string;
  week_number: number;
  total_steps: number;
  is_late: boolean;
  is_locked: boolean;
  submitted_at: string;
  participants: { first_name: string; last_name: string; nickname: string | null } | null;
}

interface Week {
  week_number: number;
  start_date: string;
  end_date: string;
  is_locked: boolean;
  winner_override_id: string | null;
}

interface Announcement {
  id: string;
  message: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('participants');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [newPin, setNewPin] = useState<Record<string, string>>({});
  const [editSteps, setEditSteps] = useState<Record<string, string>>({});
  const [newAnnouncement, setNewAnnouncement] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, sRes, wRes, aRes] = await Promise.all([
        fetch('/api/admin/participants'),
        fetch('/api/admin/submissions'),
        fetch('/api/admin/weeks'),
        fetch('/api/admin/announcements'),
      ]);

      if (pRes.status === 401) { router.replace('/admin'); return; }

      if (pRes.ok) setParticipants(await pRes.json());
      if (sRes.ok) setSubmissions(await sRes.json());
      if (wRes.ok) setWeeks(await wRes.json());
      if (aRes.ok) setAnnouncements(await aRes.json());
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleResetPin = async (id: string) => {
    const pin = newPin[id];
    if (!pin || !/^\d{4,6}$/.test(pin)) { flash('PIN must be 4–6 digits.'); return; }
    const res = await fetch('/api/admin/participants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'reset_pin', new_pin: pin }),
    });
    if (res.ok) { flash(`PIN reset for participant.`); setNewPin((p) => ({ ...p, [id]: '' })); }
    else flash('Failed to reset PIN.');
  };

  const handleDeleteParticipant = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the challenge?`)) return;
    const res = await fetch('/api/admin/participants', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { flash('Participant removed.'); fetchAll(); }
    else flash('Failed to remove participant.');
  };

  const handleToggleWeekLock = async (weekNumber: number, currentLocked: boolean) => {
    const res = await fetch('/api/admin/weeks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week_number: weekNumber, is_locked: !currentLocked }),
    });
    if (res.ok) { flash(`Week ${weekNumber} ${!currentLocked ? 'locked' : 'unlocked'}.`); fetchAll(); }
    else flash('Failed to update week.');
  };

  const handleOverrideSteps = async (id: string) => {
    const steps = editSteps[id];
    if (!steps) return;
    const res = await fetch('/api/admin/submissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, total_steps: steps }),
    });
    if (res.ok) { flash('Steps updated.'); setEditSteps((e) => ({ ...e, [id]: '' })); fetchAll(); }
    else flash('Failed to update steps.');
  };

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.trim()) return;
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newAnnouncement }),
    });
    if (res.ok) { flash('Announcement posted!'); setNewAnnouncement(''); fetchAll(); }
    else flash('Failed to post announcement.');
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const res = await fetch('/api/admin/announcements', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { flash('Announcement deleted.'); fetchAll(); }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.replace('/admin');
  };

  const tabs: { id: AdminTab; label: string; count?: number }[] = [
    { id: 'participants', label: 'People', count: participants.filter((p) => p.is_active).length },
    { id: 'submissions', label: 'Steps', count: submissions.length },
    { id: 'weeks', label: 'Weeks' },
    { id: 'announcements', label: 'Announce', count: announcements.filter((a) => a.is_active).length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin header */}
      <div className="bg-navy px-4 pt-12 pb-4 flex items-center justify-between">
        <div>
          <p className="font-display text-white text-2xl leading-tight">ADMIN PANEL</p>
          <p className="font-body text-white/50 text-xs">Step w Sue 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAll} className="text-white/50 hover:text-white">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleLogout}
            className="font-body text-xs text-white/50 border border-white/20 rounded-full px-3 py-1"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Flash message */}
      {msg && (
        <div className="bg-sw-teal text-white px-4 py-2 text-center font-body text-sm">
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-4">
        {tabs.map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              'py-3 px-3 font-body text-sm font-semibold border-b-2 transition-colors',
              tab === id ? 'border-sw-pink text-sw-pink' : 'border-transparent text-gray-500'
            )}
          >
            {label}
            {count !== undefined && (
              <span className={clsx('ml-1 text-xs rounded-full px-1.5 py-0.5', tab === id ? 'bg-sw-pink/10' : 'bg-gray-100')}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">

        {/* ── Participants ────────────────────────────────────────────── */}
        {tab === 'participants' && (
          <div className="space-y-3">
            {participants.map((p) => {
              const name = `${p.first_name} ${p.last_name}`;
              return (
                <div key={p.id} className={clsx('bg-white rounded-2xl p-4 shadow-sm', !p.is_active && 'opacity-50')}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-body font-bold text-navy">{name}</p>
                      {p.nickname && <p className="font-body text-xs text-gray-400">"{p.nickname}"</p>}
                      <p className="font-body text-xs text-gray-400 mt-1">
                        {p.submissions.length}/4 weeks submitted
                        {p.submissions.some((s) => s.is_late) && ' · ⏰ has late'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteParticipant(p.id, name)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <input
                      type="number"
                      placeholder="New PIN (4–6 digits)"
                      inputMode="numeric"
                      value={newPin[p.id] ?? ''}
                      onChange={(e) => setNewPin((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 font-body text-sm focus:outline-none focus:border-sw-pink"
                    />
                    <button
                      onClick={() => handleResetPin(p.id)}
                      className="bg-navy text-white font-body text-xs rounded-xl px-3 py-2"
                    >
                      Reset PIN
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Submissions ─────────────────────────────────────────────── */}
        {tab === 'submissions' && (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((wn) => {
              const weekSubs = submissions.filter((s) => s.week_number === wn);
              return (
                <div key={wn} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-navy/5 px-4 py-2 border-b border-gray-100">
                    <p className="font-display text-navy text-lg">WEEK {wn}</p>
                  </div>
                  {weekSubs.length === 0 ? (
                    <p className="font-body text-sm text-gray-400 px-4 py-3">No submissions yet.</p>
                  ) : (
                    weekSubs.map((s) => {
                      const pName = s.participants
                        ? s.participants.nickname ?? `${s.participants.first_name} ${s.participants.last_name}`
                        : 'Unknown';
                      return (
                        <div key={s.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                          <div className="flex-1">
                            <p className="font-body font-semibold text-navy text-sm">{pName}</p>
                            <p className="font-body text-xs text-gray-400">
                              {s.total_steps.toLocaleString()} steps
                              {s.is_late && ' · ⏰ late'}
                              {s.is_locked && ' · 🔒 locked'}
                            </p>
                          </div>
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              placeholder="Override"
                              value={editSteps[s.id] ?? ''}
                              onChange={(e) => setEditSteps((prev) => ({ ...prev, [s.id]: e.target.value }))}
                              className="w-24 border border-gray-200 rounded-xl px-2 py-1 font-body text-sm text-center focus:outline-none focus:border-sw-pink"
                            />
                            <button
                              onClick={() => handleOverrideSteps(s.id)}
                              className="bg-sw-teal text-white font-body text-xs rounded-xl px-2 py-1"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Weeks ───────────────────────────────────────────────────── */}
        {tab === 'weeks' && (
          <div className="space-y-3">
            {weeks.map((week) => (
              <div key={week.week_number} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-navy text-xl">WEEK {week.week_number}</p>
                    <p className="font-body text-xs text-gray-400">
                      {week.start_date} – {week.end_date}
                    </p>
                    <p className="font-body text-xs mt-1">
                      {week.is_locked ? '🔒 Locked — winner is final' : '🔓 Open — accepting submissions'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleWeekLock(week.week_number, week.is_locked)}
                    className={clsx(
                      'flex items-center gap-2 rounded-xl px-4 py-2 font-body text-sm font-semibold',
                      week.is_locked
                        ? 'bg-sw-teal/10 text-sw-teal border border-sw-teal/30'
                        : 'bg-sw-pink/10 text-sw-pink border border-sw-pink/30'
                    )}
                  >
                    {week.is_locked ? <Unlock size={14} /> : <Lock size={14} />}
                    {week.is_locked ? 'Unlock' : 'Lock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Announcements ───────────────────────────────────────────── */}
        {tab === 'announcements' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="font-body font-semibold text-navy text-sm mb-3">Post New Announcement</p>
              <textarea
                placeholder="Enter an announcement for the home screen..."
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 font-body text-sm resize-none h-20 focus:outline-none focus:border-sw-pink"
              />
              <button
                onClick={handleAddAnnouncement}
                className="mt-2 flex items-center gap-2 bg-sw-pink text-white font-body text-sm font-semibold rounded-xl px-4 py-2"
              >
                <Plus size={14} />
                Post Announcement
              </button>
            </div>

            <div className="space-y-2">
              {announcements.length === 0 && (
                <p className="font-body text-sm text-gray-400 text-center py-4">No announcements yet.</p>
              )}
              {announcements.map((a) => (
                <div key={a.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3">
                  <p className="flex-1 font-body text-sm text-navy">{a.message}</p>
                  <button
                    onClick={() => handleDeleteAnnouncement(a.id)}
                    className="text-red-400 hover:text-red-600 shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
