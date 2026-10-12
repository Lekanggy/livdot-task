import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { EventProvider } from '@/state/EventProvider';
import { configureApi, resetApi, setFailNext } from '@/services/mockEventApi';
import { instantLatency } from './testUtils/mockApiHarness';

const setup = () =>
  render(
    <EventProvider>
      <DashboardPage />
    </EventProvider>,
  );

beforeEach(() => {
  instantLatency();
  resetApi();
});

async function pickScenario(id: string) {
  await act(async () => {
    const select = screen.getByTestId('sim-scenario');
    const option = Array.from(select.querySelectorAll('option')).find((o) =>
      o.textContent?.includes(id),
    );
    await userEvent.selectOptions(select, option!.value);
  });
  await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
}

describe('all six lifecycle states reachable via UI alone', () => {
  const map = [
    ['Draft incomplete', 'Draft'],
    ['Scheduled, crew missing', 'Scheduled'],
    ['Ready for Streaming', 'Ready for Streaming'],
    ['Live', 'Live'],
    ['Completed', 'Completed'],
  ] as const;

  it.each(map)('scenario "%s" shows badge %s', async (scenario, badge) => {
    setup();
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
    await pickScenario(scenario);
    expect(screen.getByTestId('status-badge')).toHaveTextContent(badge);
  });

  it('replay available: Completed + replay processing toggle → Replay Available', async () => {
    setup();
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
    await pickScenario('Completed');
    await userEvent.click(screen.getByTestId('action-enableReplay'));
    await waitFor(() =>
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Replay Available'),
    );
  });

  it('Draft → Scheduled → Ready → Live → Completed via UI actions only', async () => {
    setup();
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
    await pickScenario('Draft incomplete');
    await userEvent.click(screen.getByTestId('req-ingest-satisfy'));
    await waitFor(() =>
      expect(screen.getByTestId('req-ingest')).toHaveAttribute('data-state', 'satisfied'),
    );
    await userEvent.click(screen.getByTestId('action-schedule'));
    await waitFor(() =>
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Scheduled'),
    );
    await userEvent.click(screen.getByTestId('req-pricing-satisfy'));
    await waitFor(() =>
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Ready for Streaming'),
    );
    await userEvent.click(screen.getByTestId('action-goLive'));
    await waitFor(() => expect(screen.getByTestId('status-badge')).toHaveTextContent('Live'));
    await userEvent.click(screen.getByTestId('action-endEvent'));
    await waitFor(() =>
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Completed'),
    );
  });
});

describe('stale responses and failures', () => {
  it('switching scenario mid-request does not flicker back to the old data', async () => {
    vi.useFakeTimers();
    configureApi({ latency: { minMs: 300, maxMs: 300 } });
    setup();
    await vi.advanceTimersByTimeAsync(400);
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());

    const select = screen.getByTestId('sim-scenario');
    const live = Array.from(select.querySelectorAll('option')).find((o) =>
      o.textContent?.includes('Live'),
    );
    await act(async () => {
      await userEvent.selectOptions(select, live!.value);
    });
    await vi.advanceTimersByTimeAsync(400);
    await waitFor(() =>
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Live'),
    );

    const backToDraft = Array.from(select.querySelectorAll('option')).find((o) =>
      o.textContent?.includes('Draft'),
    );
    await act(async () => {
      await userEvent.selectOptions(select, backToDraft!.value);
    });
    await vi.advanceTimersByTimeAsync(400);
    await waitFor(() =>
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Draft'),
    );
    vi.useRealTimers();
  });

  it('one-shot failure shows feedback and leaves state consistent', async () => {
    setup();
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
    await pickScenario('Ready for Streaming');

    act(() => setFailNext(true));
    await userEvent.click(screen.getByTestId('action-goLive'));
    await waitFor(() => expect(screen.getByText(/simulated failure/i)).toBeInTheDocument());
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Ready for Streaming');

    await userEvent.click(screen.getByTestId('action-goLive'));
    await waitFor(() =>
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Live'),
    );
  });

  it('double-click runs only one transition (busy button is disabled while in flight)', async () => {
    configureApi({ latency: { minMs: 200, maxMs: 200 } });
    setup();
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
    await pickScenario('Ready for Streaming');

    const goLive = screen.getByTestId('action-goLive');
    await act(async () => {
      goLive.click();
      await Promise.resolve();
    });
    expect(goLive).toBeDisabled();
    expect(goLive).toHaveAttribute('aria-busy', 'true');

    goLive.click();
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    await waitFor(() =>
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Live'),
    );
  });
});
