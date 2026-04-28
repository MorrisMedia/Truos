'use client';

import { useMemo, useState } from 'react';
import { SEED, type Person } from '../_data/seed';
import { SlideOver } from './SlideOver';

type StatusFilter = 'all' | 'completed' | 'in_progress' | 'not_started';

const COURSE_COLS = [
  { id: 101, label: 'AI·101' },
  { id: 102, label: 'AI·102' },
  { id: 103, label: 'AI·103' },
  { id: 104, label: 'AI·104' },
  { id: 105, label: 'AI·105' },
];

export function PeopleMatrix({ scope = 'all' }: { scope?: 'all' | string }) {
  const [deptFilter, setDeptFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<Person | null>(null);

  const baseFiltered = useMemo(() => {
    let list: Person[] = SEED.people;
    if (scope !== 'all') list = list.filter((p) => p.departmentId === scope);
    if (deptFilter) list = list.filter((p) => p.departmentId === deptFilter);
    if (statusFilter !== 'all') {
      list = list.filter((p) => {
        const prog = SEED.progress.filter((pr) => pr.personId === p.id);
        if (statusFilter === 'not_started') return prog.length === 0;
        return prog.some((pr) => pr.status === statusFilter);
      });
    }
    return list;
  }, [scope, deptFilter, statusFilter]);

  const VISIBLE_LIMIT = 200;
  const ordered = useMemo(() => {
    return [...baseFiltered].sort((a, b) => (a.name ? -1 : 1) - (b.name ? -1 : 1));
  }, [baseFiltered]);
  const visible = ordered.slice(0, VISIBLE_LIMIT);

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {SEED.departments.map((d) => (
          <button
            key={d.id}
            onClick={() => setDeptFilter(deptFilter === d.id ? null : d.id)}
            style={{
              padding: '4px 10px',
              fontSize: 12,
              borderRadius: 999,
              border: '1px solid var(--border)',
              background: deptFilter === d.id ? 'var(--accent)' : 'var(--bg-panel)',
              color: deptFilter === d.id ? 'var(--accent-ink)' : 'var(--text)',
              cursor: 'pointer',
            }}
          >
            {d.name}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {(['all', 'completed', 'in_progress', 'not_started'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '4px 10px',
              fontSize: 12,
              borderRadius: 999,
              border: '1px solid var(--border)',
              background: statusFilter === s ? 'var(--bg-hover)' : 'var(--bg-panel)',
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            {s === 'all' ? 'All' : s === 'completed' ? '✓ Done' : s === 'in_progress' ? '◐ In progress' : '◯ Not started'}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
        Showing {visible.length} of {baseFiltered.length} people
        {baseFiltered.length > VISIBLE_LIMIT && ' (top 200; use filters to narrow)'}
      </div>

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 200px 80px repeat(5, 70px)', gap: 0, padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          <div></div>
          <div>Name</div>
          <div>Department</div>
          <div>Tier</div>
          {COURSE_COLS.map((c) => <div key={c.id} style={{ textAlign: 'center' }}>{c.label}</div>)}
        </div>
        {visible.map((p) => {
          const personProg = SEED.progress.filter((pr) => pr.personId === p.id);
          return (
            <div
              key={p.id}
              onClick={() => setSelected(p)}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr 200px 80px repeat(5, 70px)',
                gap: 0,
                padding: '10px 16px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: 13,
                alignItems: 'center',
              }}
            >
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-hover)', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{p.initials}</div>
              <div>
                <div>{p.name ?? p.initials}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.title}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{SEED.departments.find((d) => d.id === p.departmentId)?.name}</div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: p.seatTier === 'plus' ? 'var(--accent)' : 'var(--text-muted)' }}>
                {p.seatTier === 'plus' ? '✦ PLUS' : 'Std'}
              </div>
              {COURSE_COLS.map((c) => {
                const pr = personProg.find((x) => x.courseId === c.id);
                let badge = '—';
                let color = 'var(--text-dim)';
                if (pr?.status === 'completed') { badge = '✓'; color = 'var(--success)'; }
                else if (pr?.status === 'in_progress') { badge = `${pr.percent}%`; color = 'var(--warn)'; }
                else if (pr?.status === 'stalled') { badge = '⚠'; color = 'var(--danger)'; }
                return <div key={c.id} style={{ textAlign: 'center', color, fontFamily: 'var(--font-mono)', fontSize: 11 }}>{badge}</div>;
              })}
            </div>
          );
        })}
      </div>

      <SlideOver open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? selected?.initials ?? 'Person'}>
        {selected && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-hover)', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {selected.initials}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 500 }}>{selected.name ?? selected.initials}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selected.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                  {SEED.departments.find((d) => d.id === selected.departmentId)?.name}
                </div>
              </div>
            </div>

            <div className="eyebrow" style={{ marginBottom: 8 }}>Course progress</div>
            {SEED.progress.filter((p) => p.personId === selected.id).map((pr) => {
              const course = SEED.courses.find((c) => c.id === pr.courseId);
              return (
                <div key={pr.courseId} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>{course?.code} {course?.title}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: pr.status === 'completed' ? 'var(--success)' : 'var(--warn)' }}>
                      {pr.status === 'completed' ? '✓ Complete' : `${pr.percent}%`}
                    </span>
                  </div>
                </div>
              );
            })}

            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-hover)', color: 'var(--text)', fontSize: 12, cursor: 'pointer' }}>Nudge</button>
              <button style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-hover)', color: 'var(--text)', fontSize: 12, cursor: 'pointer' }}>Reassign</button>
              <button style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 12, cursor: 'pointer' }}>Upgrade to Plus</button>
            </div>
          </div>
        )}
      </SlideOver>
    </>
  );
}
