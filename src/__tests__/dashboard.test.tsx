import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { EventProvider } from '@/state/EventProvider';
import { configureApi, resetApi } from '@/services/mockEventApi';
import { instantLatency } from './testUtils/mockApiHarness';

const configureScenario = (args: Parameters<typeof configureApi>[0]) => configureApi(args);

function renderDashboard() {
  return render(
    <EventProvider>
      <DashboardPage />
    </EventProvider>,
  );
}

beforeEach(() => {
  instantLatency();
  resetApi();
  configureScenario({ scenario: 'draft-incomplete' });
});

describe('DashboardPage', () => {
  it('renders header, stepper, and details once loaded', async () => {
    renderDashboard();
    await waitFor(() =>
      expect(screen.getByTestId('dashboard')).toBeInTheDocument(),
    );
    expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('Draft');
    expect(screen.getByText(/Fall Product Launch Keynote/i)).toBeInTheDocument();
    expect(screen.getByTestId('event-date')).toBeInTheDocument();
  });

  it('shows loading skeleton while the event loads', () => {
    vi.useFakeTimers();
    configureScenario({ latency: { minMs: 500, maxMs: 500 } });
    renderDashboard();
    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('changes badge and stepper when the seed scenario changes', async () => {
    const { unmount } = renderDashboard();
    await waitFor(() => expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('Draft'));

    unmount();
    configureScenario({ scenario: 'live' });
    renderDashboard();
    await waitFor(() =>
      expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('Live'),
    );
    expect(screen.getByTestId('step-live')).toHaveAttribute('data-state', 'current');
    expect(screen.getByTestId('step-draft')).toHaveAttribute('data-state', 'complete');
    expect(screen.getByTestId('step-replay')).toHaveAttribute('data-state', 'upcoming');
  });

  it('shows an error state and retries successfully', async () => {
    const user = userEvent.setup();
    configureScenario({ latency: { minMs: 0, maxMs: 0, failRate: 1 } });
    renderDashboard();
    await waitFor(() => expect(screen.getByTestId('dashboard-error')).toBeInTheDocument());
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();

    configureScenario({ latency: { minMs: 0, maxMs: 0, failRate: 0 } });
    await user.click(screen.getByTestId('retry'));
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
  });
});
