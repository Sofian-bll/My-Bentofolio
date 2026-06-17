/* =============================================
   BENTOFOLIO — Home (Bento) page (ES module)
   ============================================= */
import React from 'react';
import { Icon, Cell, Chip, SectionTitle, TechTag, CatGlyph, Badge } from './ui.jsx';
import { DATA, primaryCat } from './data.js';

function HomeView({ navigate, openProject }) {
  const { personalInfo: p, contactInfos, socialLinks, skillGroups, formations, interests, projects } = DATA;
  const preview = projects.slice(0, 3);
  const contactIcon = { 'Âge': 'star', 'Localisation': 'pin', 'Téléphone': 'phone', 'Email': 'mail' };

  return (
    <main className="page-wrap">
      <div className="bento">
        {/* HERO */}
        <Cell variant="hero" glow>
          <div className="hero-pills">
            {(DATA.profile?.heroChips || [{ text: 'Hello', variant: 'outline' }, { text: 'Recherche Contrat Alternance', variant: 'solid' }]).map((chip, i) => (
              <Chip key={i} variant={chip.variant || 'outline'}>
                {i === 0 && <Icon name="sparkle" size={13} />} {chip.text}
              </Chip>
            ))}
          </div>
          <h1 className="hero-name">{p.firstName}<br />{p.lastName}</h1>
          <p className="hero-role">{p.role}</p>
          <div className="hero-meta">
            {DATA.profile?.webExperienceSince ? (
              <span><Icon name="star" size={12} /> {new Date().getFullYear() - DATA.profile.webExperienceSince} ans d'expérience</span>
            ) : (
              <span>Début <strong>{p.alternance.start}</strong></span>
            )}
            <span className="meta-sep">·</span>
            <span><strong>{p.alternance.duration}</strong></span>
            <span className="meta-sep">·</span>
            <span><strong>{p.alternance.rythme}</strong></span>
          </div>
          <p className="hero-bio">{p.bio}</p>
          <div className="hero-stats">
            {DATA.projects.length > 0 && <span><Icon name="grid" size={14} /> <strong>{DATA.projects.length}</strong> projets</span>}
            {(DATA.experiences || []).length > 0 && <span><Icon name="briefcase" size={14} /> <strong>{(DATA.experiences || []).length}</strong> expériences</span>}
            {DATA.profile?.webExperienceSince && <span><Icon name="star" size={14} /> <strong>{new Date().getFullYear() - DATA.profile.webExperienceSince} ans</strong> d'expérience</span>}
          </div>
          <div className="hero-actions">
            <button className="btn btn--brand" onClick={() => navigate('/contact')}>
              <Icon name="mail" size={15} /> Me contacter
            </button>
            <button className="btn btn--ghost" onClick={() => navigate('/projets')}>
              <Icon name="grid" size={15} /> Mes projets
            </button>
          </div>
        </Cell>

        {/* PHOTO */}
        <Cell variant="photo" glow>
          <div className="photo-cell">
            <img src={DATA.personalInfo.photoUrl || 'app/assets/photo.jpg'} alt={p.firstName + ' ' + p.lastName} />
          </div>
        </Cell>

        {/* SKILLS */}
        <Cell variant="skills" glow>
          <SectionTitle title={DATA.sectionLabels?.skills || 'Compétences'} />
          <div className="skills-groups">
            {skillGroups.map((g) => (
              <div key={g.category}>
                <div className="skill-cat">{g.category}</div>
                <div className="skill-tags">
                  {g.skills.map((s) => <TechTag key={s.label} label={s.label} tech={s.tech} />)}
                </div>
              </div>
            ))}
          </div>
        </Cell>

        {/* CONTACT */}
        <Cell variant="contact" glow>
          <SectionTitle title={DATA.sectionLabels?.contact || 'Contact'} />
          <div className="contact-rows">
            {contactInfos.map((c) => (
              <div className="contact-row" key={c.key}>
                <span className="contact-ico"><Icon name={contactIcon[c.key] || 'star'} size={15} /></span>
                <span className="k">{c.key}</span>
                <span className="v">{c.value}</span>
              </div>
            ))}
          </div>
          <div className="social-row">
            {socialLinks.map((s) => (
              <a className="social-btn" href={s.href} target="_blank" rel="noreferrer" key={s.label}>
                <Icon name={s.icon} size={15} /> {s.label}
              </a>
            ))}
          </div>
          <button className="contact-cta" onClick={() => navigate('/contact')}>
            Écrire un message <Icon name="arrowRight" size={14} />
          </button>
        </Cell>

        {/* FORMATION */}
        <Cell variant="formation" glow>
          <SectionTitle title={DATA.sectionLabels?.formation || 'Formation'} />
          {formations.map((f) => (
            <div className="xp" key={f.title}>
              <div className="xp-top">
                <span className="xp-title">{f.title}</span>
                <Badge label={f.badge} />
              </div>
              <p className="xp-where">{f.where}</p>
              <p className="xp-desc">{f.description}</p>
            </div>
          ))}
        </Cell>

        {/* INTERESTS */}
        <Cell variant="interests" glow>
          <SectionTitle title={DATA.sectionLabels?.interests || "Centres d'intérêt"} />
          <div className="interests-list">
            {interests.map((i) => (
              <div className="interest" key={i.title}>
                <span className="interest-emoji">{i.emoji}</span>
                <div>
                  <div className="interest-title">{i.title}</div>
                  <div className="interest-detail">{i.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Cell>

        {/* PROJECTS PREVIEW */}
        <Cell variant="projects" glow>
          <div className="section-header">
            <SectionTitle title={DATA.sectionLabels?.projects || 'Projets'} />
            <button className="link-arrow" onClick={() => navigate('/projets')}>
              Voir tout <Icon name="arrowRight" size={14} />
            </button>
          </div>
          <div className="proj-preview-grid">
            {preview.map((pr) => (
              <button className="proj-mini" key={pr.id} onClick={() => openProject(pr.id)}>
                <div className="proj-mini-top">
                  <span className="proj-mini-name"><CatGlyph cat={primaryCat(pr)} size={15} /> {pr.name}</span>
                </div>
                <p className="proj-mini-meta">{pr.role} · {pr.period}{pr.duration ? ' · ' + pr.duration : ''}</p>
                <p className="proj-mini-desc">{pr.description}</p>
                <div className="proj-mini-techs">
                  {pr.techs.slice(0, 3).map((t, i) => <TechTag key={i} label={t.label} tech={t.tech} />)}
                </div>
              </button>
            ))}
          </div>
        </Cell>
      </div>
    </main>
  );
}
export { HomeView };
