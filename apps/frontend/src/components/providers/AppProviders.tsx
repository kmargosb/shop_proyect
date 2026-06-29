import { getCurrentUser } from '@/shared/server/api/auth';
import AppClientProviders from './AppClientProviders';

export default async function AppProviders({ children }: { children: React.ReactNode }) {
  let initialUser = null;

  try {
    const data = await getCurrentUser();
    initialUser = data.user;
  } catch {
    initialUser = null;
  }

  return <AppClientProviders initialUser={initialUser}>{children}</AppClientProviders>;
}
