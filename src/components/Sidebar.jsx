import {
  Search, MessageSquare, FolderOpen, ChevronLeft,
  Settings, PenLine,
} from 'lucide-react';

const recents = [
  { title: 'Distributed Rate Limiting Design', active: true },
  { title: 'Paper summary with logical flow' },
  { title: 'ML engineer for plant counting' },
  { title: 'Full-stack software engineer' },
  { title: 'Tailored resume points for Site R...' },
  { title: 'Associate AI Engineer role at Mp...' },
  { title: 'AI safety and agent evaluation' },
  { title: 'Evaluating memory systems' },
  { title: 'Starting a company on OPT' },
  { title: 'Bay area nonprofits hiring AI eng...' },
  { title: 'Frontend web engineer for aviati...' },
  { title: 'Google Workspace for AI agents' },
  { title: 'Learning vLLM through Colab' },
  { title: 'Paper reading request' },
  { title: 'Finding volunteering opportunities' },
  { title: 'Post-completion OPT employment' },
  { title: 'Tailoring resume for Agentic AI' },
];

const BG       = '#1a1a1a';
const BORDER   = 'rgba(255,255,255,0.08)';
const HOVER_BG = 'rgba(255,255,255,0.06)';
const ACTIVE_BG= 'rgba(255,255,255,0.09)';
const TEXT_1   = '#ececec';
const TEXT_2   = '#8a8a8a';
const TEXT_3   = '#555';
const ACCENT   = '#c96442';

export default function Sidebar() {
  return (
    <div style={{ width: 228, background: BG, borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ClaudeStarLogo />
          <span style={{ fontSize: 15, fontWeight: 600, color: TEXT_1, letterSpacing: '-0.01em' }}>Claude</span>
        </div>
        <IconBtn><ChevronLeft size={15} /></IconBtn>
      </div>

      {/* Nav */}
      <div style={{ padding: '0 10px 8px' }}>
        <NavBtn icon={PenLine}       label="New chat" />
        <NavBtn icon={Search}        label="Search" />
        <NavBtn icon={MessageSquare} label="Chats" />
        <NavBtn icon={FolderOpen}    label="Projects" />
      </div>

      <div style={{ height: 1, background: BORDER, margin: '4px 14px 8px' }} />

      {/* Recents */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
        <div style={{ padding: '4px 10px 8px', fontSize: 10.5, fontWeight: 500, letterSpacing: '0.08em', color: TEXT_3, textTransform: 'uppercase' }}>
          Recents
        </div>
        {recents.map(({ title, active }, i) => (
          <button
            key={i}
            style={{
              width: '100%', textAlign: 'left', display: 'block',
              padding: '7px 10px', fontSize: 13, borderRadius: 8,
              color: active ? TEXT_1 : TEXT_2,
              background: active ? ACTIVE_BG : 'transparent',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = HOVER_BG; e.currentTarget.style.color = '#ccc'; } }}
            onMouseLeave={e => { e.currentTarget.style.background = active ? ACTIVE_BG : 'transparent'; e.currentTarget.style.color = active ? TEXT_1 : TEXT_2; }}
          >
            {title}
          </button>
        ))}
      </div>

      {/* User */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: '10px' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = HOVER_BG}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#3d3480', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            S
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: TEXT_1, lineHeight: 1 }}>suhaas</div>
            <div style={{ fontSize: 11, color: TEXT_3, marginTop: 3 }}>Pro plan</div>
          </div>
          <IconBtn><Settings size={14} /></IconBtn>
        </div>
      </div>
    </div>
  );
}

function NavBtn({ icon: Icon, label }) {
  return (
    <button
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', fontSize: 13, borderRadius: 8, color: TEXT_2, background: 'transparent', textAlign: 'left' }}
      onMouseEnter={e => { e.currentTarget.style.background = HOVER_BG; e.currentTarget.style.color = '#ccc'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEXT_2; }}
    >
      <Icon size={15} strokeWidth={1.7} />
      <span>{label}</span>
    </button>
  );
}

function IconBtn({ children }) {
  return (
    <button
      style={{ padding: '4px 6px', borderRadius: 6, color: TEXT_3, background: 'transparent' }}
      onMouseEnter={e => { e.currentTarget.style.background = HOVER_BG; e.currentTarget.style.color = TEXT_2; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEXT_3; }}
    >
      {children}
    </button>
  );
}

function ClaudeStarLogo() {
  return (
    <svg width="19" height="19" viewBox="0 0 100 100" fill="none">
      <g transform="translate(50,50)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <rect key={i} x="-6" y="-44" width="12" height="28" rx="6" fill={ACCENT} transform={`rotate(${deg})`} />
        ))}
      </g>
    </svg>
  );
}
