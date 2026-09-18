import React, { useState } from 'react';
import { X, Type, Palette, Shield, LogOut, Trash2, Users } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useAccountStore } from '../../store/accountStore';
import { useStudioStore } from '../../store/studioStore';
import { THEMES } from '../../engine/themes';

export default function SettingsPanel({ onClose, onOpenParentDashboard }) {
  const textSize = useSettingsStore((s) => s.textSize);
  const setTextSize = useSettingsStore((s) => s.setTextSize);
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const toggleReduceMotion = useSettingsStore((s) => s.toggleReduceMotion);
  const soundOn = useSettingsStore((s) => s.soundOn);
  const toggleSound = useSettingsStore((s) => s.toggleSound);

  const parent = useAccountStore((s) => s.parent);
  const children = useAccountStore((s) => s.children);
  const signOut = useAccountStore((s) => s.signOut);
  const clearPages = useStudioStore((s) => s.clearPages);

  const [tab, setTab] = useState('display');

  const TABS = [
    { key: 'display', label: 'Display', icon: <Type size={15} /> },
    { key: 'themes',  label: 'Theme',   icon: <Palette size={15} /> },
    { key: 'family',  label: 'Family',  icon: <Users size={15} /> },
    { key: 'privacy', label: 'Privacy', icon: <Shield size={15} /> },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', overflowY: 'auto', padding: '24px 16px' }}>
      <div style={{ maxWidth: 620, margin: '0 auto', background: '#0f0c1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 22, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>Settings</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', gap: 4, padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: tab === t.key ? 'rgba(255,183,0,0.15)' : 'transparent', border: '1px solid ' + (tab === t.key ? 'rgba(255,183,0,0.4)' : 'transparent'), color: tab === t.key ? '#ffb700' : '#94a3b8', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 24, maxHeight: '72vh', overflowY: 'auto' }}>
          {tab === 'display' && (
            <div>
              <Section title="Text size" desc="Make words bigger or smaller everywhere in the app.">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button onClick={() => setTextSize(Math.max(0.85, +(textSize - 0.05).toFixed(2)))} style={btnSmall}>A−</button>
                  <input type="range" min="0.85" max="1.4" step="0.05" value={textSize} onChange={(e) => setTextSize(Number(e.target.value))} style={{ flex: 1, accentColor: '#ffb700' }} />
                  <button onClick={() => setTextSize(Math.min(1.4, +(textSize + 0.05).toFixed(2)))} style={btnSmall}>A+</button>
                  <div style={{ minWidth: 48, textAlign: 'right', color: '#fff', fontSize: 13, fontWeight: 700 }}>{Math.round(textSize * 100)}%</div>
                </div>
                <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, marginBottom: 6 }}>Preview</div>
                  <div style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>Adé met Kìnìún in Ogun State today. The lion was sleeping under the iroko tree.</div>
                </div>
              </Section>
              <Section title="Motion"><ToggleRow label="Reduce motion" value={reduceMotion} onChange={toggleReduceMotion} /></Section>
              <Section title="Sound"><ToggleRow label="Play sounds" value={soundOn} onChange={toggleSound} /></Section>
            </div>
          )}

          {tab === 'themes' && (
            <Section title="Pick a theme" desc="The whole studio changes to match.">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {Object.entries(THEMES).map(([key, t]) => (
                  <button key={key} onClick={() => setTheme(key)} style={{ padding: 14, borderRadius: 14, cursor: 'pointer', textAlign: 'left', background: t.bg, border: '2px solid ' + (theme === key ? '#ffb700' : 'rgba(255,255,255,0.08)'), position: 'relative' }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 6, background: t.primary }} />
                      <div style={{ width: 18, height: 18, borderRadius: 6, background: t.accent }} />
                      <div style={{ width: 18, height: 18, borderRadius: 6, background: t.page }} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{t.name}</div>
                    {theme === key && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 11, fontWeight: 800, color: '#ffb700' }}>OK</div>}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {tab === 'family' && (
            <div>
              {parent ? (
                <>
                  <Section title="Parent account">
                    <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{parent.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{parent.email}</div>
                    </div>
                  </Section>
                  <Section title={'Children (' + children.length + ')'}>
                    {children.map((c) => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 8 }}>
                        <div style={{ fontSize: 24 }}>{c.avatar}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{c.age} yrs · {c.culture} · user: <span style={{ fontFamily: 'monospace' }}>{c.login}</span></div>
                        </div>
                      </div>
                    ))}
                    <button onClick={onOpenParentDashboard} style={{ padding: '12px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#ffb700,#ff6b00)', color: '#000', border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer', marginTop: 8 }}>Manage family</button>
                  </Section>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>Sign in as a parent to manage family.</div>
              )}
            </div>
          )}

          {tab === 'privacy' && (
            <div>
              <Section title="Your data" desc="Everything stays on this device. Nothing is sent to any server.">
                <button onClick={() => { if (confirm('Delete all pages and progress on this device?')) { clearPages(); localStorage.clear(); location.reload(); } }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  <Trash2 size={14} /> Clear all local data
                </button>
              </Section>
              <Section title="Sign out">
                <button onClick={() => { signOut(); location.reload(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  <LogOut size={14} /> Sign out
                </button>
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, desc, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: desc ? 4 : 12 }}>{title}</div>
      {desc && <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 14, lineHeight: 1.55 }}>{desc}</div>}
      {children}
    </div>
  );
}
function ToggleRow({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
      <span style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>{label}</span>
      <button onClick={onChange} style={{ width: 46, height: 26, borderRadius: 14, background: value ? '#ffb700' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', position: 'relative' }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: value ? 23 : 3, transition: 'left .2s' }} />
      </button>
    </div>
  );
}
const btnSmall = { width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' };
