import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { AppLayout } from '@/components/AppLayout';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/');
  return <AppLayout>{children}</AppLayout>;
}
