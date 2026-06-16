/* =============================================
   BENTOFOLIO — Admin Dashboard v5 (ES module)
   2-column layout: left controls + right preview
   ============================================= */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Icon, TechTag, CatGlyph } from './ui.jsx'
import { DATA, APP_CONFIG } from './data.js'
import { clearAdminSaveOverrides, saveConfigToDisk } from './admin-save.js'

const TECH_KEYS = ['laravel','vue','java','tailwind','shadcn','mysql','docker','git','linux',
  'nvim','bash','figma','framer','python','rag','n8n','js','ts','shopify',
  'blender','ae','illustrator','default','soft','go','three','node','sops']

function slugify(s) {
  return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/['']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'projet'
}

function buildConfig(projects, socialLinks, photo, appearance, cv, contact) {
  const featuredIds = new Set(cv?.featured || [])
  const projWithFeatured = projects.map(p => ({...p, featured: featuredIds.has(p.id)}))
  return {
    projects: projWithFeatured,
    socialLinks,
    photo: photo || '',
    appearance: appearance || {},
    cv: cv || {},
    contact: contact || {},
  }
}

/* ─── POST CONFIG TO IFRAME ─── */
function postToIframe(iframeRef, config) {
  try { localStorage.setItem('bentofolio.preview', JSON.stringify(config)) } catch (e) {}
  if (!iframeRef.current?.contentWindow) return
  iframeRef.current.contentWindow.postMessage({ type: '__bento_config_update', config }, '*')
}

function useConfigState() {
  const [projects, setProjects] = useState(() => [...(APP_CONFIG.projects || [])])
  const [socialLinks, setSocialLinks] = useState(() => [...(APP_CONFIG.socialLinks || [])])
  const [photo, setPhoto] = useState(() => APP_CONFIG.photo || '')
  const [appearance, setAppearance] = useState(() => ({...APP_CONFIG.appearance}))
  const [cv, setCv] = useState(() => ({...APP_CONFIG.cv}))
  const [contact, setContact] = useState(() => ({...APP_CONFIG.contact}))

  const config = buildConfig(projects, socialLinks, photo, appearance, cv, contact)

  return { projects, setProjects, socialLinks, setSocialLinks, photo, setPhoto,
    appearance, setAppearance, cv, setCv, contact, setContact, config }
}

/* ══════════════════════════════════════
   SECTIONS
   ══════════════════════════════════════ */

const SECTIONS = [
  { id: 'projets',   label: 'Projets',   icon: 'grid' },
  { id: 'apparence', label: 'Apparence', icon: 'sparkle' },
  { id: 'cv',        label: 'CV',        icon: 'cv' },
  { id: 'contact',   label: 'Contact',   icon: 'mail' },
  { id: 'liens',     label: 'Liens',     icon: 'arrowUpRight' },
  { id: 'backup',    label: 'Backup',    icon: 'download' },
]

/* ─── APPEARANCE ─── */
function AppearanceSection({ appearance, setAppearance }) {
  const ACCENTS = ['#6366f1','#0055ff','#14b8a6','#ea4b71','#7c3aed','#f59e0b']
  const set = (k, v) => setAppearance(p => ({...p, [k]: v}))
  const Seg = ({k, opts}) => (
    <div className="ds-seg">
      {opts.map(o => <button key={String(o.v)} className={'ds-seg-opt' + (appearance[k] === o.v ? ' on' : '')} onClick={() => set(k, o.v)}>{o.l}</button>)}
    </div>
  )
  return (
    <div className="ds-section">
      <h2 className="ds-title">Apparence</h2>
      <p className="ds-sub">Couleur, typographie et mise en page.</p>
      <div className="ds-card">
        <div className="ds-form-grid">
          <div className="ds-field" style={{ gridColumn: '1/-1' }}>
            <label className="ds-label">Couleur d'accent</label>
            <div className="ds-swatches">
              {ACCENTS.map(c => <button key={c} className={'ds-swatch' + (appearance.accent === c ? ' on' : '')} style={{ '--c': c }} onClick={() => set('accent', c)} title={c} />)}
            </div>
          </div>
          <div className="ds-field"><label className="ds-label">Police titres</label>
            <Seg k="displayFont" opts={[{v:'Syne',l:'Syne'},{v:'Space Grotesk',l:'Space G.'},{v:'Sora',l:'Sora'}]} /></div>
          <div className="ds-field"><label className="ds-label">Densité</label>
            <Seg k="density" opts={[{v:'compact',l:'Dense'},{v:'cozy',l:'Cosy'},{v:'large',l:'Aéré'}]} /></div>
          <div className="ds-field"><label className="ds-label">Arrondi</label>
            <Seg k="radius" opts={[{v:'net',l:'Net'},{v:'doux',l:'Doux'},{v:'rond',l:'Rond'}]} /></div>
          <div className="ds-field"><label className="ds-label">Photo accueil</label>
            <Seg k="photo" opts={[{v:'compact',l:'Compacte'},{v:'equilibre',l:'Équil.'},{v:'grand',l:'Grande'}]} /></div>
        </div>
      </div>
    </div>
  )
}

/* ─── CV SECTION ─── */
function CvSection({ cv, setCv, projects, photo, setPhoto, showToast }) {
  const [drag, setDrag] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const set = (k, v) => setCv(p => ({...p, [k]: v}))
  const toggle = (id) => {
    const next = new Set(cv.featured || [])
    if (next.has(id)) { if (next.size <= 4) { showToast('Minimum 4 projets pour un CV équilibré'); return } next.delete(id) }
    else next.add(id)
    set('featured', [...next])
  }
  const handleDrop = e => {
    e.preventDefault(); setDrag(false)
    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) return
    const r = new FileReader(); r.onload = ev => { setPhoto(ev.target.result); showToast('Photo mise à jour') }; r.readAsDataURL(file)
  }
  const savePhotoUrl = () => { if (urlInput.trim()) { setPhoto(urlInput.trim()); showToast('Photo mise à jour') } }
  const Seg = ({k, opts}) => (
    <div className="ds-seg">{opts.map(o => <button key={String(o.v)} className={'ds-seg-opt'+(cv[k]===o.v?' on':'')} onClick={()=>set(k, typeof o.v==='number'?Number(o.v):o.v)}>{o.l}</button>)}</div>
  )
  return (
    <div className="ds-section">
      <h2 className="ds-title">CV</h2>
      <p className="ds-sub">Photo, style et sélection des projets.</p>
      <div className="ds-card">
        <h3 className="ds-card-title">Photo</h3>
        <div className="ds-photo-row">
          <div className={'ds-drop'+(drag?' ds-drop--over':'')}
            onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={handleDrop}>
            {photo
              ? <img src={photo} alt="CV" className="ds-photo-prev" />
              : <div className="ds-drop-empty"><Icon name="download" size={28}/><span>Glisser une image</span></div>}
          </div>
          <div className="ds-photo-controls">
            <div className="ds-field">
              <label className="ds-label">URL de l'image</label>
              <div style={{display:'flex',gap:'8px'}}>
                <input className="input" value={urlInput} onChange={e=>setUrlInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter')savePhotoUrl()}} placeholder="https://…" />
                <button className="btn btn--ghost" onClick={savePhotoUrl}><Icon name="check" size={14}/></button>
              </div>
            </div>
            {photo && <button className="btn btn--ghost" style={{marginTop:'4px'}} onClick={()=>{setPhoto('');showToast('Photo réinitialisée')}}><Icon name="trash" size={13}/> Réinitialiser</button>}
          </div>
        </div>
      </div>
      <div className="ds-card">
        <h3 className="ds-card-title">Style</h3>
        <div className="ds-form-grid">
          <div className="ds-field"><label className="ds-label">Pills</label><Seg k="cvPills" opts={[{v:'couleur',l:'Couleur'},{v:'sombre',l:'Sombre'},{v:'mono',l:'Mono'}]}/></div>
          <div className="ds-field"><label className="ds-label">Taille photo</label><Seg k="cvPhoto" opts={[{v:'petite',l:'Petite'},{v:'moyenne',l:'Moy.'},{v:'grande',l:'Grande'}]}/></div>
          <div className="ds-field"><label className="ds-label">Bullets / carte</label><Seg k="cvMaxBullets" opts={[{v:1,l:'1'},{v:2,l:'2'},{v:3,l:'3'}]}/></div>
          <div className="ds-field"><label className="ds-label">Densité cartes</label><Seg k="cvCardDensity" opts={[{v:'compact',l:'Dense'},{v:'normal',l:'Normal'}]}/></div>
        </div>
      </div>
      <div className="ds-card">
        <h3 className="ds-card-title">Projets sur le CV <span className="ds-tag-count">· {cv.featured?.length || 0} sélectionnés</span></h3>
        <div className="ds-pick-list">
          {projects.map(pr => {
            const on = (cv.featured || []).includes(pr.id)
            return (
              <button key={pr.id} className={'ds-pick' + (on ? ' on' : '')} onClick={() => toggle(pr.id)}>
                <span className="ds-check">{on && <Icon name="check" size={12}/>}</span>
                <span className="ds-pick-name"><CatGlyph cat={(pr.categories || ['dev'])[0]} size={12}/> {pr.name}</span>
                <span className="ds-pick-meta">{DATA.categories[(pr.categories || ['dev'])[0]]?.label} · {pr.period}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── CONTACT ─── */
function ContactSection({ contact, setContact }) {
  const set = (k, v) => setContact(p => ({...p, [k]: v}))
  return (
    <div className="ds-section">
      <h2 className="ds-title">Contact</h2>
      <p className="ds-sub">Formulaire de contact et champs visibles.</p>
      <div className="ds-card">
        <h3 className="ds-card-title">Provider</h3>
        <div className="ds-field">
          <label className="ds-label">Endpoint Formspree</label>
          <p className="ds-hint">POST → JSON. Laisse vide pour le fallback mailto:.</p>
          <input className="input" style={{marginTop:'8px'}} value={contact.formspreeUrl || ''} onChange={e => set('formspreeUrl', e.target.value)} placeholder="https://formspree.io/f/xxxxxxx" />
        </div>
        <div className={'ds-status-badge' + (contact.formspreeUrl ? ' ok' : ' warn')}>
          <Icon name={contact.formspreeUrl ? 'check' : 'mail'} size={13}/>
          {contact.formspreeUrl ? 'Envoi direct activé' : 'Fallback mailto actif'}
        </div>
      </div>
      <div className="ds-card">
        <h3 className="ds-card-title">Champs optionnels</h3>
        {[
          {k:'contactShowStatus', l:'Badge disponibilité alternance', s:'Indicateur vert sur la page Contact'},
          {k:'contactShowPhone', l:'Champ téléphone', s:'Champ optionnel dans le formulaire'},
          {k:'contactShowType', l:'Type de contact', s:'Menu : alternance, freelance, collaboration…'},
        ].map(f => (
          <div key={f.k} className="ds-toggle-row" onClick={() => set(f.k, !contact[f.k])}>
            <div><div className="ds-toggle-label">{f.l}</div><div className="ds-toggle-sub">{f.s}</div></div>
            <div className={'ds-switch' + (contact[f.k] ? ' on' : '')}/>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── LIENS ─── */
const LINK_ICONS = ['linkedin','github','mail','arrowUpRight','phone','star','code']
function LinksSection({ socialLinks, setSocialLinks, showToast }) {
  const [adding, setAdding] = useState(false)
  const [editIdx, setEditIdx] = useState(null)
  const [newL, setNewL] = useState({ icon: 'arrowUpRight', label: '', href: '' })
  const toggle = (i) => setSocialLinks(sl => sl.map((l, j) => j === i ? {...l, hidden: !l.hidden} : l))
  const remove = (i) => setSocialLinks(sl => sl.filter((_, j) => j !== i))
  const upd = (i, k, v) => setSocialLinks(sl => sl.map((l, j) => j === i ? {...l, [k]: v} : l))
  const addLink = () => {
    if (!newL.label || !newL.href) { showToast('Label et URL requis'); return }
    setSocialLinks(sl => [...sl, {...newL}])
    setNewL({ icon: 'arrowUpRight', label: '', href: '' })
    setAdding(false)
  }
  return (
    <div className="ds-section">
      <div className="ds-section-head">
        <div><h2 className="ds-title">Liens</h2><p className="ds-sub">Réseaux sociaux et liens professionnels.</p></div>
        <button className="btn btn--brand" onClick={() => setAdding(v => !v)}><Icon name="plus" size={14}/> Ajouter</button>
      </div>
      {adding && (
        <div className="ds-card">
          <h3 className="ds-card-title">Nouveau lien</h3>
          <div className="ds-form-grid">
            <div className="ds-field"><label className="ds-label">Icône</label>
              <select className="select" value={newL.icon} onChange={e => setNewL(n => ({...n, icon: e.target.value}))}>
                {LINK_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
            <div className="ds-field"><label className="ds-label">Label</label>
              <input className="input" value={newL.label} onChange={e => setNewL(n => ({...n, label: e.target.value}))} placeholder="in/sofianbll" />
            </div>
            <div className="ds-field" style={{gridColumn:'1/-1'}}><label className="ds-label">URL</label>
              <input className="input" value={newL.href} onChange={e => setNewL(n => ({...n, href: e.target.value}))} placeholder="https://…" />
            </div>
          </div>
          <div className="ds-form-actions">
            <button className="btn btn--ghost" onClick={() => setAdding(false)}>Annuler</button>
            <button className="btn btn--brand" onClick={addLink}><Icon name="check" size={14}/> Ajouter</button>
          </div>
        </div>
      )}
      <div className="ds-list">
        {socialLinks.map((l, i) => (
          <div key={i} className={'ds-list-item' + (l.hidden ? ' ds-list-item--dim' : '')}>
            {editIdx === i ? (
              <div className="ds-list-edit-row">
                <select className="select" style={{width:'110px'}} value={l.icon} onChange={e => upd(i, 'icon', e.target.value)}>
                  {LINK_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                </select>
                <input className="input" value={l.label} onChange={e => upd(i, 'label', e.target.value)} placeholder="Label" style={{width:'130px'}} />
                <input className="input" value={l.href} onChange={e => upd(i, 'href', e.target.value)} placeholder="https://…" style={{flex:1}} />
                <button className="btn btn--brand" onClick={() => setEditIdx(null)}><Icon name="check" size={13}/></button>
                <button className="btn btn--ghost" onClick={() => setEditIdx(null)}><Icon name="x" size={13}/></button>
              </div>
            ) : (
              <>
                <div className="ds-list-icon"><Icon name={l.icon || 'arrowUpRight'} size={16}/></div>
                <div className="ds-list-info">
                  <span className="ds-list-label">{l.label}</span>
                  <a className="ds-list-href" href={l.href} target="_blank" rel="noreferrer">{l.href || '—'}</a>
                </div>
                <div className="ds-list-actions">
                  <button className={'ds-vis-btn' + (l.hidden ? '' : ' on')} onClick={() => toggle(i)}>{l.hidden ? 'Masqué' : 'Visible'}</button>
                  <button className="icon-btn" onClick={() => setEditIdx(i)} title="Modifier"><Icon name="pen" size={15}/></button>
                  <button className="icon-btn" onClick={() => remove(i)} title="Supprimer"><Icon name="trash" size={15}/></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── PROJECTS CRUD ─── */
const EMPTY_P = { name:'', categories:['dev'], featured:true, role:'', period:'', duration:'', description:'', caseStudy:'', caseStudyBlocks:[], demoUrl:'', repoUrl:'', techs:[], highlights:['','',''] }

function ProjectForm({ init, onSave, onCancel, showToast, onDraftChange, setPreviewPage }) {
  const [f, setF] = useState(init ? {...init, highlights:(init.highlights||['','',''])} : EMPTY_P)
  const [tLabel, setTL] = useState('')
  const [tKey, setTK] = useState('default')
  const [uploading, setUploading] = useState(false)
  const set = (k, v) => setF(p => ({...p, [k]: v}))
  const toggleCat = (k) => setF(p => {
    const has = p.categories.includes(k)
    const next = has ? p.categories.filter(x => x !== k) : [...p.categories, k]
    return {...p, categories: next.length ? next : p.categories}
  })
  const addTech = () => { if (!tLabel.trim()) return; set('techs', [...f.techs, {label: tLabel.trim(), tech: tKey}]); setTL('') }
  const setHl = (i, v) => setF(p => { const h = [...(p.highlights || ['','',''])]; h[i] = v; return {...p, highlights: h} })

  const uploadImage = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Veuillez selectionner une image')
      return
    }
    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const resp = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: f.id || slugify(f.name || 'nouveau-projet'),
            image: reader.result,
          }),
        })
        const data = await resp.json()
        if (data.ok) {
          set('image', data.path)
          showToast('Image telechargee')
        } else {
          showToast(data.error || 'Echec upload')
        }
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setUploading(false)
      showToast('Echec upload')
    }
  }

  useEffect(() => {
    if (onDraftChange) {
      const draft = { ...f, id: f.id || slugify(f.name || 'nouveau-projet') }
      onDraftChange(draft)
      if (setPreviewPage) setPreviewPage(`/projet/${draft.id}`)
    }
  }, [f, onDraftChange, setPreviewPage])

  return (
    <div className="ds-card">
      <div className="ds-form-grid" style={{marginTop:'var(--s5)'}}>
        <div className="ds-field" style={{gridColumn:'1/-1'}}>
          <label className="ds-label">Nom *</label>
          <input className="input" value={f.name} onChange={e => set('name', e.target.value)} placeholder="Connect'IN" />
        </div>
        <div className="ds-field" style={{gridColumn:'1/-1'}}>
          <label className="ds-label">Image principale</label>
          <div className="ds-image-row">
            {f.image ? (
              <div className="ds-image-prev">
                <img src={f.image} alt="Apercu" />
                <button className="ds-image-clear" onClick={() => set('image', '')} title="Supprimer"><Icon name="x" size={14}/></button>
              </div>
            ) : (
              <div className="ds-image-placeholder"><Icon name="download" size={24}/><span>Aucune image</span></div>
            )}
            <div style={{display:'flex',flexDirection:'column',gap:'8px',flex:1}}>
              <input className="input" value={f.image || ''} onChange={e => set('image', e.target.value)} placeholder="/media/projects/… ou https://…" />
              <label className={'btn btn--ghost' + (uploading ? '' : '')} style={{cursor:'pointer',textAlign:'center'}}>
                {uploading ? 'Upload...' : <><Icon name="download" size={14}/> Telecharger une image</>}
                <input type="file" accept="image/*" style={{display:'none'}} onChange={e => { const file = e.target.files[0]; if (file) uploadImage(file) }} disabled={uploading} />
              </label>
            </div>
          </div>
        </div>
        <div className="ds-field">
          <label className="ds-label">Catégories</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginTop:'6px'}}>
            {Object.keys(DATA.categories).filter(k => !['ai','tools'].includes(k)).map(k => (
              <button key={k} className={'cat-opt' + (f.categories.includes(k) ? ' on' : '')} style={{'--co': DATA.categories[k].color}} onClick={() => toggleCat(k)}>
                <Icon name={DATA.categories[k].glyph} size={12}/> {DATA.categories[k].label}
              </button>
            ))}
          </div>
        </div>
        <div className="ds-field">
          <label className="ds-label">Rôle · Période · Durée</label>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginTop:'6px'}}>
            <input className="input" value={f.role} onChange={e => set('role', e.target.value)} placeholder="Solo" />
            <input className="input" value={f.period} onChange={e => set('period', e.target.value)} placeholder="2025" />
            <input className="input" value={f.duration} onChange={e => set('duration', e.target.value)} placeholder="3 sem." />
          </div>
        </div>
        <div className="ds-field" style={{gridColumn:'1/-1'}}>
          <label className="ds-label">Description courte *</label>
          <textarea className="textarea" value={f.description} onChange={e => set('description', e.target.value)} placeholder="Une ligne résumant le projet." />
        </div>
        <div className="ds-field" style={{gridColumn:'1/-1'}}>
          <label className="ds-label">Etude de cas</label>
          <textarea className="textarea" style={{minHeight:'80px'}} value={f.caseStudy} onChange={e => set('caseStudy', e.target.value)} placeholder="Contexte, defis techniques, resultats..." />
        </div>
        <div className="ds-field" style={{gridColumn:'1/-1'}}>
          <label className="ds-label">Blocs etude de cas (optionnel)</label>
          {(f.caseStudyBlocks || []).length > 0 && (
            <div className="ds-blocks-list">
              {(f.caseStudyBlocks || []).map((block, i) => (
                <div key={i} className="ds-block-row">
                  <select className="select" value={block.type} onChange={e => {
                    const next = [...(f.caseStudyBlocks || [])]
                    next[i] = { ...next[i], type: e.target.value }
                    set('caseStudyBlocks', next)
                  }} style={{width:'110px'}}>
                    <option value="heading">Titre</option>
                    <option value="paragraph">Paragraphe</option>
                  </select>
                  <textarea className="textarea" value={block.content || ''}
                    onChange={e => {
                      const next = [...(f.caseStudyBlocks || [])]
                      next[i] = { ...next[i], content: e.target.value }
                      set('caseStudyBlocks', next)
                    }}
                    placeholder="Contenu du bloc..."
                    style={{minHeight:'44px',flex:1}}
                  />
                  <button className="icon-btn" onClick={() => set('caseStudyBlocks', (f.caseStudyBlocks || []).filter((_, j) => j !== i))} title="Supprimer">
                    <Icon name="trash" size={14}/>
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{display:'flex',gap:'8px',marginTop:'8px'}}>
            <button className="btn btn--ghost" onClick={() => set('caseStudyBlocks', [...(f.caseStudyBlocks || []), { type: 'heading', content: '' }])}>
              <Icon name="plus" size={14}/> Ajouter titre
            </button>
            <button className="btn btn--ghost" onClick={() => set('caseStudyBlocks', [...(f.caseStudyBlocks || []), { type: 'paragraph', content: '' }])}>
              <Icon name="plus" size={14}/> Ajouter paragraphe
            </button>
          </div>
        </div>
        <div className="ds-field" style={{gridColumn:'1/-1'}}>
          <label className="ds-label">Bullets CV (3 max)</label>
          {[0,1,2].map(i => (
            <input key={i} className="input" style={{marginTop:'6px'}} value={(f.highlights||['','',''])[i]||''} onChange={e=>setHl(i,e.target.value)} placeholder={'Point '+(i+1)} />
          ))}
        </div>
        <div className="ds-field" style={{gridColumn:'1/-1'}}>
          <label className="ds-label">Technologies</label>
          {f.techs.length > 0 && (
            <div className="tech-added" style={{marginBottom:'8px'}}>
              {f.techs.map((t, i) => (
                <span key={i} className="tech-added-tag">
                  <TechTag label={t.label} tech={t.tech}/>
                  <button onClick={() => set('techs', f.techs.filter((_, j) => j !== i))}><Icon name="x" size={11}/></button>
                </span>
              ))}
            </div>
          )}
          <div className="tech-add-row">
            <input className="input" value={tLabel} onChange={e => setTL(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech() } }} placeholder="Label" />
            <select className="select" value={tKey} onChange={e => setTK(e.target.value)}>
              {TECH_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <button className="btn btn--ghost" onClick={addTech}><Icon name="plus" size={14}/></button>
          </div>
        </div>
        <div className="ds-field"><label className="ds-label">Lien démo</label>
          <input className="input" value={f.demoUrl} onChange={e => set('demoUrl', e.target.value)} placeholder="https://…" /></div>
        <div className="ds-field"><label className="ds-label">Lien repo</label>
          <input className="input" value={f.repoUrl} onChange={e => set('repoUrl', e.target.value)} placeholder="https://github.com/…" /></div>
      </div>
      <div className="ds-form-actions">
        <button className="btn btn--ghost" onClick={onCancel}>Annuler</button>
        <button className="btn btn--brand" onClick={() => onSave({...f, id: f.id || slugify(f.name)})} disabled={!f.name || !f.description}>
          <Icon name="check" size={14}/> Enregistrer
        </button>
      </div>
    </div>
  )
}

function ProjectsSection({ projects, setProjects, showToast, onDraftChange, setPreviewPage }) {
  const [editing, setEditing] = useState(null)
  const handleSave = (proj) => {
    const next = editing === 'new' ? [...projects, proj] : projects.map(p => p.id === proj.id ? proj : p)
    setProjects(next)
    setEditing(null)
    onDraftChange(null)
    showToast(editing === 'new' ? 'Projet ajouté' : 'Projet mis à jour')
  }
  const handleCancel = () => {
    setEditing(null)
    onDraftChange(null)
  }
  const del = (id) => {
    if (!window.confirm('Supprimer ce projet ?')) return
    setProjects(projects.filter(p => p.id !== id))
    showToast('Projet supprimé')
  }
  const startEdit = (pr) => {
    setEditing(pr)
    if (setPreviewPage) setPreviewPage(`/projet/${pr.id}`)
  }
  if (editing !== null) return (
    <div className="ds-section">
      <button className="back-link" style={{marginBottom:'var(--s2)'}} onClick={handleCancel}><Icon name="arrowLeft" size={14}/> Retour à la liste</button>
      <h2 className="ds-title">{editing === 'new' ? 'Ajouter un projet' : 'Modifier — ' + editing.name}</h2>
      <ProjectForm init={editing === 'new' ? null : editing} onSave={handleSave} onCancel={handleCancel} showToast={showToast} onDraftChange={onDraftChange} setPreviewPage={setPreviewPage}/>
    </div>
  )
  return (
    <div className="ds-section">
      <div className="ds-section-head">
        <div><h2 className="ds-title">Projets <span className="ds-count">{projects.length}</span></h2><p className="ds-sub">Ajoute, modifie ou retire des projets.</p></div>
        <button className="btn btn--brand" onClick={() => setEditing('new')}><Icon name="plus" size={14}/> Ajouter</button>
      </div>
      <div className="ds-proj-list">
        {projects.map(pr => (
          <div key={pr.id} className="ds-proj-row">
            <div className="ds-proj-info">
              <div className="ds-proj-name"><CatGlyph cat={(pr.categories || ['dev'])[0]} size={14}/> {pr.name}</div>
              <div className="ds-proj-meta">{pr.role} · {pr.period}{pr.duration ? ' · ' + pr.duration : ''}</div>
            </div>
            <div className="ds-proj-acts">
              <button className="icon-btn" onClick={() => startEdit(pr)} title="Modifier"><Icon name="pen" size={15}/></button>
              <button className="icon-btn" onClick={() => del(pr.id)} title="Supprimer"><Icon name="trash" size={15}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── BACKUP ─── */
function BackupSection({ config, showToast }) {
  const [importText, setImportText] = useState('')
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'bentofolio-backup.json'; a.click()
    URL.revokeObjectURL(url)
    showToast('Backup téléchargé')
  }
  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText)
      if (!parsed.projects || !parsed.appearance) { showToast('Format invalide'); return }
      const json = JSON.stringify(parsed, null, 2)
      localStorage.setItem('bentofolio.import', json)
      showToast('Import prêt — recharge la page pour appliquer')
    } catch { showToast('JSON invalide') }
  }
  return (
    <div className="ds-section">
      <h2 className="ds-title">Backup</h2>
      <p className="ds-sub">Exporte ou importe la configuration complète.</p>
      <div className="ds-card">
        <h3 className="ds-card-title">Export</h3>
        <p className="ds-hint">Télécharge un fichier JSON contenant projets, apparence, CV, contact et liens.</p>
        <button className="btn btn--brand" style={{marginTop:'8px'}} onClick={handleExport}><Icon name="download" size={14}/> Télécharger le backup</button>
      </div>
      <div className="ds-card">
        <h3 className="ds-card-title">Import</h3>
        <p className="ds-hint">Colle le contenu d'un fichier backup JSON puis clique sur Importer.</p>
        <textarea className="textarea" style={{minHeight:'120px',marginTop:'8px'}} value={importText}
          onChange={e => setImportText(e.target.value)} placeholder='{ "projects": [...], "appearance": {...}, ... }' />
        <button className="btn btn--ghost" style={{marginTop:'8px'}} onClick={handleImport} disabled={!importText.trim()}>
          <Icon name="arrowRight" size={14}/> Importer (recharge la page)
        </button>
      </div>
    </div>
  )
}

/* ─── PROFILE ─── */
function ProfileSection({ profile, setProfile, showToast }) {
  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }))
  const setAlt = (k, v) => setProfile(p => ({ ...p, alternance: { ...(p.alternance || {}), [k]: v } }))

  return (
    <div className="ds-section">
      <h2 className="ds-title">Profil</h2>
      <p className="ds-sub">Identité, bio, alternance et textes affichés.</p>

      {/* Identity */}
      <div className="ds-card">
        <h3 className="ds-card-title">Identité</h3>
        <div className="ds-form-grid">
          <div className="ds-field">
            <label className="ds-label">Prénom</label>
            <input className="input" value={profile.firstName || ''} onChange={e => set('firstName', e.target.value)} placeholder="Sofian" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Nom</label>
            <input className="input" value={profile.lastName || ''} onChange={e => set('lastName', e.target.value)} placeholder="BELLOUL" />
          </div>
          <div className="ds-field" style={{ gridColumn: '1/-1' }}>
            <label className="ds-label">Rôle / Accroche</label>
            <input className="input" value={profile.role || ''} onChange={e => set('role', e.target.value)} placeholder="Développeur Web Full Stack" />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="ds-card">
        <h3 className="ds-card-title">Bio</h3>
        <textarea className="textarea" style={{ minHeight: '120px' }} value={profile.bio || ''}
          onChange={e => set('bio', e.target.value)}
          placeholder="Quelques lignes sur toi..."
        />
      </div>

      {/* Alternance */}
      <div className="ds-card">
        <h3 className="ds-card-title">Alternance</h3>
        <div className="ds-form-grid">
          <div className="ds-field">
            <label className="ds-label">Début</label>
            <input className="input" value={profile.alternance?.start || ''} onChange={e => setAlt('start', e.target.value)} placeholder="sept. 2026" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Durée</label>
            <input className="input" value={profile.alternance?.duration || ''} onChange={e => setAlt('duration', e.target.value)} placeholder="14 mois" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Rythme</label>
            <input className="input" value={profile.alternance?.rythme || ''} onChange={e => setAlt('rythme', e.target.value)} placeholder="6/2 sem." />
          </div>
        </div>
      </div>

      {/* Contact infos */}
      <div className="ds-card">
        <h3 className="ds-card-title">Infos contact <span className="ds-tag-count">· {profile.contactInfos?.length || 0}</span></h3>
        {(profile.contactInfos || []).map((ci, i) => (
          <div key={i} className="ds-block-row" style={{ marginBottom: '10px' }}>
            <input className="input" value={ci.key || ''} onChange={e => {
              const next = [...(profile.contactInfos || [])]
              next[i] = { ...next[i], key: e.target.value }
              set('contactInfos', next)
            }} placeholder="Label (ex: Âge)" style={{ width: '130px' }} />
            <input className="input" value={ci.value || ''} onChange={e => {
              const next = [...(profile.contactInfos || [])]
              next[i] = { ...next[i], value: e.target.value }
              set('contactInfos', next)
            }} placeholder="Valeur (ex: 22 ans)" style={{ flex: 1 }} />
            <button className={'ds-vis-btn' + (ci.visible !== false ? ' on' : '')} onClick={() => {
              const next = [...(profile.contactInfos || [])]
              next[i] = { ...next[i], visible: !(ci.visible !== false) }
              set('contactInfos', next)
            }}>
              {ci.visible !== false ? 'Visible' : 'Masqué'}
            </button>
            <button className="icon-btn" onClick={() => {
              set('contactInfos', (profile.contactInfos || []).filter((_, j) => j !== i))
            }} title="Supprimer"><Icon name="trash" size={14} /></button>
          </div>
        ))}
        <button className="btn btn--ghost" style={{ marginTop: '8px' }} onClick={() => {
          set('contactInfos', [...(profile.contactInfos || []), { key: '', value: '', visible: true }])
        }}>
          <Icon name="plus" size={14} /> Ajouter une info
        </button>
      </div>

      {/* CV subtitle */}
      <div className="ds-card">
        <h3 className="ds-card-title">Sous-titre CV</h3>
        <div className="ds-form-grid">
          <div className="ds-field" style={{ gridColumn: '1/-1' }}>
            <label className="ds-label">Texte du sous-titre</label>
            <input className="input" value={profile.cvSubtitle || ''} onChange={e => set('cvSubtitle', e.target.value)}
              placeholder="CV synthétique pour recruteurs..." />
          </div>
          <div className="ds-field">
            <label className="ds-label">Taille du texte <span className="ds-tag-count">· {profile.cvSubtitleSize || 14}px</span></label>
            <input type="range" min="12" max="32" value={profile.cvSubtitleSize || 14}
              onChange={e => set('cvSubtitleSize', Number(e.target.value))}
              style={{ width: '100%', marginTop: '6px' }} />
          </div>
        </div>
      </div>

      {/* Hero chips */}
      <div className="ds-card">
        <h3 className="ds-card-title">Pills de l'accueil</h3>
        {(profile.heroChips || []).map((chip, i) => (
          <div key={i} className="ds-block-row" style={{ marginBottom: '10px' }}>
            <select className="select" value={chip.variant || 'outline'} onChange={e => {
              const next = [...(profile.heroChips || [])]
              next[i] = { ...next[i], variant: e.target.value }
              set('heroChips', next)
            }} style={{ width: '110px' }}>
              <option value="outline">Outline</option>
              <option value="solid">Plein</option>
            </select>
            <input className="input" value={chip.text || ''} onChange={e => {
              const next = [...(profile.heroChips || [])]
              next[i] = { ...next[i], text: e.target.value }
              set('heroChips', next)
            }} placeholder="Texte de la pill" style={{ flex: 1 }} />
            <button className="icon-btn" onClick={() => {
              set('heroChips', (profile.heroChips || []).filter((_, j) => j !== i))
            }} title="Supprimer"><Icon name="trash" size={14} /></button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button className="btn btn--ghost" onClick={() => {
            set('heroChips', [...(profile.heroChips || []), { text: '', variant: 'outline' }])
          }}><Icon name="plus" size={14} /> Ajouter outline</button>
          <button className="btn btn--ghost" onClick={() => {
            set('heroChips', [...(profile.heroChips || []), { text: '', variant: 'solid' }])
          }}><Icon name="plus" size={14} /> Ajouter plein</button>
        </div>
      </div>

      {/* Skill groups */}
      <div className="ds-card">
        <h3 className="ds-card-title">Compétences</h3>
        {(profile.skillGroups || []).map((group, gi) => (
          <div key={gi} style={{ marginBottom: '16px', border: '1px solid var(--admin-line)', borderRadius: '12px', padding: '12px' }}>
            <div className="ds-block-row" style={{ marginBottom: '10px' }}>
              <input className="input" value={group.category || ''} onChange={e => {
                const next = [...(profile.skillGroups || [])]
                next[gi] = { ...next[gi], category: e.target.value }
                set('skillGroups', next)
              }} placeholder="Catégorie (ex: Dev Web)" style={{ flex: 1 }} />
              <button className="icon-btn" onClick={() => {
                set('skillGroups', (profile.skillGroups || []).filter((_, j) => j !== gi))
              }} title="Supprimer le groupe"><Icon name="trash" size={14} /></button>
            </div>
            {(group.skills || []).map((sk, si) => (
              <div key={si} className="ds-block-row" style={{ marginBottom: '6px' }}>
                <input className="input" value={sk.label || ''} onChange={e => {
                  const next = [...(profile.skillGroups || [])]
                  const skills = [...(next[gi].skills || [])]
                  skills[si] = { ...skills[si], label: e.target.value }
                  next[gi] = { ...next[gi], skills }
                  set('skillGroups', next)
                }} placeholder="Label (ex: PHP / Laravel)" style={{ flex: 1 }} />
                <select className="select" value={sk.tech || 'default'} onChange={e => {
                  const next = [...(profile.skillGroups || [])]
                  const skills = [...(next[gi].skills || [])]
                  skills[si] = { ...skills[si], tech: e.target.value }
                  next[gi] = { ...next[gi], skills }
                  set('skillGroups', next)
                }} style={{ width: '110px' }}>
                  {['laravel','vue','java','go','tailwind','shadcn','mysql','docker','git','linux','bash','nvim','figma','framer','python','rag','n8n','blender','three','js','ts','shopify','ae','illustrator','default','soft','node','sops'].map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <button className="icon-btn" onClick={() => {
                  const next = [...(profile.skillGroups || [])]
                  next[gi] = { ...next[gi], skills: (next[gi].skills || []).filter((_, j) => j !== si) }
                  set('skillGroups', next)
                }} title="Supprimer"><Icon name="x" size={12} /></button>
              </div>
            ))}
            <button className="btn btn--ghost" onClick={() => {
              const next = [...(profile.skillGroups || [])]
              next[gi] = { ...next[gi], skills: [...(next[gi].skills || []), { label: '', tech: 'default' }] }
              set('skillGroups', next)
            }}><Icon name="plus" size={12} /> Ajouter skill</button>
          </div>
        ))}
        <button className="btn btn--ghost" onClick={() => {
          set('skillGroups', [...(profile.skillGroups || []), { category: '', skills: [] }])
        }}><Icon name="plus" size={14} /> Ajouter groupe</button>
      </div>

      {/* Formations */}
      <div className="ds-card">
        <h3 className="ds-card-title">Formations</h3>
        {(profile.formations || []).map((f, i) => (
          <div key={i} style={{ marginBottom: '16px', border: '1px solid var(--admin-line)', borderRadius: '12px', padding: '12px' }}>
            <div className="ds-block-row" style={{ marginBottom: '6px', justifyContent: 'space-between' }}>
              <strong>Formation {i + 1}</strong>
              <button className="icon-btn" onClick={() => set('formations', (profile.formations || []).filter((_, j) => j !== i))} title="Supprimer">
                <Icon name="trash" size={14} />
              </button>
            </div>
            <input className="input" value={f.title || ''} onChange={e => {
              const next = [...(profile.formations || [])]
              next[i] = { ...next[i], title: e.target.value }
              set('formations', next)
            }} placeholder="Titre" style={{ marginBottom: '6px' }} />
            <div className="ds-block-row" style={{ gap: '8px', marginBottom: '6px' }}>
              <input className="input" value={f.badge || ''} onChange={e => {
                const next = [...(profile.formations || [])]
                next[i] = { ...next[i], badge: e.target.value }
                set('formations', next)
              }} placeholder="Badge (ex: BAC+2 RNCP)" style={{ width: '150px' }} />
              <input className="input" value={f.where || ''} onChange={e => {
                const next = [...(profile.formations || [])]
                next[i] = { ...next[i], where: e.target.value }
                set('formations', next)
              }} placeholder="Établissement" style={{ flex: 1 }} />
            </div>
            <textarea className="textarea" value={f.description || ''} onChange={e => {
              const next = [...(profile.formations || [])]
              next[i] = { ...next[i], description: e.target.value }
              set('formations', next)
            }} placeholder="Description" style={{ minHeight: '60px' }} />
          </div>
        ))}
        <button className="btn btn--ghost" onClick={() => {
          set('formations', [...(profile.formations || []), { title: '', badge: '', where: '', description: '' }])
        }}><Icon name="plus" size={14} /> Ajouter formation</button>
      </div>

      {/* Interests */}
      <div className="ds-card">
        <h3 className="ds-card-title">Centres d'intérêt</h3>
        {(profile.interests || []).map((it, i) => (
          <div key={i} className="ds-block-row" style={{ marginBottom: '10px' }}>
            <input className="input" value={it.emoji || ''} onChange={e => {
              const next = [...(profile.interests || [])]
              next[i] = { ...next[i], emoji: e.target.value }
              set('interests', next)
            }} placeholder="Emoji" style={{ width: '60px', textAlign: 'center' }} />
            <input className="input" value={it.title || ''} onChange={e => {
              const next = [...(profile.interests || [])]
              next[i] = { ...next[i], title: e.target.value }
              set('interests', next)
            }} placeholder="Titre" style={{ width: '160px' }} />
            <input className="input" value={it.detail || ''} onChange={e => {
              const next = [...(profile.interests || [])]
              next[i] = { ...next[i], detail: e.target.value }
              set('interests', next)
            }} placeholder="Détail" style={{ flex: 1 }} />
            <button className="icon-btn" onClick={() => {
              set('interests', (profile.interests || []).filter((_, j) => j !== i))
            }} title="Supprimer"><Icon name="trash" size={14} /></button>
          </div>
        ))}
        <button className="btn btn--ghost" onClick={() => {
          set('interests', [...(profile.interests || []), { emoji: '', title: '', detail: '' }])
        }}><Icon name="plus" size={14} /> Ajouter intérêt</button>
      </div>

      {/* Section labels */}
      <div className="ds-card">
        <h3 className="ds-card-title">Libellés de sections</h3>
        <div className="ds-form-grid">
          {['skills','formation','contact','interests','projects'].map(key => (
            <div className="ds-field" key={key}>
              <label className="ds-label">{key}</label>
              <input className="input" value={profile.sectionLabels?.[key] || ''}
                onChange={e => set('sectionLabels', { ...(profile.sectionLabels || {}), [key]: e.target.value })}
                placeholder={key} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── PREVIEW PANEL ─── */
function PreviewPanel({ iframeRef, page, setPage, iframeKey, previewWidth, setPreviewWidth }) {
  const PAGES = [
    { p: '/', l: 'Accueil' },
    { p: '/projets', l: 'Projets' },
    { p: '/cv', l: 'CV' },
    { p: '/contact', l: 'Contact' },
  ]
  const setPresetWidth = (width) => {
    const maxWidth = Math.max(320, window.innerWidth - 620)
    setPreviewWidth(Math.min(width, maxWidth))
  }
  return (
    <div className="ds-preview-panel">
      <div className="ds-preview-tabs">
        <div className="ds-preview-routes">
          {PAGES.map(x => (
            <button key={x.p} className={'ds-preview-tab' + (page === x.p ? ' active' : '')} onClick={() => setPage(x.p)}>{x.l}</button>
          ))}
        </div>
        <div className="ds-preview-tools">
          <span className="ds-preview-size">{Math.round(previewWidth)}px</span>
          <button className="ds-preview-preset" onClick={() => setPresetWidth(390)}>Mobile</button>
          <button className="ds-preview-preset" onClick={() => setPresetWidth(768)}>Tablet</button>
          <button className="ds-preview-preset" onClick={() => setPresetWidth(1100)}>Desktop</button>
          <button className="icon-btn" onClick={() => { if (iframeRef.current) iframeRef.current.src = iframeRef.current.src }} title="Rafraîchir"><Icon name="arrowRight" size={15}/></button>
        </div>
      </div>
      <div className="ds-preview-frame">
        <iframe ref={iframeRef} key={iframeKey} src={'index.html#' + page} title="Aperçu" sandbox="allow-scripts allow-same-origin" />
      </div>
    </div>
  )
}

/* ─── MAIN DASHBOARD ─── */
function DashboardView({ navigate, showToast, onLogout }) {
  const { projects, setProjects, socialLinks, setSocialLinks, photo, setPhoto,
    appearance, setAppearance, cv, setCv, contact, setContact, config } = useConfigState()

  const [section, setSection] = useState('projets')
  const [previewPage, setPreviewPage] = useState('/')
  const [saving, setSaving] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [previewWidth, setPreviewWidth] = useState(420)
  const [draftProject, setDraftProject] = useState(null)
  const iframeRef = useRef(null)
  const debounceRef = useRef(null)
  const isDragging = useRef(false)

  const reloadPreview = useCallback(() => {
    setIframeKey(k => k + 1)
  }, [])

  const syncToIframe = useCallback(() => {
    let merged = projects
    if (draftProject) {
      const idx = projects.findIndex(p => p.id === draftProject.id)
      merged = idx >= 0
        ? projects.map(p => p.id === draftProject.id ? draftProject : p)
        : [...projects, draftProject]
    }
    const cfg = buildConfig(merged, socialLinks, photo, appearance, cv, contact)
    postToIframe(iframeRef, cfg)
  }, [projects, socialLinks, photo, appearance, cv, contact, draftProject])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      syncToIframe()
      reloadPreview()
    }, 600)
  }, [projects, socialLinks, photo, appearance, cv, contact, draftProject, syncToIframe, reloadPreview])

  const handleSave = useCallback(async () => {
    setSaving(true)
    let merged = projects
    if (draftProject) {
      const idx = projects.findIndex(p => p.id === draftProject.id)
      merged = idx >= 0
        ? projects.map(p => p.id === draftProject.id ? draftProject : p)
        : [...projects, draftProject]
    }
    const cfg = buildConfig(merged, socialLinks, photo, appearance, cv, contact)
    const result = await saveConfigToDisk(cfg)
    if (result.ok) {
      try { clearAdminSaveOverrides(window.localStorage) } catch {}
      showToast('Sauvegarde sur le disque — pret pour le build')
      if (draftProject) {
        setProjects(merged)
        setDraftProject(null)
      }
      reloadPreview()
    } else {
      showToast(`Sauvegarde echouee — ${result.error || 'dev uniquement'}`)
    }
    setSaving(false)
  }, [projects, socialLinks, photo, appearance, cv, contact, draftProject, showToast, reloadPreview, setProjects])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return
      // Prevent selecting text while dragging
      e.preventDefault()
      // Calculate new width (from right edge)
      const newWidth = window.innerWidth - e.clientX
      // Keep enough room for the admin controls while allowing desktop preview on wide screens.
      const maxW = window.innerWidth - 620
      const w = Math.min(Math.max(newWidth, 320), maxW)
      setPreviewWidth(w)
    }
    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.body.style.cursor = ''
        document.documentElement.classList.remove('is-resizing')
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <div className="dashboard-v5" style={{ '--preview-w': `${previewWidth}px` }}>
      <aside className="dash-sidebar">
        <div className="dash-brand"><span className="dash-brand-dot"/><span>Admin</span></div>
        <nav className="dash-nav">
          {SECTIONS.map(s => (
            <button key={s.id} className={'dash-nav-item' + (section === s.id ? ' active' : '')} onClick={() => setSection(s.id)}>
              <Icon name={s.icon} size={15}/>{s.label}
            </button>
          ))}
        </nav>
        <div className="dash-sidebar-footer">
          <button className="btn btn--brand" style={{width:'100%',marginBottom:'8px'}} onClick={handleSave} disabled={saving}>
            <Icon name={saving ? 'check' : 'download'} size={14}/> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button className="btn btn--ghost" style={{width:'100%'}} onClick={() => navigate('/')}>
            <Icon name="arrowLeft" size={13}/> Voir le site
          </button>
          <button className="btn btn--ghost" style={{width:'100%',marginTop:'4px'}} onClick={onLogout}>
            <Icon name="x" size={13}/> Quitter
          </button>
        </div>
      </aside>
      <main className="dash-main">
        <div className="dash-content">
          {section === 'projets'   && <ProjectsSection   projects={projects} setProjects={setProjects} showToast={showToast} onDraftChange={setDraftProject} setPreviewPage={setPreviewPage}/>}
          {section === 'apparence' && <AppearanceSection appearance={appearance} setAppearance={setAppearance}/>}
          {section === 'cv'        && <CvSection         cv={cv} setCv={setCv} projects={projects} photo={photo} setPhoto={setPhoto} showToast={showToast}/>}
          {section === 'contact'   && <ContactSection    contact={contact} setContact={setContact}/>}
          {section === 'liens'     && <LinksSection      socialLinks={socialLinks} setSocialLinks={setSocialLinks} showToast={showToast}/>}
          {section === 'backup'    && <BackupSection     config={config} showToast={showToast}/>}
        </div>
      </main>
      
      {/* Drag handle for resizing */}
      <div 
        className="dash-resizer" 
        onMouseDown={(e) => {
          e.preventDefault()
          isDragging.current = true
          document.body.style.cursor = 'col-resize'
          document.documentElement.classList.add('is-resizing')
        }}
      >
        <div className="dash-resizer-line" />
      </div>

      <aside className="dash-preview">
        <PreviewPanel iframeRef={iframeRef} page={previewPage} setPage={setPreviewPage} iframeKey={iframeKey} previewWidth={previewWidth} setPreviewWidth={setPreviewWidth}/>
      </aside>
    </div>
  )
}

const ADMIN_PASSWORD = 'bento'
function AdminLogin({ onLogin }) {
  const [pwd, setPwd] = useState('')
  const [err, setErr] = useState(false)
  const submit = (e) => {
    e.preventDefault()
    if (pwd === ADMIN_PASSWORD) { onLogin() }
    else { setErr(true); setPwd(''); setTimeout(() => setErr(false), 1800) }
  }
  return (
    <main className="page-wrap" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}>
      <div style={{width:'100%',maxWidth:'360px'}}>
        <div className="admin-card">
          <h3 style={{marginBottom:'4px'}}>Espace Admin</h3>
          <p className="sub">Accès réservé.</p>
          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'12px',marginTop:'20px'}}>
            <div className="field">
              <label>Mot de passe</label>
              <input className={'input' + (err ? ' input-error' : '')} type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••" autoFocus/>
              {err && <p style={{fontSize:'12px',color:'var(--cat-animation)',marginTop:'4px'}}>Mot de passe incorrect.</p>}
            </div>
            <button className="btn btn--brand" type="submit"><Icon name="arrowRight" size={15}/> Entrer</button>
          </form>
        </div>
      </div>
    </main>
  )
}

export function AdminView({ adminMode, onLogin, onLogout, navigate, showToast }) {
  if (!adminMode) return <AdminLogin onLogin={onLogin}/>
  return <DashboardView navigate={navigate} showToast={showToast} onLogout={onLogout}/>
}
