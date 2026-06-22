/* =============================================
   BENTOFOLIO — Experiences page (ES module)
   ============================================= */
import React, { useState } from 'react';
import { Icon, TechTag } from './ui.jsx';
import { DATA } from './data.js';
import { Markdown } from './markdown-renderer.jsx';

function ExperienceCard({ experience, onOpen }) {
  return (
    <button className="proj-card" onClick={() => onOpen(experience.id)}>
      <div className="proj-card-body">
        <div className="proj-card-top">
          <span className="proj-card-name"><Icon name="briefcase" size={14} /> {experience.title}</span>
        </div>
        <p className="proj-card-meta">{experience.company} · {experience.period}</p>
        <Markdown text={experience.description} className="proj-card-desc" />
        <div className="proj-card-techs">
          {experience.techs.slice(0, 4).map((t, i) => <TechTag key={i} label={t.label} tech={t.tech} color={t.color} />)}
        </div>
      </div>
    </button>
  );
}

function ExperienceDetail({ experience, onClose }) {
  if (!experience) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Fermer"><Icon name="x" size={18} /></button>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <div className="modal-head">
            <h2 className="modal-title">{experience.title}</h2>
          </div>
          <div className="modal-meta">
            <span>Entreprise <b>{experience.company}</b></span>
            <span>Periode <b>{experience.period}</b></span>
            {experience.location && <span>Lieu <b>{experience.location}</b></span>}
          </div>
          {experience.highlights && experience.highlights.length > 0 && (
            <ul className="modal-list">
              {experience.highlights.map((h, i) => (
                <li key={i}><Icon name="check" size={12} /> {h}</li>
              ))}
            </ul>
          )}
          <Markdown text={experience.description} className="modal-case" />
          <div className="modal-techs">
            {experience.techs.map((t, i) => <TechTag key={i} label={t.label} tech={t.tech} color={t.color} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExperiencesView({ navigate }) {
  const { experiences } = DATA;
  const [detailId, setDetailId] = useState(null);
  const detail = detailId ? experiences.find(e => e.id === detailId) : null;

  return (
    <main className="page-wrap">
      <button className="back-link" onClick={() => navigate('/')}><Icon name="arrowLeft" size={16} /> Retour au portfolio</button>
      <div className="page-head">
        <h1 className="page-title">Experiences</h1>
        <p className="page-sub">Parcours professionnel : missions, postes et realisations.</p>
      </div>
      {experiences.length === 0 ? (
        <div className="empty-state">
          <Icon name="briefcase" size={40} />
          <p>Aucune experience pour le moment.</p>
        </div>
      ) : (
        <div className="proj-gallery">
          {experiences.map(exp => (
            <ExperienceCard key={exp.id} experience={exp} onOpen={setDetailId} />
          ))}
        </div>
      )}
      {detail && <ExperienceDetail experience={detail} onClose={() => setDetailId(null)} />}
    </main>
  );
}

export { ExperiencesView };
