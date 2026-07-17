import { guidanceForPostponement } from './taskGuidance';

const rank = { P1: 1, P2: 2, P3: 3 };

export function suggestIfThenPlans(tasks = [], preferences = {}) {
  const open = tasks.filter((task) => !['completed', 'cancelled'].includes(task.status)).sort((a, b) => (rank[a.priority] || 9) - (rank[b.priority] || 9));
  const primary = open[0];
  const postponed = open.find((task) => task.status === 'postponed');
  const suggestions = [];
  if (primary) suggestions.push({ type: 'action', cue: `When I begin my work period at ${preferences.workingHoursStart || '09:00'}`, response: primary.nextAction || `I will start “${primary.title}” for five minutes`, taskId: primary.id });
  if (postponed) suggestions.push({ type: 'coping', cue: `If the obstacle “${postponed.postponementReason || 'friction'}” appears while working on “${postponed.title}”`, response: guidanceForPostponement(postponed.postponementReason), taskId: postponed.id });
  return suggestions;
}

export const planSentence = (plan) => `${plan.cue.trim()}, then ${plan.response.trim()}.`;
