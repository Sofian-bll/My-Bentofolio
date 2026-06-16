/* =============================================
   BENTOFOLIO — Admin Sidebar (ES module)
   ============================================= */
import React, { useState } from 'react';
import { Icon } from './ui.jsx';

/* ─── Micro controls ─── */
function ASwatch({ color, active, onClick }) {
  return (
    <button className={'as-swatch' + (active ? ' on' : '')} style={{ '--c': color }}
      onClick={onClick} title={color} />
  );
}

function ASegment({ options, value, onChange }) {
  return (
    <div className="as-seg">
      {options.map((o) => {
        const val = o.value ?? o; const lbl = o.label ?? o;
        return (
          <button key={val} className={'as-seg-opt' + (val == value ? ' on' : '')}
            onClick={() => onChange(val)}>{lbl}</button>
        );
      })}
    </div>
  );
}

function AToggle({ value, onChange }) {
  return (
    <button className={'as-toggle' + (value ? ' on' : '')} onClick={() => onChange(!value)}
      role="switch" aria-checked={!!value}>
      <span className="as-toggle-knob" />
    </button>
  );
}

function AInput({ value, onChange, placeholder }) {
  return (
    <input className="as-input" value={value || ''} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)} />
  );
}

function ARow({ label, children, vertical }) {
  return (
    <div className={'as-row' + (vertical ? ' vertical' : '')}>
      <span className="as-label">{label}</span>
      <div className="as-ctrl">{children}</div>
    </div>
  );
}

function ASection({ label, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="as-section">
      <button className="as-section-hd" onClick={() => setOpen((v) => !v)}>
        <span>{label}</span>
        <Icon name="arrowRight" size={11}
          style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', opacity: 0.5 }} />
      </button>
      {open && <div className="as-section-body">{children}</div>}
    </div>
  );
}

/* ─── Main sidebar ─── */
function AdminSidebar({ tweaks, setTweak, onLogout, navigate }) {
  const ACCENTS = ['#6366f1', '#0055ff', '#14b8a6', '#ea4b71', '#7c3aed'];
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-hd">
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-dot" />
          <span>Admin</span>
        </div>
        <button className="icon-btn" onClick={onLogout} title="Quitter le mode admin">
          <Icon name="x" size={15} />
        </button>
      </div>

      <div className="admin-sidebar-body">

        <ASection label="Apparence">
          <ARow label="Accent">
            <div className="as-swatches">
              {ACCENTS.map((c) => (
                <ASwatch key={c} color={c} active={tweaks.accent === c}
                  onClick={() => setTweak('accent', c)} />
              ))}
            </div>
          </ARow>
          <ARow label="Police">
            <ASegment value={tweaks.displayFont}
              options={[{ value: 'Syne', label: 'Syne' }, { value: 'Space Grotesk', label: 'Space' }, { value: 'Sora', label: 'Sora' }]}
              onChange={(v) => setTweak('displayFont', v)} />
          </ARow>
          <ARow label="Densité">
            <ASegment value={tweaks.density}
              options={[{ value: 'compact', label: 'Dense' }, { value: 'cozy', label: 'Cosy' }, { value: 'large', label: 'Aéré' }]}
              onChange={(v) => setTweak('density', v)} />
          </ARow>
          <ARow label="Arrondi">
            <ASegment value={tweaks.radius}
              options={[{ value: 'net', label: 'Net' }, { value: 'doux', label: 'Doux' }, { value: 'rond', label: 'Rond' }]}
              onChange={(v) => setTweak('radius', v)} />
          </ARow>
        </ASection>

        <ASection label="Accueil">
          <ARow label="Photo">
            <ASegment value={tweaks.photo}
              options={[{ value: 'compact', label: 'Petite' }, { value: 'equilibre', label: 'Équil.' }, { value: 'grand', label: 'Grande' }]}
              onChange={(v) => setTweak('photo', v)} />
          </ARow>
        </ASection>

        <ASection label="CV">
          <ARow label="Pills">
            <ASegment value={tweaks.cvPills}
              options={[{ value: 'couleur', label: 'Couleur' }, { value: 'sombre', label: 'Sombre' }, { value: 'mono', label: 'Mono' }]}
              onChange={(v) => setTweak('cvPills', v)} />
          </ARow>
          <ARow label="Photo">
            <ASegment value={tweaks.cvPhoto}
              options={[{ value: 'petite', label: 'Petite' }, { value: 'moyenne', label: 'Moy.' }, { value: 'grande', label: 'Grande' }]}
              onChange={(v) => setTweak('cvPhoto', v)} />
          </ARow>
          <ARow label="Points / carte">
            <ASegment value={tweaks.cvMaxBullets}
              options={[{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }]}
              onChange={(v) => setTweak('cvMaxBullets', Number(v))} />
          </ARow>
          <ARow label="Densité cartes">
            <ASegment value={tweaks.cvCardDensity}
              options={[{ value: 'compact', label: 'Dense' }, { value: 'normal', label: 'Normal' }]}
              onChange={(v) => setTweak('cvCardDensity', v)} />
          </ARow>
        </ASection>

        <ASection label="Contact">
          <ARow label="Badge dispo"><AToggle value={tweaks.contactShowStatus}
            onChange={(v) => setTweak('contactShowStatus', v)} /></ARow>
          <ARow label="Téléphone"><AToggle value={tweaks.contactShowPhone}
            onChange={(v) => setTweak('contactShowPhone', v)} /></ARow>
          <ARow label="Type contact"><AToggle value={tweaks.contactShowType}
            onChange={(v) => setTweak('contactShowType', v)} /></ARow>
          <ARow label="Formspree" vertical>
            <AInput value={tweaks.formspreeUrl} placeholder="https://formspree.io/f/xxx"
              onChange={(v) => setTweak('formspreeUrl', v)} />
          </ARow>
        </ASection>

        <ASection label="Outils" defaultOpen={false}>
          <div style={{ padding: '4px 0 8px' }}>
            <button className="btn btn--ghost" style={{ width: '100%', fontSize: '13px' }}
              onClick={() => navigate('/admin')}>
              <Icon name="code" size={14} /> Gérer les projets
            </button>
          </div>
        </ASection>

      </div>
    </aside>
  );
}

export { AdminSidebar };
