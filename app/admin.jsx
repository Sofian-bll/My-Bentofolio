/* =============================================
   BENTOFOLIO — Admin Dashboard (ES module)
   7 sections : Vue d'ensemble · Projets · Apparence · Liens · CV · Formulaire · Aperçu
   ============================================= */
import React, { useState, useRef } from 'react';
import { Icon, TechTag, CatGlyph, CatPills } from './ui.jsx';
import { DATA, primaryCat } from './data.js';

const TECH_KEYS = ['laravel','vue','java','tailwind','shadcn','mysql','docker','git','linux',
  'nvim','bash','figma','framer','python','rag','n8n','js','ts','shopify',
  'blender','ae','illustrator','default','soft'];
const CMS_KEY   = 'bentofolio.cms';
const PHOTO_KEY = 'bentofolio.photo';

/* ─── CMS helpers ─── */
function cmsGet(field, fallback) {
  try { const c=JSON.parse(localStorage.getItem(CMS_KEY)||'null'); return (c&&c[field]!==undefined)?c[field]:fallback; }
  catch(e) { return fallback; }
}
function cmsSave(field, value) {
  try { const c=JSON.parse(localStorage.getItem(CMS_KEY)||'{}'); c[field]=value; localStorage.setItem(CMS_KEY,JSON.stringify(c)); }
  catch(e) {}
}
function slugify(s) {
  return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/['']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'projet';
}
function genSnippet(p) {
  const ts = (v) => JSON.stringify(v||'');
  const techs = (p.techs||[]).map(t=>`{ label: ${ts(t.label)}, tech: ${ts(t.tech)} }`).join(', ');
  const hl    = (p.highlights||[]).filter(Boolean).map(h=>`\n    ${ts(h)}`).join(',');
  return `{\n  id: ${ts(p.id)},\n  name: ${ts(p.name)},\n  categories: [${(p.categories||[]).map(ts).join(', ')}],\n  featured: ${!!p.featured},\n  techs: [${techs}],\n  role: ${ts(p.role)},\n  period: ${ts(p.period)},\n  duration: ${ts(p.duration)},\n  description: ${ts(p.description)},\n  caseStudy: ${ts(p.caseStudy)},\n  highlights: [${hl}${hl?'\n  ':' '}],\n  demoUrl: ${ts(p.demoUrl)},\n  repoUrl: ${ts(p.repoUrl)},\n},`;
}

const SECTIONS = [
  { id: 'overview',  label: "Vue d'ensemble", icon: 'home'        },
  { id: 'projets',   label: 'Projets',         icon: 'grid'        },
  { id: 'apparence', label: 'Apparence',       icon: 'sparkle'     },
  { id: 'liens',     label: 'Liens',           icon: 'arrowUpRight'},
  { id: 'cv',        label: 'CV',              icon: 'cv'          },
  { id: 'contact',   label: 'Formulaire',      icon: 'mail'        },
  { id: 'apercu',    label: 'Aperçu live',     icon: 'layout'      },
];

/* ══════════════════════════════════════
   OVERVIEW
══════════════════════════════════════ */
function OverviewSection({ navigate, projects, links, tweaks }) {
  const stats = [
    { label: 'Projets',      val: projects.length,                         icon: 'grid'        },
    { label: 'Sur le CV',    val: projects.filter(p=>p.featured).length,  icon: 'star'        },
    { label: 'Liens actifs', val: links.filter(l=>!l.hidden).length,      icon: 'arrowUpRight'},
    { label: 'Formspree',    val: tweaks.formspreeUrl?'Configuré':'Non configuré', icon:'mail', warn:!tweaks.formspreeUrl },
  ];
  const pages = [{p:'/',l:'Accueil',i:'home'},{p:'/projets',l:'Projets',i:'grid'},{p:'/cv',l:'CV',i:'cv'},{p:'/contact',l:'Contact',i:'mail'}];
  return (
    <div className="ds-section">
      <div className="ds-section-head"><div><h2 className="ds-title">Vue d'ensemble</h2><p className="ds-sub">État du portfolio et raccourcis de navigation.</p></div></div>
      <div className="ds-stats">
        {stats.map(s=>(
          <div key={s.label} className={'ds-stat'+(s.warn?' ds-stat--warn':'')}>
            <Icon name={s.icon} size={20} />
            <div className="ds-stat-val">{s.val}</div>
            <div className="ds-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <p className="ds-subtitle">Accès rapide</p>
      <div className="ds-quick">
        {pages.map(x=><button key={x.p} className="btn btn--ghost" onClick={()=>navigate(x.p)}><Icon name={x.i} size={14}/> {x.l}</button>)}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   APPARENCE
══════════════════════════════════════ */
function AppearanceSection({ tweaks, setTweak }) {
  const ACCENTS = ['#6366f1','#0055ff','#14b8a6','#ea4b71','#7c3aed','#f59e0b'];
  const Seg = ({k,opts}) => (
    <div className="ds-seg">
      {opts.map(o=><button key={o.v} className={'ds-seg-opt'+(tweaks[k]===o.v?' on':'')} onClick={()=>setTweak(k,o.v)}>{o.l}</button>)}
    </div>
  );
  return (
    <div className="ds-section">
      <div className="ds-section-head"><div><h2 className="ds-title">Apparence</h2><p className="ds-sub">Couleur, typographie et layout.</p></div></div>
      <div className="ds-card">
        <div className="ds-form-grid">
          <div className="ds-field" style={{gridColumn:'1/-1'}}>
            <label className="ds-label">Couleur d'accent</label>
            <div className="ds-swatches">{ACCENTS.map(c=><button key={c} className={'ds-swatch'+(tweaks.accent===c?' on':'')} style={{'--c':c}} onClick={()=>setTweak('accent',c)} title={c} />)}</div>
          </div>
          <div className="ds-field"><label className="ds-label">Police titres</label><Seg k="displayFont" opts={[{v:'Syne',l:'Syne'},{v:'Space Grotesk',l:'Space G.'},{v:'Sora',l:'Sora'}]} /></div>
          <div className="ds-field"><label className="ds-label">Densité</label><Seg k="density" opts={[{v:'compact',l:'Dense'},{v:'cozy',l:'Cosy'},{v:'large',l:'Aéré'}]} /></div>
          <div className="ds-field"><label className="ds-label">Arrondi</label><Seg k="radius" opts={[{v:'net',l:'Net'},{v:'doux',l:'Doux'},{v:'rond',l:'Rond'}]} /></div>
          <div className="ds-field"><label className="ds-label">Photo accueil</label><Seg k="photo" opts={[{v:'compact',l:'Compacte'},{v:'equilibre',l:'Équil.'},{v:'grand',l:'Grande'}]} /></div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   LIENS
══════════════════════════════════════ */
const LINK_ICONS = ['linkedin','github','mail','arrowUpRight','phone','star','code'];
function LinksSection({ links, onSave, showToast }) {
  const [items, setItems]   = useState(links);
  const [adding, setAdding] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [newL, setNewL]     = useState({icon:'arrowUpRight',label:'',href:''});

  const flush = (next) => { setItems(next); onSave(next); showToast('Liens sauvegardés'); };
  const toggle  = (i) => flush(items.map((l,j)=>j===i?{...l,hidden:!l.hidden}:l));
  const remove  = (i) => flush(items.filter((_,j)=>j!==i));
  const upd = (i,k,v) => setItems(items.map((l,j)=>j===i?{...l,[k]:v}:l));
  const addLink = () => {
    if(!newL.label||!newL.href){showToast('Label et URL requis');return;}
    flush([...items,{...newL}]); setNewL({icon:'arrowUpRight',label:'',href:''}); setAdding(false);
  };

  return (
    <div className="ds-section">
      <div className="ds-section-head">
        <div><h2 className="ds-title">Liens</h2><p className="ds-sub">Réseaux sociaux et liens professionnels visibles sur le site.</p></div>
        <button className="btn btn--brand" onClick={()=>setAdding(v=>!v)}><Icon name="plus" size={14}/> Ajouter</button>
      </div>

      {adding && (
        <div className="ds-card">
          <h3 className="ds-card-title">Nouveau lien</h3>
          <div className="ds-form-grid">
            <div className="ds-field"><label className="ds-label">Icône</label>
              <select className="select" value={newL.icon} onChange={e=>setNewL(n=>({...n,icon:e.target.value}))}>
                {LINK_ICONS.map(ic=><option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
            <div className="ds-field"><label className="ds-label">Label</label>
              <input className="input" value={newL.label} onChange={e=>setNewL(n=>({...n,label:e.target.value}))} placeholder="in/sofianbll" />
            </div>
            <div className="ds-field" style={{gridColumn:'1/-1'}}><label className="ds-label">URL</label>
              <input className="input" value={newL.href} onChange={e=>setNewL(n=>({...n,href:e.target.value}))} placeholder="https://…" />
            </div>
          </div>
          <div className="ds-form-actions">
            <button className="btn btn--ghost" onClick={()=>setAdding(false)}>Annuler</button>
            <button className="btn btn--brand" onClick={addLink}><Icon name="check" size={14}/> Ajouter</button>
          </div>
        </div>
      )}

      <div className="ds-list">
        {items.map((l,i)=>(
          <div key={i} className={'ds-list-item'+(l.hidden?' ds-list-item--dim':'')}>
            {editIdx===i ? (
              <div className="ds-list-edit-row">
                <select className="select" style={{width:'110px'}} value={l.icon} onChange={e=>upd(i,'icon',e.target.value)}>
                  {LINK_ICONS.map(ic=><option key={ic} value={ic}>{ic}</option>)}
                </select>
                <input className="input" value={l.label} onChange={e=>upd(i,'label',e.target.value)} placeholder="Label" style={{width:'130px'}} />
                <input className="input" value={l.href}  onChange={e=>upd(i,'href',e.target.value)}  placeholder="https://…" style={{flex:1}} />
                <button className="btn btn--brand" onClick={()=>{flush(items);setEditIdx(null);}}><Icon name="check" size={13}/></button>
                <button className="btn btn--ghost" onClick={()=>setEditIdx(null)}><Icon name="x" size={13}/></button>
              </div>
            ) : (
              <>
                <div className="ds-list-icon"><Icon name={l.icon||'arrowUpRight'} size={16}/></div>
                <div className="ds-list-info">
                  <span className="ds-list-label">{l.label}</span>
                  <a className="ds-list-href" href={l.href} target="_blank" rel="noreferrer">{l.href||'—'}</a>
                </div>
                <div className="ds-list-actions">
                  <button className={'ds-vis-btn'+(l.hidden?'':' on')} onClick={()=>toggle(i)}>{l.hidden?'Masqué':'Visible'}</button>
                  <button className="icon-btn" onClick={()=>setEditIdx(i)} title="Modifier"><Icon name="pen" size={15}/></button>
                  <button className="icon-btn" onClick={()=>remove(i)} title="Supprimer"><Icon name="trash" size={15}/></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   CV
══════════════════════════════════════ */
function CvSection({ tweaks, setTweak, projects, showToast }) {
  const [photoUrl, setPhotoUrl] = useState(()=>localStorage.getItem(PHOTO_KEY)||'');
  const [urlInput, setUrlInput] = useState('');
  const [drag, setDrag]         = useState(false);
  const MIN = 4;
  const [featured, setFeatured] = useState(()=>{
    try { const s=JSON.parse(localStorage.getItem('bentofolio.cv.featured')); if(Array.isArray(s))return new Set(s); } catch(e) {}
    return new Set(projects.filter(p=>p.featured).map(p=>p.id));
  });
  const savePhoto = (url) => {
    setPhotoUrl(url); localStorage.setItem(PHOTO_KEY, url||'');
    DATA.personalInfo.photoUrl = url||null; showToast('Photo mise à jour');
  };
  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const file = e.dataTransfer.files[0];
    if(!file||!file.type.startsWith('image/'))return;
    const r=new FileReader(); r.onload=ev=>savePhoto(ev.target.result); r.readAsDataURL(file);
  };
  const toggleFeat = (id) => {
    const next=new Set(featured);
    if(next.has(id)){if(next.size<=MIN){showToast('Minimum '+MIN+' projets');return;}next.delete(id);}
    else next.add(id);
    setFeatured(next); localStorage.setItem('bentofolio.cv.featured',JSON.stringify([...next]));
  };
  const Seg = ({k,opts}) => <div className="ds-seg">{opts.map(o=><button key={String(o.v)} className={'ds-seg-opt'+(tweaks[k]===o.v?' on':'')} onClick={()=>setTweak(k,typeof o.v==='number'?Number(o.v):o.v)}>{o.l}</button>)}</div>;

  return (
    <div className="ds-section">
      <div className="ds-section-head"><div><h2 className="ds-title">CV</h2><p className="ds-sub">Photo, style et sélection des projets.</p></div></div>

      <div className="ds-card">
        <h3 className="ds-card-title">Photo</h3>
        <div className="ds-photo-row">
          <div className={'ds-drop'+(drag?' ds-drop--over':'')}
            onDragOver={e=>{e.preventDefault();setDrag(true);}}
            onDragLeave={()=>setDrag(false)} onDrop={handleDrop}>
            {photoUrl
              ? <img src={photoUrl} alt="CV" className="ds-photo-prev" />
              : <div className="ds-drop-empty"><Icon name="download" size={28}/><span>Glisser une image</span></div>}
          </div>
          <div className="ds-photo-controls">
            <div className="ds-field">
              <label className="ds-label">URL de l'image</label>
              <div style={{display:'flex',gap:'8px'}}>
                <input className="input" value={urlInput} onChange={e=>setUrlInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter')savePhoto(urlInput.trim());}} placeholder="https://…" />
                <button className="btn btn--ghost" onClick={()=>savePhoto(urlInput.trim())}><Icon name="check" size={14}/></button>
              </div>
            </div>
            {photoUrl && <button className="btn btn--ghost" style={{marginTop:'4px'}} onClick={()=>savePhoto('')}><Icon name="trash" size={13}/> Réinitialiser</button>}
            <p className="ds-hint" style={{marginTop:'6px'}}>Ou glisse une image directement sur le cadre à gauche. Stocké en base64 dans localStorage.</p>
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
        <h3 className="ds-card-title">Projets sur le CV <span style={{color:'var(--text-2)',fontWeight:500,fontFamily:'var(--font-body)'}}>· {featured.size} sélectionnés</span></h3>
        <div className="ds-pick-list">
          {projects.map(pr=>{const on=featured.has(pr.id);return(
            <button key={pr.id} className={'ds-pick'+(on?' on':'')} onClick={()=>toggleFeat(pr.id)}>
              <span className="ds-check">{on&&<Icon name="check" size={12}/>}</span>
              <span className="ds-pick-name"><CatGlyph cat={primaryCat(pr)} size={12}/> {pr.name}</span>
              <span className="ds-pick-meta">{DATA.categories[primaryCat(pr)]?.label} · {pr.period}</span>
            </button>
          );})}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   FORMULAIRE CONTACT
══════════════════════════════════════ */
function ContactSection({ tweaks, setTweak }) {
  const toggles = [
    {k:'contactShowStatus', l:'Badge disponibilité alternance', s:'Indicateur vert sur la page Contact'},
    {k:'contactShowPhone',  l:'Champ téléphone',               s:'Champ optionnel dans le formulaire'},
    {k:'contactShowType',   l:'Type de contact',               s:'Menu : alternance, freelance, collaboration…'},
  ];
  return (
    <div className="ds-section">
      <div className="ds-section-head"><div><h2 className="ds-title">Formulaire de contact</h2><p className="ds-sub">Provider, endpoint et champs optionnels.</p></div></div>
      <div className="ds-card">
        <h3 className="ds-card-title">Provider</h3>
        <div className="ds-field">
          <label className="ds-label">Endpoint</label>
          <p className="ds-hint">Compatible Formspree, Formspark, Basin ou tout provider REST (POST → JSON). Laisse vide pour le fallback <code>mailto:</code>.</p>
          <input className="input" style={{marginTop:'8px'}} value={tweaks.formspreeUrl||''} onChange={e=>setTweak('formspreeUrl',e.target.value)} placeholder="https://formspree.io/f/xxxxxxx" />
        </div>
        <div className={'ds-status-badge'+(tweaks.formspreeUrl?' ok':' warn')}>
          <Icon name={tweaks.formspreeUrl?'check':'mail'} size={13}/>
          {tweaks.formspreeUrl ? 'Envoi direct activé' : 'Fallback mailto actif — ouvrira le client email'}
        </div>
      </div>
      <div className="ds-card">
        <h3 className="ds-card-title">Champs optionnels</h3>
        {toggles.map(f=>(
          <div key={f.k} className="ds-toggle-row" onClick={()=>setTweak(f.k,!tweaks[f.k])}>
            <div><div className="ds-toggle-label">{f.l}</div><div className="ds-toggle-sub">{f.s}</div></div>
            <div className={'ds-switch'+(tweaks[f.k]?' on':'')}/>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   APERÇU LIVE
══════════════════════════════════════ */
function PreviewSection() {
  const [page, setPage] = useState('/');
  const [rev,  setRev]  = useState(0);
  const PAGES = [{p:'/',l:'Accueil'},{p:'/projets',l:'Projets'},{p:'/cv',l:'CV'},{p:'/contact',l:'Contact'}];
  return (
    <div className="ds-section ds-preview-wrap">
      <div className="ds-section-head">
        <div><h2 className="ds-title">Aperçu live</h2><p className="ds-sub">Rendu du portfolio public en temps réel.</p></div>
        <div className="ds-preview-tabs">
          {PAGES.map(x=><button key={x.p} className={'ds-preview-tab'+(page===x.p?' active':'')} onClick={()=>setPage(x.p)}>{x.l}</button>)}
          <button className="icon-btn" onClick={()=>setRev(r=>r+1)} title="Rafraîchir"><Icon name="arrowRight" size={15}/></button>
        </div>
      </div>
      <div className="ds-iframe-wrap">
        <iframe key={rev+'|'+page} src={'index.html#'+page} title="Aperçu portfolio" className="ds-iframe" sandbox="allow-scripts allow-same-origin" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   PROJETS — form
══════════════════════════════════════ */
const EMPTY_P = {name:'',categories:['dev'],featured:true,role:'',period:'',duration:'',description:'',caseStudy:'',demoUrl:'',repoUrl:'',techs:[],highlights:['','','']};

function ProjectForm({ init, onSave, onCancel, showToast }) {
  const [f, setF]       = useState(init ? {...init, highlights:(init.highlights||['','',''])} : EMPTY_P);
  const [tLabel, setTL] = useState('');
  const [tKey,   setTK] = useState('default');
  const [tab, setTab]   = useState('form');
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const toggleCat = (k) => setF(p=>{const h=p.categories.includes(k);const n=h?p.categories.filter(x=>x!==k):[...p.categories,k];return{...p,categories:n.length?n:p.categories};});
  const addTech = () => {if(!tLabel.trim())return;set('techs',[...f.techs,{label:tLabel.trim(),tech:tKey}]);setTL('');};
  const setHl = (i,v) => setF(p=>{const h=[...(p.highlights||['','',''])];h[i]=v;return{...p,highlights:h};});
  const proj = {...f, id: f.id||slugify(f.name)};

  return (
    <div className="ds-card">
      <div className="ds-card-tabs">
        <button className={'ds-card-tab'+(tab==='form'?' active':'')} onClick={()=>setTab('form')}>Formulaire</button>
        <button className={'ds-card-tab'+(tab==='snippet'?' active':'')} onClick={()=>setTab('snippet')}>Snippet TS</button>
      </div>

      {tab==='snippet' ? (
        <div style={{marginTop:'var(--s4)'}}>
          <pre className="code-block">{genSnippet(proj)}</pre>
          <button className="btn btn--ghost" style={{marginTop:'var(--s3)'}} onClick={()=>navigator.clipboard.writeText(genSnippet(proj)).then(()=>showToast('Copié !'))}>
            <Icon name="copy" size={14}/> Copier
          </button>
        </div>
      ) : (
        <div className="ds-form-grid" style={{marginTop:'var(--s5)'}}>
          <div className="ds-field" style={{gridColumn:'1/-1'}}>
            <label className="ds-label">Nom *</label>
            <input className="input" value={f.name} onChange={e=>set('name',e.target.value)} placeholder="Connect'IN" />
          </div>

          <div className="ds-field">
            <label className="ds-label">Catégories</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginTop:'6px'}}>
              {Object.keys(DATA.categories).map(k=>(
                <button key={k} className={'cat-opt'+(f.categories.includes(k)?' on':'')} style={{'--co':DATA.categories[k].color}} onClick={()=>toggleCat(k)}>
                  <Icon name={DATA.categories[k].glyph} size={12}/> {DATA.categories[k].label}
                </button>
              ))}
            </div>
          </div>

          <div className="ds-field">
            <label className="ds-label">Rôle · Période · Durée</label>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginTop:'6px'}}>
              <input className="input" value={f.role}     onChange={e=>set('role',e.target.value)}     placeholder="Solo" />
              <input className="input" value={f.period}   onChange={e=>set('period',e.target.value)}   placeholder="2025" />
              <input className="input" value={f.duration} onChange={e=>set('duration',e.target.value)} placeholder="3 sem." />
            </div>
          </div>

          <div className="ds-field" style={{gridColumn:'1/-1'}}>
            <label className="ds-label">Description courte *</label>
            <textarea className="textarea" value={f.description} onChange={e=>set('description',e.target.value)} placeholder="Une ligne résumant le projet." />
          </div>

          <div className="ds-field" style={{gridColumn:'1/-1'}}>
            <label className="ds-label">Étude de cas</label>
            <textarea className="textarea" style={{minHeight:'80px'}} value={f.caseStudy} onChange={e=>set('caseStudy',e.target.value)} placeholder="Contexte, défis techniques, résultats…" />
          </div>

          <div className="ds-field" style={{gridColumn:'1/-1'}}>
            <label className="ds-label">Bullets CV (3 max)</label>
            {[0,1,2].map(i=>(
              <input key={i} className="input" style={{marginTop:'6px'}} value={(f.highlights||['','',''])[i]||''} onChange={e=>setHl(i,e.target.value)} placeholder={'Point '+(i+1)} />
            ))}
          </div>

          <div className="ds-field" style={{gridColumn:'1/-1'}}>
            <label className="ds-label">Technologies</label>
            {f.techs.length>0 && (
              <div className="tech-added" style={{marginBottom:'8px'}}>
                {f.techs.map((t,i)=>(
                  <span key={i} className="tech-added-tag">
                    <TechTag label={t.label} tech={t.tech}/>
                    <button onClick={()=>set('techs',f.techs.filter((_,j)=>j!==i))}><Icon name="x" size={11}/></button>
                  </span>
                ))}
              </div>
            )}
            <div className="tech-add-row">
              <input className="input" value={tLabel} onChange={e=>setTL(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addTech();}}} placeholder="Label" />
              <select className="select" value={tKey} onChange={e=>setTK(e.target.value)}>
                {TECH_KEYS.map(k=><option key={k} value={k}>{k}</option>)}
              </select>
              <button className="btn btn--ghost" onClick={addTech}><Icon name="plus" size={14}/></button>
            </div>
          </div>

          <div className="ds-field">
            <label className="ds-label">Lien démo</label>
            <input className="input" value={f.demoUrl} onChange={e=>set('demoUrl',e.target.value)} placeholder="https://…" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Lien repo</label>
            <input className="input" value={f.repoUrl} onChange={e=>set('repoUrl',e.target.value)} placeholder="https://github.com/…" />
          </div>

          <div className="ds-field" style={{gridColumn:'1/-1'}}>
            <div className="ds-toggle-row" onClick={()=>set('featured',!f.featured)}>
              <div><div className="ds-toggle-label">Mettre en avant sur le CV</div><div className="ds-toggle-sub">Sélectionné par défaut dans la section Projets du CV</div></div>
              <div className={'ds-switch'+(f.featured?' on':'')}/>
            </div>
          </div>
        </div>
      )}

      <div className="ds-form-actions">
        <button className="btn btn--ghost" onClick={onCancel}>Annuler</button>
        <button className="btn btn--brand" onClick={()=>onSave(proj)} disabled={!f.name||!f.description}>
          <Icon name="check" size={14}/> Enregistrer
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   PROJETS — liste
══════════════════════════════════════ */
function ProjectsSection({ projects, onSave, showToast }) {
  const [editing, setEditing] = useState(null);

  const handleSave = (proj) => {
    const next = editing==='new' ? [...projects,proj] : projects.map(p=>p.id===proj.id?proj:p);
    onSave(next); setEditing(null); showToast(editing==='new'?'Projet ajouté 🎉':'Projet mis à jour');
  };
  const del = (id) => {
    if(!window.confirm('Supprimer ce projet ?'))return;
    onSave(projects.filter(p=>p.id!==id)); showToast('Projet supprimé');
  };
  const toggleFeat = (id) => onSave(projects.map(p=>p.id===id?{...p,featured:!p.featured}:p));

  if (editing!==null) return (
    <div className="ds-section">
      <div className="ds-section-head">
        <div>
          <button className="back-link" style={{marginBottom:'var(--s2)'}} onClick={()=>setEditing(null)}><Icon name="arrowLeft" size={14}/> Retour à la liste</button>
          <h2 className="ds-title">{editing==='new'?'Ajouter un projet':'Modifier — '+editing.name}</h2>
        </div>
      </div>
      <ProjectForm init={editing==='new'?null:editing} onSave={handleSave} onCancel={()=>setEditing(null)} showToast={showToast}/>
    </div>
  );

  return (
    <div className="ds-section">
      <div className="ds-section-head">
        <div><h2 className="ds-title">Projets <span className="ds-count">{projects.length}</span></h2><p className="ds-sub">Ajoute, modifie ou retire des projets. Les changements sont persistés en localStorage.</p></div>
        <button className="btn btn--brand" onClick={()=>setEditing('new')}><Icon name="plus" size={14}/> Ajouter</button>
      </div>
      <div className="ds-proj-list">
        {projects.map(pr=>(
          <div key={pr.id} className="ds-proj-row">
            <div className="ds-proj-info">
              <div className="ds-proj-name"><CatGlyph cat={primaryCat(pr)} size={14}/> {pr.name}</div>
              <div className="ds-proj-meta">{pr.role} · {pr.period}{pr.duration?' · '+pr.duration:''}</div>
            </div>
            <div className="ds-proj-acts">
              <button className={'ds-feat-btn'+(pr.featured?' on':'')} onClick={()=>toggleFeat(pr.id)} title={pr.featured?'Sur le CV':'Hors CV'}>
                <Icon name="star" size={12}/> {pr.featured?'CV':'—'}
              </button>
              <button className="icon-btn" onClick={()=>setEditing(pr)} title="Modifier"><Icon name="pen" size={15}/></button>
              <button className="icon-btn" onClick={()=>del(pr.id)} title="Supprimer"><Icon name="trash" size={15}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   DASHBOARD SHELL
══════════════════════════════════════ */
function DashboardView({ navigate, showToast, tweaks, setTweak, onLogout }) {
  const [section,  setSection]  = useState('overview');
  const [projects, setProjects] = useState(()=>cmsGet('projects', DATA.projects));
  const [links,    setLinks]    = useState(()=>cmsGet('socialLinks', DATA.socialLinks));

  const saveProjects = (next) => { setProjects(next); cmsSave('projects',next); DATA.projects=next; };
  const saveLinks    = (next) => { setLinks(next);    cmsSave('socialLinks',next); DATA.socialLinks=next; };

  return (
    <div className="dashboard">
      <aside className="dash-sidebar">
        <div className="dash-brand"><span className="dash-brand-dot"/><span>Admin</span></div>
        <nav className="dash-nav">
          {SECTIONS.map(s=>(
            <button key={s.id} className={'dash-nav-item'+(section===s.id?' active':'')} onClick={()=>setSection(s.id)}>
              <Icon name={s.icon} size={15}/>{s.label}
            </button>
          ))}
        </nav>
        <div className="dash-footer">
          <button className="dash-back" onClick={()=>navigate('/')}><Icon name="arrowLeft" size={13}/> Voir le site</button>
          <button className="icon-btn" onClick={onLogout} title="Quitter l'admin"><Icon name="x" size={15}/></button>
        </div>
      </aside>

      <main className="dash-main">
        {section==='overview'  && <OverviewSection  navigate={navigate} projects={projects} links={links} tweaks={tweaks}/>}
        {section==='projets'   && <ProjectsSection  projects={projects} onSave={saveProjects} showToast={showToast}/>}
        {section==='apparence' && <AppearanceSection tweaks={tweaks} setTweak={setTweak}/>}
        {section==='liens'     && <LinksSection     links={links} onSave={saveLinks} showToast={showToast}/>}
        {section==='cv'        && <CvSection        tweaks={tweaks} setTweak={setTweak} projects={projects} showToast={showToast}/>}
        {section==='contact'   && <ContactSection   tweaks={tweaks} setTweak={setTweak}/>}
        {section==='apercu'    && <PreviewSection/>}
      </main>
    </div>
  );
}

/* ══════════════════════════════════════
   LOGIN GATE
══════════════════════════════════════ */
const ADMIN_PASSWORD = 'bento';
function AdminLogin({ onLogin }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if(pwd===ADMIN_PASSWORD){onLogin();}
    else{setErr(true);setPwd('');setTimeout(()=>setErr(false),1800);}
  };
  return (
    <main className="page-wrap" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}>
      <div style={{width:'100%',maxWidth:'360px'}}>
        <div className="admin-card">
          <h3 style={{marginBottom:'4px'}}>Espace Admin</h3>
          <p className="sub">Accès réservé.</p>
          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'12px',marginTop:'20px'}}>
            <div className="field">
              <label>Mot de passe</label>
              <input className={'input'+(err?' input-error':'')} type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="••••••" autoFocus/>
              {err && <p style={{fontSize:'12px',color:'var(--cat-animation)',marginTop:'4px'}}>Mot de passe incorrect.</p>}
            </div>
            <button className="btn btn--brand" type="submit"><Icon name="arrowRight" size={15}/> Entrer</button>
          </form>
        </div>
      </div>
    </main>
  );
}

export function AdminView({ adminMode, onLogin, onLogout, navigate, showToast, tweaks, setTweak }) {
  if(!adminMode) return <AdminLogin onLogin={onLogin}/>;
  return <DashboardView navigate={navigate} showToast={showToast} tweaks={tweaks} setTweak={setTweak} onLogout={onLogout}/>;
}
