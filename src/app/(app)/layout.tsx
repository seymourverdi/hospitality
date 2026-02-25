// City Club HMS - App Layout
// Layout for authenticated app routes

import { AppShell } from '@/components/layout';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
