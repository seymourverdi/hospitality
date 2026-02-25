// City Club HMS - Root Page
// Redirects to Stats dashboard

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/stats');
}
