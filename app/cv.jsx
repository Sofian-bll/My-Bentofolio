/* =============================================
   BENTOFOLIO — CV page (A4 + featured selection + download) (ES module)
   ============================================= */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icon, TechTag, CatGlyph } from './ui.jsx';
import { DATA, primaryCat } from './data.js';

const CV_KEY = 'bentofolio.cv.featured';

function useFeatured() {
  const [ids, setIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CV_KEY));
      if (Array.isArray(saved)) return new Set(saved);
    } catch (e) {}
    return new Set(DATA.projects.filter((p) => p.featured).map((p) => p.id));
  });
  useEffect(() => {localStorage.setItem(CV_KEY, JSON.stringify([...ids]));}, [ids]);
  const toggle = (id) => setIds((prev) => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  return [ids, toggle];
}

/* A4 frame — scales horizontally to fit container width; height is always fixed 297mm */
function A4Frame({ children }) {
  const MM = 3.7795;
  const PAGE_W = 210 * MM;
  const PAGE_H = 297 * MM;
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const measure = () => {
      if (!wrapRef.current) return;
      setScale(Math.min(1, wrapRef.current.clientWidth / PAGE_W));
    };
    measure();
    let ro;
    if (window.ResizeObserver) {ro = new ResizeObserver(measure);ro.observe(wrapRef.current);}
    window.addEventListener('resize', measure);
    return () => {window.removeEventListener('resize', measure);if (ro) ro.disconnect();};
  }, []);
  return (
    <div className="a4-fit" ref={wrapRef} style={{ height: PAGE_H * scale + 'px' }}>
      <div className="a4-scaler" style={{ width: PAGE_W + 'px', transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <div className="a4-page">
          <div className="a4-body">{children}</div>
        </div>
      </div>
    </div>);
}

function CvView({ navigate, showToast, tweaks = {}, setTweak, adminMode }) {
  const maxBullets = Number(tweaks.cvMaxBullets) || 2;
  const { personalInfo: p, contactInfos, socialLinks, skillGroups, formations, interests, projects, categories } = DATA;
  const catOf = (pr) => categories[primaryCat(pr)];
  const cvContactIcon = { 'Âge': 'star', 'Localisation': 'pin', 'Email': 'mail', 'Téléphone': 'phone' };
  const MIN_CV = 4;
  const [featured, toggle] = useFeatured();
  const selected = projects.filter((pr) => featured.has(pr.id));
  const guardedToggle = (id) => {
    if (featured.has(id) && featured.size <= MIN_CV) {
      showToast('Garde au moins ' + MIN_CV + ' projets pour un CV équilibré');
      return;
    }
    toggle(id);
  };

  const download = () => {showToast('Boîte d\'impression — choisis « Enregistrer en PDF »');setTimeout(() => window.print(), 350);};

  return (
    <main className="page-wrap">
      <button className="back-link no-print" onClick={() => navigate('/')}><Icon name="arrowLeft" size={16} /> Retour au portfolio</button>
      <div className="page-head no-print">
        <h1 className="page-title">CV</h1>
        <p className="page-sub">Prévisualisez et téléchargez votre CV en version A4 prête à imprimer.</p>
      </div>

      <div className="cv-layout cv-layout--admin">
        {/* CONTROL PANEL */}
        <aside className="cv-panel no-print">

          {/* Color mode — always visible */}
          <div className="cv-style-block">
            <span className="cv-style-label">Style pills</span>
            <div className="cv-style-opts">
              {[{v:'couleur',l:'Couleur'},{v:'sombre',l:'Sombre'},{v:'mono',l:'Mono'}].map((o) => (
                <button key={o.v} className={'cv-style-opt' + (tweaks.cvPills === o.v ? ' on' : '')}
                  onClick={() => setTweak('cvPills', o.v)}>{o.l}</button>
              ))}
            </div>
          </div>

          {/* Project picker — admin only */}
          {adminMode && (
            <>
              <h3 style={{ marginTop: 'var(--s4)' }}>Projets du CV</h3>
              <p className="cv-panel-sub">Coche les projets qui apparaîtront dans la section « Projets » du CV. {selected.length} sélectionné{selected.length > 1 ? 's' : ''}.</p>
              <div className="cv-pick-list">
                {projects.map((pr) => {
                  const on = featured.has(pr.id);
                  return (
                    <button key={pr.id} className={'cv-pick' + (on ? ' on' : '')} onClick={() => guardedToggle(pr.id)}>
                      <span className="cv-check">{on && <Icon name="check" size={13} />}</span>
                      <span className="cv-pick-info">
                        <span className="cv-pick-name"><CatGlyph cat={primaryCat(pr)} size={13} /> {pr.name}</span>
                        <span className="cv-pick-meta">{catOf(pr).label} · {pr.period}</span>
                      </span>
                    </button>);
                })}
              </div>
            </>
          )}

          {/* Actions — always visible */}
          <div className="cv-panel-actions" style={{ marginTop: 'var(--s4)' }}>
            <button className="btn btn--brand" onClick={download}><Icon name="download" size={16} /> Télécharger le CV (PDF)</button>
            <button className="btn btn--ghost" onClick={() => window.print()}><Icon name="cv" size={16} /> Aperçu impression</button>
          </div>

          {adminMode && <p className="cv-hint">Astuce : 4 à 6 projets tiennent parfaitement sur une page A4. La sélection est mémorisée pour la prochaine fois.</p>}
        </aside>

        {/* A4 PREVIEW */}
        <div className="cv-stage">
          <A4Frame>
            {/* HEADER */}
            <div className="cv-header2">
                <div className="cv-photo"><img src={DATA.personalInfo.photoUrl || 'app/assets/photo.jpg'} alt="" /></div>
                <div className="cv-id">
                  <div className="cv-name">{p.firstName} {p.lastName}</div>
                  <div className="cv-role">{p.role}</div>
                  <p className="cv-bio">{p.bio}</p>
                  <div className="cv-contact-row">
                    {contactInfos.map((c) =>
                  <span className="cv-c-item" key={c.key}>
                        <Icon name={cvContactIcon[c.key] || 'star'} size={12} /> {c.value}
                      </span>
                  )}
                    {socialLinks.map((s) =>
                  <a className="cv-c-item" href={s.href} target="_blank" rel="noreferrer" key={s.label} style={{textDecoration: 'none', color: 'inherit'}}>
                        <Icon name={s.icon} size={12} /> {s.label}
                      </a>
                  )}
                  </div>
                </div>
              </div>

              <hr className="cv-divider" />
              <div className="cv-alt">
                <span className="cv-alt-badge">Recherche Alternance</span>
                <span>Début <strong>{p.alternance.start}</strong></span><span>·</span>
                <span><strong>{p.alternance.duration}</strong></span><span>·</span>
                <span>Rythme <strong>{p.alternance.rythme}</strong></span>
              </div>

              <hr className="cv-divider" />
              <div className="cv-sec-title">Compétences</div>
              <div className="cv-skills">
                {skillGroups.map((g) =>
              <div key={g.category}>
                    <div className="cv-skill-cat">{g.category}</div>
                    <div className="cv-skill-tags">
                      {g.skills.map((s) => <TechTag key={s.label} label={s.label} tech={s.tech} />)}
                    </div>
                  </div>
              )}
              </div>

              <hr className="cv-divider" />
              <div className="cv-sec-title">Formation</div>
              {formations.map((f) =>
            <div key={f.title} style={{ marginBottom: '10px' }}>
                  <div className="cv-xp-top"><strong>{f.title}</strong><span className="cv-xp-badge">{f.badge}</span></div>
                  <div className="cv-xp-where">{f.where}</div>
                  <div className="cv-xp-desc">{f.description}</div>
                </div>
            )}

              {/* Section projets — prend tout l'espace restant entre formation et footer */}
              <div className="cv-proj-section">
                <hr className="cv-divider" />
                <div className="cv-sec-title">Projets {selected.length > 0 && <span style={{ color: 'var(--color-zinc-400)', fontWeight: 600 }}>· {selected.length}</span>}</div>
                {selected.length === 0 ?
              <p className="cv-empty-note">Aucun projet sélectionné — coche des projets dans le panneau de gauche.</p> :
              <div className="cv-projects">
                      {selected.map((pr) =>
                <div className="cv-proj" key={pr.id} style={{ '--cv-c': catOf(pr).color }}>
                          <div className="cv-proj-top">
                            <span className="cv-proj-name">{pr.name}</span>
                            <span className="cv-proj-tech">{pr.techs[0] ? pr.techs[0].label : catOf(pr).label}</span>
                          </div>
                          <div className="cv-proj-meta">{pr.role} · {pr.period}{pr.duration ? ' · ' + pr.duration : ''}</div>
                          {pr.highlights && pr.highlights.length ?
                  <ul className="cv-proj-list">
                              {pr.highlights.slice(0, maxBullets).map((h, i) =>
                    <li key={i}><Icon name="check" size={11} /><span>{h}</span></li>
                    )}
                            </ul> :
                  <div className="cv-proj-desc">{pr.description}</div>
                  }
                        </div>
                )}
                    </div>
              }
              </div>

              {/* Footer — toujours en bas de la page A4 */}
              <div className="cv-footer-section">
                <hr className="cv-divider" />
                <div className="cv-sec-title">Centres d'intérêt</div>
                <div className="cv-interests">
                  {interests.map((i) =>
                <div className="cv-int" key={i.title}>
                      <span className="cv-int-emoji">{i.emoji}</span>
                      <div><strong>{i.title}</strong><span className="cv-int-detail">{i.detail}</span></div>
                    </div>
                )}
                </div>
              </div>
          </A4Frame>
        </div>
      </div>
    </main>);

}
export { CvView };