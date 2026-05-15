export interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  created_at: string;
  is_active: boolean;
}

export interface DailyStep {
  id: string;
  participant_id: string;
  entry_date: string;
  steps: number;
  created_at: string;
  updated_at: string;
}

export interface WeeklySubmission {
  id: string;
  participant_id: string;
  week_number: number;
  total_steps: number;
  submitted_at: string;
  updated_at: string;
  is_late: boolean;
  is_locked: boolean;
}

export interface WeekConfig {
  week_number: number;
  start_date: string;
  end_date: string;
  submission_deadline: string;
  is_locked: boolean;
  winner_override_id: string | null;
}

export interface Announcement {
  id: string;
  message: string;
  created_at: string;
  is_active: boolean;
}

export interface SessionUser {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
}

export interface LeaderboardEntry {
  participant: Participant;
  total_steps: number;
  weeks_submitted: number;
  rank: number;
  title: string;
  title_emoji: string;
  has_late: boolean;
  first_submitted_at: string | null;
}

export interface WeekLeaderboardEntry {
  participant: Participant;
  steps: number;
  is_submitted: boolean;
  submitted_at: string | null;
  is_late: boolean;
  rank: number;
  is_winner: boolean;
}

export interface WeekStanding {
  entries: WeekLeaderboardEntry[];
  is_locked: boolean;
  winner: Participant | null;
  status: 'upcoming' | 'active' | 'past';
}

export interface LeaderboardData {
  overall: LeaderboardEntry[];
  weeks: Record<number, WeekStanding>;
  participant_count: number;
}
