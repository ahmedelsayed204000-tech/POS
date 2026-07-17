const vagueStarts = /^(work on|handle|deal with|prepare|study|exercise|research|plan|organize|improve)\b/i;

export function suggestNextAction(task) {
  const title = String(task?.title || '').trim();
  if (!title) return '';
  if (/exercise|workout|gym|walk|run/i.test(title)) return 'Put on your training clothes and move for five minutes.';
  if (/study|read|learn|chapter|course/i.test(title)) return `Open the relevant material for “${title}” and complete the first two pages or one short lesson.`;
  if (/presentation|slides|deck/i.test(title)) return 'Open the presentation and write the three section titles.';
  if (/email|message|reply|contact/i.test(title)) return 'Open the message, write the first two sentences, and save or send the draft.';
  if (vagueStarts.test(title) || title.split(/\s+/).length < 3) return `Open what you need for “${title}” and define one visible result you can finish in ten minutes.`;
  return `Open the materials for “${title}” and complete the first visible step.`;
}

export const postponementOptions = [
  ['unclear', 'Task is unclear'], ['too_large', 'Task is too large'], ['missing_resources', 'Missing information or resources'],
  ['low_energy', 'Low energy'], ['anxiety', 'Anxiety or perfectionism'], ['low_importance', 'Low importance'],
  ['schedule_conflict', 'Scheduling conflict'], ['no_longer_wanted', 'I no longer want to do it'],
];

export function guidanceForPostponement(reason) {
  return {
    unclear: 'Clarify the result and write one physical next action.',
    too_large: 'Divide it and complete a five-minute version.',
    missing_resources: 'List the missing item and create a task to obtain it.',
    low_energy: 'Choose the minimum useful version or move it to a better energy window.',
    anxiety: 'Start an intentionally imperfect draft for five minutes.',
    low_importance: 'Reduce its priority, delegate it, or remove it.',
    schedule_conflict: 'Reschedule it into a realistic open block.',
    no_longer_wanted: 'Cancel it deliberately and release the commitment.',
  }[reason] || 'Clarify, simplify, reschedule, delegate, or remove the task.';
}
