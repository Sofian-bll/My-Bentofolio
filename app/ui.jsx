/* =============================================
   BENTOFOLIO — Shared UI (ES module)
   ============================================= */
import React, { useRef, useEffect, useState } from 'react';
import { DATA, projCats, primaryCat } from './data.js';

/* ─── ICONS (lucide-style inline SVG) ─── */
const ICON_PATHS = {
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>,
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>,
  arrowRight: <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
  arrowLeft: <><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>,
  arrowUpRight: <><path d="M7 7h10v10"/><path d="M7 17 17 7"/></>,
  github: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>,
  linkedin: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></>,
  code: <><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></>,
  layout: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>,
  cube: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></>,
  play: <polygon points="6 3 20 12 6 21 6 3"/>,
  pen: <path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586"/>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></>,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>,
  pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>,
  copy: <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  check: <path d="M20 6 9 17l-5-5"/>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  trash: <><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
  x: <><path d="M18 6 6 18M6 6l12 12"/></>,
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
  cv: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></>,
  filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>,
  home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></>,
  grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
  sparkle: <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z"/>,
  menu: <><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></>,
  tool: <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></>,
  wrench: <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></>,
  server: <><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></>,
  brain: <><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></>,
  briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
};

function Icon({ name, size = 18, fill = 'none', strokeWidth = 2, style, className }) {
  const isFilled = name === 'play' || name === 'star';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={isFilled ? 'currentColor' : fill}
      stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      style={style} className={className} aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  );
}

/* ─── BADGE / CHIP / TECHTAG ─── */
function Badge({ label, color, children }) {
  return <span className={'badge' + (color ? ' badge--color' : '')} style={color ? { '--badge-c': color } : undefined}>{children || label}</span>;
}
function Chip({ label, variant = 'outline', children }) {
  return <span className={'chip chip--' + variant}>{children || label}</span>;
}
function TechTag({ label, tech }) {
  return <span className={'tag t-' + (tech || 'default')}>{label}</span>;
}

function SectionTitle({ title, children }) {
  return <h2 className="section-title">{children || title}</h2>;
}

/* ─── GLOW CELL (mouse-follow glow like useMouseGlow) ─── */
function Cell({ variant, glow, className = '', style, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!glow) return;
    const el = ref.current;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--x', (e.clientX - r.left) + 'px');
      el.style.setProperty('--y', (e.clientY - r.top) + 'px');
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, [glow]);
  return (
    <div ref={ref} className={'cell ' + (variant ? 'cell--' + variant + ' ' : '') + className} style={style}>
      {glow && <div className="glow-blob" />}
      <div className="cell__inner">{children}</div>
    </div>
  );
}

/* ─── CATEGORY GLYPH BADGE ─── */
function CatGlyph({ cat, size = 16 }) {
  const meta = DATA.categories[cat];
  if (!meta) return null;
  return (
    <span className="cat-glyph" style={{ color: meta.color }}>
      <Icon name={meta.glyph} size={size} />
    </span>
  );
}
function CatPill({ cat }) {
  const meta = DATA.categories[cat];
  if (!meta) return null;
  return (
    <span className="cat-pill" style={{ '--c': meta.color }}>
      <Icon name={meta.glyph} size={13} />
      {meta.label}
    </span>
  );
}
/* Renders every category a project belongs to (multi-category aware) */
function CatPills({ project, max }) {
  const cats = projCats(project);
  const shown = max ? cats.slice(0, max) : cats;
  return (
    <span className="cat-pills">
      {shown.map((c) => <CatPill key={c} cat={c} />)}
      {max && cats.length > max && <span className="cat-pill cat-pill--more">+{cats.length - max}</span>}
    </span>
  );
}

/* ─── PROJECT THUMBNAIL (placeholder) ─── */
function ProjectThumb({ project, ratio = '16 / 10' }) {
  const primary = primaryCat(project);
  const meta = DATA.categories[primary];
  const c = meta ? meta.color : 'var(--brand)';
  return (
    <div className="thumb" style={{ '--c': c, aspectRatio: ratio }}>
      {project.image
        ? <img src={project.image} alt={project.name} className="thumb-img" />
        : (
          <div className="thumb-ph">
            <Icon name={meta ? meta.glyph : 'code'} size={34} />
            <span className="thumb-ph-tag">placeholder</span>
          </div>
        )}
    </div>
  );
}

export { Icon, Badge, Chip, TechTag, SectionTitle, Cell, CatGlyph, CatPill, CatPills, ProjectThumb };
