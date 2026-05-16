import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { WeeklySubmission } from '@/lib/types';
import { StepsClient } from './StepsClient';

export default async function StepsPage() {
  const session = await getSession();
  if (!session) redirect('/');

  const { data } = await supabase
    .from('weekly_submissions')
    .select('*')
    .eq('participant_id', session.id)
    .order('week_number');

  const submissions: WeeklySubmission[] = data ?? [];

  return <StepsClient session={session} submissions={submissions} />;
}
