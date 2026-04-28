'use client';

import { useState } from 'react';
import { SlideOver } from './SlideOver';

type CourseStatus =
  | { courseId: number; status: 'cert'; date: Date }
  | { courseId: number; status: 'progress'; pct: number }
  | { courseId: number; status: 'none' };

export type PersonRow = {
  id: string;
  userId: string | null;
  name: string | null;
  email: string;
  dept: string | null;
  deptId: string | null;
  orgRole: string;
  joinedAt: Date | string | null;
  invitedAt: Date | string;
  pending: boolean;
  courses: CourseStatus[];
};

type DeptOption = { id: string; name: string };

function initials(name: string | null, email: string) {
  if (name) return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

function courseCell(cs: CourseStatus) {
  if (cs.status === 'cert') {
    const d = cs.date ? new Date(cs.date) : null;
    const label = d
      ? `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`
      : '✓';
    return (
      <span style={{ color: 'var(--success)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
        ✓ {label}
      </span>
    );
  }
  if (cs.status === 'progress') {
    return (
      <span style={{ color: 'var(--warn)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
        ◐ {cs.pct}%
      </span>
    );
  }
  return <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>—</span>;
}

export function PeopleTable({ rows, depts }: { rows: PersonRow[]; depts: DeptOption[] }) {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<PersonRow | null>(null);

  const filtered = rows.filter((r) => {
    if (deptFilter && r.deptId !== deptFilter) return false;
    const q = search.toLowerCase();
    if (q && !r.name?.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <>
      {/* Filter bar */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email…"
          style={{
            padding: '6px 12px',
            fontSize: 13,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--bg-panel)',
            color: 'var(--text)',
            minWidth: 200,
          }}
        />
        <button
          onClick={() => setDeptFilter(null)}
          style={{
            padding: '5px 12px',
            fontSize: 12,
            borderRadius: 999,
            border: '1px solid var(--border)',
            background: !deptFilter ? 'var(--accent)' : 'var(--bg-panel)',
            color: !deptFilter ? 'var(--accent-ink)' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          All
        </button>
        {depts.map((d) => (
          <button
            key={d.id}
            onClick={() => setDeptFilter(d.id === deptFilter ? null : d.id)}
            style={{
              padding: '5px 12px',
              fontSize: 12,
              borderRadius: 999,
              border: '1px solid var(--border)',
              background: deptFilter === d.id ? 'var(--accent)' : 'var(--bg-panel)',
              color: deptFilter === d.id ? 'var(--accent-ink)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            {d.name}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          overflowX: 'auto',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th
                style={{
                  textAlign: 'left',
                  padding: '10px 16px',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                Person
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                }}
              >
                Dept
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                }}
              >
                Joined
              </th>
              {[101, 102, 103, 104].map((c) => (
                <th
                  key={c}
                  style={{
                    textAlign: 'center',
                    padding: '10px 12px',
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                  }}
                >
                  AI·{c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr
                key={r.id}
                onClick={() => setSelected(r)}
                style={{
                  borderBottom:
                    i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background =
                    'var(--bg-hover)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')
                }
              >
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: 'var(--bg-elevated)',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                        flexShrink: 0,
                      }}
                    >
                      {initials(r.name, r.email)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{r.name ?? r.email}</div>
                      {r.name && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.email}</div>
                      )}
                      {r.pending && (
                        <div
                          style={{
                            fontSize: 10,
                            color: 'var(--warn)',
                            fontFamily: 'var(--font-mono)',
                            letterSpacing: '0.08em',
                          }}
                        >
                          PENDING
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                  {r.dept ?? '—'}
                </td>
                <td
                  style={{
                    padding: '10px 12px',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                  }}
                >
                  {r.joinedAt ? new Date(r.joinedAt).toLocaleDateString() : 'Invited'}
                </td>
                {r.courses.map((cs) => (
                  <td key={cs.courseId} style={{ padding: '10px 12px', textAlign: 'center' }}>
                    {courseCell(cs)}
                  </td>
                ))}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: '32px 16px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  No members match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-over detail panel */}
      <SlideOver
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? selected?.email ?? ''}
      >
        {selected && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Email</div>
              <div style={{ fontSize: 14 }}>{selected.email}</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                Department
              </div>
              <div style={{ fontSize: 14 }}>{selected.dept ?? '—'}</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Role</div>
              <div style={{ fontSize: 14 }}>{selected.orgRole}</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Status</div>
              <div style={{ fontSize: 14 }}>
                {selected.pending
                  ? 'Pending invite'
                  : `Joined ${selected.joinedAt ? new Date(selected.joinedAt).toLocaleDateString() : ''}`}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                Courses
              </div>
              {selected.courses.map((cs) => (
                <div
                  key={cs.courseId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border)',
                    fontSize: 13,
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    AI·{cs.courseId}
                  </span>
                  {courseCell(cs)}
                </div>
              ))}
            </div>
          </div>
        )}
      </SlideOver>
    </>
  );
}
