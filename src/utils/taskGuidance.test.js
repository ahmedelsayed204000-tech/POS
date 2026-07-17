import { guidanceForPostponement, suggestNextAction } from './taskGuidance';

test('turns a vague presentation task into a visible action', () => expect(suggestNextAction({ title: 'Work on presentation' })).toMatch(/three section titles/i));
test('offers a minimum physical start for exercise', () => expect(suggestNextAction({ title: 'Exercise' })).toMatch(/five minutes/i));
test('matches postponement reasons to transparent guidance', () => expect(guidanceForPostponement('anxiety')).toMatch(/imperfect draft/i));
