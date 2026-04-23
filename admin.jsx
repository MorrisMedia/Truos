/* =============================================================
   ADMIN DASHBOARD — org seats, team progress, billing
   ============================================================= */

function AdminDash({ onNav }) {
  const [tab, setTab] = React.useState('overview');
  return (
    <div style={{ minHeight: '100vh' }}>
      <nav className="nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Logo />
          <span style={{ color: 'var(--text-dim)' }}>/</span>
          <span style={{ fontSize: 14 }}>{ORG.name}</span>
          <span className="badge" style={{ marginLeft: 8 }}>ADMIN</span>
        </div>
        <div className="nav-links">
          <a className="nav-link" onClick={() => onNav('landing')} style={{ cursor: 'pointer' }}>Courses</a>
          <a className="nav-link active">Admin</a>
          <Avatar name="Rhea Kapoor" size={32}/>
        </div>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 65px)' }}>
        {/* Side */}
        <aside style={{ borderRight: '1px solid var(--border)', padding: '32px 20px' }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>WORKSPACE</div>
          {[
            { id: 'overview', label: 'Overview', icon: icons.chart },
            { id: 'seats', label: 'Seats & people', icon: icons.users },
            { id: 'courses', label: 'Courses', icon: icons.book },
            { id: 'billing', label: 'Billing', icon: icons.dot },
            { id: 'sso', label: 'SSO & security', icon: icons.shield },
            { id: 'settings', label: 'Settings', icon: icons.settings },
          ].map(item => (
            <div key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 6,
                cursor: 'pointer',
                background: tab === item.id ? 'var(--bg-hover)' : 'transparent',
                color: tab === item.id ? 'var(--text)' : 'var(--text-muted)',
                fontSize: 13,
                marginBottom: 2,
              }}
            >
              <span style={{ display: 'flex', opacity: 0.7 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
          <div style={{ marginTop: 32, padding: 16, background: 'var(--bg-panel)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>PLAN</div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>{ORG.plan}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Renews Nov 14</div>
            <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={() => onNav('checkout', { plan: 'Team' })}>Manage plan</button>
          </div>
        </aside>

        {/* Main */}
        <main style={{ padding: '40px 48px' }}>
          {tab === 'overview' && <OverviewTab onNav={onNav}/>}
          {tab === 'seats' && <SeatsTab/>}
          {tab === 'courses' && <AdminCoursesTab/>}
          {tab === 'billing' && <BillingTab onNav={onNav}/>}
          {tab === 'sso' && <SSOTab/>}
          {tab === 'settings' && <SettingsTab/>}
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, accent }) {
  return (
    <div className="panel" style={{ padding: 24 }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>{label}</div>
      <div style={{ fontSize: 32, letterSpacing: '-0.025em', marginBottom: 4, color: accent ? 'var(--accent)' : 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  );
}

function OverviewTab({ onNav }) {
  const activeSeats = TEAM.filter(t => t.progress[101] > 0).length;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 36, marginBottom: 6 }}>Overview</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Team fluency at {ORG.name}, last 30 days</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm">Export CSV</button>
          <button className="btn btn-primary btn-sm">Invite members {icons.arrow}</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <Stat label="ACTIVE SEATS" value={`${activeSeats} / 48`} sub={`${48 - activeSeats} pending invite`}/>
        <Stat label="AVG COMPLETION" value="68%" sub="+14% vs last month" accent/>
        <Stat label="CERTIFICATES" value="27" sub="13 this month"/>
        <Stat label="DAILY ACTIVE" value="31" sub="65% of invited"/>
      </div>

      {/* Chart + leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 32 }}>
        <div className="panel" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>LESSONS COMPLETED</div>
              <div style={{ fontSize: 22, letterSpacing: '-0.02em' }}>1,284 this month</div>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}/> This month</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-dim)' }}/> Last month</span>
            </div>
          </div>
          <MiniChart/>
        </div>
        <div className="panel" style={{ padding: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 20 }}>TOP LEARNERS</div>
          {[...TEAM].sort((a,b) => b.xp - a.xp).slice(0, 5).map((t, i) => (
            <div key={t.email} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', width: 16 }}>{String(i+1).padStart(2,'0')}</span>
              <Avatar name={t.name} size={28}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.role}</div>
              </div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>{t.xp}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Course progress */}
      <div className="panel" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
          <div className="eyebrow">COURSE PROGRESS</div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNav('landing')}>View catalog {icons.arrow}</button>
        </div>
        {COURSES.map(c => {
          const avg = TEAM.reduce((s, t) => s + (t.progress[c.id] || 0), 0) / TEAM.length;
          const done = TEAM.filter(t => t.progress[c.id] === 100).length;
          return (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 100px', gap: 24, alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--border)' }}>
              <div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>{c.code}</div>
                <div style={{ fontSize: 14, marginTop: 2 }}>{c.title}</div>
              </div>
              <div className="progress-bar" style={{ height: 6 }}><span style={{ width: `${avg}%` }}/></div>
              <div className="mono" style={{ fontSize: 13 }}>{Math.round(avg)}%</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{done} completed</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniChart() {
  // Simple sparkline SVG
  const data = [12, 18, 22, 15, 28, 32, 38, 30, 42, 48, 44, 52];
  const prev = [8, 14, 16, 18, 20, 22, 26, 28, 30, 32, 34, 36];
  const max = 60;
  const pts = arr => arr.map((v, i) => `${(i / (arr.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: 160 }}>
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={`0,100 ${pts(data)} 100,100`} fill="url(#g)" stroke="none"/>
      <polyline points={pts(prev)} fill="none" stroke="var(--text-dim)" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke"/>
      <polyline points={pts(data)} fill="none" stroke="var(--accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
    </svg>
  );
}

function SeatsTab() {
  const [search, setSearch] = React.useState('');
  const filtered = TEAM.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 36, marginBottom: 6 }}>Seats &amp; people</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{TEAM.length} active of 48 total seats</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm">{icons.mail} Bulk invite</button>
          <button className="btn btn-primary btn-sm">Add member {icons.arrow}</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            placeholder="Search by name, email, role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', height: 40, padding: '0 16px', borderRadius: 8, background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none' }}
          />
        </div>
        <select style={{ height: 40, padding: '0 12px', borderRadius: 8, background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13 }}>
          <option>All roles</option>
        </select>
      </div>

      <div className="panel" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr repeat(4, 80px) 80px 40px', gap: 16, padding: '14px 24px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
          <span>MEMBER</span>
          <span>ROLE</span>
          <span>101</span>
          <span>102</span>
          <span>103</span>
          <span>104</span>
          <span>STREAK</span>
          <span></span>
        </div>
        {filtered.map(t => (
          <div key={t.email} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr repeat(4, 80px) 80px 40px', gap: 16, padding: '16px 24px', alignItems: 'center', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <Avatar name={t.name} size={32}/>
              <div style={{ minWidth: 0 }}>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.email}</div>
              </div>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>{t.role}</div>
            {[101, 102, 103, 104].map(cid => (
              <CourseCell key={cid} pct={t.progress[cid] || 0}/>
            ))}
            <div className="mono" style={{ fontSize: 12, color: t.streak > 10 ? 'var(--warn)' : 'var(--text-muted)' }}>
              {t.streak > 0 ? `${t.streak}d` : '—'}
            </div>
            <div style={{ color: 'var(--text-dim)', textAlign: 'right' }}>···</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseCell({ pct }) {
  if (pct === 0) return <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>—</span>;
  if (pct === 100) return <span style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>✓ <span style={{color: 'var(--text-muted)'}}>cert</span></span>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div className="progress-bar" style={{ flex: 1, height: 4 }}><span style={{ width: `${pct}%` }}/></div>
      <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', width: 20, textAlign: 'right' }}>{pct}</span>
    </div>
  );
}

function AdminCoursesTab() {
  return (
    <div>
      <h1 style={{ fontSize: 36, marginBottom: 32 }}>Courses</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {COURSES.map(c => (
          <div key={c.id} className="panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="mono" style={{ color: 'var(--accent)', fontSize: 12 }}>{c.code}</span>
              <span className="badge">{c.tier === 'free' ? 'INCLUDED' : 'ASSIGNED'}</span>
            </div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>{c.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{c.subtitle}</p>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-dim)' }}>
              <span>{c.lessons} lessons</span>
              <span>{TEAM.filter(t => t.progress[c.id] > 0).length}/{TEAM.length} started</span>
              <span>{TEAM.filter(t => t.progress[c.id] === 100).length} certified</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BillingTab({ onNav }) {
  return (
    <div>
      <h1 style={{ fontSize: 36, marginBottom: 32 }}>Billing</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="panel" style={{ padding: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 20 }}>CURRENT PLAN</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 28, letterSpacing: '-0.02em' }}>Team · 48 seats</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>$19 / seat / month · renews Nov 14, 2026</div>
            </div>
            <span className="badge success">ACTIVE</span>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>MRR</div>
              <div style={{ fontSize: 20, letterSpacing: '-0.02em' }}>$912</div>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>SEATS USED</div>
              <div style={{ fontSize: 20, letterSpacing: '-0.02em' }}>48 / 48</div>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>NEXT INVOICE</div>
              <div style={{ fontSize: 20, letterSpacing: '-0.02em' }}>Nov 14</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
            <button className="btn btn-ghost btn-sm">Change plan</button>
            <button className="btn btn-ghost btn-sm">Add seats</button>
          </div>
        </div>
        <div className="panel" style={{ padding: 28 }}>
          <div className="eyebrow" style={{ marginBottom: 20 }}>PAYMENT METHOD</div>
          <div style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 24, background: 'linear-gradient(135deg, #1a1f71, #5c8dff)', borderRadius: 4 }}/>
            <div style={{ flex: 1, fontSize: 13 }}>
              <div className="mono">•••• 4242</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Expires 08/28</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 12 }}>Update card</button>
          <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
            Secured by <span className="mono" style={{ color: 'var(--text)' }}>stripe</span> · billing@northwind.com
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: 28, marginTop: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 20 }}>INVOICES</div>
        {[
          { date: 'Oct 14, 2026', amount: '$912.00', status: 'Paid' },
          { date: 'Sep 14, 2026', amount: '$912.00', status: 'Paid' },
          { date: 'Aug 14, 2026', amount: '$874.00', status: 'Paid' },
          { date: 'Jul 14, 2026', amount: '$836.00', status: 'Paid' },
        ].map((inv, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 60px', gap: 24, padding: '12px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)', fontSize: 13 }}>
            <div>{inv.date}</div>
            <div className="mono">{inv.amount}</div>
            <div><span className="badge success">{inv.status}</span></div>
            <div style={{ textAlign: 'right', color: 'var(--text-muted)', cursor: 'pointer' }}>{icons.download}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SSOTab() {
  return (
    <div>
      <h1 style={{ fontSize: 36, marginBottom: 32 }}>SSO &amp; security</h1>
      <div className="panel" style={{ padding: 28, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, letterSpacing: '-0.015em' }}>Google Workspace</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Auto-join for @northwind.com</div>
          </div>
          <span className="badge success">CONNECTED</span>
        </div>
      </div>
      <div className="panel" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, letterSpacing: '-0.015em' }}>SAML SSO</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Okta, Azure AD, OneLogin — requires Enterprise</div>
          </div>
          <button className="btn btn-ghost btn-sm">Upgrade</button>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div>
      <h1 style={{ fontSize: 36, marginBottom: 32 }}>Settings</h1>
      <div className="panel" style={{ padding: 28, maxWidth: 640 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 20, padding: '14px 0' }}>
          <div className="eyebrow">ORG NAME</div>
          <div>{ORG.name}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 20, padding: '14px 0', borderTop: '1px solid var(--border)' }}>
          <div className="eyebrow">WORKSPACE</div>
          <div className="mono">northwind.truos.ai</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 20, padding: '14px 0', borderTop: '1px solid var(--border)' }}>
          <div className="eyebrow">BILLING EMAIL</div>
          <div>{ORG.billingEmail}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 20, padding: '14px 0', borderTop: '1px solid var(--border)' }}>
          <div className="eyebrow">DATA RESIDENCY</div>
          <div>United States · us-east-1</div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   CHECKOUT — Stripe-style
   ============================================================= */

function Checkout({ onNav, plan = 'Team' }) {
  // Plan catalog — derives pricing + billing cadence from the plan name
  const PLAN_INFO = {
    'Team':     { name: 'Team subscription',         unit: '$99/seat/mo',      recurring: true,  basePrice: 99,   desc: 'Monthly per seat. All base courses + full Truos+ suite. Min 5 seats.' },
    'Bundle':   { name: 'AI·102 + AI·103 + AI·104',  unit: '$2,497 one-time',  recurring: false, basePrice: 2497, desc: 'All three paid base courses, lifetime access. Save $500 vs buying individually.' },
    'AI·102':   { name: 'AI·102 — Practical Prompting', unit: '$499 one-time', recurring: false, basePrice: 499,  desc: 'Lifetime access. 24 lessons, ~4 hours.' },
    'AI·103':   { name: 'AI·103 — AI at Work',       unit: '$999 one-time',    recurring: false, basePrice: 999,  desc: 'Lifetime access. 32 lessons, ~6 hours.' },
    'AI·104':   { name: 'AI·104 — The Truos Capstone', unit: '$1,499 one-time', recurring: false, basePrice: 1499, desc: 'Lifetime access. 40 lessons, ~10 hours. Includes capstone project.' },
    'CPLT·101': { name: 'Copilot 101',                unit: '$249 one-time',   recurring: false, basePrice: 249,  desc: 'Truos+ standalone. Lifetime access. 20 lessons, ~2.5 hours.' },
    'CPLT·EXL': { name: 'Copilot + Excel',            unit: '$249 one-time',   recurring: false, basePrice: 249,  desc: 'Truos+ standalone. Lifetime access. 12 lessons, ~1.5 hours.' },
  };
  const info = PLAN_INFO[plan] || PLAN_INFO['Team'];
  const isTeam = plan === 'Team';
  const [seats, setSeats] = React.useState(10);
  const total = isTeam ? seats * info.basePrice : info.basePrice;

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left: summary */}
      <div style={{ background: 'var(--bg-panel)', borderRight: '1px solid var(--border)', padding: '56px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onNav('landing')}>{icons.arrowLeft} Back</button>
          <Logo />
        </div>
        <div className="eyebrow" style={{ marginBottom: 12 }}>
          {info.recurring ? 'SUBSCRIBE TO TRUOS' : 'UNLOCK FOREVER'}
        </div>
        <div style={{ fontSize: 40, letterSpacing: '-0.03em', marginBottom: 8 }}>${total.toLocaleString()}.00</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 40 }}>
          {info.recurring ? 'per month, billed monthly' : 'one-time payment · lifetime access'}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 14 }}>
            <div>
              <div>{info.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{info.unit}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, maxWidth: 320 }}>{info.desc}</div>
            </div>
            <div>${(isTeam ? seats * info.basePrice : info.basePrice).toLocaleString()}.00</div>
          </div>
          {isTeam && (
            <div style={{ padding: '16px 0', borderTop: '1px solid var(--border)' }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>SEATS</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setSeats(Math.max(5, seats - 1))}>−</button>
                <span className="mono" style={{ fontSize: 20, minWidth: 50, textAlign: 'center' }}>{seats}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setSeats(seats + 1)}>+</button>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>min 5 seats</span>
              </div>
            </div>
          )}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <div>Subtotal</div>
            <div className="mono">${total.toLocaleString()}.00</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 14, color: 'var(--text-muted)' }}>
            <div>Tax</div>
            <div>Calculated at checkout</div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-strong)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 500 }}>
            <div>Total due today</div>
            <div className="mono">${total.toLocaleString()}.00</div>
          </div>
        </div>

        <div style={{ marginTop: 48, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
          Powered by <span className="mono" style={{ color: 'var(--text)', fontWeight: 500 }}>stripe</span>
          <span>·</span>
          <span>{info.recurring ? '14-day free trial · cancel anytime' : 'Lifetime access · 30-day refund policy'}</span>
        </div>
      </div>

      {/* Right: form */}
      <div style={{ padding: '56px 64px', maxWidth: 520 }}>
        <div className="eyebrow" style={{ marginBottom: 20 }}>PAYMENT DETAILS</div>

        <Field label="EMAIL">
          <input style={fieldStyle} defaultValue="billing@northwind.com"/>
        </Field>

        <Field label="CARD INFORMATION">
          <div style={{ border: '1px solid var(--border-strong)', borderRadius: 8, overflow: 'hidden' }}>
            <input style={{ ...fieldStyle, border: 'none', borderRadius: 0, borderBottom: '1px solid var(--border)' }} placeholder="1234 1234 1234 1234" defaultValue="4242 4242 4242 4242"/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <input style={{ ...fieldStyle, border: 'none', borderRadius: 0, borderRight: '1px solid var(--border)' }} placeholder="MM / YY" defaultValue="08 / 28"/>
              <input style={{ ...fieldStyle, border: 'none', borderRadius: 0 }} placeholder="CVC" defaultValue="424"/>
            </div>
          </div>
        </Field>

        <Field label="NAME ON CARD">
          <input style={fieldStyle} defaultValue="Rhea Kapoor"/>
        </Field>

        <Field label="BILLING ADDRESS">
          <select style={fieldStyle} defaultValue="US">
            <option value="US">United States</option>
          </select>
          <div style={{ height: 8 }}/>
          <input style={fieldStyle} placeholder="Address" defaultValue="1200 Market St, Suite 4"/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
            <input style={fieldStyle} placeholder="City" defaultValue="San Francisco"/>
            <input style={fieldStyle} placeholder="ZIP" defaultValue="94103"/>
          </div>
        </Field>

        <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 24 }} onClick={() => onNav('admin')}>
          {info.recurring ? `Start subscription · $${total.toLocaleString()}/mo` : `Pay $${total.toLocaleString()} · Unlock forever`} {icons.arrow}
        </button>

        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          By subscribing, you authorize Truos to charge this card for future payments in accordance with their terms. You can cancel at any time.
        </div>
      </div>
    </div>
  );
}

const fieldStyle = {
  width: '100%',
  height: 42,
  padding: '0 14px',
  borderRadius: 8,
  background: 'var(--bg-panel)',
  border: '1px solid var(--border-strong)',
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

Object.assign(window, { AdminDash, Checkout });
