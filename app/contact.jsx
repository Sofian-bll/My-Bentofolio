/* =============================================
   BENTOFOLIO — Contact page (ES module)
   ============================================= */
import React, { useState, useEffect } from 'react';
import { Icon } from './ui.jsx';
import { DATA } from './data.js';

const CONTACT_DRAFT_KEY = 'bentofolio.contact.draft';
const CONTACT_TYPES = [
  { value: 'alternance', label: '🎓 Alternance' },
  { value: 'freelance',  label: '💼 Freelance' },
  { value: 'collab',     label: '🤝 Collaboration' },
  { value: 'autre',      label: '💬 Autre' },
];

const EMPTY_FORM = { nom: '', email: '', telephone: '', sujet: '', type: '', message: '' };

function ContactView({ navigate, showToast, tweaks = {}, adminMode }) {
  const { personalInfo: p, contactInfos, socialLinks } = DATA;

  const showStatus   = tweaks.contactShowStatus !== false;
  const showPhone    = tweaks.contactShowPhone  !== false;
  const showType     = tweaks.contactShowType   !== false;
  const formspreeUrl = (tweaks.formspreeUrl || '').trim();

  const email    = (contactInfos.find((c) => c.key === 'Email')?.value)       || 'sofian.belloul@epitech.eu';
  const location = (contactInfos.find((c) => c.key === 'Localisation')?.value) || 'Île-de-France';

  const [form, setForm] = useState(() => {
    try { return { ...EMPTY_FORM, ...JSON.parse(localStorage.getItem(CONTACT_DRAFT_KEY)) }; }
    catch (e) { return EMPTY_FORM; }
  });
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  /* persist draft */
  useEffect(() => {
    if (!sent) localStorage.setItem(CONTACT_DRAFT_KEY, JSON.stringify(form));
  }, [form, sent]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    if (formspreeUrl) {
      try {
        const res = await fetch(formspreeUrl, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setSent(true);
          setForm(EMPTY_FORM);
          localStorage.removeItem(CONTACT_DRAFT_KEY);
          showToast('Message envoyé — je te réponds rapidement !');
        } else {
          showToast('Erreur d\'envoi — réessaie ou contacte-moi directement par email.');
        }
      } catch {
        showToast('Erreur réseau — essaie le lien email direct.');
      }
    } else {
      /* mailto fallback */
      const lines = [
        `Nom : ${form.nom}`,
        `Email : ${form.email}`,
        showPhone && form.telephone ? `Téléphone : ${form.telephone}` : null,
        showType  && form.type      ? `Type : ${CONTACT_TYPES.find((t) => t.value === form.type)?.label || form.type}` : null,
        '',
        form.message,
      ].filter((l) => l !== null);
      const subject = encodeURIComponent(form.sujet || 'Contact depuis le portfolio');
      const body    = encodeURIComponent(lines.join('\n'));
      window.open(`mailto:${email}?subject=${subject}&body=${body}`);
      showToast('Client email ouvert !');
    }
    setSending(false);
  };

  return (
    <main className="page-wrap">
      <button className="back-link" onClick={() => navigate('/')}>
        <Icon name="arrowLeft" size={16} /> Retour au portfolio
      </button>
      <div className="page-head">
        <h1 className="page-title">Contact</h1>
        <p className="page-sub">Une opportunité d'alternance, un projet freelance, ou juste envie d'échanger — je suis dispo.</p>
      </div>

      <div className="contact-bento">

        {/* ── FORM CARD ── */}
        <div className="contact-form-card">
          {sent ? (
            <div className="contact-sent">
              <div className="contact-sent-icon"><Icon name="check" size={26} /></div>
              <h3>Message reçu !</h3>
              <p>Je te réponds dans les plus brefs délais.</p>
              <button className="btn btn--ghost" onClick={() => setSent(false)}>Envoyer un autre message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form" noValidate={false}>
              <div className="cform-row">
                <div className="field">
                  <label>Nom <span className="req">*</span></label>
                  <input className="input" name="nom" value={form.nom} onChange={handleChange}
                    placeholder="Sofian Belloul" required />
                </div>
                <div className="field">
                  <label>Email <span className="req">*</span></label>
                  <input className="input" name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="toi@exemple.fr" required />
                </div>
              </div>

              {(showPhone || showType) && (
                <div className="cform-row">
                  {showPhone && (
                    <div className="field">
                      <label>Téléphone <span className="opt">optionnel</span></label>
                      <input className="input" name="telephone" value={form.telephone} onChange={handleChange}
                        placeholder="+33 6 00 00 00 00" />
                    </div>
                  )}
                  {showType && (
                    <div className="field">
                      <label>Type de contact <span className="opt">optionnel</span></label>
                      <select className="select" name="type" value={form.type} onChange={handleChange}>
                        <option value="">Sélectionner…</option>
                        {CONTACT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="field">
                <label>Sujet <span className="req">*</span></label>
                <input className="input" name="sujet" value={form.sujet} onChange={handleChange}
                  placeholder="Proposition d'alternance — sept. 2026" required />
              </div>

              <div className="field">
                <label>Message <span className="req">*</span></label>
                <textarea className="textarea contact-textarea" name="message" value={form.message}
                  onChange={handleChange} placeholder="Dis-moi tout…" rows={6} required></textarea>
              </div>

              <div className="contact-form-footer">
                {!formspreeUrl && (
                  <span className="contact-mailto-hint">
                    <Icon name="mail" size={13} /> Ouvrira ton client email
                  </span>
                )}
                <button className="btn btn--brand" type="submit" disabled={sending}
                  style={{ marginLeft: 'auto' }}>
                  {sending ? 'Envoi…' : <><Icon name="arrowRight" size={16} /> Envoyer</>}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── INFO CARD ── */}
        <div className="contact-info-card">

          {showStatus && (
            <div className="contact-status">
              <span className="contact-status-dot"></span>
              <div>
                <div className="contact-status-label">Disponible en alternance</div>
                <div className="contact-status-sub">
                  Début {p.alternance.start} · {p.alternance.duration} · {p.alternance.rythme}
                </div>
              </div>
            </div>
          )}

          <div className="contact-info-list">
            <div className="contact-info-item">
              <Icon name="pin" size={15} />
              <span>{location}</span>
            </div>
            <div className="contact-info-item">
              <Icon name="mail" size={15} />
              <a href={`mailto:${email}`}>{email}</a>
            </div>
          </div>

          <div className="contact-socials">
            {socialLinks.map((s) => (
              <a key={s.label} href={s.href || '#'} target="_blank" rel="noreferrer"
                className="contact-social-btn">
                <Icon name={s.icon} size={16} />
                <span>{s.label}</span>
                <Icon name="arrowUpRight" size={12} style={{ marginLeft: 'auto', opacity: 0.4 }} />
              </a>
            ))}
          </div>

          {!formspreeUrl && adminMode && (
            <div className="contact-config-hint">
              <Icon name="sparkle" size={13} />
              <span>Pour activer l'envoi direct, ajoute ton endpoint Formspree dans les Tweaks → Contact.</span>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
export { ContactView };
