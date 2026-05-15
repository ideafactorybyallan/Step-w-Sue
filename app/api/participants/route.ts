import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('participants')
    .select('id, first_name, last_name, nickname')
    .eq('is_active', true)
    .order('first_name');

  if (error) {
    return NextResponse.json({ error: 'Failed to load participants' }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
