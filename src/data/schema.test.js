import DEF from './defaults';
import { validateImport } from './schema';

test('accepts an exported PersonalOS data object', () => expect(validateImport(JSON.stringify(DEF)).success).toBe(true));
test('explains malformed JSON', () => expect(validateImport('{invalid').message).toMatch(/not valid JSON/i));

test('accepts saved workspace focus and reflection data', () => {
  const data = {
    ...DEF,
    workspacePulse: {
      finance: {
        customFocus: 'Review cash flow',
        focusDone: { '2026-07-17': true },
        checkIns: [{ id: 1, date: '2026-07-17', note: 'Moved savings forward.', energy: 4 }],
      },
    },
  };
  expect(validateImport(JSON.stringify(data)).success).toBe(true);
});
