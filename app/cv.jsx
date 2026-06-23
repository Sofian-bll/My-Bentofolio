/* =============================================
   BENTOFOLIO — CV page (A4 + featured projects + download) (ES module)
   ============================================= */
import React, { useState, useEffect, useRef } from 'react';
import { Icon, TechTag } from './ui.jsx';
import { DATA, primaryCat } from './data.js';
import { getFeaturedCvProjects } from './cv-selection.js';
import { resolveImageSrc } from './config-runtime.js';
import { CV_PDF_VARIANTS, CV_PDF_DEFAULT, cvPdfUrl } from './cv-pdf-files.js';

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

function CvView({ navigate, showToast, tweaks = {}, setTweak }) {
  const maxBullets = Number(tweaks.cvMaxBullets) || 2;
  const { personalInfo: p, contactInfos, socialLinks, skillGroups, formations, interests, projects, categories, experiences } = DATA;
  const catOf = (pr) => categories[primaryCat(pr)];
  const cvContactIcon = { 'Âge': 'star', 'Localisation': 'pin', 'Email': 'mail', 'Téléphone': 'phone' };
  const selected = getFeaturedCvProjects(projects);
  const featuredExperiences = experiences.filter(e => e.featured);

  const pdfVariant = tweaks.cvPills || CV_PDF_DEFAULT;
  const pdfHref = cvPdfUrl(pdfVariant);

  return (
    <main className="page-wrap">
      <button className="back-link no-print" onClick={() => navigate('/')}><Icon name="arrowLeft" size={16} /> Retour au portfolio</button>
      <div className="page-head no-print">
        <h1 className="page-title">CV</h1>
        <p className="page-sub" style={{ fontSize: (DATA.profile?.cvSubtitleSize || 14) + 'px' }}>{DATA.profile?.cvSubtitle || "CV synthétique pour recruteurs : parcours, compétences, disponibilité et projets clés en une page."}</p>
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

          {/* Actions — always visible */}
          <div className="cv-panel-actions" style={{ marginTop: 'var(--s4)' }}>
            <a className="btn btn--brand" href={pdfHref} download style={{ textDecoration: 'none' }}>
              <Icon name="download" size={16} /> Télécharger le CV (PDF)
            </a>
            <button className="btn btn--ghost" onClick={() => window.print()}>
              <Icon name="cv" size={16} /> Aperçu impression
            </button>
          </div>
        </aside>

        {/* A4 PREVIEW */}
        <div className="cv-stage">
          <A4Frame>
            {/* HEADER */}
            <div className="cv-header2">
                <div className="cv-photo"><img src={resolveImageSrc(DATA.personalInfo.photoUrl) || 'photo.jpg'} alt="" /></div>
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

              {/* Section experiences */}
              <div className="cv-proj-section">
                <hr className="cv-divider" />
                <div className="cv-sec-title">Experiences {featuredExperiences.length > 0 && <span style={{ color: 'var(--color-zinc-400)', fontWeight: 600 }}>· {featuredExperiences.length}</span>}</div>
                {featuredExperiences.length === 0 ? (
                  <p className="cv-empty-note">Aucune experience marquee comme featured dans la configuration.</p>
                ) : (
                  <div className="cv-projects">
                    {featuredExperiences.map(e => (
                      <div className="cv-proj" key={e.id} style={{ '--cv-c': 'var(--cat-dev)' }}>
                        <div className="cv-proj-top">
                          <span className="cv-proj-name">{e.title}</span>
                          <span className="cv-proj-tech">{e.company}</span>
                        </div>
                        <div className="cv-proj-meta">{e.period}{e.location ? ' · ' + e.location : ''}</div>
                        {e.highlights && e.highlights.length ? (
                          <ul className="cv-proj-list">
                            {e.highlights.slice(0, maxBullets).map((h, i) => (
                              <li key={i}><Icon name="check" size={11} /><span>{h}</span></li>
                            ))}
                          </ul>
                        ) : (
                          <div className="cv-proj-desc">{e.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section projets — prend tout l'espace restant entre formation et footer */}
              <div className="cv-proj-section">
                <hr className="cv-divider" />
                <div className="cv-sec-title">Projets {selected.length > 0 && <span style={{ color: 'var(--color-zinc-400)', fontWeight: 600 }}>· {selected.length}</span>}</div>
                {selected.length === 0 ?
              <p className="cv-empty-note">Aucun projet marqué comme featured dans la configuration.</p> :
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
