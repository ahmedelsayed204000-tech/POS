import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Input, Select, Textarea } from './index';

test('Input forwards standard DOM props to the input element', () => {
  const html = renderToStaticMarkup(
    <Input
      aria-label="Daily energy"
      max="10"
      min="1"
      name="energy"
      onChange={() => {}}
      required
      step="1"
      type="number"
      value="7"
    />,
  );

  expect(html).toContain('aria-label="Daily energy"');
  expect(html).toContain('max="10"');
  expect(html).toContain('min="1"');
  expect(html).toContain('name="energy"');
  expect(html).toContain('required=""');
  expect(html).toContain('step="1"');
});

test('Select forwards DOM props to the select element', () => {
  const html = renderToStaticMarkup(
    <Select
      aria-label="Preferred workspace"
      disabled
      name="workspace"
      onChange={() => {}}
      options={[{ v: 'today', l: 'Today' }]}
      value="today"
    />,
  );

  expect(html).toContain('aria-label="Preferred workspace"');
  expect(html).toContain('disabled=""');
  expect(html).toContain('name="workspace"');
});

test('Textarea forwards DOM props and caller styles', () => {
  const html = renderToStaticMarkup(
    <Textarea
      aria-label="Weekly notes"
      maxLength={240}
      name="notes"
      onChange={() => {}}
      placeholder="What changed?"
      rows={4}
      style={{ minHeight: 96 }}
      value="Clearer rhythm"
    />,
  );

  expect(html).toContain('aria-label="Weekly notes"');
  expect(html).toContain('maxLength="240"');
  expect(html).toContain('name="notes"');
  expect(html).toContain('rows="4"');
  expect(html).toContain('min-height:96px');
});
