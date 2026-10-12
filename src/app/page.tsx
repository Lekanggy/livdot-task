import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { EventProvider } from '@/state/EventProvider';

export default function Home() {
  return (
    <EventProvider>
      <DashboardPage />
    </EventProvider>
  );
}
