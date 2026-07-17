import { planSentence, suggestIfThenPlans } from './ifThenPlans';

test('suggests an action plan from the highest-priority open task', () => {
  const suggestions = suggestIfThenPlans([{ id: '2', title: 'Admin', priority: 'P2', status: 'inbox', nextAction: 'Open the form' }, { id: '1', title: 'Proposal', priority: 'P1', status: 'planned', nextAction: 'Write three headings' }], { workingHoursStart: '09:30' });
  expect(suggestions[0]).toMatchObject({ type: 'action', taskId: '1', response: 'Write three headings' });
  expect(suggestions[0].cue).toMatch(/09:30/);
});

test('suggests a coping response for a postponed task', () => {
  const suggestions = suggestIfThenPlans([{ id: '1', title: 'Report', priority: 'P1', status: 'postponed', nextAction: 'Open report', postponementReason: 'anxiety' }]);
  expect(suggestions.some((plan) => plan.type === 'coping' && /imperfect draft/i.test(plan.response))).toBe(true);
});

test('formats the exact sentence shown for confirmation', () => expect(planSentence({ cue: 'When I sit down', response: 'I will open the proposal' })).toBe('When I sit down, then I will open the proposal.'));
