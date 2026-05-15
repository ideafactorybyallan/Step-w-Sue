export const WEEKS = [
  { number: 1, start: '2026-05-18', end: '2026-05-24', deadline: '2026-05-25' },
  { number: 2, start: '2026-05-25', end: '2026-05-31', deadline: '2026-06-01' },
  { number: 3, start: '2026-06-01', end: '2026-06-07', deadline: '2026-06-08' },
  { number: 4, start: '2026-06-08', end: '2026-06-14', deadline: '2026-06-15' },
] as const;

export const CHALLENGE_START = '2026-05-18';
export const CHALLENGE_END = '2026-06-14';

// EDT = UTC-4 (valid for May–June)
export function getNowEDT(): Date {
  const now = new Date();
  return new Date(now.getTime() - 4 * 60 * 60 * 1000);
}

export function getTodayEDT(): string {
  return getNowEDT().toISOString().split('T')[0];
}

export function isMondayEDT(): boolean {
  return getNowEDT().getUTCDay() === 1;
}

export function isChallengeStarted(): boolean {
  return getTodayEDT() >= CHALLENGE_START;
}

export function isChallengeOver(): boolean {
  return getTodayEDT() > CHALLENGE_END;
}

export function getDaysUntilStart(): number {
  const now = getNowEDT();
  const start = new Date('2026-05-18T04:00:00.000Z'); // midnight EDT
  return Math.max(0, Math.ceil((start.getTime() - now.getTime()) / 86400000));
}

export function getDaysRemaining(): number {
  const now = getNowEDT();
  const end = new Date('2026-06-15T03:59:59.000Z'); // end of June 14 EDT
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
}

export function getCurrentWeekNumber(): number | null {
  const today = getTodayEDT();
  for (const week of WEEKS) {
    if (today >= week.start && today <= week.end) return week.number;
  }
  return null;
}

export function getWeekStatus(weekNumber: number): 'upcoming' | 'active' | 'past' {
  const today = getTodayEDT();
  const week = WEEKS[weekNumber - 1];
  if (today < week.start) return 'upcoming';
  if (today <= week.end) return 'active';
  return 'past';
}

export function isLateSubmission(weekNumber: number): boolean {
  return getTodayEDT() > WEEKS[weekNumber - 1].deadline;
}

export function getDaysInWeek(weekNumber: number): string[] {
  const { start } = WEEKS[weekNumber - 1];
  const [y, m, d] = start.split('-').map(Number);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(y, m - 1, d + i);
    days.push(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    );
  }
  return days;
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getDayName(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-CA', { weekday: 'short' });
}
