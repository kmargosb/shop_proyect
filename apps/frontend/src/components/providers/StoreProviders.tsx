import StoreClientProviders from './StoreClientProviders';

export default function StoreProviders({ children }: { children: React.ReactNode }) {
  return <StoreClientProviders>{children}</StoreClientProviders>;
}
