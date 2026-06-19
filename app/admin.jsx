/* =============================================
   BENTOFOLIO — Admin Dashboard v5 (ES module)
   2-column layout: left controls + right preview
   ============================================= */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Icon, TechTag, CatGlyph } from './ui.jsx'
import { DATA, APP_CONFIG } from './data.js'
import { clearAdminSaveOverrides, saveConfigToDisk } from './admin-save.js'
import { saveProjectToContent, deleteProjectFromContent } from './admin-project-save.js'
import { applyLiveConfig, resolveImageSrc } from './config-runtime.js'
import { HomeView } from './home.jsx'
import { ProjectsView, ProjectDetailView } from './projects.jsx'
import { ExperiencesView } from './experiences.jsx'
import { CvView } from './cv.jsx'
import { ContactView } from './contact.jsx'

const TECH_KEYS = ['laravel','vue','java','tailwind','shadcn','mysql','docker','git','linux',
  'nvim','bash','figma','framer','python','rag','n8n','js','ts','shopify',
  'blender','ae','illustrator','default','soft','go','three','node','sops']

function slugify(s) {
  return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/['']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'projet'
}

function buildConfig(projects, socialLinks, photo, appearance, cv, contact, experiences, profile) {
  const featuredIds = new Set(cv?.featured || [])
  const projWithFeatured = projects.map(p => ({...p, featured: featuredIds.has(p.id)}))
  return {
    projects: projWithFeatured,
    socialLinks,
    photo: photo || '',
    appearance: appearance || {},
    cv: cv || {},
    contact: contact || {},
    experiences: experiences || [],
    profile: profile || {},
  }
}

function useConfigState() {
  const [projects, setProjects] = useState(() => [...(APP_CONFIG.projects || [])])
  const [socialLinks, setSocialLinks] = useState(() => [...(APP_CONFIG.socialLinks || [])])
  const [photo, setPhoto] = useState(() => APP_CONFIG.photo || '')
  const [appearance, setAppearance] = useState(() => ({...APP_CONFIG.appearance}))
  const [cv, setCv] = useState(() => ({...APP_CONFIG.cv}))
  const [contact, setContact] = useState(() => ({...APP_CONFIG.contact}))
  const [experiences, setExperiences] = useState(() => [...(APP_CONFIG.experiences || [])])
  const [profile, setProfile] = useState(() => ({ ...(APP_CONFIG.profile || {}) }))

  const config = buildConfig(projects, socialLinks, photo, appearance, cv, contact, experiences, profile)

  return { projects, setProjects, socialLinks, setSocialLinks, photo, setPhoto,
    appearance, setAppearance, cv, setCv, contact, setContact, experiences, setExperiences, profile, setProfile, config }
}

function syncLivePreview(cfg) {
  applyLiveConfig(cfg, DATA, APP_CONFIG)
}

const FOCAL_DEFAULTS = {
  home: '50% 18%',
  cv: '50% 16%',
}

function clampPercent(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 50
  return Math.max(0, Math.min(100, Math.round(n)))
}

function focalTokenToPercent(token, axis) {
  if (!token) return null
  if (token.endsWith('%')) return Number.parseFloat(token)
  if (axis === 'x') {
    if (token === 'left') return 0
    if (token === 'center') return 50
    if (token === 'right') return 100
  }
  if (axis === 'y') {
    if (token === 'top') return 0
    if (token === 'center') return 50
    if (token === 'bottom') return 100
  }
  return null
}

function parseFocalPosition(value, fallback) {
  const source = String(value || fallback || '50% 50%').trim().toLowerCase()
  const parts = source.split(/\s+/)
  const x = focalTokenToPercent(parts[0], 'x')
  const y = focalTokenToPercent(parts[1], 'y')
  return {
    x: clampPercent(x ?? focalTokenToPercent(String(fallback || '50% 50%').split(/\s+/)[0], 'x')),
    y: clampPercent(y ?? focalTokenToPercent(String(fallback || '50% 50%').split(/\s+/)[1], 'y')),
  }
}

function formatFocalPosition(x, y) {
  return `${clampPercent(x)}% ${clampPercent(y)}%`
}

function FocalPointControl({ label, hint, photo, value, fallback, aspectRatio, onChange }) {
  const position = parseFocalPosition(value, fallback)
  const imageSrc = resolveImageSrc(photo) || 'photo.jpg'
  const setPosition = (x, y) => onChange(formatFocalPosition(x, y))
  const updateFromPointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setPosition(x, y)
  }
  const handlePointerDown = (event) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    updateFromPointer(event)
  }
  const handlePointerMove = (event) => {
    if (event.buttons !== 1) return
    updateFromPointer(event)
  }

  return (
    <div className="ds-focal-control">
      <div className="ds-focal-head">
        <div>
          <h4>{label}</h4>
          <p>{hint}</p>
        </div>
        <span data-testid="focal-value" className="ds-focal-value">{formatFocalPosition(position.x, position.y)}</span>
      </div>
      <div
        data-testid="focal-preview"
        className="ds-focal-preview"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        style={{
          aspectRatio,
          '--focal-position': formatFocalPosition(position.x, position.y),
          '--focal-x': `${position.x}%`,
          '--focal-y': `${position.y}%`,
        }}
      >
        <img src={imageSrc} alt="Aperçu du cadrage" draggable="false" />
        <span className="ds-focal-crosshair" />
        <span className="ds-focal-marker" />
      </div>
      <div className="ds-focal-sliders">
        <label>
          <span>Horizontal</span>
          <input type="range" min="0" max="100" value={position.x} onChange={e => setPosition(e.target.value, position.y)} />
        </label>
        <label>
          <span>Vertical</span>
          <input type="range" min="0" max="100" value={position.y} onChange={e => setPosition(position.x, e.target.value)} />
        </label>
      </div>
      <div className="ds-focal-presets">
        <button className="btn btn--ghost" onClick={() => setPosition(50, 50)}>Centrer</button>
        <button className="btn btn--ghost" onClick={() => setPosition(50, 18)}>Visage haut</button>
        <button className="btn btn--ghost" onClick={() => setPosition(35, 25)}>Gauche</button>
        <button className="btn btn--ghost" onClick={() => setPosition(65, 25)}>Droite</button>
      </div>
    </div>
  )
}

/* ─── MAIN DASHBOARD ─── */
function DashboardView({ navigate, showToast, onLogout }) {
  const { projects, setProjects, socialLinks, setSocialLinks, photo, setPhoto,
    appearance, setAppearance, cv, setCv, contact, setContact, experiences, setExperiences, profile, setProfile, config } = useConfigState()

  const [section, setSection] = useState('projets')
  const [previewPage, setPreviewPage] = useState('/')
  const [saving, setSaving] = useState(false)
  const [mainWidth, setMainWidth] = useState(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [draftProject, setDraftProject] = useState(null)
  const debounceRef = useRef(null)
  const isDragging = useRef(false)
  const dashRef = useRef(null)

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current || !dashRef.current) return
      e.preventDefault()
      const rect = dashRef.current.getBoundingClientRect()
      const sidebarW = 200
      const handleW = 6
      const minMain = 400
      const w = e.clientX - rect.left - sidebarW - handleW / 2
      setMainWidth(Math.max(minMain, w))
    }
    const onUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.body.style.cursor = ''
        document.documentElement.classList.remove('is-resizing')
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const startResize = (e) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = 'col-resize'
    document.documentElement.classList.add('is-resizing')
  }

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      let merged = projects
      if (draftProject) {
        const idx = projects.findIndex(p => p.id === draftProject.id)
        merged = idx >= 0
          ? projects.map(p => p.id === draftProject.id ? draftProject : p)
          : [...projects, draftProject]
      }
      const cfg = buildConfig(merged, socialLinks, photo, appearance, cv, contact, experiences, profile)
      syncLivePreview(cfg)
      setPreviewKey(k => k + 1)
    }, 300)
  }, [projects, socialLinks, photo, appearance, cv, contact, experiences, profile, draftProject])

  const handleSave = useCallback(async () => {
    setSaving(true)
    let merged = projects
    if (draftProject) {
      const idx = projects.findIndex(p => p.id === draftProject.id)
      merged = idx >= 0
        ? projects.map(p => p.id === draftProject.id ? draftProject : p)
        : [...projects, draftProject]
    }
    const cfg = buildConfig(merged, socialLinks, photo, appearance, cv, contact, experiences, profile)
    const { projects: _proj, ...cfgForDisk } = cfg
    const result = await saveConfigToDisk(cfgForDisk)
    if (result.ok) {
      try { clearAdminSaveOverrides(window.localStorage) } catch {}
      showToast('Sauvegarde sur le disque — pret pour le build')
      if (draftProject) {
        setProjects(merged)
        setDraftProject(null)
      }
    } else {
      showToast(`Sauvegarde echouee — ${result.error || 'dev uniquement'}`)
    }
    setSaving(false)
  }, [projects, socialLinks, photo, appearance, cv, contact, experiences, profile, draftProject, showToast, setProjects])

  const previewNavigate = useCallback((path) => {
    setPreviewPage(path)
  }, [])

  const previewOpenProject = useCallback((id) => {
    setPreviewPage('/projet/' + id)
  }, [])

  const previewFilter = 'all'
  const previewSetFilter = () => {}
  const previewTweaks = {}
  const previewSetTweak = () => {}

  const renderPreview = () => {
    const page = previewPage
    if (page.startsWith('/projet/')) {
      const id = page.slice('/projet/'.length)
      return <ProjectDetailView id={id} navigate={previewNavigate} openProject={previewOpenProject} />
    }
    switch (page) {
      case '/projets': return <ProjectsView navigate={previewNavigate} openProject={previewOpenProject} filter={previewFilter} setFilter={previewSetFilter} />
      case '/experiences': return <ExperiencesView navigate={previewNavigate} />
      case '/cv': return <CvView navigate={previewNavigate} showToast={showToast} tweaks={previewTweaks} setTweak={previewSetTweak} />
      case '/contact': return <ContactView navigate={previewNavigate} showToast={showToast} />
      default: return <HomeView navigate={previewNavigate} openProject={previewOpenProject} />
    }
  }

  const PAGES = [
    { p: '/', l: 'Accueil' },
    { p: '/projets', l: 'Projets' },
    { p: '/experiences', l: 'Experiences' },
    { p: '/cv', l: 'CV' },
    { p: '/contact', l: 'Contact' },
  ]

  return (
    <div className="dashboard-v5" ref={dashRef}>
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
      <main className={'dash-main' + (mainWidth ? '' : ' is-auto')} style={mainWidth ? { width: mainWidth } : undefined}>
        <div className="dash-content">
          {section === 'projets'   && <ProjectsSection   projects={projects} setProjects={setProjects} showToast={showToast} onDraftChange={setDraftProject} setPreviewPage={setPreviewPage}/>}
          {section === 'apparence' && <AppearanceSection appearance={appearance} setAppearance={setAppearance} photo={photo}/>}
          {section === 'cv'        && <CvSection         cv={cv} setCv={setCv} projects={projects} photo={photo} setPhoto={setPhoto} showToast={showToast}/>}
          {section === 'contact'   && <ContactSection    contact={contact} setContact={setContact}/>}
          {section === 'liens'     && <LinksSection      socialLinks={socialLinks} setSocialLinks={setSocialLinks} showToast={showToast}/>}
          {section === 'profil'    && <ProfileSection    profile={profile} setProfile={setProfile} showToast={showToast} />}
          {section === 'experiences' && <ExperiencesSection experiences={experiences} setExperiences={setExperiences} showToast={showToast} />}
          {section === 'backup'    && <BackupSection     config={config} showToast={showToast}/>}
        </div>
      </main>

      <div className="dash-resizer-h" onMouseDown={startResize} />

      <aside className="dash-preview">
        <div className="ds-preview-panel">
          <div className="ds-preview-tabs">
            <div className="ds-preview-routes">
              {PAGES.map(x => (
                <button key={x.p} className={'ds-preview-tab' + (previewPage === x.p ? ' active' : '')} onClick={() => setPreviewPage(x.p)}>{x.l}</button>
              ))}
            </div>
          </div>
          <div className="ds-preview-frame" key={previewKey}>
            {renderPreview()}
          </div>
        </div>
      </aside>
    </div>
  )
}

/* ══════════════════════════════════════
   SECTIONS
   ══════════════════════════════════════ */

const SECTIONS = [
  { id: 'projets',      label: 'Projets',      icon: 'grid' },
  { id: 'experiences',  label: 'Experiences',  icon: 'briefcase' },
  { id: 'apparence',    label: 'Apparence',    icon: 'sparkle' },
  { id: 'cv',        label: 'CV',        icon: 'cv' },
  { id: 'contact',   label: 'Contact',   icon: 'mail' },
  { id: 'liens',     label: 'Liens',     icon: 'arrowUpRight' },
  { id: 'profil',    label: 'Profil',    icon: 'user' },
  { id: 'backup',    label: 'Backup',    icon: 'download' },
]

/* ─── APPEARANCE ─── */
function AppearanceSection({ appearance, setAppearance, photo }) {
  const ACCENTS = ['#6366f1','#0055ff','#14b8a6','#ea4b71','#7c3aed','#f59e0b']
  const [focalTarget, setFocalTarget] = useState('home')
  const set = (k, v) => setAppearance(p => ({...p, [k]: v}))
  const focal = focalTarget === 'cv'
    ? { key: 'photoPositionCv', label: 'Cadrage CV', hint: 'Ajuste la photo dans le format portrait du CV.', fallback: appearance.photoPosition || FOCAL_DEFAULTS.cv, aspectRatio: '118 / 152' }
    : { key: 'photoPositionHome', label: 'Cadrage accueil', hint: 'Ajuste la photo dans le bloc bento de la page d’accueil.', fallback: appearance.photoPosition || FOCAL_DEFAULTS.home, aspectRatio: '4 / 3' }
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
      <div className="ds-card">
        <h3 className="ds-card-title">Cadrage photo</h3>
        <p className="ds-hint" style={{marginBottom:'12px'}}>Clique ou glisse sur la photo, puis affine avec les sliders.</p>
        <div className="ds-focal-tabs">
          <button data-testid="focal-tab-home" className={'ds-focal-tab' + (focalTarget === 'home' ? ' on' : '')} onClick={() => setFocalTarget('home')}>Accueil</button>
          <button data-testid="focal-tab-cv" className={'ds-focal-tab' + (focalTarget === 'cv' ? ' on' : '')} onClick={() => setFocalTarget('cv')}>CV</button>
        </div>
        <FocalPointControl
          label={focal.label}
          hint={focal.hint}
          photo={photo}
          value={appearance[focal.key]}
          fallback={focal.fallback}
          aspectRatio={focal.aspectRatio}
          onChange={value => set(focal.key, value)}
        />
      </div>
    </div>
  )
}

/* ─── CV SECTION ─── */
function CvSection({ cv, setCv, projects, photo, setPhoto, showToast }) {
  const [drag, setDrag] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const set = (k, v) => setCv(p => ({...p, [k]: v}))
  const toggle = (id) => {
    const next = new Set(cv.featured || [])
    if (next.has(id)) { if (next.size <= 4) { showToast('Minimum 4 projets pour un CV équilibré'); return } next.delete(id) }
    else next.add(id)
    set('featured', [...next])
  }
  const uploadPhoto = async (file) => {
    if (!file || !file.type.startsWith('image/')) { showToast('Selectionne une image'); return }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const resp = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: 'photo-cv', image: reader.result }),
        })
        const data = await resp.json()
        if (data.ok) { setPhoto(data.path); showToast('Photo telechargee') }
        else showToast(data.error || 'Echec upload')
      } catch { showToast('Echec upload') }
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }
  const handleDrop = e => {
    e.preventDefault(); setDrag(false)
    uploadPhoto(e.dataTransfer.files[0])
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
              ? <img src={resolveImageSrc(photo)} alt="CV" className="ds-photo-prev" />
              : <div className="ds-drop-empty"><Icon name="download" size={28}/><span>Glisser une image</span></div>}
          </div>
          <div className="ds-photo-controls">
            <label className="btn btn--ghost" style={{cursor:'pointer',textAlign:'center',marginBottom:'8px'}}>
              {uploading ? 'Upload...' : <><Icon name="download" size={14}/> Cliquer pour uploader</>}
              <input type="file" accept="image/*" style={{display:'none'}} onChange={e => { const file = e.target.files[0]; if (file) uploadPhoto(file) }} disabled={uploading} />
            </label>
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
const EMPTY_P = { name:'', categories:['dev'], featured:true, role:'', startDate:'', endDate:'', description:'', caseStudy:'', caseStudyBlocks:[], demoUrl:'', repoUrl:'', techs:[], highlights:['','',''] }

function ProjectForm({ init, onSave, onCancel, showToast, onDraftChange, setPreviewPage }) {
  const [f, setF] = useState(init ? {...init, highlights:(init.highlights||['','',''])} : EMPTY_P)
  const [tLabel, setTL] = useState('')
  const [tKey, setTK] = useState('default')
  const [uploading, setUploading] = useState(false)
  const [caseImageUploading, setCaseImageUploading] = useState(false)
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

  const uploadCaseStudyImage = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Veuillez selectionner une image')
      return
    }
    setCaseImageUploading(true)
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
          const caption = 'Décris cette image'
          const markdown = `![${caption}](${data.path})`
          set('caseStudy', `${(f.caseStudy || '').trim()}\n\n${markdown}\n`.trimStart())
          showToast('Image insérée dans l’étude de cas')
        } else {
          showToast(data.error || 'Echec upload')
        }
        setCaseImageUploading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setCaseImageUploading(false)
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
                <img src={resolveImageSrc(f.image)} alt="Apercu" />
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
        <div className="ds-field" style={{gridColumn:'1/-1'}}>
          <label className="ds-label">Période</label>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px',marginTop:'6px',background:'var(--bg-inset)',borderRadius:'var(--radius-md)',padding:'12px'}}>
            <div style={{display:'flex',flexDirection:'column',gap:'3px'}}>
              <span style={{fontSize:'11px',fontWeight:600,color:'var(--text-2)',textTransform:'uppercase'}}>Rôle</span>
              <input className="input" value={f.role} onChange={e => set('role', e.target.value)} placeholder="Solo" />
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'3px'}}>
              <span style={{fontSize:'11px',fontWeight:600,color:'var(--text-2)',textTransform:'uppercase'}}>Début</span>
              <input type="date" className="input" value={f.startDate || ''} onChange={e => set('startDate', e.target.value)} />
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'3px'}}>
              <span style={{fontSize:'11px',fontWeight:600,color:'var(--text-2)',textTransform:'uppercase'}}>Fin</span>
              <input type="date" className="input" value={f.endDate || ''} onChange={e => set('endDate', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="ds-field" style={{gridColumn:'1/-1'}}>
          <label className="ds-label">Description courte * (Markdown)</label>
          <textarea className="textarea" value={f.description} onChange={e => set('description', e.target.value)} placeholder="**gras** *italique* `code` [lien](url) - liste" />
        </div>
        <div className="ds-field" style={{gridColumn:'1/-1'}}>
          <label className="ds-label">Étude de cas complète (Markdown)</label>
          <textarea className="textarea" style={{minHeight:'240px'}} value={f.caseStudy} onChange={e => set('caseStudy', e.target.value)} placeholder={'## Contexte\n\nExplique le problème, les choix techniques et les résultats.\n\n![Capture](media/projects/projet/capture.jpg)'} />
          <div className="ds-markdown-tools">
            <span>Supporte titres, listes, liens, code, citations et images markdown.</span>
            <label className="btn btn--ghost" style={{cursor:'pointer'}}>
              {caseImageUploading ? 'Upload...' : <><Icon name="download" size={14}/> Insérer image étude de cas</>}
              <input type="file" accept="image/*" style={{display:'none'}} onChange={e => { const file = e.target.files[0]; if (file) uploadCaseStudyImage(file) }} disabled={caseImageUploading} />
            </label>
          </div>
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
  const handleSave = async (proj) => {
    const next = editing === 'new' ? [...projects, proj] : projects.map(p => p.id === proj.id ? proj : p)
    setProjects(next)
    setEditing(null)
    onDraftChange(null)
    try {
      const result = await saveProjectToContent(proj)
      showToast(`Projet sauvegardé dans content/projects/${result.id}/`)
    } catch (err) {
      showToast(`Sauvegarde du projet échouée — ${err.message || ''}`)
    }
  }
  const handleCancel = () => {
    setEditing(null)
    onDraftChange(null)
  }
  const del = async (id) => {
    if (!window.confirm('Supprimer ce projet ?')) return
    setProjects(projects.filter(p => p.id !== id))
    try {
      await deleteProjectFromContent(id)
      showToast(`Projet supprimé de content/projects/${id}/`)
    } catch (err) {
      showToast(`Suppression échouée — ${err.message || ''}`)
    }
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
        <div><h2 className="ds-title">Projets <span className="ds-count">{projects.length}</span></h2><p className="ds-sub">Ajoute, modifie ou retire des projets. Sauvegardes dans <code>content/projects/&lt;id&gt;/project.json</code> et <code>case-study.md</code>.</p></div>
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
          <div className="ds-field">
            <label className="ds-label">Expérience web depuis</label>
            <input className="input" type="number" value={profile.webExperienceSince || ''} onChange={e => set('webExperienceSince', Number(e.target.value) || null)} placeholder="2024" min="1900" max="2100" />
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

/* ─── EXPERIENCES ─── */
function ExperiencesSection({ experiences, setExperiences, showToast }) {
  const [editing, setEditing] = useState(null)
  const EMPTY = { title:'', company:'', location:'', period:'', description:'', highlights:['','',''], techs:[], featured:true }
  const [f, setF] = useState(EMPTY)
  const [tLabel, setTL] = useState('')
  const [tKey, setTK] = useState('default')

  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const setHl = (i, v) => setF(p => { const h = [...(p.highlights || ['','',''])]; h[i] = v; return { ...p, highlights: h } })
  const addTech = () => { if (!tLabel.trim()) return; set('techs', [...f.techs, { label: tLabel.trim(), tech: tKey }]); setTL('') }

  const startEdit = (exp) => { setEditing(exp); setF(exp ? { ...exp } : EMPTY) }
  const handleCancel = () => setEditing(null)
  const handleSave = () => {
    if (!f.title) { showToast('Titre requis'); return }
    const id = f.id || f.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
    const exp = { ...f, id }
    const next = editing && editing.id ? experiences.map(e => e.id === exp.id ? exp : e) : [...experiences, exp]
    setExperiences(next)
    setEditing(null)
    showToast(editing && editing.id ? 'Experience mise a jour' : 'Experience ajoutee')
  }
  const del = (id) => {
    if (!window.confirm('Supprimer cette experience ?')) return
    setExperiences(experiences.filter(e => e.id !== id))
    showToast('Experience supprimee')
  }

  if (editing !== null) return (
    <div className="ds-section">
      <button className="back-link" style={{marginBottom:'var(--s2)'}} onClick={handleCancel}><Icon name="arrowLeft" size={14}/> Retour a la liste</button>
      <h2 className="ds-title">{editing && editing.id ? 'Modifier — ' + editing.title : 'Ajouter une experience'}</h2>
      <div className="ds-card">
        <div className="ds-form-grid" style={{marginTop:'var(--s5)'}}>
          <div className="ds-field" style={{gridColumn:'1/-1'}}>
            <label className="ds-label">Titre *</label>
            <input className="input" value={f.title} onChange={e => set('title', e.target.value)} placeholder="Developpeur Full Stack Freelance" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Entreprise</label>
            <input className="input" value={f.company} onChange={e => set('company', e.target.value)} placeholder="Independant" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Lieu</label>
            <input className="input" value={f.location} onChange={e => set('location', e.target.value)} placeholder="Ile-de-France" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Periode</label>
            <input className="input" value={f.period} onChange={e => set('period', e.target.value)} placeholder="2025-2026" />
          </div>
          <div className="ds-field">
            <label className="ds-label">CV</label>
            <button className={'ds-vis-btn' + (f.featured ? ' on' : '')} onClick={() => set('featured', !f.featured)}>
              {f.featured ? 'Featured' : 'Non'}
            </button>
          </div>
          <div className="ds-field" style={{gridColumn:'1/-1'}}>
            <label className="ds-label">Description</label>
            <textarea className="textarea" value={f.description} onChange={e => set('description', e.target.value)} placeholder="Description de l'experience..." />
          </div>
          <div className="ds-field" style={{gridColumn:'1/-1'}}>
            <label className="ds-label">Highlights (3 max)</label>
            {[0,1,2].map(i => (
              <input key={i} className="input" style={{marginTop:'6px'}} value={f.highlights[i] || ''} onChange={e => setHl(i, e.target.value)} placeholder={'Point '+(i+1)} />
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
              <input className="input" value={tLabel} onChange={e => setTL(e.target.value)} placeholder="Label" />
              <select className="select" value={tKey} onChange={e => setTK(e.target.value)}>
                {['laravel','vue','java','js','ts','tailwind','mysql','docker','git','linux','bash','default'].map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <button className="btn btn--ghost" onClick={addTech}><Icon name="plus" size={14}/></button>
            </div>
          </div>
        </div>
        <div className="ds-form-actions">
          <button className="btn btn--ghost" onClick={handleCancel}>Annuler</button>
          <button className="btn btn--brand" onClick={handleSave} disabled={!f.title}>
            <Icon name="check" size={14}/> Enregistrer
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="ds-section">
      <div className="ds-section-head">
        <div><h2 className="ds-title">Experiences <span className="ds-count">{experiences.length}</span></h2><p className="ds-sub">Parcours professionnel.</p></div>
        <button className="btn btn--brand" onClick={() => { setEditing({}); setF(EMPTY) }}><Icon name="plus" size={14}/> Ajouter</button>
      </div>
      <div className="ds-proj-list">
        {experiences.map(exp => (
          <div key={exp.id} className="ds-proj-row">
            <div className="ds-proj-info">
              <div className="ds-proj-name"><Icon name="briefcase" size={14}/> {exp.title}</div>
              <div className="ds-proj-meta">{exp.company} · {exp.period}</div>
            </div>
            <div className="ds-proj-acts">
              <button className="icon-btn" onClick={() => startEdit(exp)} title="Modifier"><Icon name="pen" size={15}/></button>
              <button className="icon-btn" onClick={() => del(exp.id)} title="Supprimer"><Icon name="trash" size={15}/></button>
            </div>
          </div>
        ))}
      </div>
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
