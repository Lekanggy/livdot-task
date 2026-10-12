import { describe, expect, it } from 'vitest';
import { getAvailableActions } from '@/domain/actions';
import { makeEvent, type Patch } from './helpers/eventFactory';
import type { ActionId } from '@/domain/types';

const satisfied: Patch['requirementStates'] = {
  crew: 'satisfied',
  ingest: 'satisfied',
  pricing: 'satisfied',
};

const enabledActions = (event: ReturnType<typeof makeEvent>): ActionId[] =>
  getAvailableActions(event)
    .filter((a) => a.enabled)
    .map((a) => a.action);

describe('getAvailableActions per status', () => {
  it('draft without a date: nothing enabled, every disabled action has a reason', () => {
    const event = makeEvent({ details: { name: 'n', startsAt: '', ticketPrice: 0 } });
    const actions = getAvailableActions(event);
    expect(actions.filter((a) => a.enabled)).toEqual([]);
    actions.forEach((a) => expect(a.reason).toBeTruthy());
  });

  it('draft with date + all requirements → only Schedule enabled', () => {
    const event = makeEvent({ requirementStates: satisfied });
    expect(enabledActions(event)).toEqual(['schedule']);
  });

  it('draft missing date shows the unscheduled reason on Schedule', () => {
    const event = makeEvent({ details: { name: 'n', startsAt: '', ticketPrice: 0 } });
    const schedule = getAvailableActions(event).find((a) => a.action === 'schedule');
    expect(schedule?.enabled).toBe(false);
    expect(schedule?.reason).toMatch(/schedule date/i);
  });

  it('draft: Go Live blocked (skips states); readiness reasoning appears from Scheduled', () => {
    const draft = makeEvent();
    const goLiveDraft = getAvailableActions(draft).find(
      (a) => a.action === 'goLive',
    );
    expect(goLiveDraft?.enabled).toBe(false);
    expect(goLiveDraft?.reason).toMatch(/cannot/i);

    const scheduled = makeEvent({ status: 'scheduled' });
    const goLiveSched = getAvailableActions(scheduled).find(
      (a) => a.action === 'goLive',
    );
    expect(goLiveSched?.enabled).toBe(false);
    expect(goLiveSched?.reason).toMatch(/crew/i);
    expect(goLiveSched?.reason).toMatch(/ingest/i);
  });

  it('scheduled (all satisfied): Schedule shows "already there", Go Live blocked by transition rule', () => {
    const event = makeEvent({ status: 'scheduled', requirementStates: satisfied });
    const actions = getAvailableActions(event);
    const schedule = actions.find((a) => a.action === 'schedule');
    expect(schedule?.enabled).toBe(false);
    expect(schedule?.reason).toMatch(/already/i);
    const goLive = actions.find((a) => a.action === 'goLive');
    expect(goLive?.enabled).toBe(false);
    expect(goLive?.reason).toMatch(/cannot/i);
  });

  it('ready → Go Live enabled, everything else disabled with a reason', () => {
    const event = makeEvent({ status: 'ready', requirementStates: satisfied });
    const actions = getAvailableActions(event);
    expect(actions.find((a) => a.action === 'goLive')?.enabled).toBe(true);
    actions
      .filter((a) => a.action !== 'goLive')
      .forEach((a) => expect(a.reason).toBeTruthy());
  });

  it('live → only End Event enabled', () => {
    const event = makeEvent({ status: 'live', requirementStates: satisfied });
    expect(enabledActions(event)).toEqual(['endEvent']);
  });

  it('completed → Replay enabled only when replayProcessed', () => {
    const done = makeEvent({
      status: 'completed',
      requirementStates: satisfied,
      replayProcessed: true,
    });
    expect(enabledActions(done)).toEqual(['enableReplay']);

    const processing = makeEvent({
      status: 'completed',
      requirementStates: satisfied,
      replayProcessed: false,
    });
    const replay = getAvailableActions(processing).find(
      (a) => a.action === 'enableReplay',
    );
    expect(replay?.enabled).toBe(false);
    expect(replay?.reason).toMatch(/processing/i);
  });

  it('replay is terminal: nothing enabled', () => {
    const event = makeEvent({
      status: 'replay',
      requirementStates: satisfied,
      replayProcessed: true,
    });
    expect(enabledActions(event)).toEqual([]);
  });

  it('always returns all four actions in order', () => {
    const ids = getAvailableActions(makeEvent()).map((a) => a.action);
    expect(ids).toEqual(['schedule', 'goLive', 'endEvent', 'enableReplay']);
  });
});
