import React, { useMemo, useState } from 'react';
import C from '../../constants/theme';
import { Bar, Button, CardHeader, Input, Label, Select } from '../ui';

const statuses = ['Want', 'Reading', 'Done'];
const card = { background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' };

export default function ReadingList({ data, setData, dateContext }) {
  const TODAY = dateContext.today;
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({ title: '', author: '', genre: '', status: 'Want' });
  const books = data.books || [];
  const done = books.filter((book) => book.status === 'Done').length;
  const average = useMemo(() => { const rated = books.filter((book) => book.rating); return rated.length ? (rated.reduce((sum, book) => sum + book.rating, 0) / rated.length).toFixed(1) : '—'; }, [books]);
  const visible = books.filter((book) => (filter === 'All' || book.status === filter) && `${book.title} ${book.author}`.toLowerCase().includes(query.toLowerCase()));
  const update = (id, patch) => setData((p) => ({ ...p, books: (p.books || []).map((book) => book.id === id ? { ...book, ...patch } : book) }));
  const cycleStatus = (book) => { const status = statuses[(statuses.indexOf(book.status) + 1) % statuses.length]; update(book.id, { status, finished: status === 'Done' ? TODAY : book.finished }); };
  const addBook = () => { if (!form.title.trim()) return; setData((p) => ({ ...p, books: [{ id: Date.now(), ...form, rating: 0, note: '', finished: '' }, ...(p.books || [])] })); setForm({ title: '', author: '', genre: '', status: 'Want' }); };
  const remove = (id) => setData((p) => ({ ...p, books: (p.books || []).filter((book) => book.id !== id) }));

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ background: C.navy2, borderRadius: 14, padding: '18px 22px', color: '#fff', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', borderLeft: `4px solid ${C.gold}` }}><div><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>2026 READING GOAL</div><div style={{ fontSize: 37, fontWeight: 800 }}>{done}<span style={{ fontSize: 17 }}>/24 books</span></div></div><div style={{ flex: 1, minWidth: 180 }}><Bar p={done / 24 * 100} color={C.gold} /><div style={{ fontSize: 10, marginTop: 4, opacity: .85 }}>{Math.max(0, 24 - done)} books remaining</div></div><div style={{ fontSize: 12, fontWeight: 700 }}>★ {average} average rating</div></div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 12, alignItems: 'start' }}>
      <div style={card}><CardHeader icon="📚" title={`LIBRARY · ${visible.length} BOOKS`} color={C.book} /><div style={{ padding: 10, borderBottom: `1px solid ${C.g1}`, display: 'flex', gap: 5, flexWrap: 'wrap' }}><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title or author" style={{ flex: 1, minWidth: 160 }} />{['All', ...statuses].map((item) => <Button key={item} onClick={() => setFilter(item)} color={C.book} small outline={filter !== item}>{item}</Button>)}</div><div style={{ maxHeight: 560, overflowY: 'auto' }}>{visible.map((book, index) => <div key={book.id} style={{ display: 'flex', gap: 9, padding: '10px 12px', background: index % 2 ? C.g0 : '#fff', borderBottom: `1px solid ${C.g1}`, alignItems: 'center' }}><button onClick={() => cycleStatus(book)} style={{ width: 64, border: 'none', borderRadius: 6, background: `${C.book}18`, color: C.book, padding: '5px 3px', cursor: 'pointer', fontSize: 9, fontWeight: 800 }}>{book.status}</button><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 11, color: C.dark }}>{book.title}</div><div style={{ fontSize: 9, color: C.g3 }}>{book.author} {book.genre && `· ${book.genre}`}</div><div style={{ fontSize: 9, color: C.g3, marginTop: 2 }}>{book.note || (book.finished ? `Finished ${book.finished}` : 'Click status to update')}</div></div><div style={{ display: 'flex', gap: 1 }}>{[1, 2, 3, 4, 5].map((star) => <button key={star} onClick={() => update(book.id, { rating: star })} style={{ background: 'none', border: 'none', color: star <= book.rating ? C.gold : C.g1, cursor: 'pointer', padding: 1 }}>★</button>)}</div><button onClick={() => remove(book.id)} style={{ border: 'none', background: 'none', color: C.red, cursor: 'pointer' }}>×</button></div>)}{visible.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: C.g2 }}>No books match this filter.</div>}</div></div>
      <div style={card}><CardHeader icon="＋" title="ADD BOOK" color={C.book} /><div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 7 }}><div><Label>TITLE</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div><div><Label>AUTHOR</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div><div><Label>GENRE</Label><Input value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} /></div><div><Label>STATUS</Label><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={statuses} /></div><Button onClick={addBook} color={C.book} full>Add Book</Button><div style={{ color: C.g3, fontSize: 9, lineHeight: 1.5 }}>Click a status to cycle Want → Reading → Done. Click a star to rate a book.</div></div></div>
    </div>
  </div>;
}
