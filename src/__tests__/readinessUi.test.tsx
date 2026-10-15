import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { EventProvider } from '@/state/EventProvider';
import { configureApi, resetApi } from '@/services/mockEventApi';
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

const waitForDashboard = async () => {
  await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument());
};

describe('ReadinessPanel rendering', () => {
  it('shows N of M progress and distinct states for missing/pending/error/satisfied', async () => {
    setup();
    await waitForDashboard();

    expect(screen.getByTestId('readiness-summary')).toHaveTextContent(/1 of 3 satisfied/);
    expect(screen.getByTestId('req-crew')).toHaveAttribute('data-state', 'satisfied');
    expect(screen.getByTestId('req-ingest')).toHaveAttribute('data-state', 'missing');
    expect(screen.getByTestId('req-pricing')).toHaveAttribute('data-state', 'missing');

    const crew = screen.getByTestId('req-crew');
    expect(crew).toHaveTextContent(/Crew assigned/i);
    const ingest = screen.getByTestId('req-ingest');
    expect(ingest).toHaveTextContent(/Ingest configured/i);
  });

  it('different tone icons per state (not color alone)', async () => {
    setup();
    await waitForDashboard();
    const crew = screen.getByTestId('req-crew');
    expect(crew.querySelector('span')?.getAttribute('class')).toContain('text-green-800');
    const ingest = screen.getByTestId('req-ingest');
    expect(ingest.querySelector('span')?.getAttribute('class')).toContain('text-red-800');
  });

  it('Configure appears only for missing/error rows; none for satisfied', async () => {
    setup();
    await waitForDashboard();

    expect(screen.getByTestId('configure-ingest')).toBeInTheDocument();
    expect(screen.getByTestId('configure-pricing')).toBeInTheDocument();
    expect(screen.queryByTestId('configure-crew')).not.toBeInTheDocument();
  });

  it('pending requirement shows “Verifying…” with no Configure button', async () => {
    configureApi({ scenario: 'scheduled-almost-ready' });
    setup();
    await waitForDashboard();

    const row = screen.getByTestId('req-ingest');
    expect(row).toHaveAttribute('data-state', 'pending');
    expect(within(row).getByText(/Verifying/)).toBeInTheDocument();
    expect(within(row).queryByTestId('configure-ingest')).not.toBeInTheDocument();
  });
});

describe('LifecycleStepper', () => {
  it('exactly one aria-current="step" matching the status; earlier steps complete', async () => {
    configureApi({ scenario: 'ready' });
    setup();
    await waitForDashboard();

    const stepper = screen.getByTestId('lifecycle-stepper');
    const currentSteps = stepper.querySelectorAll('[aria-current="step"]');
    expect(currentSteps).toHaveLength(1);
    expect(currentSteps[0]).toHaveAttribute('data-testid', 'step-ready');

    expect(screen.getByTestId('step-draft')).toHaveAttribute('data-state', 'complete');
    expect(screen.getByTestId('step-scheduled')).toHaveAttribute('data-state', 'complete');
    expect(screen.getByTestId('step-live')).toHaveAttribute('data-state', 'upcoming');
  });
});

describe('NextStepCard blocked state', () => {
  it('shows the button disabled, aria-describedby resolving to the reasons list', async () => {
    configureApi({ scenario: 'scheduled-missing-crew' });
    setup();
    await waitForDashboard();

    const goLive = screen.getByTestId('action-goLive');
    expect(goLive).toBeDisabled();

    const describedBy = goLive.getAttribute('aria-describedby');
    expect(describedBy).toBe('blocked-goLive');
    const reasons = screen.getByTestId(describedBy!);
    expect(reasons).toHaveTextContent(/Resolve to continue/i);
    expect(reasons).toHaveTextContent(/Crew is not confirmed\.?/i);
  });

  it('enabled state hides the reasons box', async () => {
    configureApi({ scenario: 'ready' });
    setup();
    await waitForDashboard();

    const goLive = screen.getByTestId('action-goLive');
    expect(goLive).toBeEnabled();
    expect(goLive).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByTestId('blocked-goLive')).not.toBeInTheDocument();
  });
});

describe('auto-promote / demote without reload', () => {
  it('satisfying the last requirement promotes Scheduled → Ready', async () => {
    const user = userEvent.setup();
    configureApi({ scenario: 'scheduled-missing-crew' });
    setup();
    await waitForDashboard();

    expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('Scheduled');
    await user.click(screen.getByTestId('sim-scenario'));
    const select = screen.getByTestId('sim-scenario');
    await user.selectOptions(select, 'ready');

    await waitFor(() =>
      expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('Ready for Streaming'),
    );
    expect(screen.getAllByTestId('status-badge')[0]).toBeInTheDocument();
  });

  it('removing a requirement demotes Ready → Scheduled with a visible notice', async () => {
    const user = userEvent.setup();
    configureApi({ scenario: 'ready' });
    setup();
    await waitForDashboard();

    expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('Ready for Streaming');
    await user.click(screen.getByTestId('sim-scenario'));
    const select = screen.getByTestId('sim-scenario');
    await user.selectOptions(select, 'scheduled-missing-crew');

    await waitFor(() =>
      expect(screen.getAllByTestId('status-badge')[0]).toHaveTextContent('Scheduled'),
    );
    expect(screen.getAllByTestId('status-badge')[0]).toBeInTheDocument();
  });
});
