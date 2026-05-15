'use client';
import { useState } from 'react';
import { Card } from './ui/Card';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function RulesCard() {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <p className="font-display text-navy text-xl">CHALLENGE RULES</p>
        </div>
        {open ? <ChevronUp size={18} className="text-navy/60 shrink-0" /> : <ChevronDown size={18} className="text-navy/60 shrink-0" />}
      </button>

      {open && (
        <div className="mt-4 space-y-3 font-body text-sm text-gray-700">
          <div className="bg-cream rounded-xl p-3 space-y-1">
            <p className="font-semibold text-navy">📅 Dates</p>
            <p>May 18 – June 14, 2026 (4 weeks)</p>
            <p className="text-xs text-gray-500">Submit by Monday midnight after each week.</p>
          </div>

          <div className="bg-cream rounded-xl p-3 space-y-1">
            <p className="font-semibold text-navy">💰 Buy-In</p>
            <p>$20 for the overall challenge</p>
            <p>$20 for weekly prizes ($5 × 4 weeks)</p>
            <p className="font-semibold text-sw-pink">$40 total per person</p>
          </div>

          <div className="bg-cream rounded-xl p-3 space-y-1">
            <p className="font-semibold text-navy">🗓️ Weeks</p>
            <p>Week 1: May 18–24 · Submit by May 25</p>
            <p>Week 2: May 25–31 · Submit by Jun 1</p>
            <p>Week 3: Jun 1–7 · Submit by Jun 8</p>
            <p>Week 4: Jun 8–14 · Submit by Jun 15</p>
          </div>

          <div className="bg-cream rounded-xl p-3 space-y-1">
            <p className="font-semibold text-navy">🏆 Prizes</p>
            <p>Overall: highest total steps wins the pool</p>
            <p>Weekly: most steps that week wins the weekly prize</p>
            <p className="text-xs text-gray-500">
              Prize amounts update dynamically based on participant count.
            </p>
          </div>

          <div className="bg-cream rounded-xl p-3">
            <p className="font-semibold text-navy mb-1">📝 Submissions</p>
            <p>Enter steps daily or as a weekly total. Submit by Monday midnight. Late submissions still count but get flagged.</p>
          </div>
        </div>
      )}
    </Card>
  );
}
