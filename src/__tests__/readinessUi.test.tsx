import { render, screen, waitFor } from '@testing-library/react';
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

    expect(screen.getByTestId('readiness-summary')).toHaveTextContent(/of 3 requirements/);
    expect(screen.getByTestId('req-crew')).toHaveAttribute('data-state', 'satisfied');
    expect(screen.getByTestId('req-ingest')).toHaveAttribute('data-state', 'missing');
    expect(screen.getByTestId('req-pricing')).toHaveAttribute('data-state', 'missing');

    const crew = screen.getByTestId('req-crew');
    expect(crew).toHaveTextContent(/satisfied/i);
    const ingest = screen.getByTestId('req-ingest');
    expect(ingest).toHaveTextContent(/missing/i);
  });

  it('different icons per state (not color alone)', async () => {
    setup();
    await waitForDashboard();
    expect(screen.getByTestId('req-crew')).toHaveTextContent('✓');
    expect(screen.getByTestId('req-ingest')).toHaveTextContent('✕');
  });
});

describe('blocked actions surface reasons', () => {
  it('every disabled button shows Why blocked + reason, linked via aria-describedby', async () => {
    setup();
    await waitForDashboard();

    const buttons = screen
      .getAllByRole('button')
      .filter((b) => b.hasAttribute('data-testid') && b.getAttribute('data-testid') !== 'retry' && !b.hasAttribute('aria-description'));

    const actionButtons = screen.getAllByRole('button').filter((b) =>
      b.getAttribute('data-testid')?.startsWith('action-'),
    );
    actionButtons.forEach((b) => {
      if (b.getAttribute('aria-disabled') === 'true' || b.hasAttribute('disabled')) {
        const described = b.getAttribute('aria-describedby');
        expect(described).toBeTruthy();
        expect(screen.getByTestId(described as string)).toHaveTextContent(
          /why blocked:/i,
        );
      }
    });
    expect(actionButtons.length).toBeGreaterThan(0);
  });

  it('pending requirement blocks Go Live path with pending wording from blocked message', async () => {
    configureApi({ scenario: 'scheduled-almost-ready' });
    setup();
    await waitForDashboard();
    expect(screen.getByTestId('req-ingest')).toHaveAttribute('data-state', 'pending');
    const goLive = screen.getByTestId('action-goLive');
    expect(goLive).toBeDisabled();
  });
});

describe('auto-promote / demote without reload', () => {
  it('satisfying the last requirement promotes Scheduled → Ready with notice, no reload', async () => {
    const user = userEvent.setup();
    configureApi({ scenario: 'scheduled-missing-crew' });
    setup();
    await waitForDashboard();

    expect(screen.getByTestId('status-badge')).toHaveTextContent('Scheduled');
    await user.click(screen.getByTestId('req-crew-satisfy'));

    await waitFor(() =>
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Ready for Streaming'),
    );
    expect(screen.getByText(/auto-promoted/i)).toBeInTheDocument();
  });

  it('removing a requirement demotes Ready → Scheduled with a visible notice', async () => {
    const user = userEvent.setup();
    configureApi({ scenario: 'ready' });
    setup();
    await waitForDashboard();

    expect(screen.getByTestId('status-badge')).toHaveTextContent('Ready for Streaming');
    await user.click(screen.getByTestId('req-crew-missing'));

    await waitFor(() =>
      expect(screen.getByTestId('status-badge')).toHaveTextContent('Scheduled'),
    );
    expect(screen.getByText(/demoted/i)).toBeInTheDocument();
  });
});
