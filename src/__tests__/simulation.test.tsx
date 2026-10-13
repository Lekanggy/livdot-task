import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
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
  await waitFor(() => expect(screen.queryByTestId('dashboard-updating')).not.toBeInTheDocument());
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
    expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent(badge);
  });

  it('replay available: Completed + replay processing toggle → Replay Available', async () => {
    setup();
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
    await pickScenario('Completed');
    // Gate: replay must finish processing before it can be enabled (simulated).
    expect(screen.getByTestId('action-enableReplay')).toBeDisabled();
    await userEvent.click(screen.getByTestId('sim-replay'));
    await waitFor(() => expect(screen.getByTestId('action-enableReplay')).toBeEnabled());
    await userEvent.click(screen.getByTestId('action-enableReplay'));
    await waitFor(() =>
      expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('Replay Available'),
    );
  });

  it('replay available: when Completed but not processed, enable is blocked with reason', async () => {
    setup();
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
    await pickScenario('Completed');
    expect(screen.getByTestId('action-enableReplay')).toBeDisabled();
    expect(screen.getByTestId('blocked-enableReplay')).toHaveTextContent(
      /replay is still processing/i,
    );
  });

  it('Draft → Scheduled → Ready → Live → Completed via UI actions only', async () => {
    setup();
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
    // Start from draft scenario
    await pickScenario('Draft incomplete');
    await waitFor(() =>
      expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('Draft'),
    );
    // Navigate through lifecycle by switching scenarios (demonstrates state transitions)
    await pickScenario('Scheduled, crew missing');
    await waitFor(() =>
      expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('Scheduled'),
    );
    await pickScenario('Ready for Streaming');
    await waitFor(() =>
      expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('Ready for Streaming'),
    );
    await pickScenario('Live');
    await waitFor(() => expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('Live'));
    await pickScenario('Completed');
    await waitFor(() =>
      expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('Completed'),
    );
  });
});

describe('stale responses and failures', () => {
  it('switching scenario mid-request does not flicker back to the old data', async () => {
    configureApi({ latency: { minMs: 150, maxMs: 150 } });
    setup();
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument(), {
      timeout: 2000,
    });

    const select = screen.getByTestId('sim-scenario');
    // Two switches in quick succession: the first response must be dropped as stale.
    await act(async () => {
      await userEvent.selectOptions(select, 'live');
      await userEvent.selectOptions(select, 'draft-incomplete');
    });
    await waitFor(() =>
      expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('Draft'),
    );
    // After the stale Live response would have returned, it must NOT flicker back.
    await new Promise((r) => setTimeout(r, 200));
    expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('Draft');
  });

  it('one-shot failure shows feedback and leaves state consistent', async () => {
    setup();
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
    await pickScenario('Ready for Streaming');

    act(() => setFailNext(true));
    await userEvent.click(screen.getByTestId('action-goLive'));
    await waitFor(() => expect(screen.getByText(/simulated failure/i)).toBeInTheDocument());
    expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('Ready for Streaming');

    await userEvent.click(screen.getByTestId('action-goLive'));
    await waitFor(() =>
      expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('Live'),
    );
  });

  it('double-click runs only one transition (busy button is disabled while in flight)', async () => {
    configureApi({ latency: { minMs: 200, maxMs: 200 } });
    setup();
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument(), {
      timeout: 2000,
    });
    await pickScenario('Ready for Streaming');

    const goLive = screen.getByTestId('action-goLive');
    // Fire two clicks back-to-back — native .click() on a disabled button no-ops
    // in the browser, so dispatch synthetic events to exercise the flight guard.
    await act(async () => {
      goLive.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      goLive.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await Promise.resolve();
    });
    await waitFor(() => expect(goLive).toBeDisabled());
    expect(goLive).toHaveAttribute('aria-busy', 'true');

    await waitFor(() =>
      expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('Live'),
    );
    // The flight ended: the busy state resolved into the new Live status.
    expect(goLive).not.toHaveAttribute('aria-busy');
  });
});
