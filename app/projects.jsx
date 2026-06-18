/* =============================================
   BENTOFOLIO — Projects gallery + detail modal (ES module)
   ============================================= */
import React, { useState, useEffect } from 'react';
import { Icon, ProjectThumb, CatPills, TechTag, CatGlyph } from './ui.jsx';
import { DATA, projCats, primaryCat } from './data.js';
import { getProjectGalleryState } from './project-gallery.js';
import { getCaseStudyBlocks } from './case-study-renderer.js';
import { Markdown } from './markdown-renderer.jsx';
import { resolveImageSrc } from './config-runtime.js';

function CaseStudyContent({ project }) {
  if (project?.caseStudy) return <Markdown text={project.caseStudy} className="case-article md-content" />

  const blocks = getCaseStudyBlocks(project)
  if (!blocks) return <Markdown text={project.description} className="modal-case" />

  return (
    <div className="cs-blocks">
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return <h3 key={i} className="cs-heading">{block.content}</h3>
        }
        if (block.type === 'image') {
          return (
            <figure key={i} className="cs-figure">
              <img src={resolveImageSrc(block.src)} alt={block.alt || ''} />
              {block.alt && <figcaption>{block.alt}</figcaption>}
            </figure>
          )
        }
        return <Markdown key={i} text={block.content} />
      })}
    </div>
  )
}

function ProjectCard({ project, onOpen }) {
  return (
    <button className="proj-card" onClick={() => onOpen(project.id)}>
      <div style={{ position: 'relative' }}>
        {project.featured && (
          <span className="proj-card-featured"><Icon name="star" size={11} /> CV</span>
        )}
        <ProjectThumb project={project} />
      </div>
      <div className="proj-card-body">
        <div className="proj-card-top">
          <span className="proj-card-name">{project.name}</span>
          <CatPills project={project} max={2} />
        </div>
        <p className="proj-card-meta">{project.role} · {project.period}{project.duration ? ' · ' + project.duration : ''}</p>
        <p className="proj-card-desc">{project.description}</p>
        <div className="proj-card-techs">
          {project.techs.map((t, i) => <TechTag key={i} label={t.label} tech={t.tech} />)}
        </div>
      </div>
    </button>
  );
}

function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, []);
  if (!project) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-thumb">
          <button className="modal-close" onClick={onClose} aria-label="Fermer"><Icon name="x" size={18} /></button>
          <ProjectThumb project={project} ratio="16 / 7" />
        </div>
        <div className="modal-body">
          <div className="modal-head">
            <div>
              <h2 className="modal-title">{project.name}</h2>
            </div>
            <CatPills project={project} />
          </div>
          <div className="modal-meta">
            <span>Rôle <b>{project.role}</b></span>
            <span>Période <b>{project.period}</b></span>
            {project.duration && <span>Durée <b>{project.duration}</b></span>}
            {project.featured && <span style={{ color: 'var(--cat-logo)' }}><Icon name="star" size={12} style={{ display: 'inline', verticalAlign: '-2px' }} /> Mis en avant sur le CV</span>}
          </div>
          <CaseStudyContent project={project} />
          <div className="modal-techs">
            {project.techs.map((t, i) => <TechTag key={i} label={t.label} tech={t.tech} />)}
          </div>
          <div className="modal-actions">
            {project.demoUrl && <a className="btn btn--brand" href={project.demoUrl} target="_blank" rel="noreferrer"><Icon name="arrowUpRight" size={16} /> Voir la démo</a>}
            {project.repoUrl && <a className="btn btn--ghost" href={project.repoUrl} target="_blank" rel="noreferrer"><Icon name="github" size={16} /> Code source</a>}
            {!project.demoUrl && !project.repoUrl && <span className="cv-hint">Aucun lien public pour ce projet.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsView({ navigate, openProject, filter, setFilter }) {
  const { projects, categories } = DATA;
  const { counts, catKeys, activeFilter, shown } = getProjectGalleryState({ projects, categories, filter });

  return (
    <main className="page-wrap">
      <button className="back-link" onClick={() => navigate('/')}><Icon name="arrowLeft" size={16} /> Retour au portfolio</button>
      <div className="page-head">
        <h1 className="page-title">Projets</h1>
        <p className="page-sub">Projets sélectionnés pour montrer ma progression full-stack, mes choix techniques et ma capacité à livrer des interfaces utiles.</p>
      </div>

      <div className="filter-bar">
        <button className={'filter-chip filter-chip--all' + (activeFilter === 'all' ? ' active' : '')}
          style={{ '--fc': 'var(--accent)' }} onClick={() => setFilter('all')}>
          <Icon name="grid" size={14} /> Tous <span className="count">{projects.length}</span>
        </button>
        {catKeys.map((k) => (
          <button key={k} className={'filter-chip' + (activeFilter === k ? ' active' : '')}
            style={{ '--fc': categories[k].color }} onClick={() => setFilter(k)}>
            <Icon name={categories[k].glyph} size={14} /> {categories[k].label}
            <span className="count">{counts[k]}</span>
          </button>
        ))}
        <span className="filter-spacer" />
        <span className="filter-result">{shown.length} projet{shown.length > 1 ? 's' : ''}</span>
      </div>

      <div className="proj-gallery">
        {shown.map((p) => <ProjectCard key={p.id} project={p} onOpen={openProject} />)}
        {shown.length === 0 && <div className="gallery-empty">Aucun projet dans cette catégorie pour l'instant.</div>}
      </div>
    </main>
  );
}

export { ProjectsView, ProjectCard, ProjectModal, ProjectDetailView };
function ProjectDetailView({ id, navigate, openProject }) {
  const { projects, categories } = DATA;
  const idx = projects.findIndex((p) => p.id === id);
  const project = projects[idx];
  if (!project) {
    return (
      <main className="page-wrap">
        <button className="back-link" onClick={() => navigate('/projets')}><Icon name="arrowLeft" size={16} /> Tous les projets</button>
        <div className="gallery-empty">Projet introuvable.</div>
      </main>
    );
  }
  const primary = primaryCat(project);
  const cat = categories[primary];
  const next = projects[(idx + 1) % projects.length];

  return (
    <main className="page-wrap">
      <button className="back-link" onClick={() => navigate('/projets')}><Icon name="arrowLeft" size={16} /> Tous les projets</button>

      <header className="pd-head">
        <div className="pd-head-top">
          <CatPills project={project} />
          {project.featured && <span className="pd-featured"><Icon name="star" size={12} /> Mis en avant sur le CV</span>}
        </div>
        <h1 className="pd-title">{project.name}</h1>
        <p className="pd-lead">{project.description}</p>
      </header>

      <div className="pd-hero" style={{ '--c': cat.color }}>
        <ProjectThumb project={project} ratio="16 / 7" />
      </div>

      <div className="pd-body">
        <article className="pd-main">
          <div className="pd-section-kicker">Étude de cas</div>
          <CaseStudyContent project={project} />
        </article>

        <aside className="pd-aside">
          <div className="pd-aside-card">
            <span className="pd-aside-k">Résumé</span>
            <p>{project.description}</p>
          </div>
          <div className="pd-facts">
            <div className="pd-fact"><span className="pd-fact-k">Catégorie{projCats(project).length > 1 ? 's' : ''}</span><span className="pd-fact-v">{projCats(project).map((c) => categories[c].label).join(' · ')}</span></div>
            <div className="pd-fact"><span className="pd-fact-k">Rôle</span><span className="pd-fact-v">{project.role || '—'}</span></div>
            <div className="pd-fact"><span className="pd-fact-k">Période</span><span className="pd-fact-v">{project.period || '—'}</span></div>
            {project.duration && <div className="pd-fact"><span className="pd-fact-k">Durée</span><span className="pd-fact-v">{project.duration}</span></div>}
          </div>
          <div className="pd-techs">
            {project.techs.map((t, i) => <TechTag key={i} label={t.label} tech={t.tech} />)}
          </div>
          <div className="pd-actions">
            {project.demoUrl && <a className="btn btn--brand" href={project.demoUrl} target="_blank" rel="noreferrer"><Icon name="arrowUpRight" size={16} /> Voir la démo</a>}
            {project.repoUrl && <a className="btn btn--ghost" href={project.repoUrl} target="_blank" rel="noreferrer"><Icon name="github" size={16} /> Code source</a>}
            {!project.demoUrl && !project.repoUrl && <span className="cv-hint">Aucun lien public pour ce projet.</span>}
          </div>
        </aside>
      </div>

      <button className="pd-next" onClick={() => openProject(next.id)}>
        <span className="pd-next-k">Projet suivant</span>
        <span className="pd-next-v"><CatGlyph cat={primaryCat(next)} size={16} /> {next.name} <Icon name="arrowRight" size={18} /></span>
      </button>
    </main>
  );
}
